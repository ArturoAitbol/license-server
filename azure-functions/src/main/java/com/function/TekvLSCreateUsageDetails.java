package com.function;

import com.function.auth.Permission;
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
import java.sql.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;

import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSCreateUsageDetails
{
	/**
	 * This function listens at endpoint "/v1.0/usageDetails". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/usageDetails
	 */
	@FunctionName("TekvLSCreateUsageDetails")
	public HttpResponseMessage run(
			@HttpTrigger(
				name = "req",
				methods = {HttpMethod.POST},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "usageDetails/{id}")
				HttpRequestMessage<Optional<String>> request,
				@BindingName("id") String id,
				final ExecutionContext context) {

		Claims tokenClaims = getTokenClaimsFromHeader(request, context);
		String currentRole = getRoleFromToken(tokenClaims,context);
		if(currentRole.isEmpty()){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
			json.put("error", MESSAGE_FOR_UNAUTHORIZED);
			return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
		if(!hasPermission(currentRole, Permission.CREATE_USAGE_DETAILS)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + currentRole);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		context.getLogger().info("Entering TekvLSCreateUsageDetails Azure function");
		String userId = getEmailFromToken(tokenClaims, context);
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
		} catch (Exception e) {
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

		String sql = "INSERT INTO usage_detail (consumption_id, usage_date, day_of_week, mac_address, serial_number, modified_date, modified_by) " +
					 "VALUES (?::uuid, ?::date, ?, ?, ?, ?::timestamp, ?);";
		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");

		try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
			 PreparedStatement statement = connection.prepareStatement(sql)) {
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

			// Set common parameters to all batches
			statement.setString(1, id);
			statement.setTimestamp(6, Timestamp.from(Instant.now()));
			statement.setString(7, userId);

			final JSONArray usageDays = jobj.getJSONArray(MANDATORY_PARAMS.ADDED_DAYS.value);
			if (usageDays != null && usageDays.length() > 0) {
				int usage;
				//Iterating the contents of the array
				for (Object usageDay: usageDays) {
					usage = Integer.parseInt(usageDay.toString());
					statement.setDate(2, Date.valueOf(LocalDate.now().plusDays(usage)));
					statement.setInt(3, usage);
					statement.setString(4, "");
					statement.setString(5, "");
					statement.addBatch();
				}
			} else {
				context.getLogger().info("Missing mandatory parameter: " + MANDATORY_PARAMS.ADDED_DAYS.value);
				JSONObject json = new JSONObject();
				json.put("error", "Missing mandatory parameter: " + MANDATORY_PARAMS.ADDED_DAYS.value);
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}

			context.getLogger().info("Execute SQL statement: " + statement);
			statement.executeBatch();
			context.getLogger().info("tekToken consumption inserted successfully.");
			return request.createResponseBuilder(HttpStatus.OK).body(jobj.toString()).build();
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

		ADDED_DAYS("addedDays"),
		CONSUMPTION_DATE("consumptionDate");

		private final String value;

		MANDATORY_PARAMS(String value) {
			this.value = value;
		}
	}
}
