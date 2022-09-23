package com.function;

import java.sql.*;
import java.util.Optional;

import com.function.clients.GraphAPIClient;
import com.function.util.FeatureToggles;
import org.json.JSONArray;
import org.json.JSONObject;

import com.function.auth.Permission;
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

import static com.function.auth.RoleAuthHandler.*;

public class TekvLSModifyCtaasSetupById {
	/**
	 * This function listens at endpoint "/v1.0/ctaasSetups/{id}". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/ctaasSetups/{id}
	 */
	@FunctionName("TekvLSModifyCtaasSetupById")
	public HttpResponseMessage run(
			@HttpTrigger(
				name = "req",
				methods = {HttpMethod.PUT},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "ctaasSetups/{id}")
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
		if(!hasPermission(roles, Permission.MODIFY_CTAAS_SETUP)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		context.getLogger().info("Entering TekvLSModifyCtaasSetupById Azure function");
		
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
		UpdateQueryBuilder queryBuilder = new UpdateQueryBuilder("ctaas_setup");
		int optionalParamsFound = 0;
		for (OPTIONAL_PARAMS param: OPTIONAL_PARAMS.values()) {
			try {
				queryBuilder.appendValueModification(param.columnName, jobj.getString(param.jsonAttrib), param.dataType);
				optionalParamsFound++;
			}
			catch (Exception e) {
				context.getLogger().info("Ignoring exception: " + e);
			}
		}
		if (optionalParamsFound == 0) {
			return request.createResponseBuilder(HttpStatus.OK).build();
		}
		queryBuilder.appendWhereStatement("id", id, QueryBuilder.DATA_TYPE.UUID);

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			PreparedStatement statement = queryBuilder.build(connection)) {
			
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
			String userId = getUserIdFromToken(tokenClaims,context);
			context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + statement);
			statement.executeUpdate();
			context.getLogger().info("Ctaas_setup updated successfully.");

			if(FeatureToggles.INSTANCE.isFeatureActive("ad-user-creation") && FeatureToggles.INSTANCE.isFeatureActive("ad-ctaas-user-creation-after-setup-ready"))
					this.ADUserCreation(jobj,context,connection);

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

	private void ADUserCreation(JSONObject jobj,ExecutionContext context, Connection connection) throws Exception {
		String statusParam = OPTIONAL_PARAMS.STATUS.jsonAttrib;
		if(jobj.has(statusParam) && jobj.getString(statusParam).equals("SETUP_READY")){
			String subaccountIdParam = OPTIONAL_PARAMS.SUBACCOUNT_ID.jsonAttrib;
			String subaccountId = jobj.getString(subaccountIdParam);
			final String subaccountEmailsSql = "SELECT s.name, sa.subaccount_admin_email " +
					"FROM subaccount s, subaccount_admin sa WHERE sa.subaccount_id = s.id AND s.id = ?::uuid;";
			try(PreparedStatement subaccountEmailsStmt = connection.prepareStatement(subaccountEmailsSql)){
				subaccountEmailsStmt.setString(1,subaccountId);
				ResultSet rs = subaccountEmailsStmt.executeQuery();
				while(rs.next()){
					GraphAPIClient.createGuestUserWithProperRole(rs.getString("name"),
							rs.getString("subaccount_admin_email"),SUBACCOUNT_ADMIN,context);
				}
			}
		}
	}

	private enum OPTIONAL_PARAMS {
		SUBACCOUNT_ID("subaccountId", "subaccount_id", QueryBuilder.DATA_TYPE.UUID),
		AZURE_RESOURCE_GROUP("azureResourceGroup", "azure_resource_group", QueryBuilder.DATA_TYPE.VARCHAR),
		TAP_URL("tapUrl", "tap_url", QueryBuilder.DATA_TYPE.VARCHAR),
		STATUS("status", "status", QueryBuilder.DATA_TYPE.VARCHAR),
		ON_BOARDING_COMPLETE("onBoardingComplete", "on_boarding_complete", QueryBuilder.DATA_TYPE.BOOLEAN),
		POWERBI_WORKSPACE_ID("powerbiWorkspaceId", "powerbi_workspace_id", QueryBuilder.DATA_TYPE.VARCHAR),
		POWERBI_REPORT_ID("powerbiReportId", "powerbi_report_id", QueryBuilder.DATA_TYPE.VARCHAR);

		private final String jsonAttrib;
		private final String columnName;

		private final String dataType;

		OPTIONAL_PARAMS(String jsonAttrib, String columnName, String dataType) {
			this.jsonAttrib = jsonAttrib;
			this.columnName = columnName;
			this.dataType = dataType;
		}

		OPTIONAL_PARAMS(String jsonAttrib, String columnName, QueryBuilder.DATA_TYPE dataType) {
			this.jsonAttrib = jsonAttrib;
			this.columnName = columnName;
			this.dataType = dataType.getValue();
		}
	}
}
