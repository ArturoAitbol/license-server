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
public class TekvLSGetAllLicenses {
    /**
     * This function listens at endpoint "/api/licenses?subaccountId={subaccountId}". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/api/licenses?subaccountId={subaccountId}
     * 2. curl "{your host}/api/subaccounts"
     */
    @FunctionName("TekvLSGetAllLicenses")
    public HttpResponseMessage run(
            @HttpTrigger(
                name = "req",
                methods = {HttpMethod.GET},
                authLevel = AuthorizationLevel.ANONYMOUS,
                route = "licenses")
                HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context) {

        context.getLogger().info("Entering TekvLSGetAllLicenses Azure function");
        context.getLogger().info("GET parameters are: " + request.getQueryParameters());
        // Get the optional subaccountId parameter
        String subaccountId = request.getQueryParameters().getOrDefault("subaccountId", "");
        if (subaccountId.isEmpty()) {
            context.getLogger().info("subaccountId parameter is not present");
        }
        
        // Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://tekv-db-server.postgres.database.azure.com:5432/licenses?ssl=true&sslmode=require"
                + "&user=tekvdbadmin@tekv-db-server"
                + "&password=MhZJh94z9D3Db3vW";
        try (
            Connection connection = DriverManager.getConnection(dbConnectionUrl);
            Statement statement = connection.createStatement();) {
            
            context.getLogger().info("Successfully connected to: " + dbConnectionUrl);
            
            // Retrive all licenses. TODO: pagination
            String sql = (subaccountId.isEmpty())? 
                "select id,subaccount_id,purchase_date,package_type,renewal_date,tokens,device_access_limit,status from license;" : 
                "select id,subaccount_id,purchase_date,package_type,renewal_date,tokens,device_access_limit,status from license " + 
                    "where subaccount_id = '" + subaccountId + "';";
            context.getLogger().info("Execute SQL statement: " + sql);
            ResultSet rs = statement.executeQuery(sql);
            // Return a JSON array of subaccounts (id and names)
            JSONObject json = new JSONObject();
            JSONArray array = new JSONArray();
            while (rs.next()) {
                JSONObject item = new JSONObject();
                item.put("id", rs.getString("id"));
                item.put("subaccountId", rs.getString("subaccount_id"));
                item.put("purchaseDate", rs.getString("purchase_date"));
                item.put("packageType", rs.getString("package_type"));
                item.put("renewalDate", rs.getString("renewal_date"));
                item.put("tokensPurchased", rs.getString("tokens"));
                item.put("deviceLimit", rs.getString("device_access_limit"));
                item.put("status", rs.getString("status"));
                array.put(item);
            }
            json.put("licenses", array);
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
