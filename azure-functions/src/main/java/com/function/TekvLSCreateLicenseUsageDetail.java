package com.function;

import com.function.auth.Resource;
import com.function.util.Constants.DeviceGranularity;
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
	 * This function listens at endpoint "/v1.0/licenseUsageDetails". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/licenseUsageDetails
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
		JSONArray roles = getRolesFromToken(tokenClaims, context);
		if(roles.isEmpty()){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
			json.put("error", MESSAGE_FOR_UNAUTHORIZED);
			return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
		if(!hasPermission(roles, Resource.CREATE_LICENSE_USAGE_DETAIL)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSCreateLicenseUsageDetail Azure function");		
		
		// Parse request body and extract parameters needed
		String requestBody = request.getBody().orElse("");
		context.getLogger().info("Request body: " + requestBody);
		if (requestBody.isEmpty()) {
			context.getLogger().info("error: request body is empty.");
			JSONObject json = new JSONObject();
			json.put("error", "error: request body is empty.");
			context.getLogger().info("User " + userId + " is leaving TekvLSCreateLicenseUsageDetail Azure function with error");
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
			context.getLogger().info("User " + userId + " is leaving TekvLSCreateLicenseUsageDetail Azure function with error");
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}

		// Check mandatory params to be present
		for (MANDATORY_PARAMS mandatoryParam: MANDATORY_PARAMS.values()) {
			if (!jobj.has(mandatoryParam.value)) {
				// Parameter not found
				context.getLogger().info("Missing mandatory parameter: " + mandatoryParam.value);
				JSONObject json = new JSONObject();
				json.put("error", "Missing mandatory parameter: " + mandatoryParam.value);
				context.getLogger().info("User " + userId + " is leaving TekvLSCreateLicenseUsageDetail Azure function with error");
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}
		}

		return createLicenseConsumptionEvent(tokenClaims, jobj, request, context, userId);
	}

	public HttpResponseMessage createLicenseConsumptionEvent(Claims tokenClaims, JSONObject jobj, HttpRequestMessage<Optional<String>> request, final ExecutionContext context, String userId ) {
		String userEmail = getEmailFromToken(tokenClaims, context);
		try{
			// Connect to the database
			String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
				+ "&user=" + System.getenv("POSTGRESQL_USER")
				+ "&password=" + System.getenv("POSTGRESQL_PWD");

			// Build the sql query to get tokens consumption and granularity from device table
			String deviceTokensSql = "SELECT tokens_to_consume, granularity FROM device WHERE id=?::uuid;";
			String insertSql = "INSERT INTO license_consumption (subaccount_id, device_id, consumption_date, usage_type, tokens_consumed, modified_by, modified_date, project_id, consumption_matrix_id, comment) " +
							   "VALUES (?::uuid, ?::uuid, ?::timestamp, ?::usage_type_enum, ?, ?, ?::timestamp, ?::uuid, ?::uuid, ?) RETURNING id;";
			String devicePerProjectConsumptionSql = "SELECT id FROM license_consumption WHERE device_id=?::uuid and project_id=?::uuid LIMIT 1;";

			try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
			 PreparedStatement deviceTokensStmt = connection.prepareStatement(deviceTokensSql);
			 PreparedStatement insertStmt = connection.prepareStatement(insertSql);
			 PreparedStatement devicePerProjectStmt = connection.prepareStatement(devicePerProjectConsumptionSql)) {
				context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));				
				
				int tokensToConsume;
				String granularity;
				String consumptionMatrixId;
				ResultSet rs;
				// if it has the support device flag then it must be comming from a CONSUMPTION MATRIX event
				if (jobj.has(OPTIONAL_PARAMS.SUPPORT_DEVICE.value)) {
					tokensToConsume = 0;
					granularity = DeviceGranularity.WEEKLY.value();
					consumptionMatrixId = jobj.getString(OPTIONAL_PARAMS.CONSUMPTION_MATRIX_ID.value);
				} else {
					//Insert parameters to statement
					deviceTokensStmt.setString(1, jobj.getString(MANDATORY_PARAMS.DEVICE_ID.value));
					// get tokens to consume
					context.getLogger().info("Execute SQL statement: " + deviceTokensStmt);
					rs = deviceTokensStmt.executeQuery();
					rs.next();
					tokensToConsume = rs.getInt("tokens_to_consume");
					granularity = rs.getString("granularity");
					consumptionMatrixId = null;
				}
				// check if there was a consumption for this device in the same project previously.
				if (granularity.equalsIgnoreCase("static")) {

					// Set statement parameters
					devicePerProjectStmt.setString(1, jobj.getString(MANDATORY_PARAMS.DEVICE_ID.value));
					devicePerProjectStmt.setString(2, jobj.getString(MANDATORY_PARAMS.PROJECT_ID.value));

					context.getLogger().info("Execute SQL statement: " + devicePerProjectStmt);
					rs = devicePerProjectStmt.executeQuery();

					// if there was a condition only create usage details and not a consumption, otherwise continue the normal flow
					if (rs.next()) {
						jobj.put("id", rs.getString("id"));
						jobj.put("userEmail", userEmail);
						jobj.put("userId", userId);
						return this.createUsageDetail(jobj, connection, request, context, userId);
					}
				}

				// Set statement parameters
				insertStmt.setString(1, jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_ID.value));
				insertStmt.setString(2, jobj.getString(MANDATORY_PARAMS.DEVICE_ID.value));
				insertStmt.setString(3, jobj.getString(MANDATORY_PARAMS.CONSUMPTION_DATE.value));
				insertStmt.setString(4, jobj.getString(MANDATORY_PARAMS.TYPE.value));
				insertStmt.setInt(5, tokensToConsume);
				insertStmt.setString(6, userEmail);
				insertStmt.setTimestamp(7, Timestamp.from(Instant.now()));
				insertStmt.setString(8, jobj.getString(MANDATORY_PARAMS.PROJECT_ID.value));
				insertStmt.setString(9, consumptionMatrixId);
				insertStmt.setString(10, jobj.has(OPTIONAL_PARAMS.COMMENT.value) ? jobj.getString(OPTIONAL_PARAMS.COMMENT.value) : "");

				// Insert consumption
				context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + insertStmt);
				rs = insertStmt.executeQuery();
				rs.next();
				jobj.put("id", rs.getString("id"));
				jobj.put("userEmail", userEmail);
				jobj.put("userId", userId);
				context.getLogger().info("tekToken consumption inserted successfully.");
				context.getLogger().info("User " + userId + " is successfully leaving TekvLSCreateLicenseUsageDetail Azure function");
				return this.createUsageDetail(jobj, connection, request, context, userId);
			}
		}
		catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSCreateLicenseUsageDetail Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
		catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSCreateLicenseUsageDetail Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}

	private HttpResponseMessage createUsageDetail(JSONObject consumptionObj, Connection connection, HttpRequestMessage<Optional<String>> request, final ExecutionContext context, String userId) throws SQLException {
		String sql = "INSERT INTO usage_detail (consumption_id, usage_date, day_of_week,mac_address, serial_number, modified_date, modified_by) " +
					 "VALUES (?::uuid, ?::date, ?, ?, ?, ?::timestamp, ?)";
		LocalDate consumptionDate = LocalDate.parse(consumptionObj.getString("consumptionDate"));
		try (PreparedStatement insertUsageStmt = connection.prepareStatement(sql)) {
			// Set common parameters to all batches
			insertUsageStmt.setString(1, consumptionObj.getString("id"));
			insertUsageStmt.setTimestamp(6, Timestamp.from(Instant.now()));
			insertUsageStmt.setString(7, consumptionObj.getString("userEmail"));

			final JSONArray usageDays = consumptionObj.has(OPTIONAL_PARAMS.USAGE_DAYS.value)? consumptionObj.getJSONArray(OPTIONAL_PARAMS.USAGE_DAYS.value) : null;
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
				int defaultUsageDay = consumptionDate.getDayOfWeek().getValue();
				if(defaultUsageDay==7) defaultUsageDay = 0;
				insertUsageStmt.setDate(2, Date.valueOf(consumptionDate));
				insertUsageStmt.setInt(3, defaultUsageDay);
				insertUsageStmt.setString(4, consumptionObj.has(OPTIONAL_PARAMS.MAC_ADDRESS.value)? consumptionObj.getString(OPTIONAL_PARAMS.MAC_ADDRESS.value) : null);
				insertUsageStmt.setString(5, consumptionObj.has(OPTIONAL_PARAMS.SERIAL_NUMBER.value)? consumptionObj.getString(OPTIONAL_PARAMS.SERIAL_NUMBER.value) : null);
				insertUsageStmt.addBatch();
			}
			context.getLogger().info("Execute create usages SQL statement (User: "+ consumptionObj.getString("userId") + "): " + insertUsageStmt);
			insertUsageStmt.executeBatch();
			context.getLogger().info("License usage details inserted successfully.");
			context.getLogger().info("User " + userId + " is successfully leaving TekvLSCreateLicenseUsageDetail Azure function");
			return request.createResponseBuilder(HttpStatus.OK).body(consumptionObj.toString()).build();
		} catch (Exception e) {
			context.getLogger().info("Caught exception: " + e);
			//Delete license consumption
			sql = "delete from license_consumption where id = ?::uuid;";
			try (PreparedStatement stmt = connection.prepareStatement(sql)) {
				stmt.setString(1, consumptionObj.getString("id"));
				context.getLogger().info("Execute delete license consumption SQL statement (User: "+ consumptionObj.getString("userId") + "): " + stmt);
				stmt.executeUpdate();
				context.getLogger().info("tekToken consumption deleted successfully.");
			}
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSCreateLicenseUsageDetail Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}

	private enum MANDATORY_PARAMS {
		SUBACCOUNT_ID("subaccountId"),
		DEVICE_ID("deviceId"),
		CONSUMPTION_DATE("consumptionDate"),
		TYPE("type"),
		PROJECT_ID("projectId");

		private final String value;

		MANDATORY_PARAMS(String value) {
			this.value = value;
		}
	}

	private enum OPTIONAL_PARAMS {
		USAGE_DAYS("usageDays"),
		MAC_ADDRESS("macAddress"),
		SERIAL_NUMBER("serialNumber"),
		CONSUMPTION_MATRIX_ID("consumptionMatrixId"),
		SUPPORT_DEVICE("supportDevice"),
		COMMENT("comment");

		private final String value;

		OPTIONAL_PARAMS(String value) {
			this.value = value;
		}
	}
}
