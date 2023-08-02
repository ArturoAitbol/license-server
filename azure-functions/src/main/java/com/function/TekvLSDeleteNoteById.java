package com.function;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.*;

import com.function.auth.Resource;
import com.function.clients.FCMClient;
import com.function.db.QueryBuilder;
import com.function.db.UpdateQueryBuilder;
import com.microsoft.azure.functions.annotation.*;
import com.microsoft.azure.functions.*;
import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSDeleteNoteById {
    /**
     * This function listens at endpoint "/v1.0/notes". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/v1.0/notes
     */
    @FunctionName("TekvLSDeleteNoteById")
    public HttpResponseMessage run(
            @HttpTrigger(name = "req",
                        methods = {HttpMethod.DELETE},
                        authLevel = AuthorizationLevel.ANONYMOUS,
                        route = "notes/{id}")
                        HttpRequestMessage<Optional<String>> request,
                        @BindingName("id") String id,
                        final ExecutionContext context) {

        Claims tokenClaims = getTokenClaimsFromHeader(request,context);
        JSONArray roles = getRolesFromToken(tokenClaims,context);
        if(roles.length()==0){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
            json.put("error", MESSAGE_FOR_UNAUTHORIZED);
            return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
        }
        if(!hasPermission(roles, Resource.DELETE_NOTE)){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSDeleteNoteById Azure function");
        String userEmail = getEmailFromToken(tokenClaims,context);
        UpdateQueryBuilder queryBuilder = new UpdateQueryBuilder("note");
        queryBuilder.appendValueModification("status","Closed","note_status_type_enum");
        queryBuilder.appendValueModification("close_date",LocalDateTime.now().toString(),QueryBuilder.DATA_TYPE.TIMESTAMP);
        queryBuilder.appendValueModification("closed_by",userEmail, QueryBuilder.DATA_TYPE.VARCHAR);
        queryBuilder.appendWhereStatement("id", id, QueryBuilder.DATA_TYPE.UUID);

        // Sql query to get the subaccount_id of the note
        String subaccountIdSql = "SELECT subaccount_id, content FROM note WHERE id = ?::uuid";
        // Sql query to get all user that need to be notified
        String deviceTokensSql = "SELECT sad.* FROM subaccount_admin_device sad, subaccount_admin sae WHERE sad.subaccount_admin_email = sae.subaccount_admin_email and sae.subaccount_id = ?::uuid and sad.subaccount_admin_email != ?;";

        // Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");
        try (
                Connection connection = DriverManager.getConnection(dbConnectionUrl);
                PreparedStatement statement = queryBuilder.build(connection);
                PreparedStatement subaccountIdStmt = connection.prepareStatement(subaccountIdSql);
                PreparedStatement deviceTokensStmt = connection.prepareStatement(deviceTokensSql)) {

            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
            subaccountIdStmt.setString(1, id);
            ResultSet rs = subaccountIdStmt.executeQuery();
            rs.next();
            String subaccountId = rs.getString("subaccount_id");
            String noteContent = rs.getString("content");

            // Delete project
            context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + statement);
            statement.executeUpdate();
            context.getLogger().info("Note deleted successfully.");

            // Send notifications to subaccount users
            deviceTokensStmt.setString(1, subaccountId);
            deviceTokensStmt.setString(2, userEmail);
            context.getLogger().info("Execute SQL statement: " + deviceTokensStmt);
            rs = deviceTokensStmt.executeQuery();
            JSONArray deviceTokens = new JSONArray();
            while (rs.next()) {
                deviceTokens.put(rs.getString("device_token"));
            }

            if(!deviceTokens.isEmpty()){
                String noteAuthor = userEmail.split("@")[0];
                String notificationBody = noteAuthor + ":\n" + noteContent;
                try {
                    context.getLogger().info("Sending notification to: " + deviceTokens);
                    JSONObject response = FCMClient.sendPushNotification("Note closed!",notificationBody,deviceTokens);
                    context.getLogger().info("Notifications sent: " + response);
                } catch (Exception e) {
                    context.getLogger().warning("Could not send notification to " + deviceTokens);
                    context.getLogger().warning("Notification exception: " + e.getMessage());
                }
            }
            context.getLogger().info("User " + userId + " is successfully leaving TekvLSDeleteNoteById Azure function");
            return request.createResponseBuilder(HttpStatus.OK).build();
        }
        catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSDeleteNoteById Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
        catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSDeleteNoteById Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }
}
