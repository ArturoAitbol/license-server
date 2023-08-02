package com.function;

import static com.function.auth.RoleAuthHandler.*;
import static com.function.auth.Roles.*;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

import org.json.JSONArray;
import org.json.JSONObject;

import com.function.auth.Resource;
import com.function.db.QueryBuilder;
import com.function.db.SelectQueryBuilder;
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

public class TekvLSGetAllCtaasSetups {
	/**
	* This function listens at endpoint "/v1.0/ctaasSetups?subaccountId={subaccountId}". Two ways to invoke it using "curl" command in bash:
	* 1. curl -d "HTTP Body" {your host}/v1.0/ctaasSetups?subaccountId={subaccountId}
	* 2. curl "{your host}/v1.0/ctaasSetups"
	*/

	private final String dbConnectionUrl = "jdbc:postgresql://" +
			System.getenv("POSTGRESQL_SERVER") +"/licenses" +
			System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");

	@FunctionName("TekvLSGetAllCtaasSetups")
		public HttpResponseMessage run(
		@HttpTrigger(
		name = "req",
		methods = {HttpMethod.GET},
		authLevel = AuthorizationLevel.ANONYMOUS,
		route = "ctaasSetups/{id=EMPTY}")
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
		if(!hasPermission(roles, Resource.GET_ALL_CTAAS_SETUPS)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSGetAllCtaasSetups Azure function");
		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());
		String subaccountId = request.getQueryParameters().getOrDefault("subaccountId", "");

		Map<String, List<String>> supportEmailsMap = new HashMap<>();

		// Build SQL statement
		SelectQueryBuilder queryBuilder = new SelectQueryBuilder("SELECT * FROM ctaas_setup");
		SelectQueryBuilder verificationQueryBuilder = null;
		String email = getEmailFromToken(tokenClaims,context);

		// adding conditions according to the role
		String currentRole = evaluateRoles(roles);
		switch (currentRole){
			case CUSTOMER_FULL_ADMIN:
				queryBuilder.appendCustomCondition("subaccount_id IN (SELECT s.id FROM subaccount s, customer_admin ca " +
						"WHERE s.customer_id = ca.customer_id AND admin_email = ?)", email);
				verificationQueryBuilder = new SelectQueryBuilder("SELECT s.id FROM subaccount s, customer_admin ca");
				verificationQueryBuilder.appendCustomCondition("s.customer_id = ca.customer_id AND admin_email = ?", email);
				break;
			case SUBACCOUNT_ADMIN:
			case SUBACCOUNT_STAKEHOLDER:
				queryBuilder.appendCustomCondition("subaccount_id = (SELECT subaccount_id FROM subaccount_admin WHERE subaccount_admin_email = ?)", email);
				verificationQueryBuilder = new SelectQueryBuilder("SELECT subaccount_id FROM subaccount_admin");
				verificationQueryBuilder.appendEqualsCondition("subaccount_admin_email", email);
				break;
		}

		if (id.equals("EMPTY")){
			if (!subaccountId.isEmpty()) {
				queryBuilder.appendEqualsCondition("subaccount_id", subaccountId, QueryBuilder.DATA_TYPE.UUID);
				supportEmailsMap = loadSupportEmails("subaccountId",subaccountId,context);
			}
		}else{
			queryBuilder.appendEqualsCondition("id", id, QueryBuilder.DATA_TYPE.UUID);
			supportEmailsMap = loadSupportEmails("ctaasSetupId",id,context);
		}

		if (verificationQueryBuilder != null) {
			if (currentRole.equals(SUBACCOUNT_ADMIN) || currentRole.equals(SUBACCOUNT_STAKEHOLDER))
				verificationQueryBuilder.appendEqualsCondition("subaccount_id", subaccountId, QueryBuilder.DATA_TYPE.UUID);
			else
				verificationQueryBuilder.appendEqualsCondition("s.id", subaccountId, QueryBuilder.DATA_TYPE.UUID);
		}

		// Connect to the database
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			PreparedStatement selectStmt = queryBuilder.build(connection)) {

			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
			ResultSet rs;
			JSONObject json = new JSONObject();

			if (verificationQueryBuilder != null && id.equals("EMPTY") && !subaccountId.isEmpty()) {
				try (PreparedStatement verificationStmt = verificationQueryBuilder.build(connection)) {
					context.getLogger().info("Execute SQL role verification statement: " + verificationStmt);
					rs = verificationStmt.executeQuery();
					if (!rs.next()) {
						context.getLogger().info(LOG_MESSAGE_FOR_INVALID_ID + email);
						json.put("error", MESSAGE_FOR_INVALID_ID);
						context.getLogger().info("User " + userId + " is leaving TekvLSGetAllCtaasSetups Azure function with error");
						return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
					}
				}
			}

			// Retrieve SpotLight setup.
			context.getLogger().info("Execute SQL statement: " + selectStmt);
			rs = selectStmt.executeQuery();
			// Return a JSON array of ctaas_setups
			JSONArray array = new JSONArray();
			while (rs.next()) {
				JSONObject item = new JSONObject();
				item.put("id", rs.getString("id"));
				item.put("subaccountId", rs.getString("subaccount_id"));
				item.put("status", rs.getString("status"));
				item.put("azureResourceGroup", rs.getString("azure_resource_group"));
				item.put("tapUrl", rs.getString("tap_url"));
				item.put("onBoardingComplete", rs.getBoolean("on_boarding_complete"));
				item.put("maintenance", rs.getBoolean("maintenance"));
				if(!subaccountId.isEmpty())
					item.put("supportEmails", supportEmailsMap.get(rs.getString("id")));
				array.put(item);
			}

			if(!id.equals("EMPTY") && array.isEmpty()){
				context.getLogger().info( LOG_MESSAGE_FOR_INVALID_ID + email);
				List<String> customerRoles = Arrays.asList(DISTRIBUTOR_FULL_ADMIN,CUSTOMER_FULL_ADMIN,SUBACCOUNT_ADMIN, SUBACCOUNT_STAKEHOLDER);
				json.put("error",customerRoles.contains(currentRole) ? MESSAGE_FOR_INVALID_ID : MESSAGE_ID_NOT_FOUND);
				context.getLogger().info("User " + userId + " is leaving TekvLSGetAllCtaasSetups Azure function with error");
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}

			json.put("ctaasSetups", array);
			context.getLogger().info("User " + userId + " is successfully leaving TekvLSGetAllCtaasSetups Azure function");
			return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();
		}
		catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSGetAllCtaasSetups Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
		catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSGetAllCtaasSetups Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}

	private Map<String, List<String>> loadSupportEmails(String idType,String id, ExecutionContext context) {
		Map<String, List<String>> emailsMap = new HashMap<>();
		SelectQueryBuilder queryBuilder;
		if(idType.equals("subaccountId")){
			queryBuilder = new SelectQueryBuilder("SELECT * FROM ctaas_support_email cse, ctaas_setup cs WHERE cse.ctaas_setup_id = cs.id",true);
			queryBuilder.appendEqualsCondition("subaccount_id", id, QueryBuilder.DATA_TYPE.UUID);
		}else{
			queryBuilder = new SelectQueryBuilder("SELECT * FROM ctaas_support_email");
			queryBuilder.appendEqualsCondition("ctaas_setup_id", id, QueryBuilder.DATA_TYPE.UUID);
		}
		try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
			 PreparedStatement statement = queryBuilder.build(connection)) {
			context.getLogger().info("Execute SQL statement: " + statement);
			ResultSet rs = statement.executeQuery();
			while (rs.next()) {
				emailsMap.computeIfAbsent(rs.getString("ctaas_setup_id"), k -> new ArrayList<>()).add(rs.getString("email"));
			}
		} catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
		}
		return emailsMap;
	}
}
