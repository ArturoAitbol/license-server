package com.function;

import java.sql.*;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import com.function.auth.Resource;
import com.function.clients.HttpClient;
import com.microsoft.azure.functions.annotation.*;
import com.microsoft.azure.functions.*;
import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSCreateNote {
    /**
     * This function listens at endpoint "/v1.0/notes". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/v1.0/notes
     */
    @FunctionName("TekvLSCreateNote")
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.POST},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "notes")
                    HttpRequestMessage<Optional<String>> request,
                    final ExecutionContext context) {

        Claims tokenClaims = getTokenClaimsFromHeader(request,context);
        JSONArray roles = getRolesFromToken(tokenClaims,context);
        if(roles.isEmpty()){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
            json.put("error", MESSAGE_FOR_UNAUTHORIZED);
            return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
        }
        if(!hasPermission(roles, Resource.CREATE_NOTE)){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        context.getLogger().info("Entering TekvLSCreateNote Azure function");

        // Parse request body and extract parameters needed
        String requestBody = request.getBody().orElse("");
        context.getLogger().info("Request body: "+ requestBody);
        if (requestBody.isEmpty()) {
            context.getLogger().info("error: request body is empty.");
            JSONObject json = new JSONObject();
            json.put("error","error: request body is empty.");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }

        JSONObject jobj;
        try {
            jobj = new JSONObject(requestBody);
        }
        catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }

        //Check mandatory params to be present
        for (MANDATORY_PARAMS mandatoryParam : MANDATORY_PARAMS.values()){
            if(!jobj.has(mandatoryParam.value)){
                //Parameter not found
                context.getLogger().info("Missing mandatory parameter: "+ mandatoryParam.value);
                JSONObject json = new JSONObject();
                json.put("error","Missing mandatory parameter: " + mandatoryParam.value);
                return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
            }
        }

        //Build the sql query
        String sql = "INSERT INTO note (subaccount_id, content, status, open_date, opened_by, reports)" +
                    " VALUES (?::uuid, ?, 'Open', LOCALTIMESTAMP, ?, ?) RETURNING id;";

        // Sql query to get all user that need to be notified
        String deviceTokensSql = "SELECT sad.* FROM subaccount_admin_device sad, subaccount_admin sae WHERE sad.subaccount_admin_email = sae.subaccount_admin_email and sae.subaccount_id = ?::uuid;";

        //Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");

        try(Connection connection = DriverManager.getConnection(dbConnectionUrl);
            PreparedStatement statement = connection.prepareStatement(sql);
            PreparedStatement deviceTokensStmt = connection.prepareStatement(deviceTokensSql)){

            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

            // Set statement parameters
            String userEmail = getEmailFromToken(tokenClaims,context);
            statement.setString(1,jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_ID.value));
            statement.setString(2,jobj.getString(MANDATORY_PARAMS.CONTENT.value));
            statement.setString(3,userEmail);
            if(jobj.has(OPTIONAL_PARAMS.REPORTS.value))
                statement.setString(4,jobj.getJSONArray(OPTIONAL_PARAMS.REPORTS.value).toString());
            else
                statement.setString(4,null);
            //Insert
            String userId = getUserIdFromToken(tokenClaims,context);
            context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + statement);
            ResultSet rs = statement.executeQuery();
            context.getLogger().info("Note inserted successfully.");
            rs.next();
            JSONObject json = new JSONObject();
            json.put("id", rs.getString("id"));

            // Send notifications to subaccount users
            String NOTIFICATIONS_ENDPOINT = System.getenv("NOTIFICATIONS_ENDPOINT");
            String NOTIFICATIONS_AUTH_KEY = System.getenv("NOTIFICATIONS_KEY");

            deviceTokensStmt.setString(1, jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_ID.value));
            context.getLogger().info("Execute SQL statement: " + deviceTokensStmt);
            rs = deviceTokensStmt.executeQuery();

            JSONObject body = new JSONObject();
            JSONObject notification = new JSONObject();
            notification.put("title", userEmail + "created a new note");
            notification.put("body", jobj.getString(MANDATORY_PARAMS.CONTENT.value));
            body.put("notification", notification);
            HashMap<String, String> headers = new HashMap<>();
            headers.put("Content-Type", "application/json");
            headers.put("Authorization", NOTIFICATIONS_AUTH_KEY);

            while (rs.next()) {
                String finalDeviceToken = rs.getString("device_token");
                String finalUser = rs.getString("subaccount_admin_email");
                body.put("to", finalDeviceToken);
                String bodyString = body.toString();
                headers.put("Content-Length", Integer.toString(bodyString.length()));
                try {
                    context.getLogger().info("Sending notification to: " + finalUser);
                    context.getLogger().info("Sending notification body: " + bodyString);
                    JSONObject response = HttpClient.post(NOTIFICATIONS_ENDPOINT, bodyString, headers);
                    context.getLogger().info("Notification response: " + response.toString());
                } catch (Exception e) {
                    context.getLogger().warning("Could not send notification to " + finalUser);
                    context.getLogger().warning("Notification exception: " + e.getMessage());
                }
                // ExecutorService executor = Executors.newCachedThreadPool();
                // executor.submit(() -> {
                //     body.put("to", finalDeviceToken);
                //     try {
                //         context.getLogger().info("Sending notification to : " + finalUser);
                //         JSONObject response = HttpClient.post(NOTIFICATIONS_ENDPOINT, body.toString(), headers);
                //         context.getLogger().info("Notification response: " + response.toString());
                //     } catch (Exception e) {
                //         context.getLogger().warning("Could not send notification to " + finalDeviceToken);
                //     }
                // });
            }

            return request.createResponseBuilder(HttpStatus.OK).body(json.toString()).build();
        } catch(SQLException e){
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }

    private enum MANDATORY_PARAMS {
        SUBACCOUNT_ID("subaccountId"),
        CONTENT("content");

        private final String value;

        MANDATORY_PARAMS(String value){
            this.value = value;
        }
    }

    private enum OPTIONAL_PARAMS {
        REPORTS("reports");

        private final String value;

        OPTIONAL_PARAMS(String value){
            this.value = value;
        }
    }
}
