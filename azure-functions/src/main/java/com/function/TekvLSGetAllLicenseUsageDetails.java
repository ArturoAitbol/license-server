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
import java.util.Calendar;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetAllLicenseUsageDetails {
	/**
	 * This function listens at endpoint "/api/devices/{vendor}/{product}/{version}". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/api/devices/{vendor}/{product}/{version}
	 * 2. curl "{your host}/api/devices"
	 */
	@FunctionName("TekvLSGetAllLicenseUsageDetails")
	public HttpResponseMessage run(
		@HttpTrigger(
			name = "req",
			methods = {HttpMethod.GET},
			authLevel = AuthorizationLevel.ANONYMOUS,
			route = "licenseUsageDetails")
		HttpRequestMessage<Optional<String>> request,
		final ExecutionContext context) {

		context.getLogger().info("Entering TekvLSGetAllLicenseUsageDetails Azure function");

		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());
		String subaccountId = request.getQueryParameters().getOrDefault("subaccount-id", "");
		String view = request.getQueryParameters().getOrDefault("view", "");
		String year = request.getQueryParameters().getOrDefault("year", "");
		String month = request.getQueryParameters().getOrDefault("month", "");
		String sqlPart1 = "";
      	if (year.isEmpty()) {
			Calendar cal = Calendar.getInstance();
			sqlPart1 = "subaccount_id = '" + subaccountId + "' and EXTRACT(MONTH FROM %s) = " + cal.get(Calendar.MONTH) + " and " + 
				"EXTRACT (YEAR FROM %s) = " + cal.get(Calendar.YEAR);
		} else {
			if (month.isEmpty())
			sqlPart1 = "subaccount_id = '" + subaccountId + "' and EXTRACT(YEAR FROM %s) = " + year;
			else
			sqlPart1 = "subaccount_id = '" + subaccountId + "' and EXTRACT(MONTH FROM %s) = " + month + " and " + "EXTRACT (YEAR FROM %s) = " + year;
		}
		if (!view.equalsIgnoreCase("weekly"))
			sqlPart1 = String.format(sqlPart1, "l.usage_date", "l.usage_date");

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses?ssl=true&sslmode=require"
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			Statement statement = connection.createStatement();) {
			context.getLogger().info("Successfully connected to: " + dbConnectionUrl);
			JSONObject json = new JSONObject();
			JSONArray array = new JSONArray();
			ResultSet rs;
			switch (view.toLowerCase()) {
				case "weekly": {
					sqlPart1 = String.format(sqlPart1, "usage_date", "usage_date");
					// First get the devices connected
					// Get number of connected devices
					String sqlDevicesConnected = "select count(distinct device_id) from license_usage where " + sqlPart1 + ";";
					context.getLogger().info("Execute SQL statement: " + sqlDevicesConnected);
					rs = statement.executeQuery(sqlDevicesConnected);
					rs.next();
					json.put("devicesConnected", rs.getInt(1));

					// Get tokens consumed
					String sqlTokensConsumed = "select usage_type, sum(tokens_consumed) from license_usage where " + sqlPart1 + 
						" group by usage_type;";
					context.getLogger().info("Execute SQL statement: " + sqlTokensConsumed);
					rs = statement.executeQuery(sqlTokensConsumed);
					while (rs.next()) {
						json.put(rs.getString(1) + "TokensConsumed", rs.getInt(2));
					}

					// Get weekly consumption for configuration
					String sqlWeeklyConfigurationTokensConsumed = "select DATE_PART('week',usage_date), sum(tokens_consumed) from license_usage where " + 
						sqlPart1 + " and usage_type='Configuration' group by DATE_PART('week',usage_date);";
					context.getLogger().info("Execute SQL statement: " + sqlWeeklyConfigurationTokensConsumed);
					rs = statement.executeQuery(sqlWeeklyConfigurationTokensConsumed);
					while (rs.next()) {
						JSONObject item = new JSONObject();
						item.put("weekId", rs.getInt(1));
						item.put("tokensConsumed", rs.getInt(2));
						array.put(item);
					}
					json.put("configurationTokens", array);
				} break;
				case "equipmentsummary": {
					String sqlEquipmentSummary = 
						"select d.id, d.vendor,d.product,d.version,l.mac_address,l.serial_number, sum(l.tokens_consumed) from device d inner join license_usage l on d.id=l.device_id and l." + 
						sqlPart1 + " group by d.id;";
					context.getLogger().info("Execute SQL statement: " + sqlEquipmentSummary);
					rs = statement.executeQuery(sqlEquipmentSummary);
					while (rs.next()) {
						JSONObject item = new JSONObject();
						item.put("id", rs.getString("id"));
						item.put("vendor", rs.getString("vendor"));
						item.put("product", rs.getString("product"));
						item.put("version", rs.getString("version"));
						item.put("macAddress", rs.getString("mac_address"));
						item.put("serialNumber", rs.getString("serial_number"));
						array.put(item);
					}
					json.put("equipmentSummary", array);
				} break;
				default: {
					// This is the default case (all)
					String sqlAll = 
						"select l.usage_date,d.vendor,d.product,d.version,l.mac_address,l.serial_number,l.usage_type,d.l.tokens_consumed,l.id,l.device_id " + 
						"from device d inner join license_usage l on d.id=l.device_id and l." + sqlPart1 + ";";
					context.getLogger().info("Execute SQL statement: " + sqlAll);
					rs = statement.executeQuery(sqlAll);
					while (rs.next()) {
						JSONObject item = new JSONObject();
						item.put("usageDate", rs.getString("usage_date"));
						item.put("vendor", rs.getString("vendor"));
						item.put("product", rs.getString("product"));
						item.put("version", rs.getString("version"));
						item.put("macAddress", rs.getString("mac_address"));
						item.put("serialNumber", rs.getString("serial_number"));
						item.put("usageType", rs.getString("usage_type"));
						item.put("tokensConsumed", rs.getString("l.tokens_consumed"));
						item.put("id", rs.getString("id"));
						item.put("deviceId", rs.getString("device_id"));
						array.put(item);
					}
					json.put("usage", array);
				} break;
			}

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
