package com.function;

import com.function.auth.Permission;
import com.function.util.FeatureToggles;
import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpMethod;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;

import java.sql.*;
import java.util.Optional;

import io.jsonwebtoken.Claims;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSCreateSubaccount 
{
	/**
	 * This function listens at endpoint "/v1.0/subaccounts". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/subaccounts
	 */
	@FunctionName("TekvLSCreateSubaccount")
	public HttpResponseMessage run(
			@HttpTrigger(
				name = "req",
				methods = {HttpMethod.POST},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "subaccounts")
				HttpRequestMessage<Optional<String>> request,
				final ExecutionContext context) 
	{

		Claims tokenClaims = getTokenClaimsFromHeader(request, context);
		String currentRole = getRoleFromToken(tokenClaims,context);
		if(currentRole.isEmpty()){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
			json.put("error", MESSAGE_FOR_UNAUTHORIZED);
			return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
		if(!hasPermission(currentRole, Permission.CREATE_SUBACCOUNT)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + currentRole);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		context.getLogger().info("Entering TekvLSCreateSubaccount Azure function");

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

		// Build the sql queries
		String insertValuesClause = FeatureToggles.INSTANCE.isFeatureActive("services-feature")? 
			"(name, customer_id, services) VALUES (?, ?::uuid, ?)" : "(name, customer_id) VALUES (?, ?::uuid)";
		String insertSql = "INSERT INTO subaccount " + insertValuesClause + " RETURNING id;";
		String verifyEmailsSql = "SELECT count(*) FROM subaccount_admin WHERE subaccount_admin_email=?;";
		String adminEmailSql = "INSERT INTO subaccount_admin (subaccount_admin_email, subaccount_id) VALUES (?, ?::uuid);";

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			PreparedStatement insertStmt = connection.prepareStatement(insertSql);
			PreparedStatement verifyEmailStmt = connection.prepareStatement(verifyEmailsSql);
			PreparedStatement insertEmailStmt = connection.prepareStatement(adminEmailSql)) {
			
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

			// Set statement parameters
			verifyEmailStmt.setString(1, jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_ADMIN_EMAIL.value));

			context.getLogger().info("Execute SQL statement: " + verifyEmailStmt);
			ResultSet rsEmails = verifyEmailStmt.executeQuery();
			rsEmails.next();
			if (rsEmails.getInt(1) > 0){
				JSONObject json = new JSONObject();
				json.put("error", "Subaccount email already exists");
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}

			//Insert parameters to statement
			insertStmt.setString(1, jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_NAME.value));
			insertStmt.setString(2, jobj.getString(MANDATORY_PARAMS.CUSTOMER_ID.value));
			if (FeatureToggles.INSTANCE.isFeatureActive("services-feature")) {
				if (jobj.has(OPTIONAL_PARAMS.SERVICES.value)) {
					String subaccountServices = jobj.getString(OPTIONAL_PARAMS.SERVICES.value);
					subaccountServices = !subaccountServices.equals("") ? subaccountServices : "tokenConsumption";
					insertStmt.setString(3,subaccountServices);
				} else {
					String defaultService = "tokenConsumption";
					insertStmt.setString(3, defaultService);
				}
			}

			// Insert
			String userId = getUserIdFromToken(tokenClaims,context);
			context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + insertStmt);
			ResultSet rs = insertStmt.executeQuery();
			context.getLogger().info("Subaccount inserted successfully.");

			// Return the id in the response
			rs.next();
			String subaccountId = rs.getString("id");
			JSONObject json = new JSONObject();
			json.put("id", subaccountId);

			//Insert parameters to statement
			insertEmailStmt.setString(1, jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_ADMIN_EMAIL.value));
			insertEmailStmt.setString(2, subaccountId);

			context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + insertEmailStmt);
			insertEmailStmt.executeUpdate();
			context.getLogger().info("Subaccount admin email inserted successfully.");

			return request.createResponseBuilder(HttpStatus.OK).body(json.toString()).build();
		}
		catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			String modifiedResponse= subaccountUnique(e.getMessage());
			json.put("error", modifiedResponse);
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
		catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}
	}

	private String subaccountUnique(String errorMessage){
		String response = errorMessage;
		
		if(errorMessage.contains("subaccount_unique") && errorMessage.contains("already exists"))
			response = "Subaccount already exists";
		return response;
	}

	private enum MANDATORY_PARAMS {

		SUBACCOUNT_NAME("subaccountName"),
		CUSTOMER_ID("customerId"),
		SUBACCOUNT_ADMIN_EMAIL("subaccountAdminEmail");

		private final String value;

		MANDATORY_PARAMS(String value) {
			this.value = value;
		}
	}

	private enum OPTIONAL_PARAMS {
		SERVICES("services");

		private final String value; 

		OPTIONAL_PARAMS(String value) {
			this.value = value; 
		}
	}
}
