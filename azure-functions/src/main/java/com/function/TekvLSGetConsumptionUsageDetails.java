package com.function;

import com.function.auth.Resource;
import com.function.db.QueryBuilder;
import com.function.db.SelectQueryBuilder;
import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.BindingName;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import java.sql.*;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static com.function.auth.RoleAuthHandler.*;
import static com.function.auth.Roles.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetConsumptionUsageDetails {
	/**
	 * This function listens at endpoint "/v1.0/usageDetails/{consumptionId}". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/usageDetails/{consumptionId}
	 * 2. curl "{your host}/v1.0/usageDetails"
	 */
	@FunctionName("TekvLSGetConsumptionUsageDetails")
	public HttpResponseMessage run(
		@HttpTrigger(
			name = "req",
			methods = {HttpMethod.GET},
			authLevel = AuthorizationLevel.ANONYMOUS,
			route = "usageDetails/{id=EMPTY}")
			HttpRequestMessage<Optional<String>> request,
			@BindingName("id") String id,
		final ExecutionContext context) {

		Claims tokenClaims = getTokenClaimsFromHeader(request,context);
		JSONArray roles = getRolesFromToken(tokenClaims,context);
		if(roles.isEmpty()){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
			json.put("error", MESSAGE_FOR_UNAUTHORIZED);
			return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
		if(!hasPermission(roles, Resource.GET_CONSUMPTION_USAGE_DETAILS)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		String userId = getUserIdFromToken(tokenClaims, context);
        context.getLogger().info("User " + userId + " is Entering TekvLSGetConsumptionUsageDetails Azure function");
		
		SelectQueryBuilder queryBuilder = new SelectQueryBuilder("SELECT * FROM usage_detail");
		queryBuilder.appendEqualsCondition("consumption_id", id, QueryBuilder.DATA_TYPE.UUID);

		String email = getEmailFromToken(tokenClaims,context);
		// adding conditions according to the role
		String currentRole = evaluateRoles(roles);
		switch (currentRole){
			case DISTRIBUTOR_FULL_ADMIN:
				queryBuilder.appendCustomCondition("consumption_id IN (SELECT l.id FROM license_consumption l, subaccount s, customer c " +
						"WHERE l.subaccount_id = s.id and s.customer_id = c.id AND distributor_id = (SELECT distributor_id FROM customer c,customer_admin ca " +
						"WHERE c.id = ca.customer_id AND admin_email = ?))", email);
				break;
			case CUSTOMER_FULL_ADMIN:
				queryBuilder.appendCustomCondition("consumption_id IN (SELECT lc.id FROM license_consumption lc, subaccount s, customer_admin ca " +
						"WHERE lc.subaccount_id = s.id AND s.customer_id = ca.customer_id AND admin_email = ?)", email);
				break;
			case SUBACCOUNT_ADMIN:
				queryBuilder.appendCustomCondition("consumption_id IN (SELECT lc.id FROM license_consumption lc,subaccount_admin sa " +
						"WHERE lc.subaccount_id = sa.subaccount_id AND subaccount_admin_email = ?)", email);
				break;
		}

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
			 PreparedStatement selectStatement = queryBuilder.build(connection)) {
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
			context.getLogger().info("Execute SQL statement: " + selectStatement);
			ResultSet rs = selectStatement.executeQuery();
			// Return a JSON array of usageDays
			JSONObject json = new JSONObject();
			JSONArray array = new JSONArray();
			while (rs.next()) {
				JSONObject item = new JSONObject();
				item.put("id", rs.getString("id"));
				item.put("consumptionId", rs.getString("consumption_id"));
				item.put("dayOfWeek", rs.getInt("day_of_week"));
				item.put("usageDate", rs.getString("usage_date"));
				item.put("macAddress", rs.getString("mac_address"));
				item.put("serialNumber", rs.getString("serial_number"));
				if (hasPermission(roles, Resource.GET_USER_EMAIL_INFO))
					item.put("modifiedBy", rs.getString("modified_by"));
				array.put(item);
			}
			if (hasPermission(roles, Resource.GET_USER_EMAIL_INFO)) {
				final String sql = "SELECT modified_by FROM license_consumption WHERE id = ?::uuid;";// get tokens to consume
				try (PreparedStatement modifiedByStmt = connection.prepareStatement(sql)) {
					modifiedByStmt.setString(1, id);
					context.getLogger().info("Execute SQL statement: " + modifiedByStmt);
					rs = modifiedByStmt.executeQuery();
					if (rs.next()) {
						json.put("modifiedBy", rs.getString("modified_by"));
					}
				}
			}

			if(array.isEmpty()){
				context.getLogger().info( LOG_MESSAGE_FOR_INVALID_ID + email);
				List<String> customerRoles = Arrays.asList(DISTRIBUTOR_FULL_ADMIN,CUSTOMER_FULL_ADMIN,SUBACCOUNT_ADMIN);
				json.put("error",customerRoles.contains(currentRole) ? MESSAGE_FOR_INVALID_ID : MESSAGE_ID_NOT_FOUND);
				context.getLogger().info("User " + userId + " is leaving TekvLSGetConsumptionUsageDetails Azure function with error");
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}

			json.put("usageDays", array);
			context.getLogger().info("User " + userId + " is successfully leaving TekvLSGetConsumptionUsageDetails Azure function");
			return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();
		}
		catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", "SQL exception:" + e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSGetConsumptionUsageDetails Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
		catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSGetConsumptionUsageDetails Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}
}
