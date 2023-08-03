package com.function;

import com.function.auth.Resource;
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

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSCreateProject
{
	/**
	 * This function listens at endpoint "/v1.0/projects". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/projects
	 */
	@FunctionName("TekvLSCreateProject")
	public HttpResponseMessage run(
			@HttpTrigger(
				name = "req",
				methods = {HttpMethod.POST},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "projects")
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
		if(!hasPermission(roles, Resource.CREATE_PROJECT)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSCreateProject Azure function");

		// Parse request body and extract parameters needed
		String requestBody = request.getBody().orElse("");
		context.getLogger().info("Request body: " + requestBody);
		if (requestBody.isEmpty()) {
			context.getLogger().info("error: request body is empty.");
			JSONObject json = new JSONObject();
			json.put("error", "error: request body is empty.");
			context.getLogger().info("User " + userId + " is leaving TekvLSCreateProject Azure function with error");
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
			context.getLogger().info("User " + userId + " is leaving TekvLSCreateProject Azure function with error");
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}

		// Check mandatory params to be present
		for (MANDATORY_PARAMS mandatoryParam: MANDATORY_PARAMS.values()) {
			if (!jobj.has(mandatoryParam.value)) {
				// Parameter not found
				context.getLogger().info("Missing mandatory parameter: " + mandatoryParam.value);
				JSONObject json = new JSONObject();
				json.put("error", "Missing mandatory parameter: " + mandatoryParam.value);
				context.getLogger().info("User " + userId + " is leaving TekvLSCreateProject Azure function with error");
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}
		}

		// Build the sql query
		String sql = "INSERT INTO project (subaccount_id, code, name, status, open_date, project_owner, license_id) " +
					 "VALUES (?::uuid, ?, ?, ?::project_status_type_enum, ?::timestamp, ?, ?::uuid) RETURNING id;";

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			PreparedStatement statement = connection.prepareStatement(sql)) {
			
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

			// Set statement parameters
			statement.setString(1, jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_ID.value));
			statement.setString(2, jobj.getString(MANDATORY_PARAMS.PROJECT_NUMBER.value));
			statement.setString(3, jobj.getString(MANDATORY_PARAMS.PROJECT_NAME.value));
			statement.setString(4, jobj.getString(MANDATORY_PARAMS.STATUS.value));
			statement.setString(5, jobj.getString(MANDATORY_PARAMS.OPEN_DATE.value));
			statement.setString(6, jobj.has(OPTIONAL_PARAMS.PROJECT_OWNER.value) ? jobj.getString(OPTIONAL_PARAMS.PROJECT_OWNER.value) : null);
			statement.setString(7, jobj.getString(MANDATORY_PARAMS.LICENSE_ID.value));


			// Insert
			context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + statement);
			ResultSet rs = statement.executeQuery();
			context.getLogger().info("Project inserted successfully."); 
			// Return the id in the response
			rs.next();
			JSONObject json = new JSONObject();
			json.put("id", rs.getString("id"));
			context.getLogger().info("User " + userId + " is successfully leaving TekvLSCreateProject Azure function");
			return request.createResponseBuilder(HttpStatus.OK).body(json.toString()).build();
		} catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			String modifiedResponse= projectUnique(e.getMessage());
			json.put("error", modifiedResponse);
			context.getLogger().info("User " + userId + " is leaving TekvLSCreateProject Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		} catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSCreateProject Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}
	private String projectUnique(String errorMessage){
		String response = errorMessage;
		if(errorMessage.contains("project_unique"))
			response = "Project already exists";
		return response;
	}

	private enum MANDATORY_PARAMS {

		SUBACCOUNT_ID("subaccountId"),
		PROJECT_NAME("projectName"),
		PROJECT_NUMBER("projectNumber"),
		OPEN_DATE("openDate"),
		STATUS("status"),
		LICENSE_ID("licenseId");

		private final String value;

		MANDATORY_PARAMS(String value) {
			this.value = value;
		}
	}

	private enum OPTIONAL_PARAMS {
		PROJECT_OWNER("projectOwner");

		private final String value;

		OPTIONAL_PARAMS(String value) {
			this.value = value;
		}
	}
}
