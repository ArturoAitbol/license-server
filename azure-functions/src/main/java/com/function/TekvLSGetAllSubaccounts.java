package com.function;

import com.function.auth.Resource;
import com.function.clients.GraphAPIClient;
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
public class TekvLSGetAllSubaccounts 
{
	/**
	 * This function listens at endpoint "/v1.0/subaccounts/{id}". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/subaccounts/{id}
	 * 2. curl "{your host}/v1.0/subaccounts"
	 */
	private final String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
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

		Claims tokenClaims = getTokenClaimsFromHeader(request,context);
		JSONArray roles = getRolesFromToken(tokenClaims,context);
		if(roles.isEmpty()){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
			json.put("error", MESSAGE_FOR_UNAUTHORIZED);
			return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
		if(!hasPermission(roles, Resource.GET_ALL_SUBACCOUNTS)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSGetAllSubaccounts Azure function");		

		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());
		String customerId = request.getQueryParameters().getOrDefault("customer-id", "");
		String filterByCustomerUser = request.getQueryParameters().getOrDefault("filterByCustomerUser", "");

		Map<String, List<String>> adminEmailsMap = new HashMap<>();
		// Build SQL statement
		SelectQueryBuilder queryBuilder = new SelectQueryBuilder("SELECT * FROM subaccount");
		String email = getEmailFromToken(tokenClaims,context);
		// adding conditions according to the role
		String currentRole;
		if (filterByCustomerUser.isEmpty())
			currentRole = evaluateRoles(roles);
		else {
			currentRole = evaluateCustomerRoles(roles);
			if (currentRole.isEmpty()) {
				context.getLogger().info(MESSAGE_FOR_MISSING_CUSTOMER_EMAIL + " Email=" + email);
				JSONObject json = new JSONObject();
				json.put("error", MESSAGE_FOR_MISSING_CUSTOMER_EMAIL);
				context.getLogger().info("User " + userId + " is leaving TekvLSGetAllSubaccounts Azure function with error");
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}
		}
		switch (currentRole){
			case DISTRIBUTOR_FULL_ADMIN:
				queryBuilder.appendCustomCondition("customer_id IN (SELECT id FROM customer WHERE distributor_id = (SELECT distributor_id FROM customer c,customer_admin ca " +
						"WHERE c.id = ca.customer_id AND admin_email = ?))", email);
				break;
			case CUSTOMER_FULL_ADMIN:
				queryBuilder.appendCustomCondition("customer_id = (select customer_id from customer_admin where admin_email = ?)", email);
				break;
			case SUBACCOUNT_ADMIN:
				queryBuilder.appendCustomCondition("id = (SELECT subaccount_id FROM subaccount_admin WHERE subaccount_admin_email = ?)", email);
				break;
			case SUBACCOUNT_STAKEHOLDER:
				//subaccount stakeholders are stored in subaccount_admin_email table itself
				queryBuilder.appendCustomCondition("id = (SELECT subaccount_id FROM subaccount_admin WHERE subaccount_admin_email = ?)", email);
				break;
		}

		if (id.equals("EMPTY")) {
			if (!customerId.isEmpty()) {
				queryBuilder.appendEqualsCondition("customer_id", customerId, QueryBuilder.DATA_TYPE.UUID);
			}
		}else{
			queryBuilder.appendEqualsCondition("id", id, QueryBuilder.DATA_TYPE.UUID);
			adminEmailsMap = loadAdminEmails(id, context);
		}

		// Connect to the database
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			PreparedStatement selectStmt = queryBuilder.build(connection)) {
			
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
			
			// Retrieve subaccounts.
			context.getLogger().info("Execute SQL statement: " + selectStmt);
			ResultSet rs = selectStmt.executeQuery();
			// Return a JSON array of subaccounts
			JSONObject json = new JSONObject();
			JSONArray array = new JSONArray();
			while (rs.next()) {
				JSONObject item = new JSONObject();
				item.put("name", rs.getString("name"));
				item.put("customerId", rs.getString("customer_id"));
				item.put("services", rs.getString("services"));
				if (!id.equals("EMPTY"))
					item.put("subaccountAdminEmails", adminEmailsMap.get(rs.getString("id")));
				else
					item.put("id", rs.getString("id"));
				array.put(item);
			}

			if (!id.equals("EMPTY") && array.isEmpty()) {
				context.getLogger().info( LOG_MESSAGE_FOR_INVALID_ID + email);
				List<String> customerRoles = Arrays.asList(DISTRIBUTOR_FULL_ADMIN,CUSTOMER_FULL_ADMIN,SUBACCOUNT_ADMIN, SUBACCOUNT_STAKEHOLDER);
				json.put("error",customerRoles.contains(currentRole) ? MESSAGE_FOR_INVALID_ID : MESSAGE_ID_NOT_FOUND);
				context.getLogger().info("User " + userId + " is leaving TekvLSGetAllSubaccounts Azure function with error");
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}

			json.put("subaccounts", array);
			context.getLogger().info("User " + userId + " is successfully leaving TekvLSGetAllSubaccounts Azure function");
			return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();
		}
		catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSGetAllSubaccounts Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
		catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSGetAllSubaccounts Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}

	private Map<String, List<String>> loadAdminEmails(String subaccountId, ExecutionContext context) {
		Map<String, List<String>> emailsMap = new HashMap<>();
		String sql = "SELECT * FROM subaccount_admin WHERE subaccount_id = ?::uuid;";
		try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
			 PreparedStatement statement = connection.prepareStatement(sql)) {

			statement.setString(1, subaccountId);

			context.getLogger().info("Execute SQL statement: " + statement);
			ResultSet rs = statement.executeQuery();
			while (rs.next()) {
				if(isSubaccountAdmin(rs.getString("subaccount_admin_email"), context)){
					emailsMap.computeIfAbsent(rs.getString("subaccount_id"), k -> new ArrayList<>()).add(rs.getString("subaccount_admin_email"));
				}
			}
		} catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
		}
		return emailsMap;
	}

	private boolean isSubaccountAdmin(String subaccountEmail, ExecutionContext context) {
		try{
			JSONObject userProfile = null;
			userProfile = GraphAPIClient.getUserProfileWithRoleByEmail(subaccountEmail, context);
			String userRole = userProfile.getString("role");
			if(userRole != SUBACCOUNT_STAKEHOLDER) {
				return true;
			}else {
				return false;
			}
		} catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			return true;
		}
	}
}
