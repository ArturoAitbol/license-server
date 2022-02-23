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

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetAllCustomers {
    /**
     * This function listens at endpoint "/api/customers". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/api/customers
     * 2. curl "{your host}/api/customers"
     */
    @FunctionName("TekvLSGetAllCustomers")
    public HttpResponseMessage run(
            @HttpTrigger(
                name = "req",
                methods = {HttpMethod.GET},
                authLevel = AuthorizationLevel.ANONYMOUS,
                route = "customers")
                HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context) {

        context.getLogger().info("Entering TekvLSCustomers Azure function");
        
        // Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://tekv-db-server.postgres.database.azure.com:5432/licenses?ssl=true&sslmode=require"
                + "&user=tekvdbadmin@tekv-db-server"
                + "&password=MhZJh94z9D3Db3vW";
        try (
            Connection connection = DriverManager.getConnection(dbConnectionUrl);
            Statement statement = connection.createStatement();) {
            
            context.getLogger().info("Successfully connected to: " + dbConnectionUrl);
            
            // Retrive all customers. TODO: pagination
            String sql = "select id,name from customer;";
            context.getLogger().info("Execute SQL statement: " + sql);
            ResultSet rs = statement.executeQuery(sql);
            // Return a JSON array of customers (id and names)
            JSONObject json = new JSONObject();
            JSONArray array = new JSONArray();
            while (rs.next()) {
                JSONObject item = new JSONObject();
                item.put("id", rs.getString("id"));
                item.put("name", rs.getString("name"));
                array.put(item);
            }
            json.put("customers", array);
            return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();
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
