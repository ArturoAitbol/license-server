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
     * This function listens at endpoint "/v1.0/bundles". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/v1.0/bundles
     * 2. curl {your host}/v1.0/bundle?name=HTTP%20Query
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
            context.getLogger().info("Error: Request body is empty.");
            JSONObject json = new JSONObject();
            json.put("error", "Request body is empty.");
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

        // Check mandatory params to be present
        for (MANDATORY_PARAMS mandatoryParam : MANDATORY_PARAMS.values()) {
              if (!jobj.has(mandatoryParam.value)) {
                // Parameter not found
                context.getLogger().info("Missing mandatory parameter: " + mandatoryParam.value);
                JSONObject json = new JSONObject();
                json.put("error", "Missing mandatory parameter: " + mandatoryParam.value);
                return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
            }
        }

        //Build the sql query
        String sql = "INSERT INTO bundle (name, tokens, device_access_tokens) VALUES (?,?::integer,?::integer) RETURNING id";

        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");

        try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
             PreparedStatement statement = connection.prepareStatement(sql)) {

            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

            // Set statement parameters
            statement.setString(1, jobj.getString(MANDATORY_PARAMS.NAME.value));
            statement.setString(2, jobj.getString(MANDATORY_PARAMS.TOKENS.value));
            statement.setString(3, jobj.getString(MANDATORY_PARAMS.DEVICE_ACCESS_TOKEN.value));

            context.getLogger().info("Execute SQL statement: " + statement);
            ResultSet bundleRaw = statement.executeQuery();

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

    private enum MANDATORY_PARAMS{
        NAME("name"),
        TOKENS("tokens"),
        DEVICE_ACCESS_TOKEN("deviceAccessToken");

        private final String value;

        MANDATORY_PARAMS(String value) {
            this.value = value;
        }
    }
}
