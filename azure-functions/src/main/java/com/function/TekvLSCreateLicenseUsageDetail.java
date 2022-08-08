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
public class TekvLSCreateLicenseUsageDetail
{
	/**
	 * This function listens at endpoint "/api/licenseUsageDetails". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/api/licenseUsageDetails
	 */
	@FunctionName("TekvLSCreateLicenseUsageDetail")
	public HttpResponseMessage run(
			@HttpTrigger(
				name = "req",
				methods = {HttpMethod.POST},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "licenseUsageDetails")
				HttpRequestMessage<Optional<String>> request,
				final ExecutionContext context) {

		Claims tokenClaims = getTokenClaimsFromHeader(request, context);
		String currentRole = getRoleFromToken(tokenClaims, context);
		if(currentRole.isEmpty()){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
			json.put("error", MESSAGE_FOR_UNAUTHORIZED);
			return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
		if(!hasPermission(currentRole, Permission.CREATE_LICENSE_USAGE_DETAIL)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + currentRole);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		context.getLogger().info("Entering TekvLSCreateLicenseUsageDetail Azure function");
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

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");

		// Build the sql query to get tokens consumption and granularity from device table
		String deviceTokensSql = "SELECT tokens_to_consume, granularity FROM device WHERE id=?::uuid;";
		String insertSql = "INSERT INTO license_consumption (subaccount_id, device_id, consumption_date, usage_type, tokens_consumed, modified_by, modified_date, project_id) " +
						   "VALUES (?::uuid, ?::uuid, ?::timestamp, ?::usage_type_enum, ?, ?, ?::timestamp, ?::uuid) RETURNING ID;";
		String devicePerProjectConsumptionSql;
		if (jobj.has("projectId")) {
			devicePerProjectConsumptionSql = "SELECT id FROM license_consumption WHERE device_id=?::uuid and project_id=?::uuid LIMIT 1;";
		} else {
			devicePerProjectConsumptionSql = "SELECT id FROM license_consumption WHERE device_id=?::uuid and project_id IS NULL LIMIT 1;";
		}

		try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
			 PreparedStatement deviceTokensStmt = connection.prepareStatement(deviceTokensSql);
			 PreparedStatement insertStmt = connection.prepareStatement(insertSql);
			 PreparedStatement devicePerProjectStmt = connection.prepareStatement(devicePerProjectConsumptionSql)) {
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

			//Insert parameters to statement
			deviceTokensStmt.setString(1, jobj.getString(MANDATORY_PARAMS.DEVICE_ID.value));

			// get tokens to consume
			context.getLogger().info("Execute SQL statement: " + deviceTokensStmt);
			ResultSet rs = deviceTokensStmt.executeQuery();
			rs.next();
			int tokensToConsume = rs.getInt("tokens_to_consume");
			String granularity = rs.getString("granularity");
			// check if there was a consumption for this device in the same project previously.
			if (granularity.equalsIgnoreCase("static")) {

				// Set statement parameters
				devicePerProjectStmt.setString(1, jobj.getString(MANDATORY_PARAMS.DEVICE_ID.value));
				if (jobj.has("projectId")) devicePerProjectStmt.setString(2, jobj.getString(OPTIONAL_PARAMS.PROJECT_ID.value));

				context.getLogger().info("Execute SQL statement: " + devicePerProjectStmt);
				rs = devicePerProjectStmt.executeQuery();

				// if there was a condition only create usage details and not a consumption, otherwise continue the normal flow
				if (rs.next()) {
					jobj.put("id", rs.getString("id"));
					jobj.put("userId", userId);
					return this.createUsageDetail(jobj, connection, request, context);
				}
			}

			// Set statement parameters
			insertStmt.setString(1, jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_ID.value));
			insertStmt.setString(2, jobj.getString(MANDATORY_PARAMS.DEVICE_ID.value));
			insertStmt.setString(3, jobj.getString(MANDATORY_PARAMS.CONSUMPTION_DATE.value));
			insertStmt.setString(4, jobj.getString(MANDATORY_PARAMS.TYPE.value));
			insertStmt.setInt(5, tokensToConsume);
			insertStmt.setString(6, userId);
			insertStmt.setTimestamp(7, Timestamp.from(Instant.now()));
			insertStmt.setString(8, jobj.has(OPTIONAL_PARAMS.PROJECT_ID.value) ? jobj.getString(OPTIONAL_PARAMS.PROJECT_ID.value) : null);

			// Insert consumption
			context.getLogger().info("Execute SQL statement: " + insertStmt);
			rs = insertStmt.executeQuery();
			rs.next();
			jobj.put("id", rs.getString("id"));
			jobj.put("userId", userId);
			context.getLogger().info("License consumption inserted successfully.");
			return this.createUsageDetail(jobj, connection, request, context);
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

	private HttpResponseMessage createUsageDetail(JSONObject consumptionObj, Connection connection, HttpRequestMessage<Optional<String>> request, final ExecutionContext context) throws SQLException {
		String sql = "INSERT INTO usage_detail (consumption_id, usage_date, day_of_week,mac_address, serial_number, modified_date, modified_by) " +
					 "VALUES (?::uuid, ?::date, ?, ?, ?, ?::timestamp, ?)";
		LocalDate consumptionDate = LocalDate.parse(consumptionObj.getString("consumptionDate"));
		try (PreparedStatement insertUsageStmt = connection.prepareStatement(sql)) {
			// Set common parameters to all batches
			insertUsageStmt.setString(1, consumptionObj.getString("id"));
			insertUsageStmt.setTimestamp(6, Timestamp.from(Instant.now()));
			insertUsageStmt.setString(7, consumptionObj.getString("userId"));

			final JSONArray usageDays = consumptionObj.getJSONArray(OPTIONAL_PARAMS.USAGE_DAYS.value);
			if (usageDays != null && usageDays.length() > 0) {
				int usage;
				//Iterating the contents of the array
				for (Object usageDay: usageDays) {
					usage = Integer.parseInt(usageDay.toString());
					insertUsageStmt.setDate(2, Date.valueOf(consumptionDate.plusDays(usage)));
					insertUsageStmt.setInt(3, usage);
					insertUsageStmt.setString(4, "");
					insertUsageStmt.setString(5, "");
					insertUsageStmt.addBatch();
				}
			} else {
				insertUsageStmt.setDate(2, Date.valueOf(consumptionDate));
				insertUsageStmt.setInt(3, 0);
				insertUsageStmt.setString(4, consumptionObj.getString(OPTIONAL_PARAMS.MAC_ADDRESS.value));
				insertUsageStmt.setString(5, consumptionObj.getString(OPTIONAL_PARAMS.SERIAL_NUMBER.value));
				insertUsageStmt.addBatch();
			}
			context.getLogger().info("Execute create usages SQL statement: " + insertUsageStmt);
			insertUsageStmt.executeBatch();
			context.getLogger().info("License usage details inserted successfully.");
			return request.createResponseBuilder(HttpStatus.OK).body(consumptionObj.toString()).build();
		} catch (Exception e) {
			context.getLogger().info("Caught exception: " + e);
			//Delete license consumption
			sql = "delete from license_consumption where id = ?::uuid;";
			try (PreparedStatement stmt = connection.prepareStatement(sql)) {
				stmt.setString(1, consumptionObj.getString("id"));
				context.getLogger().info("Execute delete license consumption SQL statement: " + stmt);
				stmt.executeUpdate();
				context.getLogger().info("License consumption deleted successfully.");
			}
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}

	private enum MANDATORY_PARAMS {
		SUBACCOUNT_ID("subaccountId"),
		DEVICE_ID("deviceId"),
		CONSUMPTION_DATE("consumptionDate"),
		TYPE("type");

		private final String value;

		MANDATORY_PARAMS(String value) {
			this.value = value;
		}
	}

	private enum OPTIONAL_PARAMS {
		PROJECT_ID("projectId"),
		USAGE_DAYS("usageDays"),
		MAC_ADDRESS("macAddress"),
		SERIAL_NUMBER("serialNumber");

		private final String value;

		OPTIONAL_PARAMS(String value) {
			this.value = value;
		}
	}
}
