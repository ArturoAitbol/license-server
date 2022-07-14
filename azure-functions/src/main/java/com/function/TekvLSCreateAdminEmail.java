package com.function;

import com.function.auth.Permission;
import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import org.json.JSONObject;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Optional;

import static com.function.auth.RoleAuthHandler.*;

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

        String currentRole = getRoleFromToken(request,context);
        if(currentRole.isEmpty()){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
            json.put("error", MESSAGE_FOR_UNAUTHORIZED);
            return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
        }
        if(!hasPermission(currentRole, Permission.CREATE_ADMIN_EMAIL)){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + currentRole);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        context.getLogger().info("Entering TekvLSCreateAdminEmail Azure function");
        context.getLogger().info("Request body: " + request);

        if (!request.getBody().isPresent()) {
            context.getLogger().info("error: request body is empty.");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(new JSONObject("{\"error\": \"error: request body is empty.\"}")).build();
        }

        CreateAdminRequest createAdminRequest = request.getBody().get();

        if (createAdminRequest.getAdminEmail() == null) {
            context.getLogger().info("error: Missing customerAdminEmail parameter.");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(new JSONObject("{\"error\": \"Missing mandatory parameter customerAdminEmail.\"}")).build();
        }
        if (createAdminRequest.getCustomerId() == null) {
            context.getLogger().info("error: Missing customerId parameter.");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(new JSONObject("{\"error\": \"Missing mandatory parameter customerId.\"}")).build();
        }

        final String sql = "INSERT INTO customer_admin (admin_email, customer_id) VALUES ('" + createAdminRequest.getAdminEmail() + "', '" +
                createAdminRequest.getCustomerId() + "');";

        try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
             Statement statement = connection.createStatement()) {

            context.getLogger().info("Successfully connected to:" + dbConnectionUrl);

            context.getLogger().info("Execute SQL statement: " + sql);
            statement.executeUpdate(sql);
            context.getLogger().info("License usage inserted successfully.");

            return request.createResponseBuilder(HttpStatus.OK).build();

        } catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }

    }

    public static class CreateAdminRequest {
        private final String customerAdminEmail;
        private final String customerId;

        public CreateAdminRequest(String adminEmail, String customerId) {
            this.customerAdminEmail = adminEmail;
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
