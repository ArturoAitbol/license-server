package com.function;

import static com.function.auth.RoleAuthHandler.LOG_MESSAGE_FOR_FORBIDDEN;
import static com.function.auth.RoleAuthHandler.LOG_MESSAGE_FOR_UNAUTHORIZED;
import static com.function.auth.RoleAuthHandler.MESSAGE_FOR_FORBIDDEN;
import static com.function.auth.RoleAuthHandler.MESSAGE_FOR_UNAUTHORIZED;
import static com.function.auth.RoleAuthHandler.getRolesFromToken;
import static com.function.auth.RoleAuthHandler.getTokenClaimsFromHeader;
import static com.function.auth.RoleAuthHandler.getUserIdFromToken;
import static com.function.auth.RoleAuthHandler.hasPermission;
import static com.function.auth.Roles.SUBACCOUNT_ADMIN;
import static com.function.auth.Roles.SUBACCOUNT_STAKEHOLDER;

import java.sql.*;
import java.util.Optional;

import com.function.db.SelectQueryBuilder;
import com.microsoft.graph.models.User;
import org.json.JSONArray;
import org.json.JSONObject;

import com.function.auth.Resource;
import com.function.clients.GraphAPIClient;
import com.function.db.QueryBuilder;
import com.function.db.UpdateQueryBuilder;
import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpMethod;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.BindingName;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;

import io.jsonwebtoken.Claims;

public class TekvLSModifySubaccountStakeholderByEmail {
	/**
	 * This function listens at endpoint "/v1.0/subaccountStakeHolders/{id}". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/subaccountStakeHolders/{id}
	 * @throws Exception
	 */
	
	@FunctionName("TekvLSModifySubaccountStakeholderByEmail")
	public HttpResponseMessage run(
			@HttpTrigger(
				name = "req",
				methods = {HttpMethod.PUT},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "subaccountStakeHolders/{email}")
				HttpRequestMessage<Optional<String>> request,
				@BindingName("email") String email,
				final ExecutionContext context)
	{
		email = email.toLowerCase();
		Claims tokenClaims = getTokenClaimsFromHeader(request,context);
		JSONArray roles = getRolesFromToken(tokenClaims,context);
		if(roles.isEmpty()){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
			json.put("error", MESSAGE_FOR_UNAUTHORIZED);
			return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
		if(!hasPermission(roles, Resource.MODIFY_SUBACCOUNT_STAKEHOLDER)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		context.getLogger().info("Entering TekvLSModifySubaccountStakeholderByEmail Azure function");
		
		// Parse request body and extract parameters needed
		String requestBody = request.getBody().orElse("");
		context.getLogger().info("Request body: " + requestBody);
		if (requestBody.isEmpty()) {
			context.getLogger().info("error: request body is empty.");
			JSONObject json = new JSONObject();
			json.put("error", "error: request body is empty.");
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}
		JSONObject jobj;
		try {
			jobj = new JSONObject(requestBody);
		} 
		catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}

		// Build the sql query
		UpdateQueryBuilder queryBuilder = new UpdateQueryBuilder("subaccount_admin");
		int optionalParamsFound = 0;
		for (OPTIONAL_PARAMS param: OPTIONAL_PARAMS.values()) {
			try {
					queryBuilder.appendValueModification(param.columnName, jobj.getString(param.jsonAttrib), param.dataType);
					optionalParamsFound++;
			} catch (Exception e) {
				context.getLogger().info("Ignoring exception: " + e);
			}
		}
		if (jobj.has("emailNotifications")) {
			queryBuilder.appendValueModification("email_notifications", String.valueOf(jobj.getBoolean("emailNotifications")), QueryBuilder.DATA_TYPE.BOOLEAN);
		}
		queryBuilder.appendWhereStatement("subaccount_admin_email", email, QueryBuilder.DATA_TYPE.VARCHAR);

		SelectQueryBuilder subaccountIdQuery = new SelectQueryBuilder("SELECT subaccount_id FROM subaccount_admin");
		subaccountIdQuery.appendEqualsCondition("subaccount_admin_email", email);

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
			 PreparedStatement statement = queryBuilder.build(connection);
			 PreparedStatement subaccountIdStmt = subaccountIdQuery.build(connection)){

			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
			String userId = getUserIdFromToken(tokenClaims,context);

			context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + subaccountIdStmt);
			ResultSet subaccountIdRs = subaccountIdStmt.executeQuery();
			subaccountIdRs.next();
			String subaccountId = subaccountIdRs.getString("subaccount_id");

			if (optionalParamsFound == 0) {
				updateADUser(email, subaccountId, jobj, context);
				return request.createResponseBuilder(HttpStatus.OK).build();
			}

			context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + statement);
			statement.executeUpdate();
			context.getLogger().info("Subaccount Admin email (stakeholder) updated successfully."); 
			updateADUser(email, subaccountId, jobj, context);
			return request.createResponseBuilder(HttpStatus.OK).build();
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

	private enum OPTIONAL_PARAMS {
		NOTIFICATIONS("notifications", "notifications", QueryBuilder.DATA_TYPE.VARCHAR);
		
		private final String jsonAttrib;
		private final String columnName;
		private final String dataType;

		OPTIONAL_PARAMS(String jsonAttrib, String columnName, QueryBuilder.DATA_TYPE dataType) {
			this.jsonAttrib = jsonAttrib;
			this.columnName = columnName;
			this.dataType = dataType.getValue();
		}
	}
	
	private void updateADUser(String email, String subaccountId, JSONObject jobj, ExecutionContext context) {
		try {
			context.getLogger().info("Updating user profile at Azure AD : "+email);
			User user = GraphAPIClient.updateUserProfile(email, getValue(jobj, "name"), getValue(jobj, "jobTitle"), getValue(jobj, "companyName"), getValue(jobj, "phoneNumber"), context);
			context.getLogger().info("Updated user profile at Azure AD : "+jobj);
			String newRole = getValue(jobj, "role");
			if (newRole != null && user != null) {
				context.getLogger().info("Updating user role at Azure AD : " + email);
				if (newRole.equals(SUBACCOUNT_ADMIN)) {
					GraphAPIClient.removeRoleByUserId(user.id, SUBACCOUNT_STAKEHOLDER, context);
					GraphAPIClient.assignRole(user.id, SUBACCOUNT_ADMIN, context);
					context.getLogger().info("Removed stakeholder role and assigned subaccount admin role");
				} else if (newRole.equals(SUBACCOUNT_STAKEHOLDER)) {
					GraphAPIClient.removeRoleByUserId(user.id, SUBACCOUNT_ADMIN, context);
					GraphAPIClient.assignRole(user.id, SUBACCOUNT_STAKEHOLDER, context);
					context.getLogger().info("Removed subaccount admin role and assigned stakeholder role");
				} else {
					context.getLogger().info("New role is invalid, will skip role update");
				}
			}
		} catch(Exception e) {
			context.getLogger().info("Failed to update user profile at Azure AD. Exception: " + e.getMessage());
		}
	}
	
	private String getValue(JSONObject jobj, String key) {
		return jobj.has(key)?jobj.getString(key):null;
	}
}
