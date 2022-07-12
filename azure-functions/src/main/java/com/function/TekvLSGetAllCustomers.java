package com.function;

import com.function.auth.Permission;
import com.function.auth.RoleAuthHandler;
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

import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetAllCustomers {
	/**
	 * This function listens at endpoint "/api/customers". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/api/customers
	 * 2. curl "{your host}/api/customers"
	 */

	private final String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses?ssl=true&sslmode=require"
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

		JSONObject tokenClaims = getTokenClaimsFromHeader(request,context);
		String currentRole = getRoleFromToken(tokenClaims,context);
		if(currentRole.isEmpty()){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
			json.put("error", MESSAGE_FOR_UNAUTHORIZED);
			return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
		if(!hasPermission(currentRole, Permission.GET_ALL_CUSTOMERS)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + currentRole);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		context.getLogger().info("Entering TekvLSGetAllCustomers Azure function");   
		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());
		String customerType = request.getQueryParameters().getOrDefault("type", "");
		String customerName = request.getQueryParameters().getOrDefault("name", "");

		Map<String, List<String>> adminEmailsMap = new HashMap<>();
		// Build SQL statement
		String sql = "select * from customer";
		String email = getEmailFromToken(tokenClaims,context);
		List<String> conditionsList = new ArrayList<>();
		String customerId;
		// adding conditions according to the role
		switch (currentRole){
			case DISTRIBUTOR_FULL_ADMIN:
				String distributorId = "select distributor_id from customer c,customer_admin ca " +
						"where c.id = ca.customer_id and admin_email='"+email+"'";
				conditionsList.add("distributor_id = (" + distributorId + ")");
				break;
			case CUSTOMER_FULL_ADMIN:
				customerId = "select customer_id from customer_admin where admin_email='"+email+"'";
				conditionsList.add("id = (" + customerId + ")");
				break;
			case SUBACCOUNT_ADMIN:
				customerId = "select customer_id from subaccount s, subaccount_admin sa where s.id = sa.subaccount_id" +
						" and subaccount_admin_email = '"+email+"'";
				conditionsList.add("id=(" + customerId + ")");
				break;
		}

		if (id.equals("EMPTY")) {
			if (!customerType.isEmpty()) {
				conditionsList.add("type = '" + customerType + "'");
			}
			if(!customerName.isEmpty()){
				conditionsList.add("name = '" + customerName + "'");
			}
		}else{
			conditionsList.add("id='" + id +"'");
			adminEmailsMap = loadAdminEmails(id, context);
		}

		String sqlConditions = String.join(" and ",conditionsList);
		sql += (sqlConditions.isEmpty() ? ";" : " where "+sqlConditions+";");
		
		// Connect to the database
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			Statement statement = connection.createStatement();) {
			
			context.getLogger().info("Successfully connected to: " + dbConnectionUrl);
			
			// Retrive all customers. TODO: pagination
			context.getLogger().info("Execute SQL statement: " + sql);
			ResultSet rs = statement.executeQuery(sql);
			// Return a JSON array of customers (id and names)
			JSONObject json = new JSONObject();
			JSONArray array = new JSONArray();
			while (rs.next()) {
				JSONObject item = new JSONObject();
				item.put("id", rs.getString("id"));
				item.put("name", rs.getString("name"));
				item.put("customerType", rs.getString("type"));
				item.put("testCustomer", rs.getBoolean("test_customer"));
				item.put("tombstone", rs.getBoolean("tombstone"));
				if (!id.equals("EMPTY")) {
					String distributorId = rs.getString("distributor_id");
					if (rs.wasNull())
						distributorId = "";
					item.put("distributorId", distributorId);
					item.put("adminEmails", adminEmailsMap.get(rs.getString("id")));
				}
				array.put(item);
			}
			json.put("customers", array);
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
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}

	private Map<String, List<String>> loadAdminEmails(String customerId, ExecutionContext context) {
		String sql = "SELECT * FROM customer_admin WHERE customer_id = '" + customerId + "';";
		return loadAdminEmails(context, sql);
	}

	private Map<String, List<String>> loadAdminEmails(ExecutionContext context, String sql) {
		Map<String, List<String>> emailsMap = new HashMap<>();
		try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
			 Statement statement = connection.createStatement();) {
			context.getLogger().info("Execute SQL statement: " + sql);
			ResultSet rs = statement.executeQuery(sql);
			while (rs.next()) {
				emailsMap.computeIfAbsent(rs.getString("customer_id"), k -> new ArrayList<>()).add(rs.getString("admin_email"));
			}
		} catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
		}
		catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
		}
		return emailsMap;
	}






}
