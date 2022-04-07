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
public class TekvLSGetAllBundles {
	/**
	 * This function listens at endpoint "/api/bundles". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/api/bundles
	 * 2. curl "{your host}/api/bundles"
	 */
	@FunctionName("TekvLSGetAllBundles")
	public HttpResponseMessage run(
		@HttpTrigger(
			name = "req",
			methods = {HttpMethod.GET},
			authLevel = AuthorizationLevel.ANONYMOUS,
			route = "bundles/{id=EMPTY}")
		HttpRequestMessage<Optional<String>> request,
		@BindingName("id") String id,
		final ExecutionContext context) 
   {
		context.getLogger().info("Entering TekvLSGetAllBundles Azure function");
		
		// Build SQL statement
		String sql = "select * from bundle";
		if (!id.equals("EMPTY"))
			sql += "where id='" + id +"'";
		sql += ";";
		
		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses?ssl=true&sslmode=require"
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			Statement statement = connection.createStatement();) {
			
			context.getLogger().info("Successfully connected to: " + dbConnectionUrl);
			
			// Retrive all bundles. TODO: pagination
			context.getLogger().info("Execute SQL statement: " + sql);
			ResultSet rs = statement.executeQuery(sql);
			// Return a JSON array of bundles
			JSONObject json = new JSONObject();
			JSONArray array = new JSONArray();
			while (rs.next()) {
				JSONObject item = new JSONObject();
				item.put("id", rs.getString("id"));
				item.put("name", rs.getString("name"));
				item.put("deviceAccessTokens", rs.getString("device_access_tokens"));
				item.put("tokens", rs.getString("tokens"));
				array.put(item);
			}
			json.put("bundles", array);
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
