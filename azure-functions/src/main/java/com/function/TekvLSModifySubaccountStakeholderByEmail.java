package com.function;

import static com.function.auth.RoleAuthHandler.LOG_MESSAGE_FOR_FORBIDDEN;
import static com.function.auth.RoleAuthHandler.LOG_MESSAGE_FOR_UNAUTHORIZED;
import static com.function.auth.RoleAuthHandler.MESSAGE_FOR_FORBIDDEN;
import static com.function.auth.RoleAuthHandler.MESSAGE_FOR_UNAUTHORIZED;
import static com.function.auth.RoleAuthHandler.getRolesFromToken;
import static com.function.auth.RoleAuthHandler.getTokenClaimsFromHeader;
import static com.function.auth.RoleAuthHandler.getUserIdFromToken;
import static com.function.auth.RoleAuthHandler.hasPermission;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Optional;

import org.json.JSONArray;
import org.json.JSONObject;

import com.function.auth.Resource;
import com.function.clients.GraphAPIClient;
import com.function.db.QueryBuilder;
import com.function.db.UpdateQueryBuilder;
import com.function.util.FeatureToggles;
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
		if (optionalParamsFound == 0) {
			updateADUser(email, jobj, context);
			return request.createResponseBuilder(HttpStatus.OK).build();
		}
		queryBuilder.appendWhereStatement("subaccount_admin_email", email, QueryBuilder.DATA_TYPE.VARCHAR);

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (Connection connection = DriverManager.getConnection(dbConnectionUrl);){
			PreparedStatement statement = queryBuilder.build(connection);
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
			String userId = getUserIdFromToken(tokenClaims,context);
			context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + statement);
			statement.executeUpdate();
			context.getLogger().info("Subaccount Admin email (stakeholder) updated successfully."); 
			updateADUser(email, jobj, context);
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
	
	private void updateADUser(String email, JSONObject jobj, ExecutionContext context) {
		 if(!FeatureToggles.INSTANCE.isFeatureActive("ad-subaccount-user-creation")) {
			 context.getLogger().info("ad-subaccount-user-creation toggle is not active. Nothing to do at Azure AD");
			 return;
		 }
		try {
			context.getLogger().info("Updating user profile at Azure AD : "+email);
			GraphAPIClient.updateUserProfile(email, getValue(jobj, "name"), getValue(jobj, "jobTitle"),getValue(jobj, "companyName"), getValue(jobj, "phoneNumber"), context);
			context.getLogger().info("Updated user profile at Azure AD : "+jobj);
		} catch(Exception e) {
			context.getLogger().info("Failed to update user profile at Azure AD. Exception: " + e.getMessage());
		}
	}
	
	private String getValue(JSONObject jobj, String key) {
		return jobj.has(key)?jobj.getString(key):null;
	}
}
