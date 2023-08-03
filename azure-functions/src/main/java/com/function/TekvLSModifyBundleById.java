package com.function;

import java.sql.*;
import java.util.*;

import com.function.auth.Resource;
import com.function.db.QueryBuilder;
import com.function.db.UpdateQueryBuilder;
import com.microsoft.azure.functions.annotation.*;
import com.microsoft.azure.functions.*;
import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSModifyBundleById {
    /**
     * This function listens at endpoint "/v1.0/TekvLSModifyBundleById". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/v1.0/TekvLSModifyBundleById
     * 2. curl {your host}/v1.0/TekvLSModifyBundleById/{id}
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

        Claims tokenClaims = getTokenClaimsFromHeader(request,context);
        JSONArray roles = getRolesFromToken(tokenClaims,context);
        if(roles.isEmpty()){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
            json.put("error", MESSAGE_FOR_UNAUTHORIZED);
            return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
        }
        if(!hasPermission(roles, Resource.MODIFY_BUNDLE)){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSModifyBundleById Azure function");
        
        if (id.equals("EMPTY")) {
            context.getLogger().info("Error: There is no bundle id in the request.");
            JSONObject json = new JSONObject();
            json.put("error", "Please pass an id on the query string.");
            context.getLogger().info("User " + userId + " is leaving TekvLSModifyBundleById Azure function with error");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        // Parse request body and extract parameters needed
        String requestBody = request.getBody().orElse("");
        context.getLogger().info("Request body: " + requestBody);
        if (requestBody.isEmpty()) {
            context.getLogger().info("error: request body is empty.");
            JSONObject json = new JSONObject();
            json.put("error", "Request body is empty.");
            context.getLogger().info("User " + userId + " is leaving TekvLSModifyBundleById Azure function with error");
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
            context.getLogger().info("User " + userId + " is leaving TekvLSModifyBundleById Azure function with error");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }

        UpdateQueryBuilder queryBuilder = new UpdateQueryBuilder("bundle");

        for (OPTIONAL_PARAMS param: OPTIONAL_PARAMS.values()) {
            try {
                queryBuilder.appendValueModification(param.columnName, body.getString(param.jsonAttrib), param.dataType);
            }
            catch (Exception e) {
                context.getLogger().info("Ignoring exception: " + e);
            }
        }
        queryBuilder.appendWhereStatement("id", id, QueryBuilder.DATA_TYPE.UUID);

        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");
        try(Connection connection = DriverManager.getConnection(dbConnectionUrl);
            PreparedStatement statement = queryBuilder.build(connection)) {
            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
            context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + statement);
            statement.executeUpdate();
            context.getLogger().info("Bundle updated successfully");
            context.getLogger().info("User " + userId + " is successfully leaving TekvLSModifyBundleById Azure function");
            return request.createResponseBuilder(HttpStatus.OK).build();
        }
        catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSModifyBundleById Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
        catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSModifyBundleById Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }

    private enum OPTIONAL_PARAMS {
        NAME("bundleName", "name", QueryBuilder.DATA_TYPE.VARCHAR),
        TOKENS("defaultTokens", "tokens", QueryBuilder.DATA_TYPE.INTEGER),
        DEVICE_ACCESS_TOKENS("defaultDeviceAccessTokens", "device_access_tokens", QueryBuilder.DATA_TYPE.INTEGER);

        private final String jsonAttrib;
        private final String columnName;

        private final String dataType;

        OPTIONAL_PARAMS(String jsonAttrib, String columnName, QueryBuilder.DATA_TYPE dataType) {
            this.jsonAttrib = jsonAttrib;
            this.columnName = columnName;
            this.dataType = dataType.getValue();
        }
    }
}
