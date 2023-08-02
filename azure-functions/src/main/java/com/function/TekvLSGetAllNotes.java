package com.function;

import static com.function.auth.RoleAuthHandler.*;
import static com.function.auth.Roles.*;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

import org.json.JSONArray;
import org.json.JSONObject;

import com.function.auth.Resource;
import com.function.db.QueryBuilder;
import com.function.db.SelectQueryBuilder;
import com.function.db.SelectQueryBuilder.ORDER_DIRECTION;
import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpMethod;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;

import io.jsonwebtoken.Claims;

public class TekvLSGetAllNotes {
    /**
     * This function listens at endpoint "/v1.0/notes". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/v1.0/notes
     * 2. curl "{your host}/v1.0/subaccounts"
     */
    @FunctionName("TekvLSGetAllNotes")
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.GET},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "notes")
            HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context) {
        Claims tokenClaims = getTokenClaimsFromHeader(request, context);
        JSONArray roles = getRolesFromToken(tokenClaims, context);
        if (roles.isEmpty()) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
            json.put("error", MESSAGE_FOR_UNAUTHORIZED);
            return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
        }
        if (!hasPermission(roles, Resource.GET_ALL_NOTES)) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        String userId = getUserIdFromToken(tokenClaims, context);
        context.getLogger().info("User " + userId + " is Entering TekvLSGetAllNotes Azure function");
        
        // Get query parameters
        context.getLogger().info("URL parameters are: " + request.getQueryParameters());
        String subaccountId = request.getQueryParameters().getOrDefault("subaccountId", "");
        if (subaccountId.isEmpty()) {
            JSONObject json = new JSONObject();
            json.put("error", "Missing mandatory parameter: subaccountId");
            context.getLogger().info("User " + userId + " is leaving TekvLSGetAllNotes Azure function with error");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        
        String status = request.getQueryParameters().getOrDefault("status", "");
        String noteId = request.getQueryParameters().getOrDefault("id", "");

        // Build SQL statement
        SelectQueryBuilder queryBuilder = new SelectQueryBuilder("SELECT * FROM note");
        SelectQueryBuilder verificationQueryBuilder = null;
        String authEmail = getEmailFromToken(tokenClaims, context);

        // adding conditions according to the role
        String currentRole = evaluateCustomerRoles(roles);
        switch (currentRole) {
            case CUSTOMER_FULL_ADMIN:
                queryBuilder.appendCustomCondition("subaccount_id IN (SELECT s.id FROM subaccount s, customer_admin ca " +
                        "WHERE s.customer_id = ca.customer_id AND admin_email = ?)", authEmail);
                verificationQueryBuilder = new SelectQueryBuilder("SELECT s.id FROM subaccount s, customer_admin ca");
                verificationQueryBuilder.appendCustomCondition("s.customer_id = ca.customer_id AND admin_email = ?", authEmail);
                break;
            case SUBACCOUNT_ADMIN:
            case SUBACCOUNT_STAKEHOLDER:
                queryBuilder.appendCustomCondition("subaccount_id = (SELECT subaccount_id FROM subaccount_admin WHERE subaccount_admin_email = ?)", authEmail);
                verificationQueryBuilder = new SelectQueryBuilder("SELECT subaccount_id FROM subaccount_admin");
                verificationQueryBuilder.appendEqualsCondition("subaccount_admin_email", authEmail);
                break;
        }
        queryBuilder.appendEqualsCondition("subaccount_id", subaccountId, QueryBuilder.DATA_TYPE.UUID);

        if (verificationQueryBuilder != null) {
            if (currentRole.equals(CUSTOMER_FULL_ADMIN))
                verificationQueryBuilder.appendEqualsCondition("s.id", subaccountId, QueryBuilder.DATA_TYPE.UUID);
            else
                verificationQueryBuilder.appendEqualsCondition("subaccount_id", subaccountId, QueryBuilder.DATA_TYPE.UUID);
        }

        if (!status.isEmpty())
            queryBuilder.appendEqualsCondition("status", status, "note_status_type_enum");
        if (!noteId.isEmpty())
            queryBuilder.appendEqualsCondition("id", noteId, QueryBuilder.DATA_TYPE.UUID);

        queryBuilder.appendOrderBy("open_date", ORDER_DIRECTION.DESC);

        // Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");
        try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
            PreparedStatement selectStmt = queryBuilder.build(connection)) {

            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
            ResultSet rs;
            JSONObject json = new JSONObject();

            if (verificationQueryBuilder != null) {
                try (PreparedStatement verificationStmt = verificationQueryBuilder.build(connection)) {
                    context.getLogger().info("Execute SQL role verification statement: " + verificationStmt);
                    rs = verificationStmt.executeQuery();
                    if (!rs.next()) {
                        context.getLogger().info(LOG_MESSAGE_FOR_INVALID_ID + authEmail);
                        json.put("error", MESSAGE_FOR_INVALID_ID);
                        context.getLogger().info("User " + userId + " is leaving TekvLSGetAllNotes Azure function with error");
                        return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
                    }
                }
            }

            context.getLogger().info("Execute SQL statement: " + selectStmt);
            rs = selectStmt.executeQuery();
            // Return a JSON array of notes
            JSONArray notes = new JSONArray();
			String closeDate,closedBy,reports;
            while (rs.next()) {
                JSONObject item = new JSONObject();
                item.put("id", rs.getString("id"));
                item.put("subaccountId", rs.getString("subaccount_id"));
                item.put("content", rs.getString("content"));
				item.put("status", rs.getString("status"));
				item.put("openDate", rs.getString("open_date"));
				item.put("openedBy", rs.getString("opened_by").split(" ")[0]);
				closeDate = rs.getString("close_date");
				item.put("closeDate", closeDate != null ? closeDate.split(" ") : JSONObject.NULL);
				closedBy = rs.getString("closed_by");
				item.put("closedBy", closedBy != null ? closedBy : JSONObject.NULL);
                reports = rs.getString("reports");
                item.put("reports",reports != null ? new JSONArray(reports) : JSONObject.NULL);
                notes.put(item);
            }
            context.getLogger().info("List total " + notes.length() + " notes");
            json.put("notes", notes);
            context.getLogger().info("User " + userId + " is successfully leaving TekvLSGetAllNotes Azure function");
            return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();
        } catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSGetAllNotes Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSGetAllNotes Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }
}
