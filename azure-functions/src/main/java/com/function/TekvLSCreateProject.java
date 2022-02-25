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
public class TekvLSCreateProject 
{
    /**
     * This function listens at endpoint "/api/projects". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/api/projects
     */
    @FunctionName("TekvLSCreateProject")
    public HttpResponseMessage run(
            @HttpTrigger(
                name = "req",
                methods = {HttpMethod.POST},
                authLevel = AuthorizationLevel.ANONYMOUS,
                route = "projects")
                HttpRequestMessage<Optional<String>> request,
                final ExecutionContext context) 
    {
        context.getLogger().info("Entering TekvLSCreateProject Azure function");
        
        // Parse request body and extract parameters needed
        String requestBody = request.getBody().orElse("");
        context.getLogger().info("Request body: " + requestBody);
        String subaccountId = "";
        String name = "";
        String number = "";
        String status = "";
        String openDate = "";
        // This is optional
        String closeDate = "";
        if (!requestBody.isEmpty()) {
            try {
                JSONObject jobj = new JSONObject(requestBody);
                subaccountId = jobj.getString("subaccountId");
                name = jobj.getString("name");
                number = jobj.getString("number");
                status = jobj.getString("status");
                openDate = jobj.getString("openDate");
                closeDate = jobj.getString("closeDate");
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
        if (name.isEmpty()) {
            context.getLogger().info("error: empty name parameter");
            JSONObject json = new JSONObject();
            json.put("error", "error: empty name parameter");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        if (number.isEmpty()) {
            context.getLogger().info("error: empty number parameter");
            JSONObject json = new JSONObject();
            json.put("error", "error: empty number parameter");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        if (status.isEmpty()) {
            context.getLogger().info("error: empty status parameter");
            JSONObject json = new JSONObject();
            json.put("error", "error: empty status parameter");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        if (openDate.isEmpty()) {
            context.getLogger().info("error: empty openDate parameter");
            JSONObject json = new JSONObject();
            json.put("error", "error: empty openDate parameter");
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
            
            // Insert project
            String sql = "insert into project (subaccount_id,name,number,open_date,close_date,status) values (" + 
                "'" + subaccountId + "'," +
                "'" + name + "'," +
                "'" + number + "'," +
                "'" + openDate + "'," +
                "'" + closeDate + "'," +
                "'" + status + "');";
            context.getLogger().info("Execute SQL statement: " + sql);
            statement.executeUpdate(sql);
            context.getLogger().info("Project inserted successfully."); 

            // Return the project id in the response
            sql = "select id from project where " + 
                "subaccount_id='" + subaccountId + "' and " +
                "name='" + name + "' and " +
                "number='" + number + "' and " +
                "open_date='" + openDate + "' and " +
                "close_date='" + closeDate + "' and " +
                "status='" + status + "';";
            context.getLogger().info("Execute SQL statement: " + sql);
            ResultSet rs = statement.executeQuery(sql);
            rs.next();
            JSONObject json = new JSONObject();
            json.put("projectId", rs.getString("id"));
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
