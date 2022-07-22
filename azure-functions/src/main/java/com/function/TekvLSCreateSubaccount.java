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
public class TekvLSCreateSubaccount 
{
	/**
	 * This function listens at endpoint "/api/subaccounts". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/api/subaccounts
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

		String currentRole = getRoleFromToken(request,context);
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

		// The expected parameters (and their coresponding column name in the database) 
		String[][] mandatoryParams = {
			{"subaccountName","name"}, 
			{"customerId","customer_id"}
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
		// Remove the comma after the last parameter and build the SQL statement
		sqlPart1 = sqlPart1.substring(0, sqlPart1.length() - 1);
		sqlPart2 = sqlPart2.substring(0, sqlPart2.length() - 1);
		String sql = "insert into subaccount (" + sqlPart1 + ") values (" + sqlPart2 + ");";

		if (!jobj.has("subaccountAdminEmail"))  {
			JSONObject json = new JSONObject();
			json.put("error", "Missing mandatory parameter: subaccountAdminEmail");
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			Statement statement = connection.createStatement();) {
			
			context.getLogger().info("Successfully connected to:" + dbConnectionUrl);
			
			String adminEmail = jobj.getString("subaccountAdminEmail");
			String verifyEmails = "select count(*) from subaccount_admin where subaccount_admin_email='" +  adminEmail + "';";
			context.getLogger().info("Execute SQL statement: " + verifyEmails);
			ResultSet rsEmails = statement.executeQuery(verifyEmails);
			rsEmails.next();
			if (rsEmails.getInt(1) > 0){
				JSONObject json = new JSONObject();
				json.put("error", "Subaccount email already exists");
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}

			// Insert
				context.getLogger().info("Execute SQL statement: " + sql);
				statement.executeUpdate(sql);
				context.getLogger().info("License usage inserted successfully.");

			// Return the id in the response
			sql = "select id from subaccount where name = '" + jobj.getString("subaccountName") + "' and customer_id = '" + jobj.getString("customerId") + "';";
			context.getLogger().info("Execute SQL statement: " + sql);
			ResultSet rs = statement.executeQuery(sql);
			rs.next();
			String subaccountId = rs.getString("id");
			JSONObject json = new JSONObject();
			json.put("id", subaccountId);

			String adminEmailSql = "INSERT INTO subaccount_admin (subaccount_admin_email, subaccount_id) VALUES ('" + adminEmail + "', '" + subaccountId + "');";
			context.getLogger().info("Execute SQL statement: " + adminEmailSql);
			statement.executeUpdate(adminEmailSql);
			context.getLogger().info("Subaccount admin emails inserted successfully.");

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
}
