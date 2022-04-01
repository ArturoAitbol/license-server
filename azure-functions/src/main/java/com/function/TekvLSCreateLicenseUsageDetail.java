package com.function;

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

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSCreateLicenseUsageDetail
{
	/**
	 * This function listens at endpoint "/api/licenseUsageDetails". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/api/licensesUsageDetails
	 */
	@FunctionName("TekvLSCreateLicenseUsageDetail")
	public HttpResponseMessage run(
			@HttpTrigger(
				name = "req",
				methods = {HttpMethod.POST},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "licenseUsageDetails")
				HttpRequestMessage<Optional<String>> request,
				final ExecutionContext context) 
	{
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
			{"projectId","project_id"}, 
			{"deviceId","device_id"}, 
			{"usageDate","usage_date"}, 
			{"macAddress","mac_address"},
			{"serialNumber","serial_number"}, 
			{"usageType","usage_type"}
		};
		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses?ssl=true&sslmode=require"
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		// Build the sql query to get tokens consumption
		String sql = "select tokens_to_consume from device where id='" + jobj.getString("deviceId") + "';";

		try (Connection connection = DriverManager.getConnection(dbConnectionUrl); Statement statement = connection.createStatement();) {
			context.getLogger().info("Successfully connected to:" + dbConnectionUrl);
			// get tokens to consume
			context.getLogger().info("Execute SQL statement: " + sql);
			ResultSet rs = statement.executeQuery(sql);
			rs.next();
			int tokensToConsume = rs.getInt(1);
			// Build the sql insertion query
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
					JSONObject json = new JSONObject();
					json.put("error", "Missing mandatory parameter: " + mandatoryParams[i][0]);
					return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
				}
			}
			// modifed_date is always usage_date when creating the record
			sqlPart1 += "modified_date,tokens_consumed";
			sqlPart2 += "'" + jobj.getString("usageDate") + "'," + tokensToConsume;
			sql = "insert into license_usage (" + sqlPart1 + ") values (" + sqlPart2 + ") returning id;";	
			// Insert
			context.getLogger().info("Execute SQL statement: " + sql);
			// statement.executeUpdate(sql);
			// context.getLogger().info("License usage inserted successfully."); 

			// Return the id in the response
			// sql = "select id from license_usage where " + 
			// 	"subaccount_id = '" + jobj.getString("subaccountId") + "' and " +
			// 	"project_id = '" + jobj.getString("projectId") + "' and " +
			// 	"device_id = '" + jobj.getString("deviceId") + "' and " +
			// 	"mac_address = '" + jobj.getString("macAddress") + "' and " +
			// 	"serial_number = '" + jobj.getString("serialNumber") + "' and " +
			// 	"usage_type = '" + jobj.getString("usageType") + "' and " +
			// 	"usage_date = '" + jobj.getString("usageDate") + "';";
			// context.getLogger().info("Execute SQL statement: " + sql);
			// context.getLogger().info("Execute SQL statement: " + sql);
			rs = statement.executeQuery(sql);
			rs.next();
			JSONObject json = new JSONObject();
			json.put("id", rs.getString("id"));
			context.getLogger().info("License usage inserted successfully.");

			return request.createResponseBuilder(HttpStatus.OK).body(json.toString()).build();
		}
		catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}
		catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}
	}
}
