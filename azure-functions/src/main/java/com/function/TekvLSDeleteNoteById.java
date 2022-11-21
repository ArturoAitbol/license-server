package com.function;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.*;

import com.function.auth.Resource;
import com.function.db.QueryBuilder;
import com.function.db.UpdateQueryBuilder;
import com.microsoft.azure.functions.annotation.*;
import com.microsoft.azure.functions.*;
import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;
import static com.function.auth.RoleAuthHandler.getUserIdFromToken;

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

        context.getLogger().info("Entering TekvLSDeleteProjectById Azure function");
        String userEmail = getEmailFromToken(tokenClaims,context);
        UpdateQueryBuilder queryBuilder = new UpdateQueryBuilder("note");
        queryBuilder.appendValueModification("status","Closed","note_status_type_enum");
        queryBuilder.appendValueModification("close_date",LocalDateTime.now().toString(),QueryBuilder.DATA_TYPE.TIMESTAMP);
        queryBuilder.appendValueModification("closed_by",userEmail, QueryBuilder.DATA_TYPE.VARCHAR);
        queryBuilder.appendWhereStatement("id", id, QueryBuilder.DATA_TYPE.UUID);

        // Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");
        try (
                Connection connection = DriverManager.getConnection(dbConnectionUrl);
                PreparedStatement statement = queryBuilder.build(connection)) {

            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
            // Delete project
            String userId = getUserIdFromToken(tokenClaims,context);
            context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + statement);
            statement.executeUpdate();
            context.getLogger().info("Note deleted successfully.");

            return request.createResponseBuilder(HttpStatus.OK).build();
        }
        catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
        catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }
}
