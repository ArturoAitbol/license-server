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
import java.util.Optional;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetAllProjects {
	/**
	 * This function listens at endpoint "/api/projects". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/api/projects
	 * 2. curl "{your host}/api/projects"
	 */
	@FunctionName("TekvLSGetAllProjects")
	public HttpResponseMessage run(
		@HttpTrigger(
			name = "req",
			methods = {HttpMethod.GET},
			authLevel = AuthorizationLevel.ANONYMOUS,
			route = "projects/{id=EMPTY}")
		HttpRequestMessage<Optional<String>> request,
		@BindingName("id") String id,
		final ExecutionContext context) 
   {
		context.getLogger().info("Entering TekvLSGetAllProjects Azure function");

		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());
		String subaccountId = request.getQueryParameters().getOrDefault("subaccountId", "");
		String status = request.getQueryParameters().getOrDefault("status", "");
		
		// Build SQL statement
		String sql = "select * from project";
		if (id.equals("EMPTY")) {
			if (!subaccountId.isEmpty()) {
				sql += " where subaccount_id='" + subaccountId + "'";
				if (!status.isEmpty())
					sql += " and status='" + status + "'";
			}
		} else {
			sql += " where id='" + id +"'";
		}
		sql += ";";
		
		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses?ssl=true&sslmode=require"
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			Statement statement = connection.createStatement();) {
			
			context.getLogger().info("Successfully connected to: " + dbConnectionUrl);
			
			// Retrive all projects. TODO: pagination
			// sql = "select * from project;";
			context.getLogger().info("Execute SQL statement: " + sql);
			ResultSet rs = statement.executeQuery(sql);
			// Return a JSON array of projects
			JSONObject json = new JSONObject();
			JSONArray array = new JSONArray();
			String closeDate;
			while (rs.next()) {
				JSONObject item = new JSONObject();
				item.put("id", rs.getString("id"));
				item.put("subaccountId", rs.getString("subaccount_id"));
				item.put("name", rs.getString("name"));
				item.put("number", rs.getString("number"));
				item.put("status", rs.getString("status"));
				item.put("openDate", rs.getString("open_date").split(" ")[0]);
				closeDate = rs.getString("close_date");
				item.put("closeDate", closeDate != null ? closeDate.split(" ")[0] : JSONObject.NULL);
				array.put(item);
			}
			json.put("projects", array);
			return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();
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
