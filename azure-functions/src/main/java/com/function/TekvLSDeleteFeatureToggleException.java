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

public class TekvLSDeleteFeatureToggleException {
    /**
     * This function listens at endpoint "/v1.0/featureToggleExceptions". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/v1.0/featureToggleExceptions
     */
    @FunctionName("TekvLSDeleteFeatureToggleException")
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.DELETE},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "featureToggleExceptions")
            HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context) {

        Claims tokenClaims = getTokenClaimsFromHeader(request, context);
        JSONArray roles = getRolesFromToken(tokenClaims, context);
        if (roles.isEmpty()) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
            json.put("error", MESSAGE_FOR_UNAUTHORIZED);
            return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
        }
        if (!hasPermission(roles, Resource.CREATE_FEATURE_TOGGLE_EXCEPTION)) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        String userId = getUserIdFromToken(tokenClaims, context);
        context.getLogger().info("User " + userId + " is Entering TekvLSDeleteFeatureToggleException Azure function");
        
        // Parse request body and extract parameters needed
        String requestBody = request.getBody().orElse("");
        context.getLogger().info("Request body: " + requestBody);
        if (requestBody.isEmpty()) {
            context.getLogger().info("error: request body is empty.");
            JSONObject json = new JSONObject();
            json.put("error", "error: request body is empty.");
            context.getLogger().info("User " + userId + " is leaving TekvLSDeleteFeatureToggleException Azure function with error");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }

        JSONObject jobj;
        try {
            jobj = new JSONObject(requestBody);
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSDeleteFeatureToggleException Azure function with error");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }

        // Check mandatory params to be present
        for (MANDATORY_PARAMS mandatoryParam : MANDATORY_PARAMS.values()) {
            if (!jobj.has(mandatoryParam.value)) {
                // Parameter not found
                context.getLogger().info("Missing mandatory parameter: " + mandatoryParam.value);
                JSONObject json = new JSONObject();
                json.put("error", "Missing mandatory parameter: " + mandatoryParam.value);
                context.getLogger().info("User " + userId + " is leaving TekvLSDeleteFeatureToggleException Azure function with error");
                return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
            }
        }

        //Build the sql query
        String deleteFeatureToggleSql = "DELETE FROM feature_toggle_exception WHERE feature_toggle_id = ?::uuid AND subaccount_id = ?::uuid";

        // Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");
        try (
                Connection connection = DriverManager.getConnection(dbConnectionUrl);
                PreparedStatement deleteStatement = connection.prepareStatement(deleteFeatureToggleSql)
        ){

            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

            // Set statement parameters
            deleteStatement.setString(1, jobj.getString(MANDATORY_PARAMS.FEATURE_TOGGLE_ID.value));
            deleteStatement.setString(2, jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_ID.value));

            // Delete
            context.getLogger().info("Execute SQL statement (User: " + userId + "): " + deleteStatement);
            deleteStatement.executeUpdate();
            context.getLogger().info("Feature toggle exception deleted successfully.");

            context.getLogger().info("User " + userId + " is successfully leaving TekvLSDeleteFeatureToggleException Azure function");
            return request.createResponseBuilder(HttpStatus.OK).build();
        } catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSDeleteFeatureToggleException Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSDeleteFeatureToggleException Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }

    private enum MANDATORY_PARAMS {
        SUBACCOUNT_ID("subaccountId"),
        FEATURE_TOGGLE_ID("featureToggleId");

        private final String value;

        MANDATORY_PARAMS(String value) {
            this.value = value;
        }
    }
}
