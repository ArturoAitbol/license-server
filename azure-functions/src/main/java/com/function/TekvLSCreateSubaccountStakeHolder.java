package com.function;

import static com.function.auth.RoleAuthHandler.*;
import static com.function.auth.Roles.*;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Objects;
import java.util.Optional;

import com.function.db.QueryBuilder;
import com.function.db.SelectQueryBuilder;
import com.function.clients.EmailClient;
import com.function.util.Constants;
import com.function.util.FeatureToggleService;

import org.json.JSONArray;
import org.json.JSONObject;
import com.function.auth.Resource;
import com.function.clients.GraphAPIClient;
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
		
		String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSCreateSubaccountStakeHolder Azure function");
		// Parse request body and extract parameters needed
		String requestBody = request.getBody().orElse("");
		context.getLogger().info("Request body: " + requestBody);
		if (requestBody.isEmpty()) {
			context.getLogger().info("error: request body is empty.");
			JSONObject json = new JSONObject();
			json.put("error", "error: request body is empty.");
			context.getLogger().info("User " + userId + " is leaving TekvLSCreateSubaccountStakeHolder Azure function with error");
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
			context.getLogger().info("User " + userId + " is leaving TekvLSCreateSubaccountStakeHolder Azure function with error");
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}
		
		// Check mandatory params to be present
		for (MANDATORY_PARAMS mandatoryParam: MANDATORY_PARAMS.values()) {
			if (!jobj.has(mandatoryParam.value)) {
				// Parameter not found
				context.getLogger().info("Missing mandatory parameter: " + mandatoryParam.value);
				JSONObject json = new JSONObject();
				json.put("error", "Missing mandatory parameter: " + mandatoryParam.value);
				context.getLogger().info("User " + userId + " is leaving TekvLSCreateSubaccountStakeHolder Azure function with error");
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}
		}

		String subaccountId = jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_ID.value);
		
		SelectQueryBuilder queryBuilder = new SelectQueryBuilder("SELECT COUNT(subaccount_admin_email) FROM subaccount_admin");
		queryBuilder.appendEqualsCondition("subaccount_id", subaccountId, QueryBuilder.DATA_TYPE.UUID);
		String sql = "INSERT INTO subaccount_admin (subaccount_admin_email, subaccount_id, email_notifications) VALUES (?, ?::uuid, ?::boolean) RETURNING subaccount_admin_email;";
		if (jobj.has(OPTIONAL_PARAMS.NOTIFICATIONS.value)) {
			sql = "INSERT INTO subaccount_admin (subaccount_admin_email, subaccount_id, notifications, email_notifications) VALUES (?, ?::uuid, ?, ?::boolean) RETURNING subaccount_admin_email;";
		}

		final String ctaasSetupSql = "SELECT * FROM ctaas_setup WHERE subaccount_id = ?:: uuid";
		
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
		+ "&user=" + System.getenv("POSTGRESQL_USER")
		+ "&password=" + System.getenv("POSTGRESQL_PWD");

		try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
		    PreparedStatement statement = connection.prepareStatement(sql);
			PreparedStatement subaccountStakeholders = queryBuilder.build(connection);
			PreparedStatement ctaasSetupStmt = connection.prepareStatement(ctaasSetupSql);) {
			ResultSet stakeholderset;
			int subaccountUsersCount = 0;
			stakeholderset = subaccountStakeholders.executeQuery();
			if (stakeholderset.next())
				subaccountUsersCount = stakeholderset.getInt(1);
			int limit = Constants.STAKEHOLDERS_LIMIT_PER_SUBACCOUNT;
			if (FeatureToggleService.isFeatureActiveBySubaccountId("multitenant-demo-subaccount", subaccountId))
				limit = Constants.STAKEHOLDERS_LIMIT_PER_DEMO_SUBACCOUNT;
			if (subaccountUsersCount < limit) {
					context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

				// Check if ctaas_setup exists and is on Ready status else return Bad Request
				ctaasSetupStmt.setString(1, subaccountId);
				ResultSet ctaasRs = ctaasSetupStmt.executeQuery();

				if (ctaasRs.next() && Objects.equals(ctaasRs.getString("status"), Constants.CTaaSSetupStatus.READY.value())) {

					// Set statement parameters
					statement.setString(1, jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_ADMIN_EMAIL.value));
					statement.setString(2, subaccountId);
					if (jobj.has(OPTIONAL_PARAMS.NOTIFICATIONS.value)) {
						statement.setString(3, jobj.getString(OPTIONAL_PARAMS.NOTIFICATIONS.value));
						statement.setBoolean(4, jobj.getBoolean(OPTIONAL_PARAMS.EMAIL_NOTIFICATIONS.value));
					} else {
						statement.setBoolean(3, jobj.getBoolean(OPTIONAL_PARAMS.EMAIL_NOTIFICATIONS.value));
					}
					
					context.getLogger().info("Execute SQL statement (User: " + userId + "): " + statement);
					ResultSet rs = statement.executeQuery();
					context.getLogger().info("Subaccount Admin email (stakeHolder) inserted successfully.");
					rs.next();
					JSONObject json = new JSONObject();
					json.put("subaccountAdminEmail", rs.getString("subaccount_admin_email"));
					try {
						context.getLogger().info("Adding user to Azure AD : " + jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_ADMIN_EMAIL.value));
						GraphAPIClient.createGuestUserWithProperRole(jobj.getString(MANDATORY_PARAMS.NAME.value), jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_ADMIN_EMAIL.value), SUBACCOUNT_STAKEHOLDER, context);
						EmailClient.sendStakeholderWelcomeEmail(jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_ADMIN_EMAIL.value), jobj.getString(OPTIONAL_PARAMS.COMPANY_NAME.value),
							jobj.getString(MANDATORY_PARAMS.NAME.value), subaccountId, context);
					} catch (Exception e) {
						context.getLogger().info("Failed to add user at azure AD.  Exception: " + e.getMessage());
					}
					try {
						context.getLogger().info("Updating user profile at Azure AD : " + jobj);
						GraphAPIClient.updateUserProfile(jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_ADMIN_EMAIL.value), jobj.getString(MANDATORY_PARAMS.NAME.value),
							jobj.getString(OPTIONAL_PARAMS.JOB_TITLE.value), jobj.getString(OPTIONAL_PARAMS.COMPANY_NAME.value), jobj.getString(OPTIONAL_PARAMS.PHONE_NUMBER.value), context);
						context.getLogger().info("Updated user profile at Azure AD : " + jobj);
					} catch (Exception e) {
						context.getLogger().info("Failed to update user at azure AD.  Exception: " + e.getMessage());
					}
					context.getLogger().info("User " + userId + " is successfully leaving TekvLSCreateSubaccountStakeHolder Azure function");
					return request.createResponseBuilder(HttpStatus.OK).body(json.toString()).build();
				} else {
					JSONObject json = new JSONObject();
					json.put("error", "UCaaS Continuous Testing Setup does not exist or is not ready");
					context.getLogger().info("User " + userId + " is leaving TekvLSCreateSubaccountStakeHolder Azure function with error");
					return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
				}
			} else {
				JSONObject json = new JSONObject();
				json.put("error", "The maximum amount of users (" + limit + ") has been reached");
				context.getLogger().info("User " + userId + " is leaving TekvLSCreateSubaccountStakeHolder Azure function with error");
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}    	
		} catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSCreateSubaccountStakeHolder Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		} catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSCreateSubaccountStakeHolder Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}

	}

	private enum MANDATORY_PARAMS {
		SUBACCOUNT_ID("subaccountId"),
		SUBACCOUNT_ADMIN_EMAIL("subaccountAdminEmail"),
		NAME("name");

		private final String value;

		MANDATORY_PARAMS(String value) {
			this.value = value;
		}
	}

	private enum OPTIONAL_PARAMS {
		NOTIFICATIONS("notifications"),
		EMAIL_NOTIFICATIONS("emailNotifications"),
		JOB_TITLE("jobTitle"),
		COMPANY_NAME("companyName"),
		PHONE_NUMBER("phoneNumber");

		private final String value;

		OPTIONAL_PARAMS(String value) {
			this.value = value;
		}
	}
}
