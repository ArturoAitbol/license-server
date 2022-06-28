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
import com.microsoft.azure.functions.annotation.BindingName;

import java.sql.*;
import java.util.*;

import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetAllSubaccounts 
{
	/**
	 * This function listens at endpoint "/api/subaccounts/{id}". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/api/subaccounts/{id}
	 * 2. curl "{your host}/api/subaccounts"
	 */
	private final String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses?ssl=true&sslmode=require"
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");

	@FunctionName("TekvLSGetAllSubaccounts")
	public HttpResponseMessage run(
			@HttpTrigger(
				name = "req",
				methods = {HttpMethod.GET},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "subaccounts/{id=EMPTY}")
				HttpRequestMessage<Optional<String>> request,
				@BindingName("id") String id,
			final ExecutionContext context) 
	{

		String currentRole = getRoleFromToken(request,context);
		if(currentRole.isEmpty()){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
			json.put("error", MESSAGE_FOR_UNAUTHORIZED);
			return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
		if(!hasPermission(currentRole, Permission.GET_ALL_SUBACCOUNTS)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + currentRole);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		context.getLogger().info("Entering TekvLSGetAllSubaccounts Azure function");

		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());
		String customerId = request.getQueryParameters().getOrDefault("customer-id", "");

		Map<String, List<String>> adminEmailsMap = new HashMap<>();
		// Build SQL statement
		String sql = "select * from subaccount";
		String subQuery;
		String email = getEmailFromToken(request,context);
		List<String> conditionsList = new ArrayList<>();
		// adding conditions according to the role
		switch (currentRole){
			case DIST_FULL_ADMIN:
				String distributorId = "select distributor_id from customer c,customer_admin ca " +
						"where c.id = ca.customer_id and admin_email='"+email+"'";
				subQuery = "select id from customer where distributor_id =(" + distributorId + ")";
				conditionsList.add("customer_id IN (" + subQuery + ")");
				break;
			case CUSTOMER_FULL_ADMIN:
				String customer = "select customer_id from customer_admin where admin_email='"+email+"'";
				conditionsList.add("customer_id = (" + customer + ")");
				break;
			case SUBACCOUNT_ADMIN:
				subQuery = "select subaccount_id from subaccount_admin where subaccount_admin_email ='"+email+"'";
				conditionsList.add("id=(" + subQuery + ")");
				break;
		}

		if (id.equals("EMPTY")) {
			if (!customerId.isEmpty()) {
				conditionsList.add("customer_id='"+customerId+"'");
			}
		}else{
			conditionsList.add("id='" + id +"'");
			adminEmailsMap = loadSubaccountAdminEmails(id, context);
		}

		String sqlConditions = String.join(" and ",conditionsList);
		sql += (sqlConditions.isEmpty() ? ";" : " where "+sqlConditions+";");

		// Connect to the database
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			Statement statement = connection.createStatement();) {
			
			context.getLogger().info("Successfully connected to: " + dbConnectionUrl);
			
			// Retrive subaccounts. TODO: pagination
			context.getLogger().info("Execute SQL statement: " + sql);
			ResultSet rs = statement.executeQuery(sql);
			// Return a JSON array of subaccounts
			JSONObject json = new JSONObject();
			JSONArray array = new JSONArray();
			while (rs.next()) {
				JSONObject item = new JSONObject();
				item.put("name", rs.getString("name"));
				item.put("customerId", rs.getString("customer_id"));
				if (!id.equals("EMPTY"))
					item.put("subaccountAdminEmails", adminEmailsMap.get(rs.getString("id")));
				else
					item.put("id", rs.getString("id"));
				array.put(item);
			}
			json.put("subaccounts", array);
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

	private Map<String, List<String>> loadSubaccountAdminEmails(String subaccountId, ExecutionContext context) {
		String sql = "SELECT * FROM subaccount_admin WHERE subaccount_id = '" + subaccountId + "';";
		return loadAdminEmails(context, sql);
	}

	private Map<String, List<String>> loadAdminEmails(ExecutionContext context, String sql) {
		Map<String, List<String>> emailsMap = new HashMap<>();
		try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
			 Statement statement = connection.createStatement();) {
			context.getLogger().info("Execute SQL statement: " + sql);
			ResultSet rs = statement.executeQuery(sql);
			while (rs.next()) {
				emailsMap.computeIfAbsent(rs.getString("subaccount_id"), k -> new ArrayList<>()).add(rs.getString("subaccount_admin_email"));
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
