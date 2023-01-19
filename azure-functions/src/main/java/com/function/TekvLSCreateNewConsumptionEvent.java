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
import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;

import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSCreateNewConsumptionEvent
{
	/**
	 * This function listens at endpoint "/v1.0/consumptionEvent". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/consumptionEvent
	 */
	@FunctionName("TekvLSCreateNewConsumptionEvent")
	public HttpResponseMessage run(
			@HttpTrigger(
				name = "req",
				methods = {HttpMethod.POST},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "consumptionEvent")
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

		context.getLogger().info("Entering TekvLSCreateNewConsumptionEvent Azure function");
		
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

		// Get DUT type
		String dutType = getDeviceType(jobj.getString(MANDATORY_PARAMS.DUT_ID.value), context);
		if (dutType.isEmpty()) {
			JSONObject json = new JSONObject();
			json.put("error", "DUT provided doesn't exist");
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}

		// Get Calling Platform type
		String callingPlatformType = getDeviceType(jobj.getString(MANDATORY_PARAMS.DUT_ID.value), context);
		if (callingPlatformType.isEmpty()) {
			JSONObject json = new JSONObject();
			json.put("error", "DUT provided doesn't exist");
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}

		/** Get the device matrix id and tokens of the dut + calling platform type combinations to insert it in the consumption event records*/
		// Build SQL statement
		SelectQueryBuilder queryBuilder = new SelectQueryBuilder("SELECT * FROM consumption_matrix");
		queryBuilder.appendEqualsCondition("dut_type", dutType);
		queryBuilder.appendEqualsCondition("calling_platform_type", callingPlatformType);
		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
			PreparedStatement statement = queryBuilder.build(connection)) {
			
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
			
			// Execute sql query. TO DO: pagination
			context.getLogger().info("Execute SQL statement: " + statement);
			ResultSet rs = statement.executeQuery();
			// Get 
			if (rs.next()) {
				String consumptionMatrixId = rs.getString("id");
				Integer tokens = rs.getInt("tokens");
				return createLicenseConsumptionEvent(tokenClaims, jobj, consumptionMatrixId, tokens, request, context);
			} else {
				JSONObject json = new JSONObject();
				json.put("error", "DUT + Calling platform types sent make an invalid combination.");
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}
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

	public String getDeviceType(String deviceId, final ExecutionContext context) {
		String deviceType = "";
		SelectQueryBuilder queryBuilder = new SelectQueryBuilder("SELECT device_type FROM device");
		queryBuilder.appendEqualsCondition("id", deviceId);
		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
			PreparedStatement statement = queryBuilder.build(connection)) {
			
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
			context.getLogger().info("Execute SQL statement: " + statement);
			ResultSet rs = statement.executeQuery();
			// Get 
			if (rs.next()) {
				deviceType = rs.getString("device_type");
			} else {
				context.getLogger().warning("Unable to find device with id: " + deviceId);
			}
		}
		catch (Exception e) {
			context.getLogger().warning("Caught exception when looking for device type: " + e.getMessage());
		}
		return deviceType;
	}

	public HttpResponseMessage createLicenseConsumptionEvent(Claims tokenClaims, JSONObject jobj, String consumptionMatrixId, Integer tokensFromMatrix, HttpRequestMessage<Optional<String>> request, final ExecutionContext context) {
		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");

		// Build the sql query to get tokens consumption and granularity from device table
		String devicePerProjectConsumptionSql = "SELECT id FROM license_consumption WHERE consumption_matrix_id=?::uuid and project_id=?::uuid and ?::timestamp LIMIT 1;";
		String insertSql = "INSERT INTO license_consumption (subaccount_id, consumption_matrix_id, device_id, calling_platform_id, consumption_date, usage_type, tokens_consumed, modified_by, modified_date, project_id) " +
							"VALUES (?::uuid, ?::uuid, ?::uuid, ?::uuid, ?::timestamp, ?::usage_type_enum, ?, ?, ?::timestamp, ?::uuid) returning id;";

		try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
			PreparedStatement insertStmt = connection.prepareStatement(insertSql);
			PreparedStatement devicePerProjectStmt = connection.prepareStatement(devicePerProjectConsumptionSql)) {
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
			String userId = getUserIdFromToken(tokenClaims,context);
			
			// check if there was a consumption for this consumption matrix id in the same project and week previously.
			// Set statement parameters
			devicePerProjectStmt.setString(1, consumptionMatrixId);
			devicePerProjectStmt.setString(2, jobj.getString(MANDATORY_PARAMS.PROJECT_ID.value));
			devicePerProjectStmt.setString(3, jobj.getString(MANDATORY_PARAMS.CONSUMPTION_DATE.value));

			context.getLogger().info("Execute SQL statement: " + devicePerProjectStmt);
			ResultSet rs = devicePerProjectStmt.executeQuery();

			// if there was a consumption, consume 0 tokens in both entries.
			Integer tokensToConsume = tokensFromMatrix;
			if (rs.next())
				tokensToConsume = 0;
				
			// Get user email from tokens and timestamp
			String userEmail = getEmailFromToken(tokenClaims, context);

			// Set statement parameters to insert DUT + Calling Platform usage
			insertStmt.setString(1, jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_ID.value));
			insertStmt.setString(2, consumptionMatrixId);
			insertStmt.setString(3, jobj.getString(MANDATORY_PARAMS.DUT_ID.value));
			insertStmt.setString(4, jobj.getString(MANDATORY_PARAMS.CALLING_PLATFORM_ID.value));
			insertStmt.setString(5, jobj.getString(MANDATORY_PARAMS.CONSUMPTION_DATE.value));
			insertStmt.setString(6, jobj.getString(MANDATORY_PARAMS.TYPE.value));
			insertStmt.setInt(7, tokensToConsume);
			insertStmt.setString(8, userEmail);
			insertStmt.setTimestamp(9, Timestamp.from(Instant.now()));
			insertStmt.setString(10, jobj.getString(MANDATORY_PARAMS.PROJECT_ID.value));
			
			context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + insertStmt);
			rs = insertStmt.executeQuery();
			rs.next();
			jobj.put("id", rs.getString("id"));
			jobj.put("consumptionMatrixId", consumptionMatrixId);
			jobj.put("userEmail", userEmail);
			jobj.put("userId", userId);
			context.getLogger().info("DUT consumption inserted successfully.");
			if (!this.createUsageDetail(jobj, connection, context))
				return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(jobj.toString()).build();
			return request.createResponseBuilder(HttpStatus.OK).body(jobj.toString()).build();
		} catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		} catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}

	private boolean createUsageDetail(JSONObject consumptionObj, Connection connection, final ExecutionContext context) throws SQLException {
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
			return true;
		} catch (Exception e) {
			context.getLogger().info("Caught exception: " + e);
			//Delete license consumption
			deleteFailedConsumption(consumptionObj.getString("id"), connection, context);
			consumptionObj = new JSONObject();
			consumptionObj.put("error", e.getMessage());
			return false;
		}
	}

	private void deleteFailedConsumption(String id, Connection connection, final ExecutionContext context) {
		String sql = "delete from license_consumption where id = ?::uuid;";
		try (PreparedStatement stmt = connection.prepareStatement(sql)) {
			stmt.setString(1, id);
			stmt.executeUpdate();
			context.getLogger().info("failed consumption deleted successfully.");
		} catch (Exception e) {
			context.getLogger().info("Caught exception: " + e);
		}
	}

	private enum MANDATORY_PARAMS {
		SUBACCOUNT_ID("subaccountId"),
		DUT_ID("dutId"),
		CALLING_PLATFORM_ID("callingPlatformId"),
		CONSUMPTION_DATE("consumptionDate"),
		TYPE("type"),
		PROJECT_ID("projectId");

		private final String value;

		MANDATORY_PARAMS(String value) {
			this.value = value;
		}
	}

	private enum OPTIONAL_PARAMS {
		OTHER_DEVICES("otherDevices"),
		USAGE_DAYS("usageDays"),
		MAC_ADDRESS("macAddress"),
		SERIAL_NUMBER("serialNumber");

		private final String value;

		OPTIONAL_PARAMS(String value) {
			this.value = value;
		}
	}
}
