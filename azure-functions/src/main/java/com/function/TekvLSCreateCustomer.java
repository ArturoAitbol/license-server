package com.function;

import com.function.auth.Permission;
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
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSCreateCustomer 
{
	/**
	 * This function listens at endpoint "/api/customers". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/api/customers
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

		String currentRole = getRoleFromToken(request,context);
		if(currentRole.isEmpty()){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
			json.put("error", MESSAGE_FOR_UNAUTHORIZED);
			return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
		if(!hasPermission(currentRole, Permission.CREATE_CUSTOMER)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + currentRole);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		context.getLogger().info("Entering TekvLSCreateCustomer Azure function");

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

		//Build the sql query
		String sql;
		if (jobj.has(OPTIONAL_PARAMS.CUSTOMER_ID.value)) {
			sql = "INSERT INTO customer (name, type, test_customer, distributor_id, id) VALUES (?, ?, ?::boolean, ?::uuid, ?::uuid) RETURNING id;";
		} else {
			sql = "INSERT INTO customer (name, type, test_customer, distributor_id) VALUES (?, ?, ?::boolean, ?::uuid) RETURNING id;";
		}
		String adminEmailSql = "INSERT INTO customer_admin (admin_email, customer_id) VALUES (?,?::uuid);";

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			PreparedStatement statement = connection.prepareStatement(sql);
			PreparedStatement emailStatement = connection.prepareStatement(adminEmailSql)) {
			
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

			// Set statement parameters
			statement.setString(1, jobj.getString(MANDATORY_PARAMS.CUSTOMER_NAME.value));
			statement.setString(2, jobj.getString(MANDATORY_PARAMS.CUSTOMER_TYPE.value));
			statement.setString(3, jobj.getString(MANDATORY_PARAMS.TEST.value));

			statement.setString(4, jobj.has(OPTIONAL_PARAMS.DISTRIBUTOR_ID.value) ? jobj.getString(OPTIONAL_PARAMS.DISTRIBUTOR_ID.value) : null);
			if (jobj.has(OPTIONAL_PARAMS.CUSTOMER_ID.value))
				statement.setString(5, jobj.getString(OPTIONAL_PARAMS.CUSTOMER_ID.value));
			
			// Insert
			context.getLogger().info("Execute SQL statement: " + statement);
			ResultSet rs = statement.executeQuery();
			context.getLogger().info("Customer inserted successfully.");

			// Return the customer id in the response
			rs.next();
			String customerId = rs.getString("id");
			JSONObject json = new JSONObject();
			json.put("id", customerId);

			emailStatement.setString(1, jobj.getString(MANDATORY_PARAMS.CUSTOMER_ADMIN_EMAIL.value));
			emailStatement.setString(2, customerId);
			context.getLogger().info("Execute SQL statement: " + emailStatement);
			emailStatement.executeUpdate();
			context.getLogger().info("Admin emails inserted successfully.");

			return request.createResponseBuilder(HttpStatus.OK).body(json.toString()).build();
		}
		catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			String modifiedResponse = adminEmailUnique(customerUnique(e.getMessage()));
			json.put("error", modifiedResponse);
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

	private String adminEmailUnique(String errorMessage){
		if(errorMessage.contains("customer_admin_pk"))
			return "Administrator email already exists";
		return errorMessage;
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
		CUSTOMER_ID("customerId");

		private final String value;

		OPTIONAL_PARAMS(String value) {
			this.value = value;
		}
	}
}
