package com.function;

import com.function.auth.Resource;
import com.function.db.QueryBuilder;
import com.function.db.UpdateQueryBuilder;
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
import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSModifyProjectById 
{
	/**
	 * This function listens at endpoint "/v1.0/projects/{id}". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/projects/{id}
	 */
	@FunctionName("TekvLSModifyProjectById")
	public HttpResponseMessage run(
			@HttpTrigger(
				name = "req",
				methods = {HttpMethod.PUT},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "projects/{id}")
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
		if(!hasPermission(roles, Resource.MODIFY_PROJECT)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSModifyProjectById Azure function");
		
		// Parse request body and extract parameters needed
		String requestBody = request.getBody().orElse("");
		context.getLogger().info("Request body: " + requestBody);
		if (requestBody.isEmpty()) {
			context.getLogger().info("error: request body is empty.");
			JSONObject json = new JSONObject();
			json.put("error", "error: request body is empty.");
			context.getLogger().info("User " + userId + " is leaving TekvLSModifyProjectById Azure function with error");
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}
		JSONObject jobj;
		try {
			jobj = new JSONObject(requestBody);
		}  catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSModifyProjectById Azure function with error");
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}

		// Build the sql query
		UpdateQueryBuilder queryBuilder = new UpdateQueryBuilder("project");
		int optionalParamsFound = 0;
		for (OPTIONAL_PARAMS param: OPTIONAL_PARAMS.values()) {
			try {
				String paramValue = jobj.getString(param.jsonAttrib);
				queryBuilder.appendValueModification(param.columnName, paramValue, param.dataType);
				if(param.jsonAttrib.equals(OPTIONAL_PARAMS.STATUS.jsonAttrib) && paramValue.equals("Open")){
					queryBuilder.appendValueModificationToNull(OPTIONAL_PARAMS.CLOSE_DATE.columnName);
				}
				optionalParamsFound++;
			}
			catch (Exception e) {
				context.getLogger().info("Ignoring exception: " + e);
			}
		}
		if (optionalParamsFound == 0) {
			context.getLogger().info("User " + userId + " is successfully leaving TekvLSModifyProjectById Azure function");
			return request.createResponseBuilder(HttpStatus.OK).build();
		}

		queryBuilder.appendWhereStatement("id", id, QueryBuilder.DATA_TYPE.UUID);

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
			PreparedStatement statement = queryBuilder.build(connection)) {
			
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
			context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + statement);
			statement.executeUpdate();
			context.getLogger().info("Project updated successfully."); 
			
			context.getLogger().info("User " + userId + " is successfully leaving TekvLSModifyProjectById Azure function");
			return request.createResponseBuilder(HttpStatus.OK).build();
		}
		catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSModifyProjectById Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
		catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSModifyProjectById Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}

	private enum OPTIONAL_PARAMS {
		LICENSE_ID("licenseId", "license_id", QueryBuilder.DATA_TYPE.UUID),
		CODE("projectNumber", "code", QueryBuilder.DATA_TYPE.VARCHAR),
		NAME("projectName", "name", QueryBuilder.DATA_TYPE.VARCHAR),
		STATUS("status", "status", "project_status_type_enum"),
		OPEN_DATE("openDate", "open_date", QueryBuilder.DATA_TYPE.TIMESTAMP),
		CLOSE_DATE("closeDate", "close_date", QueryBuilder.DATA_TYPE.TIMESTAMP),
		PROJECT_OWNER("projectOwner", "project_owner", QueryBuilder.DATA_TYPE.VARCHAR);

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
