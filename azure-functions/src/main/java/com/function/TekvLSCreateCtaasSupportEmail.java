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

public class TekvLSCreateCtaasSupportEmail {
    private final String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
            + "&user=" + System.getenv("POSTGRESQL_USER")
            + "&password=" + System.getenv("POSTGRESQL_PWD");

    @FunctionName("TekvLSCreateCtaasSupportEmail")
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.POST},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "ctaasSupportEmails")
                    HttpRequestMessage<Optional<CreateSupportEmailRequest>> request,
            final ExecutionContext context) {

        Claims tokenClaims = getTokenClaimsFromHeader(request,context);
        JSONArray roles = getRolesFromToken(tokenClaims,context);
        if(roles.isEmpty()){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
            json.put("error", MESSAGE_FOR_UNAUTHORIZED);
            return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
        }
        if(!hasPermission(roles, Resource.CREATE_CTAAS_SUPPORT_EMAIL)){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSCreateAdminEmail Azure function");
        context.getLogger().info("Request body: " + request);

        if (!request.getBody().isPresent()) {
            context.getLogger().info("error: request body is empty.");
            context.getLogger().info("User " + userId + " is leaving TekvLSCreateAdminEmail Azure function with error");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(new JSONObject("{\"error\": \"error: request body is empty.\"}")).build();
        }

        CreateSupportEmailRequest createSupportEmailRequest = request.getBody().get();

        // Check mandatory params to be present
        if (createSupportEmailRequest.getSupportEmail() == null) {
            context.getLogger().info("error: Missing supportEmail parameter.");
            context.getLogger().info("User " + userId + " is leaving TekvLSCreateAdminEmail Azure function with error");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(new JSONObject("{\"error\": \"Missing mandatory parameter supportEmail.\"}")).build();
        }
        if (createSupportEmailRequest.getCtaasSetupId() == null) {
            context.getLogger().info("error: Missing ctaasSetupId parameter.");
            context.getLogger().info("User " + userId + " is leaving TekvLSCreateAdminEmail Azure function with error");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(new JSONObject("{\"error\": \"Missing mandatory parameter ctaasSetupId.\"}")).build();
        }

        //Build the sql query
        final String sql = "INSERT INTO ctaas_support_email (ctaas_setup_id, email) VALUES (?::uuid, ?);";

        try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
             PreparedStatement statement = connection.prepareStatement(sql)) {

            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

            // Set statement parameters
            statement.setString(1, createSupportEmailRequest.ctaasSetupId);
            statement.setString(2, createSupportEmailRequest.supportEmail);

            context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + statement);
            statement.executeUpdate();
            context.getLogger().info("Support email inserted successfully.");
            context.getLogger().info("User " + userId + " is successfully leaving TekvLSCreateAdminEmail Azure function");

            return request.createResponseBuilder(HttpStatus.OK).build();

        } catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", "SQL Exception: " + e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSCreateAdminEmail Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSCreateAdminEmail Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }

    }

    public static class CreateSupportEmailRequest {
        private final String supportEmail;
        private final String ctaasSetupId;

        public CreateSupportEmailRequest(String supportEmail, String ctaasSetupId) {
            this.supportEmail = supportEmail;
            this.ctaasSetupId = ctaasSetupId;
        }

        public String getSupportEmail() {
            return supportEmail;
        }

        public String getCtaasSetupId() {
            return ctaasSetupId;
        }

        @Override
        public String toString() {
            return "CreateSupportEmailRequest{" +
                    "supportEmail='" + supportEmail + '\'' +
                    ", ctaasSetupId='" + ctaasSetupId + '\'' +
                    '}';
        }
    }
}
