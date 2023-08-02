package com.function;

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

import com.microsoft.azure.functions.annotation.BindingName;

import java.sql.*;
import java.util.Optional;

import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetAllBundles {
	/**
	 * This function listens at endpoint "/v1.0/bundles". Two ways to invoke it
	 * using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/bundles
	 * 2. curl "{your host}/v1.0/bundles"
	 */
	@FunctionName("TekvLSGetAllBundles")
	public HttpResponseMessage run(
			@HttpTrigger(name = "req", methods = {
					HttpMethod.GET }, authLevel = AuthorizationLevel.ANONYMOUS, route = "bundles/{id=EMPTY}") HttpRequestMessage<Optional<String>> request,
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
		if (!hasPermission(roles, Resource.GET_ALL_BUNDLES)) {
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSGetAllBundles Azure function");
		String name = request.getQueryParameters().getOrDefault("bundleName", "");

		// Build SQL statement
		String sql = "SELECT * FROM bundle";
		if (!id.equals("EMPTY"))
			sql += " WHERE id = ?::uuid";
		else if (!name.isEmpty()) {
			sql += " WHERE name = ?";
		}

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses"
				+ System.getenv("POSTGRESQL_SECURITY_MODE")
				+ "&user=" + System.getenv("POSTGRESQL_USER")
				+ "&password=" + System.getenv("POSTGRESQL_PWD");
		context.getLogger().info("JDBC CONNECTION STRING: " + dbConnectionUrl);
		try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
				PreparedStatement statement = connection.prepareStatement(sql)) {

			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

			if (!id.equals("EMPTY"))
				statement.setString(1, id);
			else if (!name.isEmpty())
				statement.setString(1, name);

			// Retrive all bundles.
			context.getLogger().info("Execute SQL statement: " + statement);
			ResultSet rs = statement.executeQuery();
			// Return a JSON array of bundles
			JSONObject json = new JSONObject();
			JSONArray array = new JSONArray();
			while (rs.next()) {
				JSONObject item = new JSONObject();
				item.put("id", rs.getString("id"));
				item.put("bundleName", rs.getString("name"));
				item.put("defaultDeviceAccessTokens", rs.getString("device_access_tokens"));
				item.put("defaultTokens", rs.getString("tokens"));
				array.put(item);
			}
			json.put("bundles", array);
			context.getLogger().info("User " + userId + " is successfully leaving TekvLSGetAllBundles Azure function");
			return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json")
					.body(json.toString()).build();
		} catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSGetAllBundles Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		} catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSGetAllBundles Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}
}
