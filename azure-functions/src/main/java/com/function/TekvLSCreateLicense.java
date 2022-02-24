package com.function;

import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpMethod;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;

import java.sql.*;
import java.util.Optional;

import org.json.JSONObject;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSCreateLicense {
    /**
     * This function listens at endpoint "/api/licenses". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/api/licenses
     */
    @FunctionName("TekvLSCreateLicense")
    public HttpResponseMessage run(
            @HttpTrigger(
                name = "req",
                methods = {HttpMethod.POST},
                authLevel = AuthorizationLevel.ANONYMOUS,
                route = "licenses")
                HttpRequestMessage<Optional<String>> request,
                final ExecutionContext context) {
        context.getLogger().info("Entering TekvLSCreateLicense Azure function");
        
        // Parse request body and extract parameters needed
        String requestBody = request.getBody().orElse("");
        context.getLogger().info("Request body: " + requestBody);
        String subaccountId = "";
        String purchaseDate = "";
        String packageType = "";
        String tokensPurchased = "";
        String deviceLimit = "";
        String renewalDate = "";
        if (!requestBody.isEmpty()) {
            try {
                JSONObject jobj = new JSONObject(requestBody);
                subaccountId = jobj.getString("subaccountId");
                purchaseDate = jobj.getString("purchaseDate");
                packageType = jobj.getString("packageType");
                tokensPurchased = jobj.getString("tokensPurchased");
                deviceLimit = jobj.getString("deviceLimit");
                renewalDate = jobj.getString("renewalDate");
            } catch (Exception e) {
                context.getLogger().info("Caught exception: " + e.getMessage());
                JSONObject json = new JSONObject();
                json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
            }
        } else {
            context.getLogger().info("error: request body is empty.");
            JSONObject json = new JSONObject();
            json.put("error", "error: request body is empty.");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        if (subaccountId.isEmpty()) {
            context.getLogger().info("error: empty subaccountId parameter");
            JSONObject json = new JSONObject();
            json.put("error", "error: empty subaccountId parameter");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        if (purchaseDate.isEmpty()) {
            context.getLogger().info("error: empty purchaseDate parameter");
            JSONObject json = new JSONObject();
            json.put("error", "error: empty purchaseDate parameter");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        if (packageType.isEmpty()) {
            context.getLogger().info("error: empty packageType parameter");
            JSONObject json = new JSONObject();
            json.put("error", "error: empty packageType parameter");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        if (tokensPurchased.isEmpty()) {
            context.getLogger().info("error: empty tokensPurchased parameter");
            JSONObject json = new JSONObject();
            json.put("error", "error: empty tokensPurchased parameter");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        if (deviceLimit.isEmpty()) {
            context.getLogger().info("error: empty deviceLimit parameter");
            JSONObject json = new JSONObject();
            json.put("error", "error: empty deviceLimit parameter");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        if (renewalDate.isEmpty()) {
            context.getLogger().info("error: empty renewalDate parameter");
            JSONObject json = new JSONObject();
            json.put("error", "error: empty renewalDate parameter");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }

        // Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://tekv-db-server.postgres.database.azure.com:5432/licenses?ssl=true&sslmode=require"
                + "&user=tekvdbadmin@tekv-db-server"
                + "&password=MhZJh94z9D3Db3vW";
        try (
            Connection connection = DriverManager.getConnection(dbConnectionUrl);
            Statement statement = connection.createStatement();) {
            
            context.getLogger().info("Successfully connected to:" + dbConnectionUrl);
            
            // Insert license.
            String sql = "insert into license (subaccount_id,purchase_date,package_type,tokens,device_access_limit,renewal_date) values (" + 
                "'" + subaccountId + "'," +
                "'" + purchaseDate + "'," +
                "'" + packageType + "'," +
                "'" + tokensPurchased + "'," +
                "'" + deviceLimit + "'," +
                "'" + renewalDate + "');";
            context.getLogger().info("Execute SQL statement: " + sql);
            statement.executeUpdate(sql);
            context.getLogger().info("License inserted successfully."); 

            JSONObject json = new JSONObject();
            json.put("status", "success");
            return request.createResponseBuilder(HttpStatus.OK).body(json.toString()).build();
        }
        catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
    }
}
