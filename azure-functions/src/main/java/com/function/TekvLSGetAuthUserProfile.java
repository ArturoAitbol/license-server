package com.function;

import static com.function.auth.RoleAuthHandler.*;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.json.JSONArray;
import org.json.JSONObject;

import com.function.auth.Permission;
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

import io.jsonwebtoken.Claims;

public class TekvLSGetAuthUserProfile {
	/**
	 * This function listens at endpoint "/v1.0/authUserProfile". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/authUserProfile
	 */
	@FunctionName("TekvLSGetAuthUserProfile")
	public HttpResponseMessage run(
			@HttpTrigger(
				name = "req",
				methods = {HttpMethod.GET},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "authUserProfile")
				HttpRequestMessage<Optional<String>> request,
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
		if(!hasPermission(roles, Permission.GET_AUTH_USER_PROFILE)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		context.getLogger().info("Entering TekvLSGetAuthUserProfile Azure function");
		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());

		// Build SQL statement
		SelectQueryBuilder queryBuilder = new SelectQueryBuilder("SELECT * FROM subaccount_admin");
		String authEmail = getEmailFromToken(tokenClaims,context);

		// adding conditions according to the role
		String currentRole = evaluateRoles(roles);
		switch (currentRole){
			case DISTRIBUTOR_FULL_ADMIN:
				queryBuilder.appendCustomCondition("subaccount_id IN (SELECT s.id from subaccount s, customer c WHERE s.customer_id = c.id " +
						"AND distributor_id = (SELECT distributor_id FROM customer c,customer_admin ca WHERE c.id = ca.customer_id AND admin_email = ?))", authEmail);
				break;
			case CUSTOMER_FULL_ADMIN:
				queryBuilder.appendCustomCondition("subaccount_id IN (SELECT s.id FROM subaccount s, customer_admin ca " +
						"WHERE s.customer_id = ca.customer_id AND admin_email = ?)", authEmail);
				break;
			case SUBACCOUNT_ADMIN:
				queryBuilder.appendCustomCondition("subaccount_id = (SELECT subaccount_id FROM subaccount_admin WHERE subaccount_admin_email = ?)", authEmail);
				break;
			case SUBACCOUNT_STAKEHOLDER:
				queryBuilder.appendCustomCondition("subaccount_id = (SELECT subaccount_id FROM subaccount_admin WHERE subaccount_admin_email = ?)", authEmail);
				break;
		}

		if (!authEmail.isEmpty()){
			queryBuilder.appendEqualsCondition("subaccount_admin_email", authEmail, QueryBuilder.DATA_TYPE.VARCHAR);
		}

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			Statement statement = connection.createStatement();
			PreparedStatement selectStmt = queryBuilder.build(connection)) {
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
			ResultSet rs;
			JSONObject json = new JSONObject();
			
			context.getLogger().info("Execute SQL statement: " + selectStmt);
			rs = selectStmt.executeQuery();
			// Return a JSON array of licenses
			JSONObject item = null;
			if (rs.next()) {
				item = new JSONObject();
				item.put("email", rs.getString("subaccount_admin_email"));
				item.put("subaccountId", rs.getString("subaccount_id"));
				item.put("notifications", rs.getString("notifications"));
			}

			if(!authEmail.isEmpty() && item==null){
				context.getLogger().info( LOG_MESSAGE_FOR_INVALID_EMAIL + authEmail);
				List<String> customerRoles = Arrays.asList(SUBACCOUNT_ADMIN , SUBACCOUNT_STAKEHOLDER);
				json.put("error",customerRoles.contains(currentRole) ? MESSAGE_FOR_INVALID_AUTH_EMAIL : MESSAGE_EMAIL_NOT_FOUND);
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}
			
			item = fetchUserDetails(item, context);
			context.getLogger().info("Auth user profile details fetched : "+item);
			json.put("userProfile", item);
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
	
	private JSONObject fetchUserDetails(JSONObject item, ExecutionContext context) {
			JSONObject userProfile = null; 
			try {
				userProfile = GraphAPIClient.getUserProfileWithRoleByEmail(item.getString("email"),context);
				item.put("name",userProfile.get("displayName"));
				item.put("jobTitle",userProfile.get("jobTitle"));
				item.put("companyName",userProfile.get("companyName"));
				item.put("phoneNumber",userProfile.get("mobilePhone"));
			} catch (Exception e) {
				context.getLogger().info("Caught exception: " + e.getMessage());
			}
		return item;
	}
}
