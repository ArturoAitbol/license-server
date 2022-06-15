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
public class TekvLSDeleteBundleById {
    /**
     * This function listens at endpoint "/api/bundle". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/api/bundle
     * 2. curl {your host}/api/bundle
     */
    @FunctionName("TekvLSDeleteBundle")
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.DELETE},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "bundles/{id=EMPTY}"
            ) HttpRequestMessage<Optional<String>> request,
            @BindingName("id") String id,
            final ExecutionContext context) {
        context.getLogger().info("Java HTTP trigger processed a request.");
        if (id.equals("EMPTY")) {
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body("Please pass an id on the query string").build();
        }
        String sql = "delete from bundle where id='" + id + "'";

        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses?ssl=true&sslmode=require"
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");
        try{
            Connection connection = DriverManager.getConnection(dbConnectionUrl);
            context.getLogger().info("Successfully connected to: " + dbConnectionUrl);
            Statement statement = connection.createStatement();
            context.getLogger().info("Execute SQL statement: " + sql);
            statement.executeUpdate(sql);
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
