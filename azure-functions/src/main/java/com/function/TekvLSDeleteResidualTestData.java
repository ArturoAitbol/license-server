package com.function;

import java.sql.*;
import java.util.*;

import com.function.auth.Resource;
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

        String deleteNoteSql = "DELETE FROM note WHERE opened_by = ? AND open_date::timestamp < (CURRENT_TIMESTAMP - INTERVAL '1 hour' )";
        String deleteCustomerSql = "DELETE FROM customer WHERE name LIKE ? AND test_customer = ?::boolean";
        String currentTimestamp = "SELECT CURRENT_TIMESTAMP - INTERVAL '1 hour';";

        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");
        try(Connection connection = DriverManager.getConnection(dbConnectionUrl);
            PreparedStatement noteStatement = connection.prepareStatement(deleteNoteSql);
            PreparedStatement customerStatement = connection.prepareStatement(deleteCustomerSql);
            PreparedStatement timeStatement = connection.prepareStatement(currentTimestamp)) {
            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

            noteStatement.setString(1, "aamoroso@tekvizionlabs.com");
            context.getLogger().info("Execute SQL statement: " + noteStatement);
            noteStatement.executeUpdate();
            ResultSet resultSet =timeStatement.executeQuery();
            ResultSetMetaData rsmd = resultSet.getMetaData();
            int columnsNumber = rsmd.getColumnCount();
            System.out.println("Timestamp:" + resultSet.toString());
            while (resultSet.next()) {
                for (int i = 1; i <= columnsNumber; i++) {
                    if (i > 1) System.out.print(",  ");
                    String columnValue = resultSet.getString(i);
                    System.out.print(columnValue + " " + rsmd.getColumnName(i));
                }
                System.out.println("");
            }
            customerStatement.setString(1, "xxxxxx");
            customerStatement.setString(2, "true");
            context.getLogger().info("Execute SQL statement: " + customerStatement);
            context.getLogger().info("Execute SQL statement: " + customerStatement);
            customerStatement.executeUpdate();
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
