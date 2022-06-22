package com.function;

import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpMethod;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import com.microsoft.azure.functions.annotation.BindingName;

import java.sql.*;
import java.time.LocalDate;
import java.util.Optional;

import org.json.JSONObject;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSModifyLicenseUsageById 
{
	/**
	 * This function listens at endpoint "/api/licenseUsageDetails/{id}". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/api/licenseUsageDetails/{id}
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
		context.getLogger().info("Entering TekvLSModifyLicenseUsageById Azure function");
		
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

		String sql = "select tokens_to_consume from device where id='" + jobj.getString("deviceId") + "';";
		
		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses?ssl=true&sslmode=require"
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (Connection connection = DriverManager.getConnection(dbConnectionUrl); Statement statement = connection.createStatement();) {
			context.getLogger().info("Successfully connected to:" + dbConnectionUrl);
			// get tokens to consume
			context.getLogger().info("Execute SQL statement: " + sql);
			ResultSet rs = statement.executeQuery(sql);
			rs.next();
			int tokensToConsume = rs.getInt(1);

			// The expected parameters (and their coresponding column name in the database) 
			String[][] optionalParams = {
				{"projectId","project_id"},
				{"deviceId","device_id"}, 
				{"consumptionDate","consumption_date"},
				{"usageType","usage_type"}
			};
			// Build the sql query
			sql = "update license_consumption set ";
			int optionalParamsFound = 0;
			for (int i = 0; i < optionalParams.length; i++) {
				try {
					String paramName = jobj.getString(optionalParams[i][0]);
					sql += optionalParams[i][1] + "='" + paramName + "',";
					optionalParamsFound++;
				} 
				catch (Exception e) {
					// Parameter doesn't exist. (continue since it's optional)
					context.getLogger().info("Ignoring exception: " + e);
					continue;
				}
			}
			sql += " modified_date='" + LocalDate.now().toString() + "',tokens_consumed=" + tokensToConsume;
			if (optionalParamsFound == 0) {
				return request.createResponseBuilder(HttpStatus.OK).build();
			}
			sql += " where id='" + id + "';";
			
			context.getLogger().info("Successfully connected to:" + dbConnectionUrl);
			context.getLogger().info("Execute SQL statement: " + sql);
			statement.executeUpdate(sql);
			context.getLogger().info("License updated successfully."); 

			return request.createResponseBuilder(HttpStatus.OK).build();
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
