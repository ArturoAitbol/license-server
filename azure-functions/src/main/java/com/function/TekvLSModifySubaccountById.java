package com.function;

import com.function.auth.Permission;
import com.function.db.QueryBuilder;
import com.function.db.UpdateQueryBuilder;
import com.function.util.FeatureToggles;
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
import java.util.Optional;

import io.jsonwebtoken.Claims;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSModifySubaccountById 
{
	/**
	 * This function listens at endpoint "/v1.0/subaccounts/{id}". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/subaccounts/{id}
	 */
	
	String DEFAULT_CTAAS_STATUS = "setup_inprogress";
	Boolean DEFAULT_CTAAS_ON_BOARDING_COMPLETE = false;

	@FunctionName("TekvLSModifySubaccountById")
	public HttpResponseMessage run(
			@HttpTrigger(
				name = "req",
				methods = {HttpMethod.PUT},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "subaccounts/{id}")
				HttpRequestMessage<Optional<String>> request,
				@BindingName("id") String id,
				final ExecutionContext context) 
	{

		Claims tokenClaims = getTokenClaimsFromHeader(request,context);
		String currentRole = getRoleFromToken(tokenClaims,context);
		if(currentRole.isEmpty()){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
			json.put("error", MESSAGE_FOR_UNAUTHORIZED);
			return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
		if(!hasPermission(currentRole, Permission.MODIFY_SUBACCOUNT)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + currentRole);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		context.getLogger().info("Entering TekvLSModifySubaccountById Azure function");
		
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
		UpdateQueryBuilder queryBuilder = new UpdateQueryBuilder("subaccount");
		int optionalParamsFound = 0;
		for (OPTIONAL_PARAMS param: OPTIONAL_PARAMS.values()) {
			try {
				if (!param.columnName.equals("services") || FeatureToggles.INSTANCE.isFeatureActive("services-feature")) {
					queryBuilder.appendValueModification(param.columnName, jobj.getString(param.jsonAttrib), param.dataType);
					optionalParamsFound++;
				}
			} catch (Exception e) {
				context.getLogger().info("Ignoring exception: " + e);
			}
		}
		if (optionalParamsFound == 0) {
			return request.createResponseBuilder(HttpStatus.OK).build();
		}

		queryBuilder.appendWhereStatement("id", id, QueryBuilder.DATA_TYPE.UUID);

		String verifyCtassSetupSql = "SELECT count(*) FROM ctaas_setup WHERE subaccount_id=?::uuid;";
		String adminCtassSetupSql = "INSERT INTO ctaas_setup (subaccount_id, status, on_boarding_complete) VALUES (?::uuid, ?, ?::boolean);";

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
			PreparedStatement statement = queryBuilder.build(connection);
			PreparedStatement verifyCtassSetupStmt = connection.prepareStatement(verifyCtassSetupSql);
			PreparedStatement insertCtassSetupStmt = connection.prepareStatement(adminCtassSetupSql)) {
			
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
			String userId = getUserIdFromToken(tokenClaims,context);
			context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + statement);
			statement.executeUpdate();
			context.getLogger().info("Subaccount updated successfully."); 

			if (FeatureToggles.INSTANCE.isFeatureActive("services-feature")) {
				if (jobj.has("services") && jobj.getString("services").contains("Ctaas")) {
					verifyCtassSetupStmt.setString(1, id);
		
					context.getLogger().info("Execute SQL statement: " + verifyCtassSetupStmt);
					ResultSet rsCtassSetup = verifyCtassSetupStmt.executeQuery();
					rsCtassSetup.next();
					if (rsCtassSetup.getInt(1) == 0) {
						insertCtassSetupStmt.setString(1, id);
						insertCtassSetupStmt.setString(2, DEFAULT_CTAAS_STATUS);
						insertCtassSetupStmt.setBoolean(3, DEFAULT_CTAAS_ON_BOARDING_COMPLETE);
			
						context.getLogger().info("Execute SQL statement: " + insertCtassSetupStmt);
						insertCtassSetupStmt.executeUpdate();
						context.getLogger().info("CTaaS setup default values inserted successfully.");
					}
				}
			}

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
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}
	}

	private enum OPTIONAL_PARAMS {
		NAME("subaccountName", "name", QueryBuilder.DATA_TYPE.VARCHAR),
		customer_id("customerId", "customer_id", QueryBuilder.DATA_TYPE.UUID),
		SERVICES("services", "services", QueryBuilder.DATA_TYPE.VARCHAR);

		private final String jsonAttrib;
		private final String columnName;

		private final String dataType;

		OPTIONAL_PARAMS(String jsonAttrib, String columnName, QueryBuilder.DATA_TYPE dataType) {
			this.jsonAttrib = jsonAttrib;
			this.columnName = columnName;
			this.dataType = dataType.getValue();
		}
	}
}
