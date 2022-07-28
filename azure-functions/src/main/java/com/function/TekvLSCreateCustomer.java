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

		// The expected parameters (and their corresponding column name in the database)
		String[][] mandatoryParams = {
			{"customerName","name"},
			{"customerType","type"},
		    {"test","test_customer"}
		};
		// Build the sql query
		String sqlPart1 = "";
		String sqlPart2 = "";
		for (int i = 0; i < mandatoryParams.length; i++) {
			try {
				String paramValue = jobj.getString(mandatoryParams[i][0]);
				sqlPart1 += mandatoryParams[i][1] + ",";
				sqlPart2 += "'" + paramValue + "',";
			}
			catch (Exception e) {
				// Parameter not found
				context.getLogger().info("Caught exception: " + e.getMessage());
				JSONObject json = new JSONObject();
				json.put("error", "Missing mandatory parameter: " + mandatoryParams[i][0]);
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}
		}

		//Optional parameters
		if (jobj.has("distributorId")){
			sqlPart1 += "distributor_id,";
			sqlPart2 += "'" + jobj.getString("distributorId") + "',";
		}
		if (jobj.has("customerId")) {
			sqlPart1 += "id,";
			sqlPart2 += "'" + jobj.getString("customerId") + "',";
		}
		// Remove the comma after the last parameter and build the SQL statement
		sqlPart1 = sqlPart1.substring(0, sqlPart1.length() - 1);
		sqlPart2 = sqlPart2.substring(0, sqlPart2.length() - 1);
		String sql = "insert into customer (" + sqlPart1 + ") values (" + sqlPart2 + ");";

		if (!jobj.has("customerAdminEmail"))  {
			JSONObject json = new JSONObject();
			json.put("error", "Missing mandatory parameter: customerAdminEmail");
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			Statement statement = connection.createStatement();) {
			
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

			String adminEmail = jobj.getString("customerAdminEmail");
			String verifyEmails = "select count(*) from customer_admin where admin_email='" + adminEmail + "';";
			context.getLogger().info("Execute SQL statement: " + verifyEmails);
			ResultSet rsEmails = statement.executeQuery(verifyEmails);
			rsEmails.next();
			if (rsEmails.getInt(1) > 0){
				JSONObject json = new JSONObject();
				json.put("error", "Administrator email already exists");
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}
			
			// Insert
			try{
				context.getLogger().info("Execute SQL statement: " + sql);
				statement.executeUpdate(sql);
				context.getLogger().info("Customer inserted successfully."); 
			}catch(Exception e){
				context.getLogger().info("Caught exception: " + e.getMessage());
				JSONObject json = new JSONObject();
				String modifiedResponse= customerUnique(e.getMessage());
				json.put("error", modifiedResponse);
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}

			// Return the customer id in the response
			sql = "select id from customer where name = '" + jobj.getString("customerName") + "' and type = '" + jobj.getString("customerType") + "';";
			context.getLogger().info("Execute SQL statement: " + sql);
			ResultSet rs = statement.executeQuery(sql);
			rs.next();
			String customerId = rs.getString("id");
			JSONObject json = new JSONObject();
			json.put("id", customerId);

			String adminEmailSql = "INSERT INTO customer_admin (admin_email, customer_id) VALUES ('" + adminEmail + "', '" + customerId + "');";
			context.getLogger().info("Execute SQL statement: " + adminEmailSql);
			statement.executeUpdate(adminEmailSql);
			context.getLogger().info("Admin emails inserted successfully.");

			return request.createResponseBuilder(HttpStatus.OK).body(json.toString()).build();
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
	private String customerUnique(String errorMessage){
		String response = errorMessage;

		if(errorMessage.contains("customer_unique") && errorMessage.contains("already exists"))
			response = "Customer already exists";
		return response;
	}
}
