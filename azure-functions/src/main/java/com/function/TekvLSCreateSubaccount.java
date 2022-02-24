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
public class TekvLSCreateSubaccount {
    /**
     * This function listens at endpoint "/api/subaccounts". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/api/subaccounts
     */
    @FunctionName("TekvLSCreateSubaccount")
    public HttpResponseMessage run(
            @HttpTrigger(
                name = "req",
                methods = {HttpMethod.POST},
                authLevel = AuthorizationLevel.ANONYMOUS,
                route = "subaccounts")
                HttpRequestMessage<Optional<String>> request,
                final ExecutionContext context) {
        context.getLogger().info("Entering TekvLSCreateSubaccount Azure function");
        
        // Parse request body and extract parameters needed
        String requestBody = request.getBody().orElse("");
        context.getLogger().info("Request body: " + requestBody);
        String subaccountName = "";
        String customerId = "";
        if (!requestBody.isEmpty()) {
            try {
                JSONObject jobj = new JSONObject(requestBody);
                subaccountName = jobj.getString("subaccountName");
                customerId = jobj.getString("customerId");
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
        if (subaccountName.isEmpty()) {
            context.getLogger().info("error: empty subaccountName parameter");
            JSONObject json = new JSONObject();
            json.put("error", "error: empty subaccountName parameter");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        if (customerId.isEmpty()) {
            context.getLogger().info("error: empty customerId parameter");
            JSONObject json = new JSONObject();
            json.put("error", "error: empty customerId parameter");
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
            
            // Insert subaccount. TODO: check if subaccount name exists?
            String sql = "insert into subaccount (name,customer_id) values ('" + subaccountName + "','" + customerId + "');";
            context.getLogger().info("Execute SQL statement: " + sql);
            statement.executeUpdate(sql);
            context.getLogger().info("Subaccount inserted successfully."); 

            // Return the subaccount id in the response
            sql = "select id from subaccount where name = '" + subaccountName + "' and customer_id = '" + customerId + "';";
            context.getLogger().info("Execute SQL statement: " + sql);
            ResultSet rs = statement.executeQuery(sql);
            rs.next();
            JSONObject json = new JSONObject();
            json.put("subaccountId", rs.getString("id"));
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
