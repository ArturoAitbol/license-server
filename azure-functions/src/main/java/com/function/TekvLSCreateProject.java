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
public class TekvLSCreateProject
{
	/**
	 * This function listens at endpoint "/api/projects". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/api/projects
	 */
	@FunctionName("TekvLSCreateProject")
	public HttpResponseMessage run(
			@HttpTrigger(
				name = "req",
				methods = {HttpMethod.POST},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "projects")
				HttpRequestMessage<Optional<String>> request,
				final ExecutionContext context) 
	{
		context.getLogger().info("Entering TekvLSCreateProject Azure function");

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
			{"subaccountId","subaccount_id"}, 
			{"name","name"}, 
			{"number","number"}, 
			{"openDate","open_date"},
			{"status","status"} 
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
				return request.createResponseBuilder(HttpStatus.OK).body(json.toString()).build();
			}
		}

		// Remove the comma after the last parameter and build the SQL statement
		sqlPart1 = sqlPart1.substring(0, sqlPart1.length() - 1);
		sqlPart2 = sqlPart2.substring(0, sqlPart2.length() - 1);
		String sql = "insert into project (" + sqlPart1 + ") values (" + sqlPart2 + ");";

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
			context.getLogger().info("Project inserted successfully."); 

			// Return the id in the response
			sql = "select id from project where " + 
				"subaccount_id = '" + jobj.getString("subaccountId") + "' and " +
				"name = '" + jobj.getString("name") + "' and " +
				"number = '" + jobj.getString("number") + "' and " +
				"status = '" + jobj.getString("status") + "' and " +
				"open_date = '" + jobj.getString("openDate") + "';";
			context.getLogger().info("Execute SQL statement: " + sql);
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
