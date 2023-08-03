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
import com.microsoft.azure.functions.annotation.BindingName;

import java.sql.*;
import java.util.Optional;

import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSDeleteDeviceById 
{
	/**
	 * This function listens at endpoint "/v1.0/devices". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/devices
	 */
	@FunctionName("TekvLSDeleteDeviceById")
	public HttpResponseMessage run(
			@HttpTrigger(
				name = "req",
				methods = {HttpMethod.DELETE},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "devices/{id}")
				HttpRequestMessage<Optional<String>> request,
				@BindingName("id") String id,
				final ExecutionContext context) 
	{

		Claims tokenClaims = getTokenClaimsFromHeader(request,context);
		JSONArray roles = getRolesFromToken(tokenClaims,context);
		if(roles.isEmpty()){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
			json.put("error", MESSAGE_FOR_UNAUTHORIZED);
			return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
		if(!hasPermission(roles, Resource.DELETE_DEVICE)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		String userId = getUserIdFromToken(tokenClaims, context);
        context.getLogger().info("User " + userId + " is Entering TekvLSDeleteDeviceById Azure function");
		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());
		String forceDelete = request.getQueryParameters().getOrDefault("force", "false");
		Boolean deleteFlag = Boolean.parseBoolean(forceDelete);

		String tombstoneSql = "UPDATE device SET tombstone=true WHERE id = ?::uuid;";
		String deleteSql = "DELETE FROM device WHERE id = ?::uuid;";

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			PreparedStatement tombstoneStmt = connection.prepareStatement(tombstoneSql);
			PreparedStatement deleteStmt = connection.prepareStatement(deleteSql)) {
			
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

			// Delete device
			if (deleteFlag) {
				deleteStmt.setString(1, id);
				context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + deleteStmt);
				deleteStmt.executeUpdate();
			}
			else {
				tombstoneStmt.setString(1, id);
				context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + tombstoneStmt);
				tombstoneStmt.executeUpdate();
			}
			
			context.getLogger().info("Device deleted successfully.");
			context.getLogger().info("User " + userId + " is successfully leaving TekvLSDeleteDeviceById Azure function");
			return request.createResponseBuilder(HttpStatus.OK).build();
		}
		catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSDeleteDeviceById Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
		catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSDeleteDeviceById Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}
}
