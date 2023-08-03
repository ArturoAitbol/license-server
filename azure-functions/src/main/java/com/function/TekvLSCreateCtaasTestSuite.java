package com.function;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

import org.json.JSONArray;
import org.json.JSONObject;

import com.function.auth.Resource;
import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpMethod;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;

import io.jsonwebtoken.Claims;

import static com.function.auth.RoleAuthHandler.*;

public class TekvLSCreateCtaasTestSuite {
    /**
     * This function listens at endpoint "/v1.0/ctaasTestSuites". Invoke it using
     * "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/v1.0/ctaasTestSuites
     */
    @FunctionName("TekvLSCreateCtaasTestSuite")
    public HttpResponseMessage run(
            @HttpTrigger(name = "req", methods = {
                    HttpMethod.POST }, authLevel = AuthorizationLevel.ANONYMOUS, route = "ctaasTestSuites") HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context) {
        Claims tokenClaims = getTokenClaimsFromHeader(request, context);
        JSONArray roles = getRolesFromToken(tokenClaims, context);
        if (roles.isEmpty()) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
            json.put("error", MESSAGE_FOR_UNAUTHORIZED);
            return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
        }

        if (!hasPermission(roles, Resource.CREATE_CTAAS_TEST_SUITE)) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSCreateCtaasTestSuite Azure function");

        // Parse request body and extract parameters needed
        String requestBody = request.getBody().orElse("");
        context.getLogger().info("Request body: " + requestBody);
        if (requestBody.isEmpty()) {
            context.getLogger().info("error: request body is empty.");
            JSONObject json = new JSONObject();
            json.put("error", "error: request body is empty.");
            context.getLogger().info("User " + userId + " is leaving TekvLSCreateCtaasTestSuite Azure function with error");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        JSONObject jobj;

        try {
            jobj = new JSONObject(requestBody);
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSCreateCtaasTestSuite Azure function with error");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }

        // Check mandatory params to be present
        for (MANDATORY_PARAMS mandatoryParam : MANDATORY_PARAMS.values()) {
            if (!jobj.has(mandatoryParam.value)) {
                // Parameter not found
                context.getLogger().info("Missing mandatory parameter: " + mandatoryParam.value);
                JSONObject json = new JSONObject();
                json.put("error", "Missing mandatory parameter: " + mandatoryParam.value);
                context.getLogger().info("User " + userId + " is leaving TekvLSCreateCtaasTestSuite Azure function with error");
                return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
            }
        }

        // Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses"
                + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");

        String insertSql = "INSERT INTO ctaas_test_suite (subaccount_id, total_executions, next_execution_ts, frequency, device_type, name) "
                +
                "VALUES (?::uuid, ?::integer, ?::timestamp, ?, ?, ?) RETURNING ID;";

        try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
                PreparedStatement insertStmt = connection.prepareStatement(insertSql)) {
            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

            // Set statement parameters
            insertStmt.setString(1, jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_ID.value));
            insertStmt.setString(2, jobj.has(OPTIONAL_PARAMS.TOTAL_EXECUTIONS.value) ? jobj.getString(OPTIONAL_PARAMS.TOTAL_EXECUTIONS.value) : "0");
            insertStmt.setString(3, jobj.has(OPTIONAL_PARAMS.NEXT_EXECUTION.value) ? jobj.getString(OPTIONAL_PARAMS.NEXT_EXECUTION.value) : null);
            insertStmt.setString(4, jobj.getString(MANDATORY_PARAMS.FREQUENCY.value));
            insertStmt.setString(5, jobj.getString(MANDATORY_PARAMS.SERVICE.value));
            insertStmt.setString(6, jobj.getString(MANDATORY_PARAMS.SUITE_NAME.value));
            
            // Insert consumption
			context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + insertStmt);
			ResultSet rs = insertStmt.executeQuery();
            rs.next();
			jobj.put("id", rs.getString("id"));
            context.getLogger().info("CtaaS Test Suite inserted successfully.");
            context.getLogger().info("User " + userId + " is successfully leaving TekvLSCreateCtaasTestSuite Azure function");
            return request.createResponseBuilder(HttpStatus.OK).body(jobj.toString()).build();

        } catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSCreateCtaasTestSuite Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSCreateCtaasTestSuite Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }

    }

    private enum MANDATORY_PARAMS {
        SUBACCOUNT_ID("subaccountId"),
        FREQUENCY("frequency"),
        SERVICE("deviceType"),
        SUITE_NAME("name");

        private final String value;

        MANDATORY_PARAMS(String value) {
            this.value = value;
        }
    }

    private enum OPTIONAL_PARAMS {
		TOTAL_EXECUTIONS("totalExecutions"),
        NEXT_EXECUTION("nextExecution");

		private final String value;

		OPTIONAL_PARAMS(String value) {
			this.value = value;
		}
	}
}
