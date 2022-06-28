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
public class TekvLSGetAllDevices {
	/**
	 * This function listens at endpoint "/api/devices/{vendor}/{product}/{version}". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/api/devices/{vendor}/{product}/{version}
	 * 2. curl "{your host}/api/devices"
	 */
	@FunctionName("TekvLSGetAllDevices")
	public HttpResponseMessage run(
		@HttpTrigger(
			name = "req",
			methods = {HttpMethod.GET},
			authLevel = AuthorizationLevel.ANONYMOUS,
			route = "devices/{id=EMPTY}")
		HttpRequestMessage<Optional<String>> request,
	  @BindingName("id") String id,
		final ExecutionContext context) {

		context.getLogger().info("Entering TekvLSGetAllDevices Azure function");

		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());
		String vendor = request.getQueryParameters().getOrDefault("vendor", "");
		String product = request.getQueryParameters().getOrDefault("product", "");
		String version = request.getQueryParameters().getOrDefault("version", "");
		String subaccountId = request.getQueryParameters().getOrDefault("subaccountId", "");
		String licenseStartDate = request.getQueryParameters().getOrDefault("date", "");
  
		// Build SQL statement
		String sql = "";
		if (id.equals("EMPTY")) {
			if (!vendor.isEmpty() || !subaccountId.isEmpty() || !product.isEmpty() || !version.isEmpty() || !licenseStartDate.isEmpty()) {
				sql = "select * from device where ";
			   if (!subaccountId.isEmpty()) {
				  sql += "subaccount_id is NULL or subaccount_id = '" + subaccountId + "' and ";
			   }
			   if (!vendor.isEmpty()) {
				  sql += "vendor = '" + vendor + "' and ";
			   }
			   if (!product.isEmpty()) {
				  sql += "product = '" + product + "' and ";
			   }
			   if (!version.isEmpty()) {
				  sql += "version = '" + version + "' and ";
			   }
			   if (!licenseStartDate.isEmpty()) {
				  sql += "'" + licenseStartDate + "' >= start_date and '" + licenseStartDate + "' < deprecated_date and ";
			   }
			   // Remove the last " and " from the string
			   sql = sql.substring(0, sql.length() - 5) + ";";
			} else {
				sql = "select * from device where subaccount_id is NULL;";
			}
		} else {
			sql = "select * from device where id='" + id +"';";
		}
		
		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses?ssl=true&sslmode=require"
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			Statement statement = connection.createStatement();) {
			
			context.getLogger().info("Successfully connected to: " + dbConnectionUrl);
			
			// Execute sql query. TODO: pagination
			context.getLogger().info("Execute SQL statement: " + sql);
			ResultSet rs = statement.executeQuery(sql);
			// Return a JSON array
			JSONObject json = new JSONObject();
			JSONArray array = new JSONArray();
			while (rs.next()) {
				JSONObject item = new JSONObject();
				item.put("id", rs.getString("id"));

				subaccountId = rs.getString("subaccount_id");
				if (rs.wasNull()) {
					subaccountId = "";
				}
				item.put("subaccountId", subaccountId);
				item.put("vendor", rs.getString("vendor"));
				item.put("product", rs.getString("product"));
				item.put("version", rs.getString("version"));
				item.put("supportType", rs.getBoolean("support_type"));
				array.put(item);
			}
			json.put("devices", array);
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
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}
}
