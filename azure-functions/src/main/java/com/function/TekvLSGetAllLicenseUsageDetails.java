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
		String startDate = request.getQueryParameters().getOrDefault("startDate", "");
		String endDate = request.getQueryParameters().getOrDefault("endDate", "");
		Calendar cal = Calendar.getInstance();
		String year = request.getQueryParameters().getOrDefault("year", Integer.toString(cal.get(Calendar.YEAR)));
		String month = request.getQueryParameters().getOrDefault("month", Integer.toString(cal.get(Calendar.MONTH) + 1));
		String usageDateField = view.equalsIgnoreCase("weekly")? "usage_date" : "l.usage_date";
		String sqlPart1 = "subaccount_id = '" + subaccountId + "' and EXTRACT(MONTH FROM " + usageDateField + ") = " + month + 
				" and EXTRACT(YEAR FROM " + usageDateField + ") = " + year;
		if (!startDate.isEmpty() && !endDate.isEmpty())
			sqlPart1 += " and " + usageDateField + ">='" + startDate + "' and "  + usageDateField + "<='" + endDate + "'";

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
					String sqlWeeklyConfigurationTokensConsumed = "select CONCAT('Week ',DATE_PART('week',usage_date)), DATE_PART('month',usage_date), sum(tokens_consumed) from license_usage where " + 
						sqlPart1 + " and usage_type='Configuration' group by DATE_PART('week',usage_date);";
					context.getLogger().info("Execute SQL statement: " + sqlWeeklyConfigurationTokensConsumed);
					rs = statement.executeQuery(sqlWeeklyConfigurationTokensConsumed);
					while (rs.next()) {
						JSONObject item = new JSONObject();
						item.put("weekId", rs.getString(1));
						item.put("monthId", rs.getString(2));
						item.put("tokensConsumed", rs.getInt(3));
						array.put(item);
					}
					json.put("configurationTokens", array);
				} break;
				case "equipmentsummary": {
					String sqlEquipmentSummary = 
						"select d.id, d.vendor,d.product,d.version,l.mac_address,l.serial_number, sum(l.tokens_consumed) from device d inner join license_usage l on d.id=l.device_id and l." + 
						sqlPart1 + " group by d.id,l.mac_address,l.serial_number;";
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
						"select l.usage_date,d.vendor,d.product,d.version,l.mac_address,l.serial_number,l.usage_type,l.tokens_consumed,l.id,l.device_id,CONCAT('Week ',DATE_PART('week',usage_date)) as consumption " + 
						"from device d inner join license_usage l on d.id=l.device_id and l." + sqlPart1 + " order by start_date desc;";
					context.getLogger().info("Execute SQL statement: " + sqlAll);
					rs = statement.executeQuery(sqlAll);
					while (rs.next()) {
						JSONObject item = new JSONObject();
						item.put("id", rs.getString("id"));
						item.put("deviceId", rs.getString("device_id"));
						item.put("usageDate", rs.getString("usage_date"));
						item.put("vendor", rs.getString("vendor"));
						item.put("product", rs.getString("product"));
						item.put("version", rs.getString("version"));
						item.put("macAddress", rs.getString("mac_address"));
						item.put("serialNumber", rs.getString("serial_number"));
						item.put("usageType", rs.getString("usage_type"));
						item.put("tokensConsumed", rs.getString("tokens_consumed"));
						item.put("consumption", rs.getString("consumption"));
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
