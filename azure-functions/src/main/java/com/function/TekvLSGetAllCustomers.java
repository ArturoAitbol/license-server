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
import com.microsoft.azure.functions.annotation.BindingName;

import java.sql.*;
import java.util.*;

import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;
import static com.function.auth.Roles.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetAllCustomers {
	/**
	 * This function listens at endpoint "/v1.0/customers". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/customers
	 * 2. curl "{your host}/v1.0/customers"
	 */

	private final String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");

	@FunctionName("TekvLSGetAllCustomers")
	public HttpResponseMessage run(
				@HttpTrigger(
				name = "req",
				methods = {HttpMethod.GET},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "customers/{id=EMPTY}")
				HttpRequestMessage<Optional<String>> request,
				@BindingName("id") String id,
				final ExecutionContext context) 
	{

		Claims tokenClaims = getTokenClaimsFromHeader(request,context);
		JSONArray roles = getRolesFromToken(tokenClaims,context);
		if(roles.isEmpty()){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
			json.put("error", MESSAGE_FOR_UNAUTHORIZED);
			return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
		if(!hasPermission(roles, Resource.GET_ALL_CUSTOMERS)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSGetAllCustomers Azure function");
		
		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());
		String customerType = request.getQueryParameters().getOrDefault("type", "");
		String customerName = request.getQueryParameters().getOrDefault("name", "");
		String tombstone = request.getQueryParameters().getOrDefault("tombstone", "false");

		Map<String, List<String>> adminEmailsMap = new HashMap<>();
		// Build SQL statement
		SelectQueryBuilder queryBuilder = new SelectQueryBuilder("SELECT * FROM customer");
		queryBuilder.appendEqualsCondition("tombstone", tombstone, QueryBuilder.DATA_TYPE.BOOLEAN);

		String email = getEmailFromToken(tokenClaims,context);

		// adding conditions according to the role
		String currentRole = evaluateRoles(roles);
		switch (currentRole){
			case DISTRIBUTOR_FULL_ADMIN:
				queryBuilder.appendCustomCondition("distributor_id = (SELECT distributor_id FROM customer c,customer_admin ca " +
						"WHERE c.id = ca.customer_id AND admin_email = ?)", email);
				break;
			case CUSTOMER_FULL_ADMIN:
				queryBuilder.appendCustomCondition("id = (SELECT customer_id FROM customer_admin WHERE admin_email = ?)", email);
				break;
			case SUBACCOUNT_ADMIN:
				queryBuilder.appendCustomCondition("id = (SELECT customer_id FROM subaccount s, subaccount_admin sa " +
						"WHERE s.id = sa.subaccount_id AND subaccount_admin_email = ?)", email);
				break;
		}

		if (id.equals("EMPTY")) {
			if (!customerType.isEmpty()) {
				queryBuilder.appendEqualsCondition("type", customerType);
			}
			if(!customerName.isEmpty()){
				queryBuilder.appendEqualsCondition("name", customerName);
			}
		}else{
			queryBuilder.appendEqualsCondition("id", id, QueryBuilder.DATA_TYPE.UUID);
			adminEmailsMap = loadAdminEmails(id, context);
		}
		
		// Connect to the database
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			PreparedStatement statement = queryBuilder.build(connection)) {
			
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
			
			// Retrieve all customers.
			context.getLogger().info("Execute SQL statement: " + statement);
			ResultSet rs = statement.executeQuery();
			// Return a JSON array of customers (id and names)
			JSONObject json = new JSONObject();
			JSONArray array = new JSONArray();
			while (rs.next()) {
				JSONObject item = new JSONObject();
				item.put("id", rs.getString("id"));
				item.put("name", rs.getString("name"));
				item.put("customerType", rs.getString("type"));
				item.put("testCustomer", rs.getBoolean("test_customer"));
				if (!id.equals("EMPTY")) {
					String distributorId = rs.getString("distributor_id");
					if (rs.wasNull())
						distributorId = "";
					item.put("distributorId", distributorId);
					item.put("adminEmails", adminEmailsMap.get(rs.getString("id")));
				}
				array.put(item);
			}

			if(!id.equals("EMPTY") && array.isEmpty()){
				context.getLogger().info( LOG_MESSAGE_FOR_INVALID_ID + email);
				List<String> customerRoles = Arrays.asList(DISTRIBUTOR_FULL_ADMIN,CUSTOMER_FULL_ADMIN,SUBACCOUNT_ADMIN);
				json.put("error",customerRoles.contains(currentRole) ? MESSAGE_FOR_INVALID_ID : MESSAGE_ID_NOT_FOUND);
				context.getLogger().info("User " + userId + " is leaving TekvLSGetAllCustomers Azure function with error");
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}

			json.put("customers", array);
			context.getLogger().info("User " + userId + " is successfully leaving TekvLSGetAllCustomers Azure function");
			return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();
		}
		catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", "SQL Exception: " + e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSGetAllCustomers Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
		catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSGetAllCustomers Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}


	private Map<String, List<String>> loadAdminEmails(String customerId, ExecutionContext context) {
		Map<String, List<String>> emailsMap = new HashMap<>();
		SelectQueryBuilder queryBuilder = new SelectQueryBuilder("SELECT * FROM customer_admin");
		queryBuilder.appendEqualsCondition("customer_id", customerId, QueryBuilder.DATA_TYPE.UUID);
		try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
			 PreparedStatement statement = queryBuilder.build(connection)) {
			context.getLogger().info("Execute SQL statement: " + statement);
			ResultSet rs = statement.executeQuery();
			while (rs.next()) {
				emailsMap.computeIfAbsent(rs.getString("customer_id"), k -> new ArrayList<>()).add(rs.getString("admin_email"));
			}
		} catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
		}
		return emailsMap;
	}
}
