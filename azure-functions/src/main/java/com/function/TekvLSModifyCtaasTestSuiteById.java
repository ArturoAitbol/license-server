package com.function;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Optional;

import org.json.JSONArray;
import org.json.JSONObject;

import com.function.auth.Resource;
import com.function.db.QueryBuilder;
import com.function.db.UpdateQueryBuilder;
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

import static com.function.auth.RoleAuthHandler.*;

public class TekvLSModifyCtaasTestSuiteById {

    /**
     * This function listens at endpoint "/v1.0/ctaasTestSuites/{id}". To invoke it
     * using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/v1.0/ctaasTestSuites/{id}
     */
    @FunctionName("TekvLSModifyCtaasTestSuiteById")
    public HttpResponseMessage run(
            @HttpTrigger(name = "req", methods = {
                    HttpMethod.PUT }, authLevel = AuthorizationLevel.ANONYMOUS, route = "ctaasTestSuites/{id}") HttpRequestMessage<Optional<String>> request,
            @BindingName("id") String id,
            final ExecutionContext context) {
        Claims tokenClaims = getTokenClaimsFromHeader(request, context);
        JSONArray roles = getRolesFromToken(tokenClaims, context);
        if (roles.isEmpty()) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
            json.put("error", MESSAGE_FOR_UNAUTHORIZED);
            return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
        }
        if (!hasPermission(roles, Resource.MODIFY_CTAAS_TEST_SUITE)) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSModifyCtaasTestSuiteById Azure function");

        // Parse request body and extract parameters needed
        String requestBody = request.getBody().orElse("");
        context.getLogger().info("Request body: " + requestBody);
        if (requestBody.isEmpty()) {
            context.getLogger().info("error: request body is empty.");
            JSONObject json = new JSONObject();
            json.put("error", "error: request body is empty.");
            context.getLogger().info("User " + userId + " is leaving TekvLSModifyCtaasTestSuiteById Azure function with error");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        JSONObject jobj;
        try {
            jobj = new JSONObject(requestBody);
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSModifyCtaasTestSuiteById Azure function with error");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }

        // Build the sql query for ctaas test suite
        UpdateQueryBuilder queryBuilder = new UpdateQueryBuilder("ctaas_test_suite");
        int optionalParamsFound = 0;
        for (OPTIONAL_PARAMS param : OPTIONAL_PARAMS.values()) {
            try {
                if (param.columnName.equals("next_execution_ts") && jobj.getString(param.jsonAttrib).isEmpty())
                    queryBuilder.appendValueModificationToNull(param.columnName);
                else
                    queryBuilder.appendValueModification(param.columnName, jobj.getString(param.jsonAttrib), param.dataType);
                optionalParamsFound++;
            } catch (Exception e) {
                context.getLogger().info("Ignoring exception: " + e);
            }
        }
        if (optionalParamsFound == 0) {
            return request.createResponseBuilder(HttpStatus.OK).build();
        }
        queryBuilder.appendWhereStatement("id", id, QueryBuilder.DATA_TYPE.UUID);

        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses"
                + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");
        try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
                PreparedStatement statement = queryBuilder.build(connection)) {

            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

            context.getLogger().info("Execute SQL statement (User: " + userId + "): " + statement);
            statement.executeUpdate();
            context.getLogger().info("Test Suite updated successfully.");
            context.getLogger().info("User " + userId + " is successfully leaving TekvLSModifyCtaasTestSuiteById Azure function");
            return request.createResponseBuilder(HttpStatus.OK).body(jobj.toString()).build();
        } catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSModifyCtaasTestSuiteById Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSModifyCtaasTestSuiteById Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }

    private enum OPTIONAL_PARAMS {
        TOTAL_EXECUTIONS("totalExecutions", "total_executions", QueryBuilder.DATA_TYPE.INTEGER),
        NEXT_EXECUTION("nextExecution", "next_execution_ts", QueryBuilder.DATA_TYPE.TIMESTAMP),
        FREQUENCY("frequency", "frequency", QueryBuilder.DATA_TYPE.VARCHAR),
        SERVICE("deviceType", "device_type", QueryBuilder.DATA_TYPE.VARCHAR),
        SUITE_NAME("name", "name", QueryBuilder.DATA_TYPE.VARCHAR);

        private final String jsonAttrib;
        private final String columnName;

        private final String dataType;

        OPTIONAL_PARAMS(String jsonAttrib, String columnName, QueryBuilder.DATA_TYPE dataType) {
            this.jsonAttrib = jsonAttrib;
            this.columnName = columnName;
            this.dataType = dataType.getValue();
        }
    }

}
