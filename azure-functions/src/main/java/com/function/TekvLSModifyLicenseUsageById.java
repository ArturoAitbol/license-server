package com.function;

import com.function.auth.Permission;
import com.function.db.QueryBuilder;
import com.function.db.UpdateQueryBuilder;
import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpMethod;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import com.microsoft.azure.functions.annotation.BindingName;

import io.jsonwebtoken.Claims;
import java.sql.*;
import java.time.LocalDate;
import java.util.Optional;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSModifyLicenseUsageById 
{
	/**
	 * This function listens at endpoint "/v1.0/licenseUsageDetails/{id}". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/licenseUsageDetails/{id}
	 */
	@FunctionName("TekvLSModifyLicenseUsageById")
	public HttpResponseMessage run(
			@HttpTrigger(
				name = "req",
				methods = {HttpMethod.PUT},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "licenseUsageDetails/{id}")
				HttpRequestMessage<Optional<String>> request,
				@BindingName("id") String id,
				final ExecutionContext context) 
	{

		Claims tokenClaims = getTokenClaimsFromHeader(request,context);
		String currentRole = getRoleFromToken(tokenClaims,context);
		if(currentRole.isEmpty()){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
			json.put("error", MESSAGE_FOR_UNAUTHORIZED);
			return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
		if(!hasPermission(currentRole, Permission.MODIFY_LICENSE_USAGE)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + currentRole);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		context.getLogger().info("Entering TekvLSModifyLicenseUsageById Azure function");
		String emailId = getEmailFromToken(tokenClaims, context);
		
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

		// Build the sql query
		UpdateQueryBuilder queryBuilder = new UpdateQueryBuilder("license_consumption");
		int optionalParamsFound = 0;
		for (OPTIONAL_PARAMS param: OPTIONAL_PARAMS.values()) {
			try {
				queryBuilder.appendValueModification(param.columnName, jobj.getString(param.jsonAttrib), param.dataType);
				optionalParamsFound++;
			}
			catch (Exception e) {
				context.getLogger().info("Ignoring exception: " + e);
			}
		}
		queryBuilder.appendValueModification("modified_date", LocalDate.now().toString(), QueryBuilder.DATA_TYPE.TIMESTAMP);
		queryBuilder.appendValueModification("modified_by", emailId);
		if (optionalParamsFound == 0) {
			return request.createResponseBuilder(HttpStatus.OK).build();
		}

		String deviceSql = null;
		if(jobj.has(OPTIONAL_PARAMS.DEVICE_ID.jsonAttrib)){
			deviceSql = "SELECT tokens_to_consume FROM device WHERE id = ?::uuid;";
		}

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (Connection connection = DriverManager.getConnection(dbConnectionUrl)) {
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
			if (deviceSql != null) {
				try (PreparedStatement deviceStmt = connection.prepareStatement(deviceSql)) {
					deviceStmt.setString(1, jobj.getString(OPTIONAL_PARAMS.DEVICE_ID.jsonAttrib));
					context.getLogger().info("Execute SQL statement: " + deviceStmt);
					ResultSet rs = deviceStmt.executeQuery();
					rs.next();
					Integer tokensToConsume = rs.getInt(1);
					queryBuilder.appendValueModification("tokens_consumed", tokensToConsume.toString(), QueryBuilder.DATA_TYPE.INTEGER);
				}
			}
			queryBuilder.appendWhereStatement("id", id, QueryBuilder.DATA_TYPE.UUID);
			try (PreparedStatement stmt = queryBuilder.build(connection)) {
				String userId = getUserIdFromToken(tokenClaims,context);
				context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + stmt);
				stmt.executeUpdate();
				context.getLogger().info("License updated successfully.");
				return request.createResponseBuilder(HttpStatus.OK).build();
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

	private enum OPTIONAL_PARAMS {
		PROJECT_ID("projectId", "project_id", QueryBuilder.DATA_TYPE.UUID),
		DEVICE_ID("deviceId", "device_id", QueryBuilder.DATA_TYPE.UUID),
		CONSUMPTION_DATE("consumptionDate", "consumption_date", QueryBuilder.DATA_TYPE.TIMESTAMP),
		USAGE_TYPE("type", "usage_type", "usage_type_enum");

		private final String jsonAttrib;
		private final String columnName;

		private final String dataType;

		OPTIONAL_PARAMS(String jsonAttrib, String columnName, String dataType) {
			this.jsonAttrib = jsonAttrib;
			this.columnName = columnName;
			this.dataType = dataType;
		}

		OPTIONAL_PARAMS(String jsonAttrib, String columnName, QueryBuilder.DATA_TYPE dataType) {
			this.jsonAttrib = jsonAttrib;
			this.columnName = columnName;
			this.dataType = dataType.getValue();
		}
	}
}
