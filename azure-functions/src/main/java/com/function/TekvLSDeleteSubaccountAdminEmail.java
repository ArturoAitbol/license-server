package com.function;

import com.function.auth.Resource;
import com.function.clients.GraphAPIClient;
import com.function.util.FeatureToggles;
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

        context.getLogger().info("Entering TekvLSDeleteSubaccountAdminEmail Azure function");

        String sql = "DELETE FROM subaccount_admin WHERE subaccount_admin_email = ?;";

        // Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");
        try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
             PreparedStatement statement = connection.prepareStatement(sql)) {

            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

            if(FeatureToggles.INSTANCE.isFeatureActive("ad-subaccount-user-creation")){
                String searchAdminEmailSql = "SELECT admin_email FROM customer_admin WHERE admin_email = ?;";
                try(PreparedStatement emailStatement = connection.prepareStatement(searchAdminEmailSql)){
                        emailStatement.setString(1, email);
                        context.getLogger().info("Execute SQL statement: " + emailStatement);
                        ResultSet rs = emailStatement.executeQuery();
                        if(rs.next()){
                            GraphAPIClient.removeRole(email,SUBACCOUNT_ADMIN,context);
                            context.getLogger().info("Guest User Role removed successfully from Active Directory (email: "+email+").");
                        }else{
                            GraphAPIClient.deleteGuestUser(email,context);
                            context.getLogger().info("Guest User deleted successfully from Active Directory (email: "+email+").");
                        }
                }catch (Exception e){
                    context.getLogger().info("AD exception: " + e.getMessage());
                    JSONObject json = new JSONObject();
                    json.put("error", "AD Exception: " + e.getMessage());
                    return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
                }
            }
            statement.setString(1, email);

            // Delete device
            String userId = getUserIdFromToken(tokenClaims,context);
            context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + statement);
            statement.executeUpdate();
            context.getLogger().info("Subaccount Admin email deleted successfully.");

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
