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

public class TekvLSCreateConsumptionMatrix {
    /**
     * This function listens at endpoint "/v1.0/consumptionMatrix". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/v1.0/consumptionMatrix
     */
    @FunctionName("TekvLSCreateConsumptionMatrix")
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.POST},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "consumptionMatrix")
            HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context)
    {

        Claims tokenClaims = getTokenClaimsFromHeader(request, context);
        JSONArray roles = getRolesFromToken(tokenClaims, context);
        final String  email = getEmailFromToken(tokenClaims, context);
        if(roles.isEmpty()){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
            json.put("error", MESSAGE_FOR_UNAUTHORIZED);
            return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
        }
        if(!hasPermission(roles, Resource.CREATE_CONSUMPTION_MATRIX)){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSCreateConsumptionMatrix Azure function");        

        // Parse request body and extract parameters needed
        String requestBody = request.getBody().orElse("");
        context.getLogger().info("Request body: " + requestBody);
        if (requestBody.isEmpty()) {
            context.getLogger().info("error: request body is empty.");
            JSONObject json = new JSONObject();
            json.put("error", "error: request body is empty.");
            context.getLogger().info("User " + userId + " is leaving TekvLSCreateConsumptionMatrix Azure function with error");
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
            context.getLogger().info("User " + userId + " is leaving TekvLSCreateConsumptionMatrix Azure function with error");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }

        // Check mandatory params to be present
        for (MANDATORY_PARAMS mandatoryParam: MANDATORY_PARAMS.values()) {
            if (!jobj.has(mandatoryParam.value)) {
                // Parameter not found
                context.getLogger().info("Missing mandatory parameter: " + mandatoryParam.value);
                JSONObject json = new JSONObject();
                json.put("error", "Missing mandatory parameter: " + mandatoryParam.value);
                context.getLogger().info("User " + userId + " is leaving TekvLSCreateConsumptionMatrix Azure function with error");
                return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
            }
        }

        // Build the sql query
        String sql = "INSERT INTO consumption_matrix (tokens, dut_type, calling_platform, updated_by) " +
                "VALUES (?::integer, ?::dut_type_enum, ?::calling_platform_type_enum, ?) RETURNING id;";

        // Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");

        try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
             PreparedStatement statement = connection.prepareStatement(sql)) {

            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

            // Set statement parameters
            statement.setString(1, jobj.getString(MANDATORY_PARAMS.TOKENS.value));
            statement.setString(2, jobj.getString(MANDATORY_PARAMS.DUT_TYPE.value));
            statement.setString(3, jobj.getString(MANDATORY_PARAMS.CALLING_PLATFORM.value));
            statement.setString(4, email);

            // Insert
            context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + statement);
            ResultSet rs = statement.executeQuery();
            context.getLogger().info("Consumption matrix inserted successfully.");

            // Return the id in the response
            rs.next();
            JSONObject json = new JSONObject();
            json.put("id", rs.getString("id"));
            context.getLogger().info("User " + userId + " is successfully leaving TekvLSCreateConsumptionMatrix Azure function");
            return request.createResponseBuilder(HttpStatus.OK).body(json.toString()).build();
        } catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSCreateConsumptionMatrix Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSCreateConsumptionMatrix Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }

    private enum MANDATORY_PARAMS {

        TOKENS("tokens"),
        DUT_TYPE("dutType"),
        CALLING_PLATFORM("callingPlatform");

        private final String value;

        MANDATORY_PARAMS(String value) {
            this.value = value;
        }
    }
}
