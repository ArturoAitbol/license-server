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
public class TekvLSGetAllLicenses 
{
	/**
	* This function listens at endpoint "/api/licenses?subaccountId={subaccountId}". Two ways to invoke it using "curl" command in bash:
	* 1. curl -d "HTTP Body" {your host}/api/licenses?subaccountId={subaccountId}
	* 2. curl "{your host}/api/subaccounts"
	*/
	@FunctionName("TekvLSGetAllLicenses")
		public HttpResponseMessage run(
		@HttpTrigger(
		name = "req",
		methods = {HttpMethod.GET},
		authLevel = AuthorizationLevel.ANONYMOUS,
		route = "licenses/{id=EMPTY}")
		HttpRequestMessage<Optional<String>> request,
		@BindingName("id") String id,
		final ExecutionContext context) 
	{

		context.getLogger().info("Entering TekvLSGetAllLicenses Azure function");
		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());
		String subaccountId = request.getQueryParameters().getOrDefault("subaccount-id", "");
  
		// Build SQL statement
		String sql = "";
		if (id.equals("EMPTY")) {
			if (!subaccountId.isEmpty()) {
				sql = "select * from license where subaccount_id = '" + subaccountId + "'";
			} else {
				sql = "select * from license";
			}
		} else {
			sql = "select * from license where id='" + id +"'";
		}
		sql += " order by start_date desc;";
		
		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses?ssl=true&sslmode=require"
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			Statement statement = connection.createStatement();) {
			
			context.getLogger().info("Successfully connected to: " + dbConnectionUrl);
			
			// Retrive licenses. TODO: pagination
			context.getLogger().info("Execute SQL statement: " + sql);
			ResultSet rs = statement.executeQuery(sql);
			// Return a JSON array of licenses
			JSONObject json = new JSONObject();
			JSONArray array = new JSONArray();
			while (rs.next()) {
				JSONObject item = new JSONObject();
				item.put("id", rs.getString("id"));
				item.put("subaccountId", rs.getString("subaccount_id"));
				item.put("startDate", rs.getString("start_date").split(" ")[0]);
				item.put("packageType", rs.getString("package_type"));
				item.put("renewalDate", rs.getString("renewal_date").split(" ")[0]);
				item.put("tokensPurchased", rs.getString("tokens"));
				item.put("deviceLimit", rs.getString("device_access_limit"));
				item.put("status", rs.getString("status"));
				array.put(item);
			}
			json.put("licenses", array);
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
