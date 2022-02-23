package com.function;

import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpMethod;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import com.microsoft.azure.functions.annotation.BindingName;

import java.sql.*;
import java.util.Optional;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetSubaccountById {
    /**
     * This function listens at endpoint "/api/subaccounts/{id}". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/api/subaccounts/{id}
     * 2. curl "{your host}/api/subaccounts/{id}"
     */
    @FunctionName("TekvLSGetSubaccountById")
    public HttpResponseMessage run(
            @HttpTrigger(
                name = "req",
                methods = {HttpMethod.GET},
                authLevel = AuthorizationLevel.ANONYMOUS,
                route = "subaccounts/{id}")
                HttpRequestMessage<Optional<String>> request,
                @BindingName("id") String id,
                final ExecutionContext context) {

        if (id == null) {
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST)
                       .body("Missing subsccount id.")
                       .build();
        } 
        context.getLogger().info("Entering TekvLSGetSubaccountById Azure function. Route: " + id);
        
        
        // Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://tekv-db-server.postgres.database.azure.com:5432/licenses?ssl=true&sslmode=require"
                + "&user=tekvdbadmin@tekv-db-server"
                + "&password=MhZJh94z9D3Db3vW";
        try (
            Connection connection = DriverManager.getConnection(dbConnectionUrl);
            Statement statement = connection.createStatement();) {
            
            context.getLogger().info("Successfully connected to: " + dbConnectionUrl);
            
            // Retrive subaccount
            String sql = "select purchase_date,expiry_date,package_type,status from subaccount where id = '" + id + "';";
            context.getLogger().info("Execute SQL statement: " + sql);
            ResultSet rs = statement.executeQuery(sql);
            // Return a JSON array of subaccounts (id and names)
            JSONObject json = new JSONObject();
            if (rs.next() == false) {
                context.getLogger().info("Subaccount with id='" + id + "' doesn't exist.");
                return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body("Subaccount with id='" + id + "' doesn't exist.").build();
            } else {
                json.put("purchaseDate", rs.getString("purchase_date"));
                json.put("renewalDate", rs.getString("expiry_date"));
                json.put("packageType", rs.getString("package_type"));
                json.put("status", rs.getString("status"));
                return request.createResponseBuilder(HttpStatus.OK)
                           .header("Content-Type", "application/json")
                           .body(json.toString())
                           .build();
            }
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
