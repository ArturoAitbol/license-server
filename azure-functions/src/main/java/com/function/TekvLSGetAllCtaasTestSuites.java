package com.function;

import static com.function.auth.RoleAuthHandler.*;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.json.JSONArray;
import org.json.JSONObject;

import com.function.auth.Permission;
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

public class TekvLSGetAllCtaasTestSuites {
    /**
     * This function listens at endpoint "/v1.0/ctaasTestSuites". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/v1.0/ctaasTestSuites
     * 2. curl "{your host}/v1.0/ctaasTestSuites"
     */
    @FunctionName("TekvLSGetAllCtaasTestSuites")
    public HttpResponseMessage run(
            @HttpTrigger(
                name = "req", 
                methods = { HttpMethod.GET },
                authLevel = AuthorizationLevel.ANONYMOUS,
                route = "ctaasTestSuites/{id=EMPTY}")
            HttpRequestMessage<Optional<String>> request,
            @BindingName("id") String id,
            final ExecutionContext context) {

        Claims tokenClaims = getTokenClaimsFromHeader(request, context);
        JSONArray roles = getRolesFromToken(tokenClaims,context);
        if(roles.isEmpty()){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
			json.put("error", MESSAGE_FOR_UNAUTHORIZED);
			return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
        if(!hasPermission(roles, Permission.GET_ALL_CTAAS_SETUPS)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

        context.getLogger().info("Entering TekvLSGetAllCtaasTestSuites Azure function");
        // Get query parameters
        context.getLogger().info("URL parameters are: " + request.getQueryParameters());
        String subaccountId = request.getQueryParameters().getOrDefault("subaccountId", "");

        // Build SQL statement
        SelectQueryBuilder queryBuilder = new SelectQueryBuilder("SELECT * FROM ctaas_test_suite");
        SelectQueryBuilder verificationQueryBuilder = null;
        String email = getEmailFromToken(tokenClaims, context);

        // adding conditions according to the role
		String currentRole = evaluateRoles(roles);
        switch (currentRole) {
            case DISTRIBUTOR_FULL_ADMIN:
                queryBuilder.appendCustomCondition(
                        "subaccount_id IN (SELECT s.id from subaccount s, customer c WHERE s.customer_id = c.id " +
                                "AND distributor_id = (SELECT distributor_id FROM customer c,customer_admin ca WHERE c.id = ca.customer_id AND admin_email = ?))",
                        email);
                verificationQueryBuilder = new SelectQueryBuilder("SELECT s.id FROM subaccount s, customer c");
                verificationQueryBuilder.appendCustomCondition(
                        "s.customer_id = c.id AND distributor_id = (SELECT distributor_id FROM customer c,customer_admin ca "
                                +
                                "WHERE c.id = ca.customer_id and admin_email= ?)",
                        email);
                break;
            case CUSTOMER_FULL_ADMIN:
                queryBuilder
                        .appendCustomCondition("subaccount_id IN (SELECT s.id FROM subaccount s, customer_admin ca " +
                                "WHERE s.customer_id = ca.customer_id AND admin_email = ?)", email);
                verificationQueryBuilder = new SelectQueryBuilder("SELECT s.id FROM subaccount s, customer_admin ca");
                verificationQueryBuilder.appendCustomCondition("s.customer_id = ca.customer_id AND admin_email = ?",
                        email);
                break;
            case SUBACCOUNT_ADMIN:
                queryBuilder.appendCustomCondition(
                        "subaccount_id = (SELECT subaccount_id FROM subaccount_admin WHERE subaccount_admin_email = ?)",
                        email);
                verificationQueryBuilder = new SelectQueryBuilder("SELECT subaccount_id FROM subaccount_admin");
                verificationQueryBuilder.appendEqualsCondition("subaccount_admin_email", email);
                break;
            case SUBACCOUNT_STAKEHOLDER:
                queryBuilder.appendCustomCondition(
                        "subaccount_id = (SELECT subaccount_id FROM subaccount_admin WHERE subaccount_admin_email = ?)",
                        email);
                verificationQueryBuilder = new SelectQueryBuilder("SELECT subaccount_id FROM subaccount_admin");
                verificationQueryBuilder.appendEqualsCondition("subaccount_admin_email", email);
                break;
        }

        if (id.equals("EMPTY")) {
            if (!subaccountId.isEmpty())
                queryBuilder.appendEqualsCondition("subaccount_id", subaccountId, QueryBuilder.DATA_TYPE.UUID);
        } else
            queryBuilder.appendEqualsCondition("id", id, QueryBuilder.DATA_TYPE.UUID);

        if (verificationQueryBuilder != null) {
            if (currentRole.equals(SUBACCOUNT_ADMIN) || currentRole.equals(SUBACCOUNT_STAKEHOLDER))
                verificationQueryBuilder.appendEqualsCondition("subaccount_id", subaccountId,
                        QueryBuilder.DATA_TYPE.UUID);
            else
                verificationQueryBuilder.appendEqualsCondition("s.id", subaccountId, QueryBuilder.DATA_TYPE.UUID);
        }

        // Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses"
                + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER") + "&password=" + System.getenv("POSTGRESQL_PWD");

        try (
                Connection connection = DriverManager.getConnection(dbConnectionUrl);
                Statement statement = connection.createStatement();
                PreparedStatement selectStmt = queryBuilder.build(connection)) {

            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
            ResultSet rs;
            JSONObject json = new JSONObject();

            if (verificationQueryBuilder != null && id.equals("EMPTY") && !subaccountId.isEmpty()) {
                try (PreparedStatement verificationStmt = verificationQueryBuilder.build(connection)) {
                    context.getLogger().info("Execute SQL role verification statement: " + verificationStmt);
                    rs = verificationStmt.executeQuery();
                    if (!rs.next()) {
                        context.getLogger().info(LOG_MESSAGE_FOR_INVALID_ID + email);
                        json.put("error", MESSAGE_FOR_INVALID_ID);
                        return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
                    }
                }
            }

            // Retrieve SpotLight test suites.
            context.getLogger().info("Execute SQL statement: " + selectStmt);
            rs = selectStmt.executeQuery();

            // Return a JSON array of ctaas_test_suite
            JSONArray array = new JSONArray();
            while (rs.next()) {
                JSONObject item = new JSONObject();
                item.put("id", rs.getString("id"));
                item.put("subaccountId", rs.getString("subaccount_id"));
                item.put("totalExecutions", rs.getString("total_executions"));
                item.put("nextExecution", rs.getString("next_execution_ts"));
                item.put("frequency", rs.getString("frequency"));
                item.put("deviceType", rs.getString("device_type"));
                item.put("name", rs.getString("name"));
                array.put(item);
            }

            if (!id.equals("EMPTY") && array.isEmpty()) {
                context.getLogger().info(LOG_MESSAGE_FOR_INVALID_ID + email);
                List<String> customerRoles = Arrays.asList(DISTRIBUTOR_FULL_ADMIN, CUSTOMER_FULL_ADMIN,
                        SUBACCOUNT_ADMIN, SUBACCOUNT_STAKEHOLDER);
                json.put("error", customerRoles.contains(currentRole) ? MESSAGE_FOR_INVALID_ID : MESSAGE_ID_NOT_FOUND);
                return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
            }

            json.put("ctaasTestSuites", array);
            return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json")
                    .body(json.toString()).build();
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
}
