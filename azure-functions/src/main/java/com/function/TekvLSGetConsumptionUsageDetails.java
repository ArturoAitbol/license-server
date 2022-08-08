package com.function;

import com.function.auth.Permission;
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
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetConsumptionUsageDetails {
	/**
	 * This function listens at endpoint "/api/usageDetails/{consumptionId}". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/api/usageDetails/{consumptionId}
	 * 2. curl "{your host}/api/usageDetails"
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
		String currentRole = getRoleFromToken(tokenClaims,context);
		if(currentRole.isEmpty()){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
			json.put("error", MESSAGE_FOR_UNAUTHORIZED);
			return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
		if(!hasPermission(currentRole, Permission.GET_CONSUMPTION_USAGE_DETAILS)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + currentRole);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}


		context.getLogger().info("Entering TekvLSGetConsumptionUsageDetails Azure function");
		String sql = "select * from usage_detail where consumption_id='" + id +"'";

		String subQuery;
		String email = getEmailFromToken(tokenClaims,context);
		String sqlRoleCondition="";
		// adding conditions according to the role
		switch (currentRole){
			case DISTRIBUTOR_FULL_ADMIN:
				String distributorId = "select distributor_id from customer c,customer_admin ca " +
						"where c.id = ca.customer_id and admin_email='"+email+"'";
				subQuery = "select l.id from license_consumption l, subaccount s, customer c" +
						" where l.subaccount_id = s.id and s.customer_id = c.id" +
						" and distributor_id =("+distributorId+")";
				sqlRoleCondition="consumption_id IN(" + subQuery + ")";
				break;
			case CUSTOMER_FULL_ADMIN:
				subQuery = "select lc.id from license_consumption lc, subaccount s, customer_admin ca" +
						" where lc.subaccount_id = s.id and s.customer_id = ca.customer_id" +
						" and admin_email = '"+email+"'";
				sqlRoleCondition="consumption_id IN(" + subQuery + ")";
				break;
			case SUBACCOUNT_ADMIN:
				subQuery = "select lc.id from license_consumption lc,subaccount_admin sa " +
						" where lc.subaccount_id = sa.subaccount_id" +
						" and subaccount_admin_email ='"+email+"'";
				sqlRoleCondition="consumption_id IN(" + subQuery + ")";
				break;
		}

		if(!sqlRoleCondition.isEmpty())
			sql += " and "+ sqlRoleCondition;
		sql +=";";

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (Connection connection = DriverManager.getConnection(dbConnectionUrl); Statement statement = connection.createStatement()) {
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
			context.getLogger().info("Execute SQL statement: " + sql);
			ResultSet rs = statement.executeQuery(sql);
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
				if (hasPermission(currentRole, Permission.GET_USER_EMAIL_INFO))
					item.put("modifiedBy", rs.getString("modified_by"));
				array.put(item);
			}
			if (hasPermission(currentRole, Permission.GET_USER_EMAIL_INFO)) {
				sql = "SELECT modified_by FROM license_consumption WHERE id='" + id + "';";// get tokens to consume
				context.getLogger().info("Execute SQL statement: " + sql);
				rs = statement.executeQuery(sql);
				if(rs.next()){
					json.put("modifiedBy", rs.getString("modified_by"));
				}
			}

			if(!id.equals("EMPTY") && array.isEmpty()){
				context.getLogger().info( LOG_MESSAGE_FOR_INVALID_ID + email);
				List<String> customerRoles = Arrays.asList(DISTRIBUTOR_FULL_ADMIN,CUSTOMER_FULL_ADMIN,SUBACCOUNT_ADMIN);
				json.put("error",customerRoles.contains(currentRole) ? MESSAGE_FOR_INVALID_ID : MESSAGE_ID_NOT_FOUND);
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}

			json.put("usageDays", array);
			return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();
		}
		catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", "SQL exception:" + e.getMessage());
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
