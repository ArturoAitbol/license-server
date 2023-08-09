package com.function;

import com.function.auth.Resource;
import com.function.db.QueryBuilder;
import com.function.db.SelectQueryBuilder;
import com.function.db.QueryBuilder.DATA_TYPE;
import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import java.sql.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalField;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.Locale;
import java.util.Optional;

import static com.function.auth.RoleAuthHandler.*;
import static com.function.auth.Roles.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetAllLicenseUsageDetails {
	/* default values for pagination */
	String LIMIT = "100";
	String OFFSET = "0";

	/**
	 * This function listens at endpoint
	 * "/v1.0/devices/{vendor}/{product}/{version}". Two ways to invoke it using
	 * "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/devices/{vendor}/{product}/{version}
	 * 2. curl "{your host}/v1.0/devices"
	 */
	@FunctionName("TekvLSGetAllLicenseUsageDetails")
	public HttpResponseMessage run(
			@HttpTrigger(name = "req", methods = {
					HttpMethod.GET }, authLevel = AuthorizationLevel.ANONYMOUS, route = "licenseUsageDetails") HttpRequestMessage<Optional<String>> request,
			final ExecutionContext context) {

		Claims tokenClaims = getTokenClaimsFromHeader(request, context);
		JSONArray roles = getRolesFromToken(tokenClaims, context);
		if (roles.isEmpty()) {
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
			json.put("error", MESSAGE_FOR_UNAUTHORIZED);
			return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
		if (!hasPermission(roles, Resource.GET_ALL_LICENSE_USAGE_DETAILS)) {
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		String userId = getUserIdFromToken(tokenClaims, context);
        context.getLogger().info("User " + userId + " is Entering TekvLSGetAllLicenseUsageDetails Azure function");

		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());
		String subaccountId = request.getQueryParameters().getOrDefault("subaccountId", "");
		String view = request.getQueryParameters().getOrDefault("view", "");
		String startDate = request.getQueryParameters().getOrDefault("startDate", "");
		String endDate = request.getQueryParameters().getOrDefault("endDate", "");
		String licenseId = request.getQueryParameters().getOrDefault("licenseId", "");

		if (subaccountId.isEmpty()) {
			JSONObject json = new JSONObject();
			json.put("error", "Missing mandatory parameter: subaccountId");
			context.getLogger().info("User " + userId + " is leaving TekvLSGetAllLicenseUsageDetails Azure function with error");
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}

		ArrayList<Condition<String, String>> commonConditions = new ArrayList<>();
		commonConditions.add(new Condition<>("lc.subaccount_id = ?::uuid", subaccountId));
		SelectQueryBuilder verificationQueryBuilder = null;

		String whereStatement = "";
		String email = getEmailFromToken(tokenClaims, context);
		// adding conditions according to the role
		String currentRole = evaluateRoles(roles);
		switch (currentRole) {
			case DISTRIBUTOR_FULL_ADMIN:
				whereStatement = "s.customer_id = c.id AND distributor_id = (SELECT distributor_id FROM customer c,customer_admin ca "
						+
						"WHERE c.id = ca.customer_id and admin_email = ?)";
				commonConditions.add(new Condition<>(
						"lc.subaccount_id IN (SELECT s.id from subaccount s, customer c WHERE " + whereStatement + ")",
						email));
				verificationQueryBuilder = new SelectQueryBuilder("SELECT s.id from subaccount s, customer c");
				verificationQueryBuilder.appendCustomCondition(whereStatement, email);
				break;
			case CUSTOMER_FULL_ADMIN:
				whereStatement = "s.customer_id = ca.customer_id AND admin_email = ?";
				commonConditions.add(
						new Condition<>("lc.subaccount_id IN (SELECT s.id FROM subaccount s, customer_admin ca WHERE "
								+ whereStatement + ")", email));
				verificationQueryBuilder = new SelectQueryBuilder("SELECT s.id FROM subaccount s, customer_admin ca");
				verificationQueryBuilder.appendCustomCondition(whereStatement, email);
				break;
			case SUBACCOUNT_ADMIN:
				commonConditions.add(new Condition<>(
						"lc.subaccount_id = (SELECT subaccount_id FROM subaccount_admin WHERE subaccount_admin_email = ?)",
						email));
				verificationQueryBuilder = new SelectQueryBuilder("SELECT subaccount_id FROM subaccount_admin");
				verificationQueryBuilder.appendEqualsCondition("subaccount_admin_email", email);
				break;
		}

		if (!licenseId.isEmpty()) {
			commonConditions
					.add(new Condition<>("project_id IN (SELECT lc.project_id FROM license_consumption lc, project p " +
							"WHERE lc.project_id = p.id and p.license_id = ?::uuid)", licenseId));
		}

		if (!startDate.isEmpty() && !endDate.isEmpty()) {
			commonConditions.add(new Condition<>("lc.consumption_date >= ?::timestamp", startDate));
			commonConditions.add(new Condition<>("lc.consumption_date <= ?::timestamp", endDate));
		}

		if (verificationQueryBuilder != null) {
			if (currentRole.equals(SUBACCOUNT_ADMIN))
				verificationQueryBuilder.appendEqualsCondition("subaccount_id", subaccountId,
						QueryBuilder.DATA_TYPE.UUID);
			else
				verificationQueryBuilder.appendEqualsCondition("s.id", subaccountId, QueryBuilder.DATA_TYPE.UUID);
		}
		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses"
				+ System.getenv("POSTGRESQL_SECURITY_MODE")
				+ "&user=" + System.getenv("POSTGRESQL_USER")
				+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (Connection connection = DriverManager.getConnection(dbConnectionUrl)) {
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
			JSONObject json = new JSONObject();

			if (verificationQueryBuilder != null) {
				ResultSet rs;
				try (PreparedStatement verificationStmt = verificationQueryBuilder.build(connection)) {
					context.getLogger().info("Execute SQL role verification statement: " + verificationStmt);
					rs = verificationStmt.executeQuery();
					if (!rs.next()) {
						context.getLogger().info(LOG_MESSAGE_FOR_INVALID_ID + email);
						json.put("error", MESSAGE_FOR_INVALID_ID);
						context.getLogger().info("User " + userId + " is leaving TekvLSGetAllLicenseUsageDetails Azure function with error");
						return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
					}
				}
			}

			switch (view.toLowerCase()) {
				case "summary": {
					// First get the devices connected
					// Get number of connected devices

					// Initialize query builders
					SelectQueryBuilder connectedDevicesQueryBuilder = new SelectQueryBuilder(
							"SELECT COUNT(distinct device_id) FROM license_consumption lc");
					SelectQueryBuilder tokensConsumedQueryBuilder = new SelectQueryBuilder(
							"SELECT SUM(tokens_consumed) FROM license_consumption lc");

					// Append common conditions to both builders
					for (Condition<String, String> commonCondition : commonConditions) {
						connectedDevicesQueryBuilder.appendCustomCondition(commonCondition.sql, commonCondition.value);
						tokensConsumedQueryBuilder.appendCustomCondition(commonCondition.sql, commonCondition.value);
					}

					connectedDevicesQueryBuilder.appendEqualsCondition("lc.usage_type",
							USAGE_TYPE_ENUM.AUTOMATION_PLATFORM.getValue(), "usage_type_enum");

					try (PreparedStatement stmt = connectedDevicesQueryBuilder.build(connection)) {
						ResultSet rs;
						context.getLogger().info("Execute SQL devices statement: " + stmt);
						rs = stmt.executeQuery();
						rs.next();
						json.put("devicesConnected", rs.getInt(1));
					}

					// Get tokens consumed
					try (PreparedStatement stmt = tokensConsumedQueryBuilder.build(connection)) {
						ResultSet rs;
						context.getLogger().info("Execute SQL tokens statement: " + stmt);
						rs = stmt.executeQuery();
						rs.next();
						json.put("tokensConsumed", rs.getInt(1));
					}
				}
					break;
				case "equipment": {
					JSONArray array = new JSONArray();

					// Initialize query builder
					SelectQueryBuilder queryBuilder = new SelectQueryBuilder(
							"select d.id,d.vendor,d.product,d.version from device d, license_consumption lc where (d.id=lc.device_id OR d.id=lc.calling_platform_id)",
							true);

					// Append common conditions to builder
					for (Condition<String, String> commonCondition : commonConditions) {
						queryBuilder.appendCustomCondition(commonCondition.sql, commonCondition.value);
					}

					queryBuilder.appendGroupBy("d.id");

					try (PreparedStatement stmt = queryBuilder.build(connection)) {
						context.getLogger().info("Execute SQL equipment statement: " + stmt);
						ResultSet rs;
						rs = stmt.executeQuery();
						while (rs.next()) {
							JSONObject item = new JSONObject();
							item.put("id", rs.getString("id"));
							item.put("vendor", rs.getString("vendor"));
							item.put("product", rs.getString("product"));
							item.put("version", rs.getString("version"));
							array.put(item);
						}
						json.put("equipmentSummary", array);
					}
				}
					break;
				default: {
					// add special filters
					String project = request.getQueryParameters().getOrDefault("projectId", "");
					String type = request.getQueryParameters().getOrDefault("type", "");
					String limit = request.getQueryParameters().getOrDefault("limit", LIMIT);
					String offset = request.getQueryParameters().getOrDefault("offset", OFFSET);
					if (!project.isEmpty()) {
						commonConditions.add(new Condition<>("lc.project_id= ?::uuid", project));
					}
					if (!type.isEmpty()) {
						commonConditions.add(new Condition<>("lc.usage_type = ?::usage_type_enum", type));
					}
					// This is the default case (aggregated data)
					JSONArray array = new JSONArray();

					// Initialize query builders
					SelectQueryBuilder allQueryBuilder = new SelectQueryBuilder(
							"SELECT lc.id, lc.consumption_date, lc.usage_type, lc.tokens_consumed, lc.device_id, lc.calling_platform_id, lc.comment,"
									+ " CONCAT('Week ',DATE_PART('week',consumption_date+'1 day'::interval)) AS consumption,"
									+ " lc.project_id, p.name ,d.vendor, d.product, d.version, d.granularity, d.support_type, d.type, json_agg(DISTINCT day_of_week) AS usage_days"
									+ " FROM device d, license_consumption lc, usage_detail u, project p, license l "
									+ " WHERE d.id = lc.device_id AND u.consumption_id = lc.id AND p.id = lc.project_id",
							true);
					SelectQueryBuilder weeklyConfigTokensConsumedQueryBuilder = new SelectQueryBuilder(
							"SELECT consumption_date, CONCAT('Week ', " +
									"DATE_PART('week',consumption_date+'1 day'::interval)) AS consumption_week, sum(tokens_consumed) FROM license_consumption lc");

					SelectQueryBuilder tokensConsumedByProjectQueryBuilder = new SelectQueryBuilder(
							"select p.id, p.name, p.status, sum(lc.tokens_consumed) AS tokens_consumed " +
									"FROM license_consumption lc, project p where lc.project_id = p.id",
							true);

					SelectQueryBuilder tokensConsumedQueryBuilder = new SelectQueryBuilder(
							"SELECT usage_type, sum(tokens_consumed) as consumed_tokens, count(*) from license_consumption lc");

					// Append common conditions to builders
					for (Condition<String, String> commonCondition : commonConditions) {
						allQueryBuilder.appendCustomCondition(commonCondition.sql, commonCondition.value);
						weeklyConfigTokensConsumedQueryBuilder.appendCustomCondition(commonCondition.sql,
								commonCondition.value);
						tokensConsumedByProjectQueryBuilder.appendCustomCondition(commonCondition.sql,
								commonCondition.value);
						tokensConsumedQueryBuilder.appendCustomCondition(commonCondition.sql, commonCondition.value);
					}

					// Conditions for all query
					allQueryBuilder.appendGroupBy(
							"lc.id, lc.consumption_date, lc.usage_type, lc.tokens_consumed, lc.device_id, consumption, lc.project_id, p.name, d.vendor, d.product, "
									+ "d.version, d.granularity, d.support_type, d.type");
					allQueryBuilder.appendOrderBy("consumption_date", SelectQueryBuilder.ORDER_DIRECTION.DESC);
					allQueryBuilder.appendLimit(limit);
					allQueryBuilder.appendOffset(offset);

					// Conditions for weekly config tokens query
					weeklyConfigTokensConsumedQueryBuilder.appendGroupBy("consumption_date, consumption_week");
					weeklyConfigTokensConsumedQueryBuilder.appendOrderBy("consumption_date",
							SelectQueryBuilder.ORDER_DIRECTION.DESC);

					// Conditions for all tokens per project query
					tokensConsumedByProjectQueryBuilder.appendGroupBy("p.id, p.name, p.status");
					tokensConsumedByProjectQueryBuilder.appendOrderBy("p.name",
							SelectQueryBuilder.ORDER_DIRECTION.DESC);

					// Conditions for tokens consumed query
					tokensConsumedQueryBuilder.appendGroupBy("usage_type");

					try (PreparedStatement stmt = allQueryBuilder.build(connection)) {
						context.getLogger().info("Execute SQL paginated consumption statement: " + stmt);

						ResultSet rs;
						rs = stmt.executeQuery();
						while (rs.next()) {
							JSONObject item = new JSONObject();
							item.put("comment", rs.getString("comment"));
							item.put("id", rs.getString("id"));
							item.put("projectId", rs.getString("project_id"));
							item.put("projectName", rs.getString("name"));
							item.put("consumptionDate", rs.getString("consumption_date").split(" ")[0]);
							item.put("usageType", rs.getString("usage_type"));
							item.put("tokensConsumed", rs.getInt("tokens_consumed"));
							item.put("consumption",
									item.getString("consumptionDate") + " - " + rs.getString("consumption"));
							item.put("usageDays", new JSONArray(rs.getString("usage_days")));
							// generating device info object and assigning to response item
							JSONObject device = new JSONObject();
							device.put("id", rs.getString("device_id"));
							device.put("type", rs.getString("type"));
							device.put("vendor", rs.getString("vendor"));
							device.put("product", rs.getString("product"));
							device.put("version", rs.getString("version"));
							device.put("granularity", rs.getString("granularity"));
							device.put("supportType", rs.getBoolean("support_type"));
							item.put("device", device);
							String callingPlatformId = rs.getString("calling_platform_id");
							// if calling platform defined, generating calling platform info object and
							// assigning to response item
							if (callingPlatformId != null && !callingPlatformId.isEmpty()) {
								// query for the calling platform information
								SelectQueryBuilder callingPlatformQueryBuilder = new SelectQueryBuilder(
										"SELECT d.* FROM device d, license_consumption lc WHERE d.id = lc.calling_platform_id",
										true);
								callingPlatformQueryBuilder.appendEqualsCondition("d.id", callingPlatformId,
										DATA_TYPE.UUID);

								try (PreparedStatement callingPlatformStmt = callingPlatformQueryBuilder
										.build(connection)) {
									context.getLogger().info(
											"Execute SQL get calling platform by id statement: " + callingPlatformStmt);
									ResultSet cpResultSet = callingPlatformStmt.executeQuery();
									if (cpResultSet.next()) {
										JSONObject callingPlatform = new JSONObject();
										callingPlatform.put("id", callingPlatformId);
										callingPlatform.put("type", cpResultSet.getString("type"));
										callingPlatform.put("vendor", cpResultSet.getString("vendor"));
										callingPlatform.put("product", cpResultSet.getString("product"));
										callingPlatform.put("version", cpResultSet.getString("version"));
										item.put("callingPlatform", callingPlatform);
									}
								}
							}
							array.put(item);
						}
						json.put("usage", array);
					}

					// Get aggregated consumption by week
					JSONArray array2 = new JSONArray();
					try (PreparedStatement stmt = weeklyConfigTokensConsumedQueryBuilder.build(connection)) {
						context.getLogger().info("Execute SQL weekly statement: " + stmt);

						ResultSet rs;
						rs = stmt.executeQuery();
						LocalDate dt, startWeek, endWeek;
						while (rs.next()) {
							dt = LocalDateTime
									.parse(rs.getString(1), DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
									.toLocalDate();
							TemporalField DAY_OF_WEEK = WeekFields.of(Locale.US).dayOfWeek();
							startWeek = dt.with(DAY_OF_WEEK, 1);
							endWeek = dt.with(DAY_OF_WEEK, 7);
							JSONObject item = new JSONObject();
							item.put("weekId",
									rs.getString(2) + " (" + startWeek.toString() + " - " + endWeek.toString() + ")");
							item.put("tokensConsumed", rs.getInt(3));
							array2.put(item);
						}
						json.put("weeklyConsumption", array2);
					}

					// Get aggregated consumption by project
					JSONArray array3 = new JSONArray();
					try (PreparedStatement stmt = tokensConsumedByProjectQueryBuilder.build(connection)) {
						context.getLogger().info("Execute SQL project statement: " + stmt);

						ResultSet rs;
						rs = stmt.executeQuery();
						while (rs.next()) {
							JSONObject item = new JSONObject();
							item.put("projectId", rs.getString("id"));
							item.put("name", rs.getString("name"));
							item.put("status", rs.getString("status"));
							item.put("tokensConsumed", rs.getInt("tokens_consumed"));
							array3.put(item);
						}
						json.put("projectConsumption", array3);
					}

					// Get aggregated consumption by usage type
					try (PreparedStatement stmt = tokensConsumedQueryBuilder.build(connection)) {
						context.getLogger().info("Execute SQL tokenConsumption statement: " + stmt);

						ResultSet rs;
						rs = stmt.executeQuery();
						int count = 0;
						JSONObject tokenConsumption = new JSONObject();
						while (rs.next()) {
							tokenConsumption.put(rs.getString("usage_type"), rs.getInt("consumed_tokens"));
							count += rs.getInt("count");
						}
						json.put("tokenConsumption", tokenConsumption);
						json.put("usageTotalCount", count);
					}
				}
					break;
			}
			context.getLogger().info("User " + userId + " is successfully leaving TekvLSGetAllLicenseUsageDetails Azure function");
			return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json")
					.body(json.toString()).build();
		} catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSGetAllLicenseUsageDetails Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		} catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSGetAllLicenseUsageDetails Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}

	private static class Condition<L, R> {
		private final L sql;
		private final R value;

		Condition(L sql, R value) {
			this.sql = sql;
			this.value = value;
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
