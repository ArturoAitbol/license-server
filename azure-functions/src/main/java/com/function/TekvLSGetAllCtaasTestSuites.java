package com.function;

import static com.function.auth.RoleAuthHandler.*;

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
import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpMethod;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;

import io.jsonwebtoken.Claims;

public class TekvLSGetAllCtaasTestSuites {
    /**
     * This function listens at endpoint "/v1.0/ctaasTestSuites". Two ways to invoke
     * it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/v1.0/ctaasTestSuites
     * 2. curl "{your host}/v1.0/ctaasTestSuites"
     */
    @FunctionName("TekvLSGetAllCtaasTestSuites")
    public HttpResponseMessage run(
            @HttpTrigger(name = "req", methods = {
                    HttpMethod.GET }, authLevel = AuthorizationLevel.ANONYMOUS, route = "ctaasTestSuites") HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context) {

        Claims tokenClaims = getTokenClaimsFromHeader(request, context);
        JSONArray roles = getRolesFromToken(tokenClaims, context);
        if (roles.isEmpty()) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
            json.put("error", MESSAGE_FOR_UNAUTHORIZED);
            return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
        }
        if (!hasPermission(roles, Resource.GET_ALL_CTAAS_SETUPS)) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSGetAllCtaasTestSuites Azure function");
        
        // Get query parameters
        context.getLogger().info("URL parameters are: " + request.getQueryParameters());
        String subaccountId = request.getQueryParameters().getOrDefault("subaccountId", "");

        // Build SQL statement
        SelectQueryBuilder queryBuilder = new SelectQueryBuilder("SELECT * FROM ctaas_test_suite");

        // adding conditions according to the role

        if (!subaccountId.isEmpty())
            queryBuilder.appendEqualsCondition("subaccount_id", subaccountId, QueryBuilder.DATA_TYPE.UUID);

        // Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses"
                + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER") + "&password=" + System.getenv("POSTGRESQL_PWD");

        try (
                Connection connection = DriverManager.getConnection(dbConnectionUrl);
                PreparedStatement selectStmt = queryBuilder.build(connection)) {

            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
            ResultSet rs;
            JSONObject json = new JSONObject();

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
                item.put("suiteName", rs.getString("name"));
                array.put(item);
            }

            if (array.isEmpty()) {
                context.getLogger().info(LOG_MESSAGE_FOR_INVALID_ID);
                json.put("error", MESSAGE_ID_NOT_FOUND);
            }

            json.put("ctaasTestSuites", array);
            context.getLogger().info("User " + userId + " is successfully leaving TekvLSGetAllCtaasTestSuites Azure function");
            return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json")
                    .body(json.toString()).build();
        } catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSGetAllCtaasTestSuites Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSGetAllCtaasTestSuites Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }
}
