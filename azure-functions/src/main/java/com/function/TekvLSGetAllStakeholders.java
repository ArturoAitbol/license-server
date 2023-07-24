package com.function;

import static com.function.auth.RoleAuthHandler.*;
import static com.function.auth.Roles.*;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.json.JSONArray;
import org.json.JSONObject;

import com.function.auth.Resource;
import com.function.auth.Roles;
import com.function.clients.GraphAPIClient;
import com.function.db.QueryBuilder;
import com.function.db.SelectQueryBuilder;
import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpMethod;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.BindingName;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;

import io.jsonwebtoken.Claims;

public class TekvLSGetAllStakeholders {
    /**
     * This function listens at endpoint "/v1.0/subaccountStakeHolders/{email}". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/v1.0/subaccountStakeHolders/{email}
     * 2. curl "{your host}/v1.0/subaccounts"
     */
    @FunctionName("TekvLSGetAllStakeholders")
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.GET},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "subaccountStakeHolders/{email=EMPTY}")
            HttpRequestMessage<Optional<String>> request,
            @BindingName("email") String email,
            final ExecutionContext context) {
        Claims tokenClaims = getTokenClaimsFromHeader(request, context);
        JSONArray roles = getRolesFromToken(tokenClaims, context);
        if (roles.isEmpty()) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
            json.put("error", MESSAGE_FOR_UNAUTHORIZED);
            return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
        }
        if (!hasPermission(roles, Resource.GET_ALL_SUBACCOUNT_STAKEHOLDER)) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        context.getLogger().info("Entering TekvLSGetAllStakeholders Azure function");
        // Get query parameters
        context.getLogger().info("URL parameters are: " + request.getQueryParameters());
        String subaccountId = request.getQueryParameters().getOrDefault("subaccountId", "");

        // Build SQL statement
        SelectQueryBuilder queryBuilder = new SelectQueryBuilder("SELECT * FROM subaccount_admin");
        SelectQueryBuilder verificationQueryBuilder = null;
        String authEmail = getEmailFromToken(tokenClaims, context);

        // adding conditions according to the role
        String currentRole = evaluateRoles(roles);
        switch (currentRole) {
            case CUSTOMER_FULL_ADMIN:
                queryBuilder.appendCustomCondition("subaccount_id IN (SELECT s.id FROM subaccount s, customer_admin ca " +
                        "WHERE s.customer_id = ca.customer_id AND admin_email = ?)", authEmail);
                verificationQueryBuilder = new SelectQueryBuilder("SELECT s.id FROM subaccount s, customer_admin ca");
                verificationQueryBuilder.appendCustomCondition("s.customer_id = ca.customer_id AND admin_email = ?", authEmail);
                break;
            case SUBACCOUNT_ADMIN:
                queryBuilder.appendCustomCondition("subaccount_id = (SELECT subaccount_id FROM subaccount_admin WHERE subaccount_admin_email = ?)", authEmail);
                verificationQueryBuilder = new SelectQueryBuilder("SELECT subaccount_id FROM subaccount_admin");
                verificationQueryBuilder.appendEqualsCondition("subaccount_admin_email", authEmail);
                break;
        }

        if (email.equals("EMPTY")) {
            if (!subaccountId.isEmpty()) {
                queryBuilder.appendEqualsCondition("subaccount_id", subaccountId, QueryBuilder.DATA_TYPE.UUID);
            }
        } else {
            queryBuilder.appendEqualsCondition("subaccount_admin_email", email, QueryBuilder.DATA_TYPE.VARCHAR);
        }

        if (verificationQueryBuilder != null) {
            if (currentRole.equals(SUBACCOUNT_ADMIN))
                verificationQueryBuilder.appendEqualsCondition("subaccount_id", subaccountId, QueryBuilder.DATA_TYPE.UUID);
            else
                verificationQueryBuilder.appendEqualsCondition("s.id", subaccountId, QueryBuilder.DATA_TYPE.UUID);
        }

        // Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");
        try (
                Connection connection = DriverManager.getConnection(dbConnectionUrl);
                PreparedStatement selectStmt = queryBuilder.build(connection)) {

            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
            ResultSet rs;
            JSONObject json = new JSONObject();

            if (verificationQueryBuilder != null && email.equals("EMPTY") && !subaccountId.isEmpty()) {
                try (PreparedStatement verificationStmt = verificationQueryBuilder.build(connection)) {
                    context.getLogger().info("Execute SQL role verification statement: " + verificationStmt);
                    rs = verificationStmt.executeQuery();
                    if (!rs.next()) {
                        context.getLogger().info(LOG_MESSAGE_FOR_INVALID_ID + authEmail);
                        json.put("error", MESSAGE_FOR_INVALID_ID);
                        return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
                    }
                }
            }

            context.getLogger().info("Execute SQL statement: " + selectStmt);
            rs = selectStmt.executeQuery();
            // Return a JSON array of licenses
            JSONArray array = new JSONArray();
            while (rs.next()) {
                JSONObject item = new JSONObject();
                item.put("email", rs.getString("subaccount_admin_email"));
                item.put("subaccountId", rs.getString("subaccount_id"));
                item.put("notifications", rs.getString("notifications"));
                item.put("emailNotifications", rs.getBoolean("email_notifications"));
                item.put("latestCallbackRequestDate", rs.getString("latest_callback_request_date"));
                array.put(item);
            }

            if (!email.equals("EMPTY") && array.isEmpty()) {
                context.getLogger().info(LOG_MESSAGE_FOR_INVALID_ID + authEmail);
                List<String> customerRoles = Arrays.asList(DISTRIBUTOR_FULL_ADMIN, CUSTOMER_FULL_ADMIN, SUBACCOUNT_ADMIN, SUBACCOUNT_STAKEHOLDER);
                json.put("error", customerRoles.contains(currentRole) ? MESSAGE_FOR_INVALID_ID : MESSAGE_ID_NOT_FOUND);
                return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
            }
            JSONArray stakeHolders = getStakeholdersInfo(array, context);
            context.getLogger().info("List total " + stakeHolders.length() + " stakeholders");
            json.put("stakeHolders", stakeHolders);
            return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();
        } catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }

    private JSONArray getStakeholdersInfo(JSONArray array, ExecutionContext context) {
        JSONArray stakeHolders = new JSONArray();
        JSONObject json = null;
        JSONObject userProfile = null;
        for (Object obj : array) {
            json = (JSONObject) obj;
            json.put("role", Roles.SUBACCOUNT_ADMIN);
            try {
                userProfile = GraphAPIClient.getUserProfileWithRoleByEmail(json.getString("email"), context);
                if (userProfile != null) {
                    if (userProfile.has("role")) 
                        json.put("role", userProfile.getString("role"));
                    json.put("name", userProfile.get("displayName"));
                    json.put("jobTitle", userProfile.get("jobTitle"));
                    json.put("companyName", userProfile.get("companyName"));
                    json.put("phoneNumber", userProfile.get("mobilePhone"));
                }
            } catch (Exception e) {
                context.getLogger().info("Caught exception: " + e.getMessage());
            }
            stakeHolders.put(json);
        }
        return stakeHolders;
    }
}
