package com.function;

import com.function.auth.Resource;
import com.function.db.QueryBuilder;
import com.function.db.SelectQueryBuilder;
import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpMethod;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;

import io.jsonwebtoken.Claims;

import com.microsoft.azure.functions.annotation.BindingName;

import java.sql.*;
import java.util.Objects;
import java.util.Optional;

import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetAllDevices {

	/**
	 * This function listens at endpoint
	 * "/v1.0/devices/{vendor}/{product}/{version}". Two ways to invoke it using
	 * "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/devices/{vendor}/{product}/{version}
	 * 2. curl "{your host}/v1.0/devices"
	 */
	@FunctionName("TekvLSGetAllDevices")
	public HttpResponseMessage run(
			@HttpTrigger(name = "req", methods = {
					HttpMethod.GET }, authLevel = AuthorizationLevel.ANONYMOUS, route = "devices/{id=EMPTY}") HttpRequestMessage<Optional<String>> request,
			@BindingName("id") String id,
			final ExecutionContext context) {

		Claims tokenClaims = getTokenClaimsFromHeader(request, context);
		JSONArray roles = getRolesFromToken(tokenClaims, context);
		if (roles.isEmpty()) {
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
			json.put("error", MESSAGE_FOR_UNAUTHORIZED);
			return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
		if (!hasPermission(roles, Resource.GET_ALL_DEVICES)) {
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSGetAllDevices Azure function");

		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());
		String vendor = request.getQueryParameters().getOrDefault("vendor", "");
		String deviceType = request.getQueryParameters().getOrDefault("deviceType", "");
		String product = request.getQueryParameters().getOrDefault("product", "");
		String version = request.getQueryParameters().getOrDefault("version", "");
		String subaccountId = request.getQueryParameters().getOrDefault("subaccountId", "");
		String licenseStartDate = request.getQueryParameters().getOrDefault("date", "");
		String limit = request.getQueryParameters().getOrDefault("limit", "");
		String offset = request.getQueryParameters().getOrDefault("offset", "");

		String tombstone = request.getQueryParameters().getOrDefault("tombstone", "false");

		// Build SQL statement
		SelectQueryBuilder queryBuilder = new SelectQueryBuilder("SELECT * FROM device");
		queryBuilder.appendEqualsCondition("tombstone", tombstone, QueryBuilder.DATA_TYPE.BOOLEAN);
		if (id.equals("EMPTY")) {
			if (!vendor.isEmpty() || !subaccountId.isEmpty() || !product.isEmpty() || !version.isEmpty()
					|| !licenseStartDate.isEmpty()) {
				if (!subaccountId.isEmpty()) {
					queryBuilder.appendCustomCondition("(subaccount_id is NULL or subaccount_id = ?::uuid)",
							subaccountId);
				}
				if (!vendor.isEmpty()) {
					queryBuilder.appendEqualsCondition("vendor", vendor);
				}
				if (!deviceType.isEmpty()) {
					queryBuilder.appendCustomCondition("?::device_type_enum = type", deviceType);
				}
				if (!product.isEmpty()) {
					queryBuilder.appendEqualsCondition("product", product);
				}
				if (!version.isEmpty()) {
					queryBuilder.appendEqualsCondition("version", version);
				}
				if (!licenseStartDate.isEmpty()) {
					queryBuilder.appendCustomCondition("?::timestamp >= start_date", licenseStartDate);
					queryBuilder.appendCustomCondition("?::timestamp < deprecated_date", licenseStartDate);
				}
			} else {
				queryBuilder.appendColumnIsNull("subaccount_id");
			}
		} else {
			queryBuilder.appendEqualsCondition("id", id, QueryBuilder.DATA_TYPE.UUID);
		}

		if (!Objects.equals(limit, "") && !Objects.equals(offset, "")) {
			queryBuilder.appendLimit(limit);
			queryBuilder.appendOffset(offset);
		}

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses"
				+ System.getenv("POSTGRESQL_SECURITY_MODE")
				+ "&user=" + System.getenv("POSTGRESQL_USER")
				+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
				Connection connection = DriverManager.getConnection(dbConnectionUrl);
				PreparedStatement statement = queryBuilder.build(connection)) {

			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

			// Execute sql query. TO DO: pagination
			context.getLogger().info("Execute SQL statement: " + statement);
			ResultSet rs = statement.executeQuery();
			// Return a JSON array
			JSONObject json = new JSONObject();
			JSONArray array = new JSONArray();
			while (rs.next()) {
				JSONObject item = new JSONObject();
				item.put("id", rs.getString("id"));
				item.put("vendor", rs.getString("vendor"));
				item.put("product", rs.getString("product"));
				item.put("version", rs.getString("version"));
				item.put("supportType", rs.getBoolean("support_type"));
				item.put("tokensToConsume", rs.getInt("tokens_to_consume"));
				item.put("granularity", rs.getString("granularity"));
				// Required for list devices
				item.put("type", rs.getString("type"));
				item.put("startDate", rs.getString("start_date"));
				item.put("deprecatedDate", rs.getString("deprecated_date"));
				//
				if (!id.equals("EMPTY")) {
					subaccountId = rs.getString("subaccount_id");
					if (rs.wasNull())
						subaccountId = "";
					item.put("subaccountId", subaccountId);
					item.put("type", rs.getString("type"));
					item.put("startDate", rs.getString("start_date"));
					item.put("deprecatedDate", rs.getString("deprecated_date"));
				}
				array.put(item);
			}
			json.put("devices", array);

			context.getLogger().info("User " + userId + " is successfully leaving TekvLSGetAllDevices Azure function");
			return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json")
					.body(json.toString()).build();
		} catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSGetAllDevices Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		} catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSGetAllDevices Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}
}
