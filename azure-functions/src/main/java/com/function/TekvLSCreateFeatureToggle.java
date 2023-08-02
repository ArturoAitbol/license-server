package com.function;

import com.function.auth.Resource;
import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import java.sql.*;
import java.util.Optional;

import static com.function.auth.RoleAuthHandler.*;

public class TekvLSCreateFeatureToggle {
    /**
     * This function listens at endpoint "/v1.0/featureToggles". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/v1.0/featureToggles
     */
    @FunctionName("TekvLSCreateFeatureToggle")
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.POST},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "featureToggles")
            HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context) {

        Claims tokenClaims = getTokenClaimsFromHeader(request, context);
        final String  email = getEmailFromToken(tokenClaims, context);
        JSONArray roles = getRolesFromToken(tokenClaims, context);
        if (roles.isEmpty()) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
            json.put("error", MESSAGE_FOR_UNAUTHORIZED);
            return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
        }
        if (!hasPermission(roles, Resource.CREATE_FEATURE_TOGGLE)) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSCreateFeatureToggle Azure function");

        // Parse request body and extract parameters needed
        String requestBody = request.getBody().orElse("");
        context.getLogger().info("Request body: " + requestBody);
        if (requestBody.isEmpty()) {
            context.getLogger().info("error: request body is empty.");
            JSONObject json = new JSONObject();
            json.put("error", "error: request body is empty.");
            context.getLogger().info("User " + userId + " is leaving TekvLSCreateFeatureToggle Azure function with error");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }

        JSONObject jobj;
        try {
            jobj = new JSONObject(requestBody);
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSCreateFeatureToggle Azure function with error");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }

        // Check mandatory params to be present
        for (MANDATORY_PARAMS mandatoryParam : MANDATORY_PARAMS.values()) {
            if (!jobj.has(mandatoryParam.value)) {
                // Parameter not found
                context.getLogger().info("Missing mandatory parameter: " + mandatoryParam.value);
                JSONObject json = new JSONObject();
                json.put("error", "Missing mandatory parameter: " + mandatoryParam.value);
                context.getLogger().info("User " + userId + " is leaving TekvLSCreateFeatureToggle Azure function with error");
                return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
            }
        }

        //Build the sql query
        String insertFeatureToggleSql = "INSERT INTO feature_toggle (status, name, author, description) VALUES (?::boolean, ?, ?, ?) RETURNING id;";

        // Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");
        try (
            Connection connection = DriverManager.getConnection(dbConnectionUrl);
            PreparedStatement insertStatement = connection.prepareStatement(insertFeatureToggleSql)
        ){

            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

            // Set statement parameters
            insertStatement.setBoolean(1, jobj.getBoolean(MANDATORY_PARAMS.STATUS.value));
            insertStatement.setString(2, jobj.getString(MANDATORY_PARAMS.NAME.value));

            insertStatement.setString(3, email);
            insertStatement.setString(4, jobj.has(OPTIONAL_PARAMS.DESCRIPTION.value) ? jobj.getString(OPTIONAL_PARAMS.DESCRIPTION.value) : null);

            // Insert
            context.getLogger().info("Execute SQL statement (User: " + userId + "): " + insertStatement);
            ResultSet rs = insertStatement.executeQuery();
            context.getLogger().info("Feature toggle inserted successfully.");

            // Return the feature toggle id in the response
            rs.next();
            String featureToggleId = rs.getString("id");
            JSONObject json = new JSONObject();
            json.put("id", featureToggleId);

            context.getLogger().info("User " + userId + " is successfully leaving TekvLSCreateFeatureToggle Azure function");
            return request.createResponseBuilder(HttpStatus.OK).body(json.toString()).build();
        } catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            String modifiedResponse = nameUnique(e.getMessage());
            json.put("error", modifiedResponse);
            context.getLogger().info("User " + userId + " is leaving TekvLSCreateFeatureToggle Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSCreateFeatureToggle Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }

    private String nameUnique(String errorMessage){
        if(errorMessage.contains("ft_name_unique"))
            return "Feature Toggle with that name already exists";
        return "SQL Exception: " + errorMessage;
    }

    private enum MANDATORY_PARAMS {
        STATUS("status"),
        NAME("name");

        private final String value;

        MANDATORY_PARAMS(String value) {
            this.value = value;
        }
    }

    private enum OPTIONAL_PARAMS {
        DESCRIPTION("description");

        private final String value;

        OPTIONAL_PARAMS(String value) {
            this.value = value;
        }
    }
}
