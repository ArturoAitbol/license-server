package com.function;

import com.function.auth.Resource;
import com.function.db.SelectQueryBuilder;
import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpMethod;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;

import io.jsonwebtoken.Claims;

import java.sql.*;
import java.util.Optional;

import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetAllDeviceTypes {

	/**
	 * This function listens at endpoint "/v1.0/deviceTypes". Two ways to invoke
	 * it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/deviceTypes
	 * 2. curl "{your host}/v1.0/deviceTypes"
	 */
	@FunctionName("TekvLSGetAllDeviceTypes")
	public HttpResponseMessage run(
			@HttpTrigger(name = "req", methods = {
					HttpMethod.GET }, authLevel = AuthorizationLevel.ANONYMOUS, route = "deviceTypes") HttpRequestMessage<Optional<String>> request,
			final ExecutionContext context) {

		Claims tokenClaims = getTokenClaimsFromHeader(request, context);
		JSONArray roles = getRolesFromToken(tokenClaims, context);
		if (roles.isEmpty()) {
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
			json.put("error", MESSAGE_FOR_UNAUTHORIZED);
			return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
		if (!hasPermission(roles, Resource.GET_ALL_DEVICE_TYPES)) {
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSGetAllDeviceTypes Azure function");		

		// Build SQL statement
		SelectQueryBuilder dutTypesQueryBuilder = new SelectQueryBuilder(
				"SELECT unnest(enum_range(NULL::dut_type_enum))::text AS name");
		SelectQueryBuilder callingPlatformTypesQueryBuilder = new SelectQueryBuilder(
				"SELECT unnest(enum_range(NULL::calling_platform_type_enum))::text AS name");
		SelectQueryBuilder deviceTypesQueryBuilder = new SelectQueryBuilder(
				"SELECT unnest(enum_range(NULL::device_type_enum))::text AS name");

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses"
				+ System.getenv("POSTGRESQL_SECURITY_MODE")
				+ "&user=" + System.getenv("POSTGRESQL_USER")
				+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (Connection connection = DriverManager.getConnection(dbConnectionUrl)) {
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
			JSONObject json = new JSONObject();
			JSONArray array = new JSONArray();

			// Get DUT Types
			try (PreparedStatement stmt = dutTypesQueryBuilder.build(connection)) {
				ResultSet rs;
				context.getLogger().info("Execute SQL DUT types statement: " + stmt);
				rs = stmt.executeQuery();
				while (rs.next()) {
					JSONObject item = new JSONObject();
					item.put("name", rs.getString("name"));
					array.put(item);
				}
				json.put("dutTypes", array);
			}

			// Get Calling Platform Types
			try (PreparedStatement stmt = callingPlatformTypesQueryBuilder.build(connection)) {
				ResultSet rs;
				context.getLogger().info("Execute SQL calling platform statement: " + stmt);
				rs = stmt.executeQuery();
				array = new JSONArray();
				while (rs.next()) {
					JSONObject item = new JSONObject();
					item.put("name", rs.getString("name"));
					array.put(item);
				}
				json.put("callingPlatformTypes", array);
			}

			// Get Device Types
			try (PreparedStatement stmt = deviceTypesQueryBuilder.build(connection)) {
				ResultSet rs;
				context.getLogger().info("Execute SQL device Types statement: " + stmt);
				rs = stmt.executeQuery();
				array = new JSONArray();
				while (rs.next()) {
					JSONObject item = new JSONObject();
					item.put("name", rs.getString("name"));
					array.put(item);
				}
				json.put("deviceTypes", array);
			}

			context.getLogger().info("User " + userId + " is successfully leaving TekvLSGetAllDeviceTypes Azure function");
			return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json")
					.body(json.toString()).build();
		} catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSGetAllDeviceTypes Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		} catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSGetAllDeviceTypes Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}
}
