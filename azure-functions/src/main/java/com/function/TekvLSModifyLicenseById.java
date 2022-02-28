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
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

import org.json.JSONObject;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSModifyLicenseById 
{
    /**
     * This function listens at endpoint "/api/licenses/{id}". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/api/licenses/{id}
     */
    @FunctionName("TekvLSModifyLicenseById")
    public HttpResponseMessage run(
            @HttpTrigger(
                name = "req",
                methods = {HttpMethod.PUT},
                authLevel = AuthorizationLevel.ANONYMOUS,
                route = "licenses/{id}")
                HttpRequestMessage<Optional<String>> request,
                @BindingName("id") String id,
                final ExecutionContext context) 
    {
        context.getLogger().info("Entering TekvLSModifyLicenseById Azure function");
        
        // Parse request body and extract parameters needed
        String requestBody = request.getBody().orElse("");
        context.getLogger().info("Request body: " + requestBody);
        if (requestBody.isEmpty()) {
            context.getLogger().info("error: request body is empty.");
            JSONObject json = new JSONObject();
            json.put("error", "error: request body is empty.");
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
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }

        // The expected parameters (and their coresponding column name in the database) 
        String[][] optionalParams = {
            {"subaccountId","subaccount_id"}, 
            {"purchaseDate","purchase_date"}, 
            {"packageType","package_type"}, 
            {"renewalDate","renewal_date"}, 
            {"tokens","tokens"}, 
            {"deviceAccessLimit","device_access_limit"}, 
            {"status","status"}};
        // Build the sql query
        String sql = "update license set ";
        int optionalParamsFound = 0;
        for (int i = 0; i < optionalParams.length; i++) {
            try {
                String paramName = jobj.getString(optionalParams[i][0]);
                sql += optionalParams[i][1] + "='" + paramName + "',";
                optionalParamsFound++;
            } 
            catch (Exception e) {
                // Parameter doesn't exist. (continue since it's optional)
                context.getLogger().info("Ignoring exception: " + e);
                continue;
            }
        }
        if (optionalParamsFound == 0) {
            return request.createResponseBuilder(HttpStatus.OK).build();
        }
        // Remove the comma after the last parameter and add the where clause
        sql = sql.substring(0, sql.length() - 1);
        sql += " where id='" + id + "';";

        // Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://tekv-db-server.postgres.database.azure.com:5432/licenses?ssl=true&sslmode=require"
                + "&user=tekvdbadmin@tekv-db-server"
                + "&password=MhZJh94z9D3Db3vW";
        try (
            Connection connection = DriverManager.getConnection(dbConnectionUrl);
            Statement statement = connection.createStatement();) {
            
            context.getLogger().info("Successfully connected to:" + dbConnectionUrl);
            context.getLogger().info("Execute SQL statement: " + sql);
            statement.executeUpdate(sql);
            context.getLogger().info("License updated successfully."); 

            return request.createResponseBuilder(HttpStatus.OK).build();
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
