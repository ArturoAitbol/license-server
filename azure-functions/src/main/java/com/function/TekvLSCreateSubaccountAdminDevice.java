package com.function;

import com.function.auth.Resource;
import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

import static com.function.auth.RoleAuthHandler.*;

public class TekvLSCreateSubaccountAdminDevice {
    final String DEVICE_ALREADY_REGISTERED_FOR_USER_MESSAGE = "User already registered with this device";

    @FunctionName("TekvLSCreateSubaccountAdminDevice")
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.POST},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "subaccountAdminDevices")
            HttpRequestMessage<Optional<String>> request,
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
        if(!hasPermission(roles, Resource.CREATE_SUBACCOUNT_ADMIN_DEVICE)){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        String userId = getUserIdFromToken(tokenClaims, context);
        context.getLogger().info("User " + userId + " is Entering TekvLSCreateSubaccountAdminDevice Azure function");

        // Parse request body and extract parameters needed
        String requestBody = request.getBody().orElse("");
        context.getLogger().info("Request body: " + requestBody);
        if (requestBody.isEmpty()) {
            context.getLogger().info("error: request body is empty.");
            JSONObject json = new JSONObject();
            json.put("error", "error: request body is empty.");
            context.getLogger().info("User " + userId + " is leaving TekvLSCreateSubaccountAdminDevice Azure function with error");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }

        JSONObject jobj;
        try {
            jobj = new JSONObject(requestBody);
        }
        catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSCreateSubaccountAdminDevice Azure function with error");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }

        // Check mandatory params to be present
        for (MANDATORY_PARAMS mandatoryParam: MANDATORY_PARAMS.values()) {
            if (!jobj.has(mandatoryParam.value)) {
                // Parameter not found
                context.getLogger().info("Missing mandatory parameter: " + mandatoryParam.value);
                JSONObject json = new JSONObject();
                json.put("error", "Missing mandatory parameter: " + mandatoryParam.value);
                context.getLogger().info("User " + userId + " is leaving TekvLSCreateSubaccountAdminDevice Azure function with error");
                return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
            }
        }
        // Sql query to get user device info
        final String getUserDeviceSql = "SELECT * FROM subaccount_admin_device sad WHERE device_token = ?;";

        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");

        try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
             PreparedStatement getStatement = connection.prepareStatement(getUserDeviceSql)) {
            getStatement.setString(1, jobj.getString(MANDATORY_PARAMS.DEVICE_TOKEN.value));
            ResultSet rs = getStatement.executeQuery();
            String sql;
            if (rs.next()) {
                if (rs.getString("subaccount_admin_email").equals(userEmail)) {
                    // if device already registered for this email, skip update action
                    context.getLogger().info(DEVICE_ALREADY_REGISTERED_FOR_USER_MESSAGE);
                    JSONObject json = new JSONObject();
                    json.put("message", DEVICE_ALREADY_REGISTERED_FOR_USER_MESSAGE);
                    context.getLogger().info("User " + userId + " is successfully leaving TekvLSCreateSubaccountAdminDevice Azure function");
                    return request.createResponseBuilder(HttpStatus.OK).body(json.toString()).build();
                }
                sql = "UPDATE subaccount_admin_device SET subaccount_admin_email = ? WHERE device_token = ?;";
            } else
            sql = "INSERT INTO subaccount_admin_device (subaccount_admin_email, device_token) VALUES (?, ?);";
            PreparedStatement updateStatement = connection.prepareStatement(sql);
            updateStatement.setString(1, userEmail);
            updateStatement.setString(2, jobj.getString(MANDATORY_PARAMS.DEVICE_TOKEN.value));
            updateStatement.execute();
            context.getLogger().info("User " + userId + " is successfully leaving TekvLSCreateSubaccountAdminDevice Azure function");
            return request.createResponseBuilder(HttpStatus.OK).build();
        } catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSCreateSubaccountAdminDevice Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSCreateSubaccountAdminDevice Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }

    private enum MANDATORY_PARAMS {

        DEVICE_TOKEN("deviceToken");

        private final String value;

        MANDATORY_PARAMS(String value) {
            this.value = value;
        }
    }
}
