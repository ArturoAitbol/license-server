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
import com.microsoft.azure.functions.annotation.BindingName;

import java.sql.*;
import java.util.Optional;

import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

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

	   String currentRole = getRoleFromToken(request,context);
	   if(currentRole.isEmpty()){
		   JSONObject json = new JSONObject();
		   context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
		   json.put("error", MESSAGE_FOR_UNAUTHORIZED);
		   return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
	   }
	   if(!hasPermission(currentRole, Permission.GET_ALL_BUNDLES)){
		   JSONObject json = new JSONObject();
		   context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + currentRole);
		   json.put("error", MESSAGE_FOR_FORBIDDEN);
		   return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
	   }

	   context.getLogger().info("Entering TekvLSGetAllBundles Azure function");
	   String name = request.getQueryParameters().getOrDefault("name", "");

	   // Build SQL statement
		String sql = "select * from bundle ";
		if (!id.equals("EMPTY"))
			sql += "where id='" + id +"'";
		else if(!name.isEmpty()){
			sql += "where name='" + name + "'";
		}
		sql += ";";
		
		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			Statement statement = connection.createStatement();) {
			
			context.getLogger().info("Successfully connected to: " + dbConnectionUrl);
			
			// Retrive all bundles.
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
