package com.function;

import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Optional;

import com.function.auth.Resource;
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

public class TekVLSDeleteCtaasTestSuiteById {
    /**
	 * This function listens at endpoint "/v1.0/ctaasTestSuites". Two ways to invoke it
	 * using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/ctaasTestSuites
	 */
	@FunctionName("TekvLSDeleteCtaasTestSuiteById")
	public HttpResponseMessage run(
			@HttpTrigger(
				name = "req",
				methods = { HttpMethod.DELETE },
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "ctaasTestSuites/{id}")
				HttpRequestMessage<Optional<String>> request,
			@	BindingName("id") String id,
			final ExecutionContext context) {

		Claims tokenClaims = getTokenClaimsFromHeader(request, context);
		JSONArray roles = getRolesFromToken(tokenClaims, context);
		if (roles.isEmpty()) {
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
			json.put("error", MESSAGE_FOR_UNAUTHORIZED);
			return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
		if (!hasPermission(roles, Resource.DELETE_CTAAS_TEST_SUITE)) {
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		String userId = getUserIdFromToken(tokenClaims, context);
        context.getLogger().info("User " + userId + " is Entering TekvLSDeleteCtaasTestSuiteById Azure function");

		String sql = "DELETE FROM ctaas_test_suite WHERE id = ?::uuid;";

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses"
				+ System.getenv("POSTGRESQL_SECURITY_MODE")
				+ "&user=" + System.getenv("POSTGRESQL_USER")
				+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
				Connection connection = DriverManager.getConnection(dbConnectionUrl);
				PreparedStatement statement = connection.prepareStatement(sql)) {

			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

			statement.setString(1, id);

			// Delete ctaas_test_suite
			context.getLogger().info("Execute SQL statement (User: " + userId + "): " + statement);
			statement.executeUpdate();
			context.getLogger().info("Ctaas_test_suite deleted successfully.");
			
			context.getLogger().info("User " + userId + " is successfully leaving TekvLSDeleteCtaasTestSuiteById Azure function");
			return request.createResponseBuilder(HttpStatus.OK).build();
		} catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSDeleteCtaasTestSuiteById Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		} catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSDeleteCtaasTestSuiteById Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}
}
