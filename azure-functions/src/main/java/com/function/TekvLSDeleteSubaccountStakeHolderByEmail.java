package com.function;

import static com.function.auth.RoleAuthHandler.*;
import static com.function.auth.Roles.*;

import java.sql.*;
import java.util.Optional;

import com.function.db.SelectQueryBuilder;
import org.json.JSONArray;
import org.json.JSONObject;

import com.function.auth.Resource;
import com.function.clients.GraphAPIClient;
import com.function.util.FeatureToggleService;
import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpMethod;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.BindingName;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;

import io.jsonwebtoken.Claims;

public class TekvLSDeleteSubaccountStakeHolderByEmail {
    @FunctionName("TekvLSDeleteSubaccountStakeHolderByEmail")
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.DELETE},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "subaccountStakeHolders/{email}")
            HttpRequestMessage<Optional<String>> request,
            @BindingName("email") String email,
            final ExecutionContext context) {

        Claims tokenClaims = getTokenClaimsFromHeader(request,context);
        JSONArray roles = getRolesFromToken(tokenClaims,context);
        if(roles.isEmpty()){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
            json.put("error", MESSAGE_FOR_UNAUTHORIZED);
            return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
        }
        if(!hasPermission(roles, Resource.DELETE_SUBACCOUNT_STAKEHOLDER)){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        context.getLogger().info("Entering TekvLSDeleteSubaccountStakeHolderByEmail Azure function");

        String sql = "DELETE FROM subaccount_admin WHERE subaccount_admin_email = ?;";
        SelectQueryBuilder subaccountIdQuery = new SelectQueryBuilder("SELECT subaccount_id FROM subaccount_admin");
        subaccountIdQuery.appendEqualsCondition("subaccount_admin_email", email);

        // Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");
        try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
             PreparedStatement statement = connection.prepareStatement(sql);
             PreparedStatement subaccountIdStmt = subaccountIdQuery.build(connection)) {

            String userId = getUserIdFromToken(tokenClaims,context);
            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

            context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + subaccountIdStmt);
            ResultSet subaccountIdRs = subaccountIdStmt.executeQuery();
            if (subaccountIdRs.next()) {
                String subaccountId = subaccountIdRs.getString("subaccount_id");
                statement.setString(1, email);

                // Delete stakeholder
                context.getLogger().info("Execute SQL statement (User: " + userId + "): " + statement);
                statement.executeUpdate();
                context.getLogger().info("Subaccount Admin email (stakeholder) deleted successfully.");
                try {
                    GraphAPIClient.removeRole(email, SUBACCOUNT_STAKEHOLDER, context);
                    context.getLogger()
                            .info("Guest User Role removed successfully from Active Directory. Email : " + email);
                    GraphAPIClient.deleteGuestUser(email, context);
                    context.getLogger()
                            .info("Guest User removed successfully from Active Directory. Email : " + email);
                } catch (Exception e) {
                    context.getLogger().info("AD exception: " + e.getMessage());
                    JSONObject json = new JSONObject();
                    json.put("error", "AD Exception: " + e.getMessage());
                    return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString())
                                    .build();
                }
            }

            return request.createResponseBuilder(HttpStatus.OK).build();
        } catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", "SQL Exception: " + e.getMessage());
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }
}
