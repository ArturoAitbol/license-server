package com.function;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.*;
import com.microsoft.azure.functions.annotation.*;
import com.microsoft.azure.functions.*;
import org.json.JSONObject;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSModifyBundleById {
    /**
     * This function listens at endpoint "/api/TekvLSModifyBundleById". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/api/TekvLSModifyBundleById
     * 2. curl {your host}/api/TekvLSModifyBundleById?name=HTTP%20Query
     */
    @FunctionName("TekvLSModifyBundleById")
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.PUT},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "bundles/{id=EMPTY}"
            ) HttpRequestMessage<Optional<String>> request,
            @BindingName("id") String id,
            final ExecutionContext context) {
        context.getLogger().info("Java HTTP trigger processed a request.");
        if (id.equals("EMPTY")) {
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body("Please pass an id on the query string").build();
        }
        // Parse request body and extract parameters needed
        String requestBody = request.getBody().orElse("");
        context.getLogger().info("Request body: " + requestBody);
        if (requestBody.isEmpty()) {
            context.getLogger().info("error: request body is empty.");
            JSONObject json = new JSONObject();
            json.put("error", "error: request body is empty.");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        JSONObject body;
        try{
            body = new JSONObject(requestBody);
        }
        catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        String[][] params = {
                {"name","name"},
                {"tokens","tokens"},
                {"deviceAccessToken","device_access_tokens"}
        };
        String columns ="";
        String values ="";
        String sql = "update bundle set ";
        for (int i = 0; i < params.length; i++) {
            try {
                String value = body.getString(params[i][0]);
                sql += params[i][1] + "='" + value + "',";
            }
            catch (Exception e) {
                context.getLogger().info("Ignoring exception: " + e);
//                continue;
            }
        }
        sql = sql.substring(0, sql.length() - 1);
        sql += " where id='" + id + "'";

        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses?ssl=true&sslmode=require"
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");
        try{
            Connection connection = DriverManager.getConnection(dbConnectionUrl);
            context.getLogger().info("Successfully connected to: " + dbConnectionUrl);
            Statement statement = connection.createStatement();
            context.getLogger().info("Execute SQL statement: " + sql);
            statement.executeUpdate(sql);
            context.getLogger().info("Bundle updated successfully");
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
