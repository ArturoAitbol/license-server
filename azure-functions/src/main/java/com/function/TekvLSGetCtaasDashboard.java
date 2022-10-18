package com.function;

import static com.function.auth.RoleAuthHandler.*;
import static com.function.auth.Roles.*;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Optional;

import org.json.JSONArray;
import org.json.JSONObject;

import com.function.auth.Resource;
import com.function.clients.PowerBIClient;
import com.function.db.QueryBuilder;
import com.function.db.SelectQueryBuilder;
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

public class TekvLSGetCtaasDashboard {
	/**
	* This function listens at endpoint "/v1.0/ctaasDashboard?subaccountId={subaccountId}". Two ways to invoke it using "curl" command in bash:
	* 1. curl -d "HTTP Body" {your host}/v1.0/ctaasDashboard?subaccountId={subaccountId}
	* 2. curl "{your host}/v1.0/ctaasDashboard"
	*/
	@FunctionName("TekvLSGetCtaasDashboard")
		public HttpResponseMessage run(
		@HttpTrigger(
		name = "req",
		methods = {HttpMethod.GET},
		authLevel = AuthorizationLevel.ANONYMOUS,
		route = "ctaasDashboard/{subaccountId=EMPTY}")
		HttpRequestMessage<Optional<String>> request,
		@BindingName("subaccountId") String subaccountId,
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
		if(!hasPermission(roles, Resource.GET_CTAAS_DASHBOARD)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		context.getLogger().info("Entering TekvLSGetCtaasDashboard Azure function");
		
		if (subaccountId.equals("EMPTY") || subaccountId.isEmpty()){
			context.getLogger().info( MESSAGE_SUBACCOUNT_ID_NOT_FOUND + subaccountId);
			JSONObject json = new JSONObject();
			json.put("error",MESSAGE_SUBACCOUNT_ID_NOT_FOUND);
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}
		
  
		// Build SQL statement
		SelectQueryBuilder queryBuilder = new SelectQueryBuilder("SELECT * FROM ctaas_setup");
		SelectQueryBuilder verificationQueryBuilder = null;
		String email = getEmailFromToken(tokenClaims,context);

		// adding conditions according to the role
		String currentRole = evaluateRoles(roles);
		switch (currentRole){
			case CUSTOMER_FULL_ADMIN:
				verificationQueryBuilder = new SelectQueryBuilder("SELECT s.id FROM subaccount s, customer_admin ca");
				verificationQueryBuilder.appendCustomCondition("s.customer_id = ca.customer_id AND admin_email = ?", email);
				break;
			case SUBACCOUNT_ADMIN:
			case SUBACCOUNT_STAKEHOLDER:
				verificationQueryBuilder = new SelectQueryBuilder("SELECT subaccount_id FROM subaccount_admin");
				verificationQueryBuilder.appendEqualsCondition("subaccount_admin_email", email);
				break;
		}

		queryBuilder.appendEqualsCondition("subaccount_id", subaccountId, QueryBuilder.DATA_TYPE.UUID);

		if (verificationQueryBuilder != null) {
			if (currentRole.equals(SUBACCOUNT_ADMIN) || currentRole.equals(SUBACCOUNT_STAKEHOLDER))
				verificationQueryBuilder.appendEqualsCondition("subaccount_id", subaccountId, QueryBuilder.DATA_TYPE.UUID);
			else
				verificationQueryBuilder.appendEqualsCondition("s.id", subaccountId, QueryBuilder.DATA_TYPE.UUID);
		}

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			PreparedStatement selectStmt = queryBuilder.build(connection)) {

			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
			ResultSet rs;
			JSONObject json = new JSONObject();

			if (verificationQueryBuilder != null) {
				try (PreparedStatement verificationStmt = verificationQueryBuilder.build(connection)) {
					context.getLogger().info("Execute SQL role verification statement: " + verificationStmt);
					rs = verificationStmt.executeQuery();
					if (!rs.next()) {
						context.getLogger().info(MESSAGE_SUBACCOUNT_ID_NOT_FOUND + email);
						json.put("error", MESSAGE_SUBACCOUNT_ID_NOT_FOUND);
						return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
					}
				}
			}

			// Retrieve SpotLight setup.
			context.getLogger().info("Execute SQL statement: " + selectStmt);
			rs = selectStmt.executeQuery();
			// Return a JSON array of ctaas_setups
			JSONObject item = null;
			if (rs.next()) {
				item = new JSONObject();
				item.put("powerBiWorkspaceId", rs.getString("powerbi_workspace_id"));
				item.put("powerBiReportId", rs.getString("powerbi_report_id"));
			}

			if(item == null){
				context.getLogger().info( LOG_MESSAGE_FOR_INVALID_SUBACCOUNT_ID + email);
				json.put("error",MESSAGE_SUBACCOUNT_ID_NOT_FOUND);
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}
			
			JSONObject powerBiInfo = new JSONObject();

			if(FeatureToggles.INSTANCE.isFeatureActive("powerBi-dashboard"))
				powerBiInfo = PowerBIClient.getPowerBiDetails(item.getString("powerBiWorkspaceId"), item.getString("powerBiReportId"), context);

			json.put("powerBiInfo", powerBiInfo);
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
}
