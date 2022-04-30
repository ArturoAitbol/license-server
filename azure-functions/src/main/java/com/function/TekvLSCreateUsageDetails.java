package com.function;

import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpMethod;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.BindingName;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import java.sql.*;
import java.time.LocalDate;
import java.util.Iterator;
import java.util.Optional;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSCreateUsageDetails
{
	/**
	 * This function listens at endpoint "/api/usageDetails". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/api/usageDetails
	 */
	@FunctionName("TekvLSCreateUsageDetails")
	public HttpResponseMessage run(
			@HttpTrigger(
				name = "req",
				methods = {HttpMethod.POST},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "usageDetails/{id}")
				HttpRequestMessage<Optional<String>> request,
				@BindingName("id") String id,
				final ExecutionContext context) {
		context.getLogger().info("Entering TekvLSCreateUsageDetails Azure function");
		JSONObject json = new JSONObject();
		// Parse request body and extract parameters needed
		String requestBody = request.getBody().orElse("");
		context.getLogger().info("Request body: " + requestBody);
		if (requestBody.isEmpty()) {
			context.getLogger().info("error: request body is empty.");
			json.put("error", "error: request body is empty.");
			return request.createResponseBuilder(HttpStatus.OK).body(json.toString()).build();
		}
		JSONObject jobj;
		try {
			jobj = new JSONObject(requestBody);
		} catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			json.put("error", e.getMessage());
			return request.createResponseBuilder(HttpStatus.OK).body(json.toString()).build();
		}
		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses?ssl=true&sslmode=require"
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		// Build the sql insertion query
		String sqlPart2 = "";
		final JSONArray usageDays = jobj.getJSONArray("usageDays");
		if (usageDays != null && usageDays.length() > 0) {
			//Iterating the contents of the array
			Iterator<Object> iterator = usageDays.iterator();
			Integer usage;
			LocalDate consumptionDate = LocalDate.parse(jobj.getString("consumptionDate"));
			while(iterator.hasNext()) {
				usage = Integer.parseInt(iterator.next().toString());
				sqlPart2 += "\n('" + id + "','" + consumptionDate.plusDays(usage).toString() + "'," + usage + ",'',''),";
			}
			sqlPart2 = sqlPart2.substring(0, sqlPart2.length() - 1);
		} else {
			json.put("error", "Missing mandatory parameter: usageDays");
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}
		// modifed_date is always consumption_date when creating the record
		sqlPart2 += "'" + jobj.getString("usageDate") + "'";
		String sql = "insert into usage_detail (consumption_id,usage_date,day_of_week,mac_address,serial_number) values " + sqlPart2 + ";";	

		try (Connection connection = DriverManager.getConnection(dbConnectionUrl); Statement statement = connection.createStatement();) {
			context.getLogger().info("Successfully connected to:" + dbConnectionUrl);
			// get tokens to consume
			context.getLogger().info("Execute SQL statement: " + sql);
			statement.executeUpdate(sql);
			context.getLogger().info("License consumption inserted successfully.");
			return request.createResponseBuilder(HttpStatus.OK).body(jobj.toString()).build();
		}
		catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			json.put("error", e.getMessage());
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}
		catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			json.put("error", e.getMessage());
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}
	}
}
