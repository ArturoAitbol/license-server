package com.function;

import com.function.auth.Resource;
import com.function.clients.EmailClient;
import com.function.clients.GraphAPIClient;
import com.function.exceptions.ADException;
import com.function.util.Constants;
import com.function.util.FeatureToggleService;
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
import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;
import static com.function.auth.Roles.*;

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
		JSONArray roles = getRolesFromToken(tokenClaims,context);
		if(roles.isEmpty()){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
			json.put("error", MESSAGE_FOR_UNAUTHORIZED);
			return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
		if(!hasPermission(roles, Resource.CREATE_SUBACCOUNT)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSCreateSubaccount Azure function");

		// Parse request body and extract parameters needed
		String requestBody = request.getBody().orElse("");
		context.getLogger().info("Request body: " + requestBody);
		if (requestBody.isEmpty()) {
			context.getLogger().info("error: request body is empty.");
			JSONObject json = new JSONObject();
			json.put("error", "error: request body is empty.");
			context.getLogger().info("User " + userId + " is leaving TekvLSCreateSubaccount Azure function with error");
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
			context.getLogger().info("User " + userId + " is leaving TekvLSCreateSubaccount Azure function with error");
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}

		// Check mandatory params to be present
		for (MANDATORY_PARAMS mandatoryParam: MANDATORY_PARAMS.values()) {
			if (!jobj.has(mandatoryParam.value)) {
				// Parameter not found
				context.getLogger().info("Missing mandatory parameter: " + mandatoryParam.value);
				JSONObject json = new JSONObject();
				json.put("error", "Missing mandatory parameter: " + mandatoryParam.value);
				context.getLogger().info("User " + userId + " is leaving TekvLSCreateSubaccount Azure function with error");
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}
		}

		// Build the sql queries
		String insertValuesClause = "(name, customer_id, services) VALUES (?, ?::uuid, ?)";
		String insertSql = "INSERT INTO subaccount " + insertValuesClause + " RETURNING id;";
		String verifyEmailsSql = "SELECT count(*) FROM subaccount_admin WHERE subaccount_admin_email=?;";
		String adminEmailSql = "INSERT INTO subaccount_admin (subaccount_admin_email, subaccount_id) VALUES (?, ?::uuid);";
		String adminCtassSetupSql = "INSERT INTO ctaas_setup (subaccount_id, status, on_boarding_complete) VALUES (?::uuid, ?, ?::boolean);";
		String customerNameSql = "SELECT name FROM customer WHERE id = ?::uuid";

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			PreparedStatement insertStmt = connection.prepareStatement(insertSql);
			PreparedStatement verifyEmailStmt = connection.prepareStatement(verifyEmailsSql);
			PreparedStatement insertEmailStmt = connection.prepareStatement(adminEmailSql);
			PreparedStatement insertCtassSetupStmt = connection.prepareStatement(adminCtassSetupSql);
			PreparedStatement customerNameStmt = connection.prepareStatement(customerNameSql)) {
			
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

			// Set statement parameters
			verifyEmailStmt.setString(1, jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_ADMIN_EMAIL.value));

			context.getLogger().info("Execute SQL statement: " + verifyEmailStmt);
			ResultSet rsEmails = verifyEmailStmt.executeQuery();
			rsEmails.next();
			if (rsEmails.getInt(1) > 0){
				JSONObject json = new JSONObject();
				json.put("error", "Subaccount email already exists");
				context.getLogger().info("User " + userId + " is leaving TekvLSCreateSubaccount Azure function with error");
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}

			//Insert parameters to statement
			insertStmt.setString(1, jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_NAME.value));
			insertStmt.setString(2, jobj.getString(MANDATORY_PARAMS.CUSTOMER_ID.value));

			//services information
			String subaccountServices = "";
			
			if (jobj.has(OPTIONAL_PARAMS.SERVICES.value))
				subaccountServices = jobj.getString(OPTIONAL_PARAMS.SERVICES.value);
			if (subaccountServices.equals(""))
				subaccountServices = Constants.SubaccountServices.TOKEN_CONSUMPTION.value();
			insertStmt.setString(3, subaccountServices);
			

			// Insert
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
			
			if (subaccountServices.contains(Constants.SubaccountServices.SPOTLIGHT.value())) {
				insertCtassSetupStmt.setString(1, subaccountId);
				insertCtassSetupStmt.setString(2, Constants.CTaaSSetupStatus.INPROGRESS.value());
				insertCtassSetupStmt.setBoolean(3, Constants.DEFAULT_CTAAS_ON_BOARDING_COMPLETE);
	
				context.getLogger().info("Execute SQL statement: " + insertCtassSetupStmt);
				insertCtassSetupStmt.executeUpdate();
				context.getLogger().info("SpotLight setup default values inserted successfully.");

				// Get customer name to send spotlight invitation
				customerNameStmt.setString(1, jobj.getString(MANDATORY_PARAMS.CUSTOMER_ID.value));
				rs = customerNameStmt.executeQuery();
				rs.next();
				String customerName = rs.getString("name");

				if (FeatureToggleService.isFeatureActiveByName("welcomeEmail"))
					EmailClient.sendSpotlightWelcomeEmail(jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_ADMIN_EMAIL.value), customerName,subaccountId, context);
			} else {
				if (FeatureToggleService.isFeatureActiveByName("ad-license-service-user-creation"))
					this.ADUserCreation(jobj,context);
			}
			
			context.getLogger().info("User " + userId + " is successfully leaving TekvLSCreateSubaccount Azure function");
			return request.createResponseBuilder(HttpStatus.OK).body(json.toString()).build();
		}
		catch (ADException e){
			context.getLogger().info("AD exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSCreateSubaccount Azure function with error");
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}
		catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			String modifiedResponse= subaccountUnique(e.getMessage());
			json.put("error", modifiedResponse);
			context.getLogger().info("User " + userId + " is leaving TekvLSCreateSubaccount Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
		catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}

	private String subaccountUnique(String errorMessage){
		String response = errorMessage;
		
		if(errorMessage.contains("subaccount_unique"))
			response = "Subaccount already exists";
		return response;
	}

	private void ADUserCreation(JSONObject jobj, ExecutionContext context) throws Exception {
		String subaccountName = jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_NAME.value);
		String subaccountEmail = jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_ADMIN_EMAIL.value);
		GraphAPIClient.createGuestUserWithProperRole(subaccountName, subaccountEmail, SUBACCOUNT_ADMIN, context);
		context.getLogger().info("Guest user created successfully (AD).");
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
