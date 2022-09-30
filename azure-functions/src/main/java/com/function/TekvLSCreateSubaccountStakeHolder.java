package com.function;

import static com.function.auth.RoleAuthHandler.*;
import static com.function.auth.Roles.*;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

import org.json.JSONArray;
import org.json.JSONObject;
import com.function.auth.Resource;
import com.function.clients.GraphAPIClient;
import com.function.util.FeatureToggles;
import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpMethod;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;

import io.jsonwebtoken.Claims;

public class TekvLSCreateSubaccountStakeHolder {

	@FunctionName("TekvLSCreateSubaccountStakeHolder")
	public HttpResponseMessage run(
	    @HttpTrigger(
	            name = "req",
	            methods = {HttpMethod.POST},
	            authLevel = AuthorizationLevel.ANONYMOUS,
	            route = "subaccountStakeHolders")
	    HttpRequestMessage<Optional<String>> request,
	    final ExecutionContext context) {

		Claims tokenClaims = getTokenClaimsFromHeader(request,context);
		JSONArray roles = getRolesFromToken(tokenClaims,context);
		if(roles.isEmpty()){
		    JSONObject json = new JSONObject();
		    context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
		    json.put("error", MESSAGE_FOR_UNAUTHORIZED);
		    return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
		if(!hasPermission(roles, Resource.CREATE_SUBACCOUNT_STAKEHOLDER)){
		    JSONObject json = new JSONObject();
		    context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
		    json.put("error", MESSAGE_FOR_FORBIDDEN);
		    return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}
		
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
		
		// Check mandatory params to be present
		for (MANDATORY_PARAMS mandatoryParam: MANDATORY_PARAMS.values()) {
			if (!jobj.has(mandatoryParam.value)) {
				// Parameter not found
				context.getLogger().info("Missing mandatory parameter: " + mandatoryParam.value);
				JSONObject json = new JSONObject();
				json.put("error", "Missing mandatory parameter: " + mandatoryParam.value);
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}
		}
		
		String sql = "INSERT INTO subaccount_admin (subaccount_admin_email, subaccount_id) VALUES (?, ?::uuid) RETURNING subaccount_admin_email;";
		if (jobj.has(OPTIONAL_PARAMS.NOTIFICATIONS.value)) {
			sql = "INSERT INTO subaccount_admin (subaccount_admin_email, subaccount_id, notifications) VALUES (?, ?::uuid, ?) RETURNING subaccount_admin_email;";
		}
		
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
		+ "&user=" + System.getenv("POSTGRESQL_USER")
		+ "&password=" + System.getenv("POSTGRESQL_PWD");
		
		try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
		     PreparedStatement statement = connection.prepareStatement(sql)) {
		
		    context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
		
		    // Set statement parameters
		    statement.setString(1, jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_ADMIN_EMAIL.value));
		    statement.setString(2, jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_ID.value));
		    if (jobj.has(OPTIONAL_PARAMS.NOTIFICATIONS.value)) {
		    	statement.setString(3, jobj.getString(OPTIONAL_PARAMS.NOTIFICATIONS.value));
		    }
		
		    String userId = getUserIdFromToken(tokenClaims,context);
		    context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + statement);
		    ResultSet rs = statement.executeQuery();
		    context.getLogger().info("Subaccount Admin email (stakeHolder) inserted successfully.");
		    rs.next();
			JSONObject json = new JSONObject();
			json.put("subaccountAdminEmail", rs.getString("subaccount_admin_email"));
			
		    if(FeatureToggles.INSTANCE.isFeatureActive("ad-subaccount-user-creation")){
		    	try {
		    		context.getLogger().info("Adding user to Azure AD : "+jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_ADMIN_EMAIL.value));
		    		GraphAPIClient.createGuestUserWithProperRole(jobj.getString(MANDATORY_PARAMS.NAME.value), jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_ADMIN_EMAIL.value), SUBACCOUNT_STAKEHOLDER, context);
		    		context.getLogger().info("Updating user profile at Azure AD : "+jobj);
		    		GraphAPIClient.updateUserProfile(jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_ADMIN_EMAIL.value), jobj.getString(MANDATORY_PARAMS.NAME.value), 
		    				jobj.getString(MANDATORY_PARAMS.JOB_TITLE.value), jobj.getString(MANDATORY_PARAMS.COMPANY_NAME.value), jobj.getString(MANDATORY_PARAMS.PHONE_NUMBER.value), context);
		    		context.getLogger().info("Updated user profile at Azure AD : "+jobj);
		    	}catch(Exception e) {
		    		context.getLogger().info("Failed to add user at azure AD.  Exception: " + e.getMessage());
		    	}
		    }
		    return request.createResponseBuilder(HttpStatus.OK).body(json.toString()).build();
		} catch (SQLException e) {
		    context.getLogger().info("SQL exception: " + e.getMessage());
		    JSONObject json = new JSONObject();
		    json.put("error", e.getMessage());
		    return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		} catch (Exception e) {
		    context.getLogger().info("Caught exception: " + e.getMessage());
		    JSONObject json = new JSONObject();
		    json.put("error", e.getMessage());
		    return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}
	
	private enum MANDATORY_PARAMS {
		SUBACCOUNT_ID("subaccountId"),
		SUBACCOUNT_ADMIN_EMAIL("subaccountAdminEmail"),
		NAME("name"),
		JOB_TITLE("jobTitle"),
		COMPANY_NAME("companyName"),
		PHONE_NUMBER("phoneNumber");

		private final String value;

		MANDATORY_PARAMS(String value) {
			this.value = value;
		}
	}

	private enum OPTIONAL_PARAMS {
		NOTIFICATIONS("notifications");

		private final String value;

		OPTIONAL_PARAMS(String value) {
			this.value = value;
		}
	}
}
