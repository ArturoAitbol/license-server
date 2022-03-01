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

import org.json.JSONObject;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSDeleteProjectById 
{
    /**
     * This function listens at endpoint "/api/projects". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/api/projects
     */
    @FunctionName("TekvLSDeleteProjectById")
    public HttpResponseMessage run(
            @HttpTrigger(
                name = "req",
                methods = {HttpMethod.DELETE},
                authLevel = AuthorizationLevel.ANONYMOUS,
                route = "projects/{id}")
                HttpRequestMessage<Optional<String>> request,
                @BindingName("id") String id,
                final ExecutionContext context) 
    {
        context.getLogger().info("Entering TekvLSDeleteProjectById Azure function");
        
// TODO: I have disabled delete for the moment
            JSONObject json = new JSONObject();
            json.put("error", "Function is disabled");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
/*
        // Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://tekv-db-server.postgres.database.azure.com:5432/licenses?ssl=true&sslmode=require"
                + "&user=tekvdbadmin@tekv-db-server"
                + "&password=MhZJh94z9D3Db3vW";
        try (
            Connection connection = DriverManager.getConnection(dbConnectionUrl);
            Statement statement = connection.createStatement();) {
            
            context.getLogger().info("Successfully connected to:" + dbConnectionUrl);
            
            // Delete project
            String sql = "delete from project where id='" + id +"';";
            context.getLogger().info("Execute SQL statement: " + sql);
            statement.executeUpdate(sql);
            context.getLogger().info("Project delete successfully."); 

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
*/
    }
}