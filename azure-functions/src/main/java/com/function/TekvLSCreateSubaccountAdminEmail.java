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

public class TekvLSCreateSubaccountAdminEmail {
    private final String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses?ssl=true&sslmode=require"
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

        String currentRole = getRoleFromToken(request,context);
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
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(new JSONObject("{\"error\": \"Missing mandatory parameter adminEmail.\"}")).build();
        }
        if (createSubaccountAdminRequest.getSubaccountId() == null) {
            context.getLogger().info("error: Missing subaccountId parameter.");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(new JSONObject("{\"error\": \"Missing mandatory parameter subaccountId.\"}")).build();
        }

        final String sql = "INSERT INTO subaccount_admin (subaccount_admin_email, subaccount_id) VALUES ('" + createSubaccountAdminRequest.getAdminEmail() + "', '" +
                createSubaccountAdminRequest.getSubaccountId() + "');";

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

    public static class CreateSubaccountAdminRequest {
        private final String adminEmail;
        private final String subaccountId;

        public CreateSubaccountAdminRequest(String adminEmail, String subaccountId) {
            this.adminEmail = adminEmail;
            this.subaccountId = subaccountId;
        }

        public String getAdminEmail() {
            return adminEmail;
        }

        public String getSubaccountId() {
            return subaccountId;
        }

        @Override
        public String toString() {
            return "CreateSubaccountAdminRequest{" +
                    "adminEmail='" + adminEmail + '\'' +
                    ", customerId='" + subaccountId + '\'' +
                    '}';
        }
    }
}