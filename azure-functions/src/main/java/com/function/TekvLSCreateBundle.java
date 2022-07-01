package com.function;

import java.sql.*;
import java.util.*;

import com.function.auth.Permission;
import com.microsoft.azure.functions.annotation.*;
import com.microsoft.azure.functions.*;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSCreateBundle {
    /**
     * This function listens at endpoint "/api/bundles". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/api/bundles
     * 2. curl {your host}/api/bundle?name=HTTP%20Query
     */
    @FunctionName("TekvLSCreateBundle")
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.POST},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "bundles")
            HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context) {

        String currentRole = getRoleFromToken(request,context);
        if(currentRole.isEmpty()){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
            json.put("error", MESSAGE_FOR_UNAUTHORIZED);
            return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
        }
        if(!hasPermission(currentRole, Permission.CREATE_BUNDLE)){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + currentRole);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        context.getLogger().info("Java HTTP trigger processed a request.");

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
            jobj = new JSONObject(requestBody);;
        }
        catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        String[][] mandatoryParams = {
                {"name","name"},
                {"tokens","tokens"},
                {"deviceAccessToken","device_access_tokens"}
        };
        String columns = "";
        String values = "";
        for (int i = 0; i < mandatoryParams.length; i++) {
            try {
                columns += mandatoryParams[i][1] + ",";
                values += "'" + jobj.get(mandatoryParams[i][0]) + "',";
            }
            catch (Exception e) {
                // Parameter not found
                context.getLogger().info("Caught exception: " + e.getMessage());
                JSONObject json = new JSONObject();
                json.put("error", "Missing mandatory parameter: " + mandatoryParams[i][0]);
                return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
            }
        }
        columns = columns.substring(0, columns.length()-1);
        values = values.substring(0, values.length()-1);
        String sql = "insert into bundle (" + columns + ") values (" + values + ")";

        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses?ssl=true&sslmode=require"
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");
        try {
            Connection connection = DriverManager.getConnection(dbConnectionUrl);
            context.getLogger().info("Successfully connected to: " + dbConnectionUrl);
            Statement statement = connection.createStatement();
            context.getLogger().info("Execute SQL statement: " + sql);
            statement.executeUpdate(sql);

            String getId = "select * from bundle where name = '" + jobj.getString("name") + "'";
            ResultSet bundleRaw = statement.executeQuery(getId);
            bundleRaw.next();
            JSONObject response = new JSONObject();
            response.put("id", bundleRaw.getString("id"));

            return request.createResponseBuilder(HttpStatus.OK).body(response.toString()).build();
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
