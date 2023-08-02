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

import java.net.URLDecoder;
import java.sql.*;
import java.util.Optional;

import static com.function.auth.RoleAuthHandler.*;

public class TekvLSGetAllDeviceVendors {
    /**
     * This function listens at endpoint "/v1.0/devices/{vendor}/{product}/{version}". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/v1.0/devices/{vendor}/{product}/{version}
     * 2. curl "{your host}/v1.0/devices"
     */
    @FunctionName("TekvLSGetAllVendors")
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.GET},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "vendors/")
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
        if (!hasPermission(roles, Resource.GET_ALL_DEVICES)) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        String userId = getUserIdFromToken(tokenClaims, context);
        context.getLogger().info("User " + userId + " is Entering TekvLSGetAllVendors Azure function");
        
        String deviceType = request.getQueryParameters().getOrDefault("deviceType", "");
        try {
            deviceType = URLDecoder.decode(deviceType, "UTF-8");
            
        } catch (Exception e) {
            deviceType = "";
        }

        SelectQueryBuilder vendorQueryBuilder = new SelectQueryBuilder("SELECT DISTINCT vendor FROM device WHERE support_type = 'false'", true);
        SelectQueryBuilder supportVendorQueryBuilder = new SelectQueryBuilder("SELECT DISTINCT vendor FROM device WHERE support_type = 'true'", true);

        if (!deviceType.isEmpty()) {
            vendorQueryBuilder.appendCustomCondition("?::device_type_enum = type", deviceType);
            supportVendorQueryBuilder.appendCustomCondition("?::device_type_enum = type", deviceType);
        }
        
        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");

        try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
             PreparedStatement vendorStmt = vendorQueryBuilder.build(connection);
             PreparedStatement supportStmt = supportVendorQueryBuilder.build(connection)) {
            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

            // Execute sql query.
            context.getLogger().info("Execute SQL statement: " + vendorStmt);
            ResultSet rs = vendorStmt.executeQuery();

            JSONObject json = new JSONObject();
            JSONArray vendorArray = new JSONArray();

            while (rs.next()) {
                vendorArray.put(rs.getString("vendor"));
            }

            json.put("vendors", vendorArray);

            // Execute sql query.
            context.getLogger().info("Execute SQL statement: " + supportStmt);
            rs = supportStmt.executeQuery();

            JSONArray supportArray = new JSONArray();

            while (rs.next()) {
                supportArray.put(rs.getString("vendor"));
            }

            json.put("supportVendors", supportArray);

            context.getLogger().info("User " + userId + " is successfully leaving TekvLSGetAllVendors Azure function");
            return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();
        } catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSGetAllVendors Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSGetAllVendors Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }
}
