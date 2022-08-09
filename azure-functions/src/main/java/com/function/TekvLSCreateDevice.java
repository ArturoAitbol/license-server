package com.function;

import com.function.auth.Permission;
import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpMethod;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;

import java.sql.*;
import java.util.Optional;

import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSCreateDevice
{
	/**
	 * This function listens at endpoint "/api/devices". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/api/devices
	 */
	@FunctionName("TekvLSCreateDevice")
	public HttpResponseMessage run(
			@HttpTrigger(
				name = "req",
				methods = {HttpMethod.POST},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "devices")
				HttpRequestMessage<Optional<String>> request,
				final ExecutionContext context)
	{

		String currentRole = getRoleFromToken(request,context);
		if(currentRole.isEmpty()){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
			json.put("error", MESSAGE_FOR_UNAUTHORIZED);
			return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
		if(!hasPermission(currentRole, Permission.CREATE_DEVICE)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + currentRole);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		context.getLogger().info("Entering TekvLSCreateDevice Azure function");

		// Parse request body and extract parameters needed
		String requestBody = request.getBody().orElse("");
		context.getLogger().info("Request body: " + requestBody);
		if (requestBody.isEmpty()) {
			context.getLogger().info("error: request body is empty.");
			JSONObject json = new JSONObject();
			json.put("error", "error: request body is empty.");
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

		// Check mandatory params to be present
		for (MANDATORY_PARAMS mandatoryParam: MANDATORY_PARAMS.values()) {
			if (!jobj.has(mandatoryParam.value)) {
				// Parameter not found
				context.getLogger().info("Missing mandatory parameter: " + mandatoryParam.value);
				JSONObject json = new JSONObject();
				json.put("error", "Missing mandatory parameter: " + mandatoryParam.value);
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}
		}

		// Build the sql query
		String sql = "INSERT INTO device (vendor, product, version, type, support_type, granularity, tokens_to_consume, start_date, subaccount_id, deprecated_date) " +
					 "VALUES (?, ?, ?, ?::device_type_enum, ?::boolean, ?::granularity_type_enum, ?, ?::timestamp, ?::uuid, ?::timestamp) RETURNING id;";

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			PreparedStatement statement = connection.prepareStatement(sql)) {
			
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

			// Set statement parameters
			statement.setString(1, jobj.getString(MANDATORY_PARAMS.VENDOR.value));
			statement.setString(2, jobj.getString(MANDATORY_PARAMS.PRODUCT.value));
			statement.setString(3, jobj.getString(MANDATORY_PARAMS.VERSION.value));
			statement.setString(4, jobj.getString(MANDATORY_PARAMS.TYPE.value));
			statement.setString(5, jobj.getString(MANDATORY_PARAMS.SUPPORT_TYPE.value));
			statement.setString(6, jobj.getString(MANDATORY_PARAMS.GRANULARITY.value));
			statement.setInt(7, jobj.getInt(MANDATORY_PARAMS.TOKENS_TO_CONSUME.value));
			statement.setString(8, jobj.getString(MANDATORY_PARAMS.START_DATE.value));

			statement.setString(9, jobj.has(OPTIONAL_PARAMS.SUBACCOUNT_ID.value) ? jobj.getString(OPTIONAL_PARAMS.SUBACCOUNT_ID.value) : null);
			statement.setString(10, jobj.has(OPTIONAL_PARAMS.DEPRECATED_DATE.value) ? jobj.getString(OPTIONAL_PARAMS.DEPRECATED_DATE.value) : "infinity");

			// Insert
			context.getLogger().info("Execute SQL statement: " + statement);
			ResultSet rs = statement.executeQuery();
			context.getLogger().info("License usage inserted successfully."); 

			// Return the id in the response
			rs.next();
			JSONObject json = new JSONObject();
			json.put("id", rs.getString("id"));

			return request.createResponseBuilder(HttpStatus.OK).body(json.toString()).build();
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
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}
	}

	private enum MANDATORY_PARAMS {

		VENDOR("vendor"),
		PRODUCT("product"),
		VERSION("version"),
		TYPE("type"),
		SUPPORT_TYPE("supportType"),
		GRANULARITY("granularity"),
		TOKENS_TO_CONSUME("tokensToConsume"),
		START_DATE("startDate");

		private final String value;

		MANDATORY_PARAMS(String value) {
			this.value = value;
		}
	}

	private enum OPTIONAL_PARAMS {

		SUBACCOUNT_ID("subaccountId"),
		DEPRECATED_DATE("deprecatedDate");

		private final String value;

		OPTIONAL_PARAMS(String value) {
			this.value = value;
		}
	}
}
