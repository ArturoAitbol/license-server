package com.function;

import com.function.auth.Resource;
import com.function.db.QueryBuilder;
import com.function.db.SelectQueryBuilder;
import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.BindingName;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import java.sql.*;
import java.util.*;

import static com.function.auth.RoleAuthHandler.*;

public class TekvLSGetAllFeatureToggles {
    /**
     * This function listens at endpoint "/v1.0/featureToggles". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/v1.0/featureToggles
     * 2. curl "{your host}/v1.0/featureToggles"
     */

    @FunctionName("TekvLSGetAllFeatureToggles")
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.GET},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "featureToggles/{id=EMPTY}")
            HttpRequestMessage<Optional<String>> request,
            @BindingName("id") String id,
            final ExecutionContext context) {

        Claims tokenClaims = getTokenClaimsFromHeader(request, context);
        JSONArray roles = getRolesFromToken(tokenClaims, context);
        if (roles.isEmpty()) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
            json.put("error", MESSAGE_FOR_UNAUTHORIZED);
            return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
        }
        if (!hasPermission(roles, Resource.GET_ALL_FEATURE_TOGGLES)) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        context.getLogger().info("Entering TekvLSGetAllFeatureToggles Azure function");
        // Get query parameters
        context.getLogger().info("URL parameters are: " + request.getQueryParameters());

        // Build SQL statement
        SelectQueryBuilder selectFTQueryBuilder = new SelectQueryBuilder("SELECT * FROM feature_toggle");

        if (!id.equals("EMPTY")) {
            selectFTQueryBuilder.appendEqualsCondition("id", id, QueryBuilder.DATA_TYPE.UUID);
        }

        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");

        // Connect to the database
        try (
                Connection connection = DriverManager.getConnection(dbConnectionUrl);
                PreparedStatement statement = selectFTQueryBuilder.build(connection)
        ) {

            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

            // Retrieve all feature toggles
            context.getLogger().info("Execute SQL statement: " + statement);
            ResultSet rs = statement.executeQuery();
            // Return a JSON array of feature toggles
            JSONObject json = new JSONObject();
            JSONArray array = new JSONArray();
            while (rs.next()) {
                JSONObject item = new JSONObject();
                item.put("id", rs.getString("id"));
                item.put("name", rs.getString("name"));
                item.put("customerName", rs.getString("customer_name"));
                item.put("author", rs.getString("author"));
                item.put("description", rs.getString("description"));
                array.put(item);
            }

            json.put("featureToggles", array);
            return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();
        } catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", "SQL Exception: " + e.getMessage());
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }
}
