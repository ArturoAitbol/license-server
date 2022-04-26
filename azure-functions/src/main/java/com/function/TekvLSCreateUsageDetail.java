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
public class TekvLSCreateUsageDetail
{
	/**
	 * This function listens at endpoint "/api/usageDetails". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/api/usageDetails
	 */
	@FunctionName("TekvLSCreateUsageDetail")
	public HttpResponseMessage run(
			@HttpTrigger(
				name = "req",
				methods = {HttpMethod.POST},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "usageDetails")
				HttpRequestMessage<Optional<String>> request,
				final ExecutionContext context) {
		context.getLogger().info("Entering TekvLSCreateUsageDetail Azure function");
		
		// Parse request body and extract parameters needed
		String requestBody = request.getBody().orElse("");
		context.getLogger().info("Request body: " + requestBody);
		if (requestBody.isEmpty()) {
			context.getLogger().info("error: request body is empty.");
			JSONObject json = new JSONObject();
			json.put("error", "error: request body is empty.");
			return request.createResponseBuilder(HttpStatus.OK).body(json.toString()).build();
		}
		JSONObject jobj;
		try {
			jobj = new JSONObject(requestBody);
		} 
		catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			return request.createResponseBuilder(HttpStatus.OK).body(json.toString()).build();
		}
		// The expected parameters (and their coresponding column name in the database) 
		String[][] mandatoryParams = {
			{"consumptionId","consumption_id"}, 
			{"dayOfWeek","day_of_week"}, 
			{"usageDate","usage_date"}, 
			{"macAddress","mac_address"},
			{"serialNumber","serial_number"}
		};
		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses?ssl=true&sslmode=require"
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
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
				return request.createResponseBuilder(HttpStatus.OK).body(json.toString()).build();
			}
		}
		// modifed_date is always consumption_date when creating the record
		sqlPart2 += "'" + jobj.getString("usageDate") + "'";
		String sql = "insert into usage_detail (" + sqlPart1 + ") values (" + sqlPart2 + ") returning id;";	

		try (Connection connection = DriverManager.getConnection(dbConnectionUrl); Statement statement = connection.createStatement();) {
			context.getLogger().info("Successfully connected to:" + dbConnectionUrl);
			// get tokens to consume
			context.getLogger().info("Execute SQL statement: " + sql);
			ResultSet rs = statement.executeQuery(sql);
			rs.next();
			jobj.put("id", rs.getString("id"));
			context.getLogger().info("License consumption inserted successfully.");
			return request.createResponseBuilder(HttpStatus.OK).body(jobj.toString()).build();
		}
		catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			return request.createResponseBuilder(HttpStatus.OK).body(json.toString()).build();
		}
		catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			return request.createResponseBuilder(HttpStatus.OK).body(json.toString()).build();
		}
	}
}
