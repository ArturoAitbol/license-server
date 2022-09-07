package com.function;

import com.function.auth.Permission;
import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import io.jsonwebtoken.Claims;
import org.json.JSONObject;

import java.sql.*;
import java.util.Optional;

import static com.function.auth.RoleAuthHandler.*;

public class TekvLSCreateSubaccountAdminEmail {
    private final String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
            + "&user=" + System.getenv("POSTGRESQL_USER")
            + "&password=" + System.getenv("POSTGRESQL_PWD");

    @FunctionName("TekvLSCreateSubaccountAdminEmail")
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.POST},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "subaccountAdminEmails")
            HttpRequestMessage<Optional<CreateSubaccountAdminRequest>> request,
            final ExecutionContext context) {

        Claims tokenClaims = getTokenClaimsFromHeader(request,context);
        String currentRole = getRoleFromToken(tokenClaims,context);
        if(currentRole.isEmpty()){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
            json.put("error", MESSAGE_FOR_UNAUTHORIZED);
            return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
        }
        if(!hasPermission(currentRole, Permission.CREATE_SUBACCOUNT_ADMIN_MAIL)){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + currentRole);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        context.getLogger().info("Entering TekvLSCreateSubaccountAdminEmail Azure function");
        context.getLogger().info("Request body: " + request);

        if (!request.getBody().isPresent()) {
            context.getLogger().info("error: request body is empty.");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(new JSONObject("{\"error\": \"error: request body is empty.\"}")).build();
        }

        CreateSubaccountAdminRequest createSubaccountAdminRequest = request.getBody().get();

        if (createSubaccountAdminRequest.getAdminEmail() == null) {
            context.getLogger().info("error: Missing adminEmail parameter.");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(new JSONObject("{\"error\": \"Missing mandatory parameter subaccountAdminEmail.\"}")).build();
        }
        if (createSubaccountAdminRequest.getSubaccountId() == null) {
            context.getLogger().info("error: Missing subaccountId parameter.");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(new JSONObject("{\"error\": \"Missing mandatory parameter subaccountId.\"}")).build();
        }

        final String sql = "INSERT INTO subaccount_admin (subaccount_admin_email, subaccount_id) VALUES (?, ?::uuid);";

        try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
             PreparedStatement statement = connection.prepareStatement(sql)) {

            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

            // Set statement parameters
            statement.setString(1, createSubaccountAdminRequest.getAdminEmail());
            statement.setString(2, createSubaccountAdminRequest.getSubaccountId());

            String userId = getUserIdFromToken(tokenClaims,context);
            context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + statement);
            statement.executeUpdate();
            context.getLogger().info("Subaccount Admin email inserted successfully.");

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

    public static class CreateSubaccountAdminRequest {
        private final String subaccountAdminEmail;
        private final String subaccountId;

        public CreateSubaccountAdminRequest(String subaccountAdminEmail, String subaccountId) {
            this.subaccountAdminEmail = subaccountAdminEmail;
            this.subaccountId = subaccountId;
        }

        public String getAdminEmail() {
            return subaccountAdminEmail;
        }

        public String getSubaccountId() {
            return subaccountId;
        }

        @Override
        public String toString() {
            return "CreateSubaccountAdminRequest{" +
                    "subaccountAdminEmail='" + subaccountAdminEmail + '\'' +
                    ", subaccountId='" + subaccountId + '\'' +
                    '}';
        }
    }
}
