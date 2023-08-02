package com.function;

import static com.function.auth.RoleAuthHandler.*;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Optional;

import org.json.JSONArray;
import org.json.JSONObject;

import com.function.auth.Resource;
import com.function.clients.GraphAPIClient;
import com.function.db.QueryBuilder;
import com.function.db.SelectQueryBuilder;
import com.function.db.UpdateQueryBuilder;
import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpMethod;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;

import io.jsonwebtoken.Claims;

public class TekvLSModifyAuthUserProfile {
	/**
	 * This function listens at endpoint "/v1.0/authUserProfile". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/authUserProfile
	 */
	
	@FunctionName("TekvLSModifyAuthUserProfile")
	public HttpResponseMessage run(
			@HttpTrigger(
				name = "req",
				methods = {HttpMethod.PUT},
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
		if(!hasPermission(roles, Resource.MODIFY_AUTH_USER_PROFILE)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}
		
		String authEmail = getEmailFromToken(tokenClaims,context);
		String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSModifyAuthUserProfile Azure function");
		// Parse request body and extract parameters needed
		String requestBody = request.getBody().orElse("");
		context.getLogger().info("Request body: " + requestBody);
		if (requestBody.isEmpty()) {
			context.getLogger().info("error: request body is empty.");
			JSONObject json = new JSONObject();
			json.put("error", "error: request body is empty.");
			context.getLogger().info("User " + userId + " is leaving TekvLSModifyAuthUserProfile Azure function with error");
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
			context.getLogger().info("User " + userId + " is leaving TekvLSModifyAuthUserProfile Azure function with error");
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}
		
		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		
		//Verify query
		SelectQueryBuilder verificationQueryBuilder = null;
		verificationQueryBuilder = new SelectQueryBuilder("SELECT subaccount_id FROM subaccount_admin");
		verificationQueryBuilder.appendEqualsCondition("subaccount_admin_email", authEmail);
		
		try{
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			PreparedStatement verificationStmt = verificationQueryBuilder.build(connection);
			context.getLogger().info("Execute SQL role verification statement: " + verificationStmt);
			ResultSet rs = verificationStmt.executeQuery();
			if (!rs.next()) {
				context.getLogger().info(LOG_MESSAGE_FOR_INVALID_EMAIL + authEmail);
				JSONObject json = new JSONObject();
				json.put("error", MESSAGE_FOR_MISSING_CUSTOMER_EMAIL);
				context.getLogger().info("User " + userId + " is leaving TekvLSModifyAuthUserProfile Azure function with error");
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}
			String subaccountId = rs.getString("subaccount_id");
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
			if(jobj.has("emailNotifications")) {
				queryBuilder.appendValueModification("email_notifications", String.valueOf(jobj.getBoolean("emailNotifications")), QueryBuilder.DATA_TYPE.BOOLEAN);
			}
			queryBuilder.appendWhereStatement("subaccount_admin_email", authEmail, QueryBuilder.DATA_TYPE.VARCHAR);

			PreparedStatement statement = queryBuilder.build(connection);
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
			context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + statement);
			statement.executeUpdate();
			context.getLogger().info("Subaccount Admin email ( authenticated user ) updated successfully."); 
			updateADUser(authEmail, subaccountId, jobj, context);
			context.getLogger().info("User " + userId + " is succesfully leaving TekvLSModifyAuthUserProfile Azure function");
			return request.createResponseBuilder(HttpStatus.OK).build();
		}
		catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSModifyAuthUserProfile Azure function with error");
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
	
	private void updateADUser(String email, String subaccountId, JSONObject jobj, ExecutionContext context) throws Exception {
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
