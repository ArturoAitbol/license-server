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
import java.time.LocalDate; 
import java.time.format.DateTimeFormatter;

import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSCreateLicense
{
	/**
	 * This function listens at endpoint "/v1.0/licenses". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/licenses
	 */
	@FunctionName("TekvLSCreateLicense")
	public HttpResponseMessage run(
			@HttpTrigger(
				name = "req",
				methods = {HttpMethod.POST},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "licenses")
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
		if(!hasPermission(currentRole, Permission.CREATE_LICENSE)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + currentRole);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		context.getLogger().info("Entering TekvLSCreateLicense Azure function");

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

		LocalDate currentDate = LocalDate.now();
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyy-MM-dd");
		String actualDate = currentDate.format(formatter);
		String renewalDate = jobj.getString("renewalDate");
		String status = (renewalDate.compareTo(actualDate)) < 0 ? "Expired" : "Active";

		String sql;
		if (jobj.has(OPTIONAL_PARAMS.LICENSE_ID.value)) {
			sql = "INSERT INTO license (subaccount_id, start_date, package_type, renewal_date, tokens, device_access_limit, status, description, id) " +
					"VALUES (?::uuid, ?::timestamp, ?::package_type_enum, ?::timestamp, ?, ?, '%s'::status_type_enum, ?, ?::uuid) RETURNING id;";
		} else {
			sql = "INSERT INTO license (subaccount_id, start_date, package_type, renewal_date, tokens, device_access_limit, status, description) " +
					"VALUES (?::uuid, ?::timestamp, ?::package_type_enum, ?::timestamp, ?, ?, '%s'::status_type_enum, ?) RETURNING id;";
		}
		sql = String.format(sql, status);

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
			PreparedStatement statement = connection.prepareStatement(sql)) {
			
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

			// Set statement parameters
			statement.setString(1, jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_ID.value));
			statement.setString(2, jobj.getString(MANDATORY_PARAMS.START_DATE.value));
			statement.setString(3, jobj.getString(MANDATORY_PARAMS.PACKAGE_TYPE.value));
			statement.setString(4, jobj.getString(MANDATORY_PARAMS.RENEWAL_DATE.value));
			statement.setInt(5, jobj.getInt(MANDATORY_PARAMS.TOKENS_PURCHASED.value));
			statement.setInt(6, jobj.getInt(MANDATORY_PARAMS.DEVICE_LIMIT.value));
			statement.setString(7, jobj.has(OPTIONAL_PARAMS.DESCRIPTION.value) ? jobj.getString(OPTIONAL_PARAMS.DESCRIPTION.value) : null);

			if (jobj.has(OPTIONAL_PARAMS.LICENSE_ID.value))
				statement.setString(8,jobj.getString(OPTIONAL_PARAMS.LICENSE_ID.value));

			// Insert
			context.getLogger().info("Execute SQL statement: " + statement);
			ResultSet rs = statement.executeQuery();
			context.getLogger().info("License inserted successfully."); 

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
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}

	private enum MANDATORY_PARAMS {
		SUBACCOUNT_ID("subaccountId"),
		START_DATE("startDate"),
		PACKAGE_TYPE("packageType"),
		RENEWAL_DATE("renewalDate"),
		TOKENS_PURCHASED("tokensPurchased"),
		DEVICE_LIMIT("deviceLimit");

		private final String value;

		MANDATORY_PARAMS(String value) {
			this.value = value;
		}
	}

	private enum OPTIONAL_PARAMS {
		LICENSE_ID("licenseId"),
		DESCRIPTION("description");

		private final String value;

		OPTIONAL_PARAMS(String value) {
			this.value = value;
		}
	}
}
