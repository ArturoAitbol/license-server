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

import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSCreateDevice
{
	/**
	 * This function listens at endpoint "/api/devices". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/api/devices
	 */
	@FunctionName("TekvLSCreateDevice")
	public HttpResponseMessage run(
			@HttpTrigger(
				name = "req",
				methods = {HttpMethod.POST},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "devices")
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
		if(!hasPermission(currentRole, Permission.CREATE_DEVICE)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + currentRole);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		context.getLogger().info("Entering TekvLSCreateDevice Azure function");

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
			{"vendor","vendor"}, 
			{"product","product"}, 
			{"version","version"}, 
			{"type","type"},
			{"supportType","support_type"},
			{"granularity","granularity"},
			{"tokensToConsume","tokens_to_consume"},
			{"startDate","start_date"}
		};
		// Build the sql query
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
		// add subaccountId or deprecatedDate type if present
		if (jobj.has("subaccountId")) {
			sqlPart1 += "subaccount_id,";
			sqlPart2 += "'" + jobj.getString("subaccountId") + "',";
		}
		if (jobj.has("deprecatedDate")) {
			sqlPart1 += "deprecated_date,";
			sqlPart2 += "'" + jobj.getString("deprecatedDate") + "',";
		}
		// Remove the comma after the last parameter and build the SQL statement
		sqlPart1 = sqlPart1.substring(0, sqlPart1.length() - 1);
		sqlPart2 = sqlPart2.substring(0, sqlPart2.length() - 1);
		String sql = "insert into device (" + sqlPart1 + ") values (" + sqlPart2 + ");";

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses?ssl=true&sslmode=require"
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			Statement statement = connection.createStatement();) {
			
			context.getLogger().info("Successfully connected to:" + dbConnectionUrl);
			
			// Insert
			context.getLogger().info("Execute SQL statement: " + sql);
			statement.executeUpdate(sql);
			context.getLogger().info("License usage inserted successfully."); 

			// Return the id in the response
			sql = "select id from device where " + 
				"vendor = '" + jobj.getString("vendor") + "' and " +
				"product = '" + jobj.getString("product") + "' and " +
				"version = '" + jobj.getString("version") + "' and " +
				"type = '" + jobj.getString("type") + "';";
			context.getLogger().info("Execute SQL statement: " + sql);
			ResultSet rs = statement.executeQuery(sql);
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
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}
	}
}
