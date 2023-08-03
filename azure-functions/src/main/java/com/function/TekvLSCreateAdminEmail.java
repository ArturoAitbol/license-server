package com.function;

import com.function.auth.Resource;
import com.function.clients.GraphAPIClient;
import com.function.util.FeatureToggleService;
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
import static com.function.auth.Roles.*;

public class TekvLSCreateAdminEmail {
    private final String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
            + "&user=" + System.getenv("POSTGRESQL_USER")
            + "&password=" + System.getenv("POSTGRESQL_PWD");

    @FunctionName("TekvLSCreateAdminEmail")
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.POST},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "customerAdminEmails")
            HttpRequestMessage<Optional<CreateAdminRequest>> request,
            final ExecutionContext context) {

        Claims tokenClaims = getTokenClaimsFromHeader(request,context);
        JSONArray roles = getRolesFromToken(tokenClaims,context);
        if(roles.isEmpty()){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
            json.put("error", MESSAGE_FOR_UNAUTHORIZED);
            return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
        }
        if(!hasPermission(roles, Resource.CREATE_ADMIN_EMAIL)){
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

        CreateAdminRequest createAdminRequest = request.getBody().get();

        // Check mandatory params to be present
        if (createAdminRequest.getAdminEmail() == null) {
            context.getLogger().info("error: Missing customerAdminEmail parameter.");
            context.getLogger().info("User " + userId + " is leaving TekvLSCreateAdminEmail Azure function with error");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(new JSONObject("{\"error\": \"Missing mandatory parameter customerAdminEmail.\"}")).build();
        }
        if (createAdminRequest.getCustomerId() == null) {
            context.getLogger().info("error: Missing customerId parameter.");
            context.getLogger().info("User " + userId + " is leaving TekvLSCreateAdminEmail Azure function with error");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(new JSONObject("{\"error\": \"Missing mandatory parameter customerId.\"}")).build();
        }

        //Build the sql query
        final String sql = "INSERT INTO customer_admin (admin_email, customer_id) VALUES (?, ?::uuid);";

        try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
             PreparedStatement statement = connection.prepareStatement(sql)) {

            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

            // Set statement parameters
            statement.setString(1, createAdminRequest.customerAdminEmail);
            statement.setString(2, createAdminRequest.customerId);

            context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + statement);
            statement.executeUpdate();
            context.getLogger().info("Admin email inserted successfully.");

			if (FeatureToggleService.isFeatureActiveByName("ad-customer-user-creation") && FeatureToggleService.isFeatureActiveByName("ad-license-service-user-creation")) {
                final String customerNameSql = "SELECT name FROM customer WHERE id = ?::uuid;";
                try(PreparedStatement customerNameStmt = connection.prepareStatement(customerNameSql)){
                    customerNameStmt.setString(1,createAdminRequest.customerId);
                    ResultSet rs = customerNameStmt.executeQuery();
                    if(rs.next())
                        GraphAPIClient.createGuestUserWithProperRole(rs.getString("name"),createAdminRequest.customerAdminEmail, CUSTOMER_FULL_ADMIN, context);
                }
            }
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

    public static class CreateAdminRequest {
        private final String customerAdminEmail;
        private final String customerId;

        public CreateAdminRequest(String adminEmail, String customerId) {
            this.customerAdminEmail = adminEmail != null? adminEmail.toLowerCase() : null;
            this.customerId = customerId;
        }

        public String getAdminEmail() {
            return customerAdminEmail;
        }

        public String getCustomerId() {
            return customerId;
        }

        @Override
        public String toString() {
            return "CreateAdminRequest{" +
                    "customerAdminEmail='" + customerAdminEmail + '\'' +
                    ", customerId='" + customerId + '\'' +
                    '}';
        }
    }
}
