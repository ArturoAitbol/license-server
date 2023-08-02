package com.function;

import com.function.auth.Resource;
import com.function.clients.GraphAPIClient;
import com.function.db.SelectQueryBuilder;
import com.function.exceptions.ADException;
import com.function.util.FeatureToggleService;
import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.BindingName;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import java.sql.*;
import java.util.Optional;

import static com.function.auth.RoleAuthHandler.*;
import static com.function.auth.Roles.*;

public class TekvLSDeleteSubaccountAdminEmail {
    @FunctionName("TekvLSDeleteSubaccountAdminEmail")
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.DELETE},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "subaccountAdminEmails/{email}")
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
        if(!hasPermission(roles, Resource.DELETE_SUBACCOUNT_ADMIN_EMAIL)){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSDeleteSubaccountAdminEmail Azure function");

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
            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

            context.getLogger().info("Execute SQL statement: " + subaccountIdStmt);
            ResultSet subaccountIdRs = subaccountIdStmt.executeQuery();
            if (subaccountIdRs.next()) {
                String subaccountId = subaccountIdRs.getString("subaccount_id");
                if (FeatureToggleService.isFeatureActiveBySubaccountId("ad-customer-user-creation", subaccountId)) {
                    String searchAdminEmailSql = "SELECT admin_email FROM customer_admin WHERE admin_email = ?;";
                    PreparedStatement emailStatement = connection.prepareStatement(searchAdminEmailSql);
                    emailStatement.setString(1, email);
                    context.getLogger().info("Execute SQL statement: " + emailStatement);
                    ResultSet rs = emailStatement.executeQuery();
                    if (rs.next()) {
                        GraphAPIClient.removeRole(email, SUBACCOUNT_ADMIN, context);
                        context.getLogger().info("Guest User Role Subaccount Admin removed successfully from Active Directory (User: " + userId + "). Email: " + email);
                    } else {
                        GraphAPIClient.deleteGuestUser(email, false, true, context);
                        context.getLogger().info("Guest User Subaccount Admin deleted successfully from Active Directory (User: " + userId + "). Email: " + email);
                    }
                } else {
                    GraphAPIClient.deleteGuestUser(email, false, true, context);
                    context.getLogger().info("Guest User Subaccount Admin deleted successfully from Active Directory (User: " + userId + "). Email: " + email);
                }
                // Delete User from DB
                statement.setString(1, email);
                context.getLogger().info("Execute delete Subaccount Admin SQL statement (User: " + userId + "): " + statement);
                statement.executeUpdate();
                context.getLogger().info("Subaccount Admin email deleted successfully.");
            }
            context.getLogger().info("User " + userId + " is successfully leaving TekvLSDeleteSubaccountAdminEmail Azure function");
            return request.createResponseBuilder(HttpStatus.OK).build();
        } catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", "SQL Exception: " + e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSDeleteSubaccountAdminEmail Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        } catch (ADException e) {
            context.getLogger().info("AD exception when deleting Guest User Subaccount Admin: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", "AD Exception: " + e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSDeleteSubaccountAdminEmail Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSDeleteSubaccountAdminEmail Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }
}
