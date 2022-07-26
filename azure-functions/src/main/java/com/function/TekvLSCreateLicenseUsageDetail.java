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
import java.time.LocalDate;
import java.util.Iterator;
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

		String currentRole = getRoleFromToken(request,context);
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
		// The expected parameters (and their coresponding column name in the database) 
		String[][] mandatoryParams = {
			{"subaccountId","subaccount_id"}, 
			{"deviceId","device_id"}, 
			{"consumptionDate","consumption_date"},
			{"type","usage_type"}
		};
		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		// Build the sql query to get tokens consumption and granularity from device table
		String deviceId = jobj.getString("deviceId");
		String sql = "select tokens_to_consume, granularity from device where id='" + deviceId + "';";

		try (Connection connection = DriverManager.getConnection(dbConnectionUrl); Statement statement = connection.createStatement();) {
			context.getLogger().info("Successfully connected to:" + dbConnectionUrl);
			// get tokens to consume
			context.getLogger().info("Execute SQL statement: " + sql);
			ResultSet rs = statement.executeQuery(sql);
			rs.next();
			int tokensToConsume = rs.getInt("tokens_to_consume");
			String granularity = rs.getString("granularity");
			// check if there was a consumption for this device in the same project previously.
			if (granularity.equalsIgnoreCase("static")) {
				String projectIdCondition = jobj.has("projectId")? "='" + jobj.getString("projectId") + "'" : " IS NULL";
				String devicePerProjectConsumptionSql = "select id from license_consumption where device_id='" + deviceId + "' and project_id" + projectIdCondition + " LIMIT 1;";
				rs = statement.executeQuery(devicePerProjectConsumptionSql);
				// if there was a condition only create usage details and not a consumption, otherwise continue the normal flow
				if (rs.next()) {
					jobj.put("id", rs.getString("id"));
					return this.createUsageDetail(jobj, statement, request, context);
				}
			}
			// Build the sql insertion query if there was no match in the previous if statements
			String sqlPart1 = "";
			String sqlPart2 = "";
			for (int i = 0; i < mandatoryParams.length; i++) {
				try {
					String paramValue = jobj.getString(mandatoryParams[i][0]);
					sqlPart1 += mandatoryParams[i][1] + ",";
					sqlPart2 += "'" + paramValue + "',";
				} 
				catch (Exception e) {
					// Parameter not found
					context.getLogger().info("Caught exception: " + e.getMessage());
					context.getLogger().info("Missing mandatory parameter: " + mandatoryParams[i][0]);
					JSONObject json = new JSONObject();
					json.put("error", "Missing mandatory parameter: " + mandatoryParams[i][0]);
					return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
				}
			}
			//Optional parameters
			if (jobj.has("projectId")){
				sqlPart1 += "project_id,";
				sqlPart2 += "'" + jobj.getString("projectId") + "',";
			}
			// modifed_date is always consumption_date when creating the record
			sqlPart1 += "modified_date,tokens_consumed";
			sqlPart2 += "'" + LocalDate.now().toString() + "'," + tokensToConsume;
			sql = "insert into license_consumption (" + sqlPart1 + ") values (" + sqlPart2 + ") returning id;";	
			// Insert consumption
			context.getLogger().info("Execute SQL statement: " + sql);
			rs = statement.executeQuery(sql);
			rs.next();
			jobj.put("id", rs.getString("id"));
			context.getLogger().info("License consumption inserted successfully.");
			return this.createUsageDetail(jobj, statement, request, context);
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

	private HttpResponseMessage createUsageDetail(JSONObject consumptionObj, Statement statement, HttpRequestMessage<Optional<String>> request, final ExecutionContext context) {
		String sql = "insert into usage_detail (consumption_id,usage_date,day_of_week,mac_address,serial_number) values ";
		String consumptionId = consumptionObj.getString("id");
		LocalDate consumptionDate = LocalDate.parse(consumptionObj.getString("consumptionDate"));
		try {
			final JSONArray usageDays = consumptionObj.getJSONArray("usageDays");
			if (usageDays != null && usageDays.length() > 0) {
				//Iterating the contents of the array
				Iterator<Object> iterator = usageDays.iterator();
				Integer usage;
				while(iterator.hasNext()) {
					usage = Integer.parseInt(iterator.next().toString());
					sql += "\n('" + consumptionId + "','" + consumptionDate.plusDays(usage).toString() + "'," + usage + ",'',''),";
				}
				sql = sql.substring(0, sql.length() - 1) + ";";
			} else {
				String macAddress = consumptionObj.getString("macAddress");
				String serialNumber = consumptionObj.getString("serialNumber");
				sql += "('" + consumptionId + "','" + consumptionDate.toString() + "',0,'" + macAddress + "','" + serialNumber + "');";
			}
			context.getLogger().info("Execute create usages SQL statement: " + sql);
			statement.executeUpdate(sql);
			context.getLogger().info("License usage details inserted successfully.");
			return request.createResponseBuilder(HttpStatus.OK).body(consumptionObj.toString()).build();
		} catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.toString());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}
}
