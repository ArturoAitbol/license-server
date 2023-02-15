package com.function;

import java.sql.*;
import java.util.*;

import com.function.auth.Resource;
import com.function.db.QueryBuilder;
import com.function.db.SelectQueryBuilder;
import com.microsoft.azure.functions.annotation.*;
import com.microsoft.azure.functions.*;
import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;
import static com.function.auth.RoleAuthHandler.MESSAGE_FOR_FORBIDDEN;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSDeleteResidualTestData {
    /**
     * This function listens at endpoint "/v1.0/testData". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/v1.0/testData
     * 2. curl {your host}/v1.0/testData
     */
    @FunctionName("TekvLSDeleteResidualTestData")
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.DELETE},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "testData"
            )
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
        if(!hasPermission(roles, Resource.DELETE_RESIDUAL_TEST_DATA)){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }
        context.getLogger().info("Entering TekvLSDeleteResidualTestData Azure function");
//        String userEmail = getEmailFromToken(tokenClaims, context);
//        context.getLogger().info("Email:" + userEmail);

        String deleteNoteSql = "SELECT * FROM note WHERE opened_by = ? AND open_date::timestamp < (CURRENT_TIMESTAMP - INTERVAL '1 hour' )";
//        String deleteNoteSql = "DELETE FROM note WHERE opened_by = ? AND open_date::timestamp < (CURRENT_TIMESTAMP - INTERVAL '1 hour' )";
        String deleteCustomerSql = "SELECT * FROM customer WHERE name LIKE ?"; //AND test customer true
//        String deleteCustomerSql = "DELETE FROM customer WHERE name LIKE ?";

        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");
        try(Connection connection = DriverManager.getConnection(dbConnectionUrl);
            PreparedStatement noteStatement = connection.prepareStatement(deleteNoteSql);
            PreparedStatement customerStatement = connection.prepareStatement(deleteCustomerSql)) {
            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

            noteStatement.setString(1, "test-functional-subaccount-admin@tekvizion360.com");
            context.getLogger().info("Execute SQL statement: " + noteStatement);
            ResultSet rs = noteStatement.executeQuery();
            JSONObject jsonNotes = new JSONObject();
            JSONArray array = new JSONArray();
            while (rs.next()) {
                JSONObject item = new JSONObject();
                item.put("id", rs.getString("id"));
                item.put("content", rs.getString("content"));
                item.put("open_date", rs.getString("open_date"));
                item.put("opened_by", rs.getString("opened_by"));
                array.put(item);
            }
            jsonNotes.put("notes", array);

            customerStatement.setString(1, "functional-test-%");
            context.getLogger().info("Execute SQL statement: " + customerStatement);
            ResultSet rsc = customerStatement.executeQuery();
            JSONObject jsonCustomer = new JSONObject();
            JSONArray arrayCustomer = new JSONArray();
            while (rsc.next()) {
                JSONObject item = new JSONObject();
                item.put("id", rsc.getString("id"));
                item.put("name", rsc.getString("name"));
                item.put("type", rsc.getString("type"));
                item.put("test_customer", rsc.getString("test_customer"));
                arrayCustomer.put(item);
            }
            jsonCustomer.put("customers", arrayCustomer);
            return request.createResponseBuilder(HttpStatus.OK).body(jsonNotes.toString()).build();
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
