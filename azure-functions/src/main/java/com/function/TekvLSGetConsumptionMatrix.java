package com.function;

import com.function.auth.Resource;
import com.function.db.SelectQueryBuilder;
import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import java.sql.*;
import java.util.*;

import static com.function.auth.RoleAuthHandler.*;

public class TekvLSGetConsumptionMatrix {

    @FunctionName("TekvLSGetConsumptionMatrix")
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.GET},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "consumptionMatrix/")
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
        if (!hasPermission(roles, Resource.GET_CONSUMPTION_MATRIX)) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        String userId = getUserIdFromToken(tokenClaims, context);
        context.getLogger().info("User " + userId + " is Entering TekvLSGetConsumptionMatrix Azure function");

        // Build SQL statement, customers left outer join subaccount, license, project, license_consumption
        SelectQueryBuilder queryBuilder = new SelectQueryBuilder("SELECT * FROM consumption_matrix", false);

        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER") + "&password=" + System.getenv("POSTGRESQL_PWD");

        // Connect to the database
        try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
             PreparedStatement statement = queryBuilder.build(connection)) {

            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

            // Retrieve all customers.
            context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + statement);
            ResultSet rs = statement.executeQuery();

            JSONObject json = new JSONObject();
            JSONArray array = new JSONArray();
            while (rs.next()) {
                JSONObject item = new JSONObject();
                item.put("id", rs.getString("id"));
                item.put("tokens", rs.getString("tokens"));
                item.put("dutType", rs.getString("dut_type"));
                item.put("callingPlatform", rs.getString("calling_platform"));
                item.put("updatedBy", rs.getString("updated_by"));
                array.put(item);
            }
            json.put("consumptionMatrix", array);

            context.getLogger().info("User " + userId + " is successfully leaving TekvLSGetConsumptionMatrix Azure function");
            return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();

        } catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", "SQL Exception: " + e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSGetConsumptionMatrix Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSGetConsumptionMatrix Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }
}
