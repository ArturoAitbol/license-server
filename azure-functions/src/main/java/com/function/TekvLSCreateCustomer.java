package com.function;

import com.function.auth.Resource;
import com.function.clients.GraphAPIClient;
import com.function.exceptions.ADException;
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
public class TekvLSCreateCustomer 
{
	/**
	 * This function listens at endpoint "/v1.0/customers". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/customers
	 */
	@FunctionName("TekvLSCreateCustomer")
	public HttpResponseMessage run(
			@HttpTrigger(
				name = "req",
				methods = {HttpMethod.POST},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "customers")
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
		if(!hasPermission(roles, Resource.CREATE_CUSTOMER)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSCreateCustomer Azure function");

		// Parse request body and extract parameters needed
		String requestBody = request.getBody().orElse("");
		context.getLogger().info("Request body: " + requestBody);
		if (requestBody.isEmpty()) {
			context.getLogger().info("error: request body is empty.");
			JSONObject json = new JSONObject();
			json.put("error", "error: request body is empty.");
			context.getLogger().info("User " + userId + " is leaving TekvLSCreateCustomer Azure function with error");
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
			context.getLogger().info("User " + userId + " is leaving TekvLSCreateCustomer Azure function with error");
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}

		// Check mandatory params to be present
		for (MANDATORY_PARAMS mandatoryParam: MANDATORY_PARAMS.values()) {
			if (!jobj.has(mandatoryParam.value)) {
				// Parameter not found
				context.getLogger().info("Missing mandatory parameter: " + mandatoryParam.value);
				JSONObject json = new JSONObject();
				json.put("error", "Missing mandatory parameter: " + mandatoryParam.value);
				context.getLogger().info("User " + userId + " is leaving TekvLSCreateCustomer Azure function with error");
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}
		}

		//Build the sql query
		String sql;
		if (jobj.has(OPTIONAL_PARAMS.CUSTOMER_ID.value)) {
			sql = "INSERT INTO customer (name, type, test_customer, distributor_id, id) VALUES (?, ?, ?::boolean, ?::uuid, ?::uuid) RETURNING id;";
		} else {
			sql = "INSERT INTO customer (name, type, test_customer, distributor_id) VALUES (?, ?, ?::boolean, ?::uuid) RETURNING id;";
		}
		String adminEmailSql = "INSERT INTO customer_admin (admin_email, customer_id) VALUES (?,?::uuid);";
		String verifyAdminEmailSql = "SELECT count(*) FROM customer_admin WHERE admin_email = ?;";
		String verifySubAdminEmailSql = "SELECT count(*) FROM subaccount_admin WHERE subaccount_admin_email=?;";

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			PreparedStatement statement = connection.prepareStatement(sql);
			PreparedStatement verifyEmailStmt = connection.prepareStatement(verifyAdminEmailSql);
			PreparedStatement verifySubAdminEmailStmt = connection.prepareStatement(verifySubAdminEmailSql);
			PreparedStatement emailStatement = connection.prepareStatement(adminEmailSql)) {
			
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

			// Set statement parameters
			final String adminEmail = jobj.getString(MANDATORY_PARAMS.CUSTOMER_ADMIN_EMAIL.value).toLowerCase();

			verifyEmailStmt.setString(1, adminEmail);

			context.getLogger().info("Execute SQL statement: " + verifyEmailStmt);
			ResultSet rsEmails = verifyEmailStmt.executeQuery();
			rsEmails.next();
			if (rsEmails.getInt(1) > 0){
				context.getLogger().severe("Administrator email already exists");
				JSONObject json = new JSONObject();
				json.put("error", "Administrator email already exists");
				context.getLogger().info("User " + userId + " is leaving TekvLSCreateCustomer Azure function with error");
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}
			
			
			if (jobj.has(OPTIONAL_PARAMS.SUBACCOUNT_ADMIN_EMAIL.value)) {
				verifySubAdminEmailStmt.setString(1, jobj.getString(OPTIONAL_PARAMS.SUBACCOUNT_ADMIN_EMAIL.value).toLowerCase());

				context.getLogger().info("Execute SQL statement: " + verifySubAdminEmailStmt);
				ResultSet rsSubEmails = verifySubAdminEmailStmt.executeQuery();
				rsSubEmails.next();
				if (rsSubEmails.getInt(1) > 0){
					context.getLogger().severe("Sub Account Admin email already exists");
					JSONObject json = new JSONObject();
					json.put("error", "Subaccount email already exists");
					context.getLogger().info("User " + userId + " is leaving TekvLSCreateCustomer Azure function with error");
					return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
				}
			}

			statement.setString(1, jobj.getString(MANDATORY_PARAMS.CUSTOMER_NAME.value));
			statement.setString(2, jobj.getString(MANDATORY_PARAMS.CUSTOMER_TYPE.value));
			statement.setString(3, jobj.getString(MANDATORY_PARAMS.TEST.value));

			statement.setString(4, jobj.has(OPTIONAL_PARAMS.DISTRIBUTOR_ID.value) ? jobj.getString(OPTIONAL_PARAMS.DISTRIBUTOR_ID.value) : null);
			if (jobj.has(OPTIONAL_PARAMS.CUSTOMER_ID.value))
				statement.setString(5, jobj.getString(OPTIONAL_PARAMS.CUSTOMER_ID.value));
			
			// Insert
			context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + statement);
			ResultSet rs = statement.executeQuery();
			context.getLogger().info("Customer inserted successfully.");

			// Return the customer id in the response
			rs.next();
			String customerId = rs.getString("id");
			JSONObject json = new JSONObject();
			json.put("id", customerId);

			emailStatement.setString(1, adminEmail);
			emailStatement.setString(2, customerId);
			context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + emailStatement);
			emailStatement.executeUpdate();
			context.getLogger().info("Admin emails inserted successfully.");

			if(FeatureToggleService.isFeatureActiveByName("ad-customer-user-creation") && FeatureToggleService.isFeatureActiveByName("ad-license-service-user-creation")) {
				String customerName = jobj.getString(MANDATORY_PARAMS.CUSTOMER_NAME.value);
				GraphAPIClient.createGuestUserWithProperRole(customerName, adminEmail, CUSTOMER_FULL_ADMIN, context);
				context.getLogger().info("Guest user created successfully (AD).");
			}

			context.getLogger().info("User " + userId + " is successfully leaving TekvLSCreateCustomer Azure function");
			return request.createResponseBuilder(HttpStatus.OK).body(json.toString()).build();
		}
		catch (ADException e){
			context.getLogger().info("AD exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSCreateCustomer Azure function with error");
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}
		catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			String modifiedResponse = customerUnique(e.getMessage());
			json.put("error", modifiedResponse);
			context.getLogger().info("User " + userId + " is leaving TekvLSCreateCustomer Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
		catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}
	private String customerUnique(String errorMessage){
		if(errorMessage.contains("customer_unique"))
			return "Customer already exists";
		return "SQL Exception: " + errorMessage;
	}

	private enum MANDATORY_PARAMS {
		CUSTOMER_NAME("customerName"),
		CUSTOMER_TYPE("customerType"),
		TEST("test"),
		CUSTOMER_ADMIN_EMAIL("customerAdminEmail");				

		private final String value;

		MANDATORY_PARAMS(String value) {
			this.value = value;
		}
	}

	private enum OPTIONAL_PARAMS {
		DISTRIBUTOR_ID("distributorId"),
		CUSTOMER_ID("customerId"),
		SUBACCOUNT_ADMIN_EMAIL("subaccountAdminEmail");

		private final String value;

		OPTIONAL_PARAMS(String value) {
			this.value = value;
		}
	}
}
