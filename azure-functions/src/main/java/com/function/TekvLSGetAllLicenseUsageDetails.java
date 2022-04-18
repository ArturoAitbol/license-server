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
		String year = request.getQueryParameters().getOrDefault("year", "");
		String month = request.getQueryParameters().getOrDefault("month", "");
		String sqlCommonConditions = "l.subaccount_id = '" + subaccountId + "'";
		if (!startDate.isEmpty() && !endDate.isEmpty())
			sqlCommonConditions += " and l.usage_date>='" + startDate + "' and l.usage_date<='" + endDate + "'";
		if (view.isEmpty() && !year.isEmpty() && !month.isEmpty())
			sqlCommonConditions += " and EXTRACT(MONTH FROM l.usage_date) = " + month + " and EXTRACT(YEAR FROM l.usage_date) = " + year;

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses?ssl=true&sslmode=require"
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			Statement statement = connection.createStatement();) {
			context.getLogger().info("Successfully connected to: " + dbConnectionUrl);
			JSONObject json = new JSONObject();
			ResultSet rs;
			switch (view.toLowerCase()) {
				case "summary": {
					// First get the devices connected
					// Get number of connected devices
					String sqlDevicesConnected = "select count(distinct device_id) from license_usage l where " + sqlCommonConditions + ";";
					context.getLogger().info("Execute SQL statement: " + sqlDevicesConnected);
					rs = statement.executeQuery(sqlDevicesConnected);
					rs.next();
					json.put("devicesConnected", rs.getInt(1));

					// Get tokens consumed
					String sqlTokensConsumed = "select usage_type, sum(tokens_consumed) from license_usage l where " + sqlCommonConditions + 
						" group by l.usage_type;";
					context.getLogger().info("Execute SQL statement: " + sqlTokensConsumed);
					rs = statement.executeQuery(sqlTokensConsumed);
					while (rs.next()) {
						json.put(rs.getString(1) + "TokensConsumed", rs.getInt(2));
					}
				} break;
				case "equipment": {
					JSONArray array = new JSONArray();
					String sqlEquipmentSummary = 
						"select d.id, d.vendor,d.product,d.version,l.mac_address,l.serial_number, sum(l.tokens_consumed) as tokens_consumed from device d, license_usage l where d.id=l.device_id and " + 
						sqlCommonConditions + " and l.usage_type='AutomationPlatform' group by d.id,l.mac_address,l.serial_number;";
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
						item.put("tokensConsumed", rs.getString("tokens_consumed"));
						array.put(item);
					}
					json.put("equipmentSummary", array);
				} break;
				default: {
					// This is the default case (aggregated data)
					JSONArray array = new JSONArray();
					String sqlAll = 
						"select l.usage_date,d.vendor,d.product,d.version,l.mac_address,l.serial_number,l.usage_type,l.tokens_consumed,l.id,l.device_id,CONCAT('Week ',DATE_PART('week',usage_date)) as consumption " + 
						"from device d, license_usage l where d.id=l.device_id and " + sqlCommonConditions + " order by usage_date desc;";
					context.getLogger().info("Execute SQL statement: " + sqlAll);
					rs = statement.executeQuery(sqlAll);
					while (rs.next()) {
						JSONObject item = new JSONObject();
						item.put("id", rs.getString("id"));
						item.put("deviceId", rs.getString("device_id"));
						item.put("usageDate", rs.getString("usage_date").split(" ")[0]);
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

					// Get aggregated consumption for configuration
					JSONArray array2 = new JSONArray();
					String sqlWeeklyConfigurationTokensConsumed = "select CONCAT('Week ',DATE_PART('week',usage_date)) as weekId, DATE_PART('month',usage_date) as monthId, sum(tokens_consumed) from license_usage l where " + 
						sqlCommonConditions + " and usage_type='Configuration' group by DATE_PART('week',usage_date), DATE_PART('month',usage_date) order by monthId, weekId;";
					context.getLogger().info("Execute SQL statement: " + sqlWeeklyConfigurationTokensConsumed);
					rs = statement.executeQuery(sqlWeeklyConfigurationTokensConsumed);
					while (rs.next()) {
						JSONObject item = new JSONObject();
						item.put("weekId", rs.getString(1));
						item.put("monthId", rs.getString(2));
						item.put("tokensConsumed", rs.getInt(3));
						array2.put(item);
					}
					json.put("configurationTokens", array2);
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
