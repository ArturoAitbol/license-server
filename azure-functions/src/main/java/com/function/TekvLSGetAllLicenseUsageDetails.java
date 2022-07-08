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

import java.sql.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalField;
import java.time.temporal.WeekFields;
import java.util.Locale;
import java.util.Optional;

import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetAllLicenseUsageDetails {
	/* default values for pagination */
	String LIMIT = "100";
	String OFFSET = "0";
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

		JSONObject tokenClaims = getTokenClaimsFromHeader(request,context);
		String currentRole = getRoleFromToken(tokenClaims,context);
		if(currentRole.isEmpty()){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
			json.put("error", MESSAGE_FOR_UNAUTHORIZED);
			return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
		if(!hasPermission(currentRole, Permission.GET_ALL_LICENSE_USAGE_DETAILS)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + currentRole);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		context.getLogger().info("Entering TekvLSGetAllLicenseUsageDetails Azure function");

		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());
		String subaccountId = request.getQueryParameters().getOrDefault("subaccount-id", "");
		String view = request.getQueryParameters().getOrDefault("view", "");
		String startDate = request.getQueryParameters().getOrDefault("startDate", "");
		String endDate = request.getQueryParameters().getOrDefault("endDate", "");
		String sqlCommonConditions = "l.subaccount_id = '" + subaccountId + "'";

		String subQuery;
		String email = getEmailFromToken(tokenClaims,context);
		String sqlRoleCondition="";
		// adding conditions according to the role
		switch (currentRole){
			case DISTRIBUTOR_FULL_ADMIN:
				String distributorId = "select distributor_id from customer c,customer_admin ca " +
						"where c.id = ca.customer_id and admin_email='"+email+"'";
				subQuery = "select s.id from subaccount s, customer c " +
						"where s.customer_id = c.id and distributor_id =("+ distributorId +")";
				sqlRoleCondition = "l.subaccount_id IN (" + subQuery + ")";
				break;
			case CUSTOMER_FULL_ADMIN:
				subQuery = "select s.id from subaccount s, customer_admin ca where s.customer_id = ca.customer_id " +
						"and admin_email = '"+email+"'";
				sqlRoleCondition = "l.subaccount_id IN (" + subQuery + ")";
				break;
			case SUBACCOUNT_ADMIN:
				subQuery = "select subaccount_id from subaccount_admin where subaccount_admin_email ='"+email+"'";
				sqlRoleCondition = "l.subaccount_id=(" + subQuery + ")";
				break;
		}

		if(!sqlRoleCondition.isEmpty())
			sqlCommonConditions += " and "+ sqlRoleCondition;

		if (!startDate.isEmpty() && !endDate.isEmpty())
			sqlCommonConditions += " and l.consumption_date>='" + startDate + "' and l.consumption_date<='" + endDate + "'";
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
					String sqlDevicesConnected = "select count(distinct device_id) from license_consumption l where " + sqlCommonConditions + " AND l.usage_type ='"
							+ USAGE_TYPE_ENUM.AUTOMATION_PLATFORM.getValue() + "';";
					context.getLogger().info("Execute SQL devices statement: " + sqlDevicesConnected);
					rs = statement.executeQuery(sqlDevicesConnected);
					rs.next();
					json.put("devicesConnected", rs.getInt(1));

					// Get tokens consumed
					String sqlTokensConsumed = "select sum(tokens_consumed) from license_consumption l where " + sqlCommonConditions + ";";
					context.getLogger().info("Execute SQL tokens statement: " + sqlTokensConsumed);
					rs = statement.executeQuery(sqlTokensConsumed);
					rs.next();
					json.put("tokensConsumed", rs.getInt(1));
				} break;
				case "equipment": {
					JSONArray array = new JSONArray();
					String sqlEquipmentSummary = 
						"select d.id,d.vendor,d.product,d.version from device d, license_consumption l where d.id=l.device_id and " + 
						sqlCommonConditions + " group by d.id;";
					context.getLogger().info("Execute SQL equipment statement: " + sqlEquipmentSummary);
					rs = statement.executeQuery(sqlEquipmentSummary);
					while (rs.next()) {
						JSONObject item = new JSONObject();
						item.put("id", rs.getString("id"));
						item.put("vendor", rs.getString("vendor"));
						item.put("product", rs.getString("product"));
						item.put("version", rs.getString("version"));
						array.put(item);
					}
					json.put("equipmentSummary", array);
				} break;
				default: {
					// add special filters
					String year = request.getQueryParameters().getOrDefault("year", "");
					String month = request.getQueryParameters().getOrDefault("month", "");
					String project = request.getQueryParameters().getOrDefault("project", "");
					String type = request.getQueryParameters().getOrDefault("type", "");
					String limit = request.getQueryParameters().getOrDefault("limit", LIMIT);
					String offset = request.getQueryParameters().getOrDefault("offset", OFFSET);
					if (view.isEmpty() && !year.isEmpty() && !month.isEmpty())
						sqlCommonConditions += " and EXTRACT(MONTH FROM l.consumption_date) = " + month + " and EXTRACT(YEAR FROM l.consumption_date) = " + year;
					if (!project.isEmpty())
						sqlCommonConditions += " and l.project_id='" + project + "'";
					if (!type.isEmpty())
						sqlCommonConditions += " and l.usage_type='" + type + "'";
					// This is the default case (aggregated data)
					JSONArray array = new JSONArray();
					JSONObject tokenConsumption = new JSONObject();
					String usageType;
					int tokensConsumed;
					String sqlAll = "select l.id, l.consumption_date, l.usage_type, l.tokens_consumed, l.device_id, CONCAT('Week ',DATE_PART('week',consumption_date+'1 day'::interval)) as consumption, " +
							"l.project_id, d.vendor, d.product, d.version" + ", json_agg(DISTINCT day_of_week) AS usage_days" +
							" from device d, license_consumption l, usage_detail u " +
							" where d.id=l.device_id and u.consumption_id = l.id and " + sqlCommonConditions +
							" group by l.id, l.consumption_date, l.usage_type, l.tokens_consumed, l.device_id,consumption,l.project_id,d.vendor, d.product, d.version" +
							" order by consumption_date desc limit " + limit + " offset " + offset + ";";
					context.getLogger().info("Execute SQL all statement: " + sqlAll);
					rs = statement.executeQuery(sqlAll);
					while (rs.next()) {
						JSONObject item = new JSONObject();
						item.put("id", rs.getString("id"));
						item.put("deviceId", rs.getString("device_id"));
						item.put("projectId", rs.getString("project_id"));
						item.put("consumptionDate", rs.getString("consumption_date").split(" ")[0]);
						item.put("vendor", rs.getString("vendor"));
						item.put("product", rs.getString("product"));
						item.put("version", rs.getString("version"));
						usageType =  rs.getString("usage_type");
						tokensConsumed = rs.getInt("tokens_consumed");
						item.put("usageType",usageType);
						item.put("tokensConsumed", tokensConsumed);
						item.put("consumption", item.getString("consumptionDate") + " - " + rs.getString("consumption"));
						item.put("usageDays",new JSONArray(rs.getString("usage_days")));
						array.put(item);

						tokenConsumption.put(usageType,tokenConsumption.optInt(usageType,0) + tokensConsumed);

					}
					json.put("usage", array);
					json.put("tokenConsumption",tokenConsumption);

					// Get aggregated consumption for configuration
					JSONArray array2 = new JSONArray();
					String sqlWeeklyConfigurationTokensConsumed = "select consumption_date, CONCAT('Week ',DATE_PART('week',consumption_date+'1 day'::interval)) as consumption_week, sum(tokens_consumed) from license_consumption l where " +
						sqlCommonConditions + " group by consumption_date, consumption_week order by consumption_date desc;";
					context.getLogger().info("Execute SQL weekly statement: " + sqlWeeklyConfigurationTokensConsumed);
					rs = statement.executeQuery(sqlWeeklyConfigurationTokensConsumed);
					LocalDate dt, startWeek, endWeek;
					while (rs.next()) {
						dt = LocalDateTime.parse(rs.getString(1), DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")).toLocalDate();
						TemporalField DAY_OF_WEEK  = WeekFields.of(Locale.US).dayOfWeek();
						startWeek = dt.with(DAY_OF_WEEK, 1);
						endWeek = dt.with(DAY_OF_WEEK, 7);
						JSONObject item = new JSONObject();
						item.put("weekId", rs.getString(2) + " (" + startWeek.toString() + " - " + endWeek.toString() + ")");
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
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
		catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}
	}

	enum USAGE_TYPE_ENUM {
		CONFIGURATION("Configuration"),
		AUTOMATION_PLATFORM("AutomationPlatform");

		private final String value;
		USAGE_TYPE_ENUM(String value) {
			this.value = value;
		}
		public String getValue() {
			return value;
		}
	}
}
