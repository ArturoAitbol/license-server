package com.function;

import com.function.auth.Resource;
import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.BindingName;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import java.sql.*;
import java.util.Optional;

import static com.function.auth.RoleAuthHandler.*;

public class TekvLSDeleteSubaccountAdminDevice {
    @FunctionName("TekvLSDeleteSubaccountAdminDevice")
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.DELETE},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "subaccountAdminDevices/{deviceToken}")
            HttpRequestMessage<Optional<String>> request,
            @BindingName("deviceToken") String deviceToken,
            final ExecutionContext context) {

        Claims tokenClaims = getTokenClaimsFromHeader(request, context);
        String userEmail = getEmailFromToken(tokenClaims, context);
        JSONArray roles = getRolesFromToken(tokenClaims, context);
        if(roles.isEmpty()){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
            json.put("error", MESSAGE_FOR_UNAUTHORIZED);
            return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
        }
        if(!hasPermission(roles, Resource.DELETE_SUBACCOUNT_ADMIN_DEVICE)){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSDeleteSubaccountAdminDevice Azure function");

        String sql = "DELETE FROM subaccount_admin_device WHERE subaccount_admin_email = ? AND device_token = ?;";

        // Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");
        try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
             PreparedStatement statement = connection.prepareStatement(sql)) {

            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
            statement.setString(1, userEmail);
            statement.setString(2, deviceToken);

            // Delete subaccount admin device
            context.getLogger().info("Execute SQL statement: " + statement);
            statement.executeUpdate();
            context.getLogger().info("Subaccount Admin device deleted successfully.");

            context.getLogger().info("User " + userId + " is successfully leaving TekvLSDeleteSubaccountAdminDevice Azure function");
            return request.createResponseBuilder(HttpStatus.OK).build();
        } catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", "SQL Exception: " + e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSDeleteSubaccountAdminDevice Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSDeleteSubaccountAdminDevice Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }
}
