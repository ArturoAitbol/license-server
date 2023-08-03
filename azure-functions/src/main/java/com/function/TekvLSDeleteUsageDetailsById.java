package com.function;

import com.function.auth.Resource;
import com.function.db.QueryBuilder;
import com.function.db.SelectQueryBuilder;
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
import java.util.ArrayList;
import java.util.Optional;

import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSDeleteUsageDetailsById 
{
	/**
	 * This function listens at endpoint "/v1.0/usageDetails". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/usageDetails
	 */
	@FunctionName("TekvLSDeleteUsageDetailsById")
	public HttpResponseMessage run(
			@HttpTrigger(
				name = "req",
				methods = {HttpMethod.PUT},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "usageDetails/{id}")
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
		if(!hasPermission(roles, Resource.DELETE_USAGE_DETAILS)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSDeleteUsageDetailsById Azure function");
		JSONObject json = new JSONObject();
		// Parse request body and extract parameters needed
		String requestBody = request.getBody().orElse("");
		context.getLogger().info("Request body: " + requestBody);
		if (requestBody.isEmpty()) {
			context.getLogger().info("error: request body is empty.");
			json.put("error", "error: request body is empty.");
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}
		JSONObject jobj;
		try {
			jobj = new JSONObject(requestBody);
			// Check mandatory params to be present
			for (MANDATORY_PARAMS mandatoryParam: MANDATORY_PARAMS.values()) {
				if (!jobj.has(mandatoryParam.value)) throw new Exception("Missing mandatory parameter: " + mandatoryParam.value);
			}
			JSONArray deletedDays = jobj.getJSONArray(MANDATORY_PARAMS.DELETED_DAYS.value);
			if (deletedDays.length() < 1) throw new Exception("Missing mandatory parameter: " + MANDATORY_PARAMS.DELETED_DAYS.value);
		} catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSDeleteUsageDetailsById Azure function with error");
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}

		String sql = "DELETE FROM usage_detail WHERE consumption_id= ?::uuid AND id = ANY (?);";
		SelectQueryBuilder queryBuilder = new SelectQueryBuilder("SELECT count(*) FROM usage_detail");
		queryBuilder.appendEqualsCondition("consumption_id", id, QueryBuilder.DATA_TYPE.UUID);
		String deleteLicense = "DELETE  FROM  license_consumption WHERE id = ?::uuid";

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			PreparedStatement statement = connection.prepareStatement(sql);
			PreparedStatement consumptionId = queryBuilder.build(connection)) {
			
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

			ArrayList<String> deletedDays = new ArrayList<>();
			jobj.getJSONArray(MANDATORY_PARAMS.DELETED_DAYS.value).forEach(object -> deletedDays.add(object.toString()));
			Array array = statement.getConnection().createArrayOf("UUID", deletedDays.toArray(new String[0]));
			statement.setString(1, id);
			statement.setArray(2, array);

			context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + statement);
			statement.executeUpdate();
			context.getLogger().info("License usage delete successfully.");

			ResultSet rs = consumptionId.executeQuery();
			rs.next();

			if(rs.getInt("count") == 0 ){
				try(PreparedStatement deleteLicenseStatement = connection.prepareStatement(deleteLicense)){
					deleteLicenseStatement.setString(1, id);
					context.getLogger().info("Execute SQL statement: " + deleteLicenseStatement);
					deleteLicenseStatement.executeUpdate();
					context.getLogger().info("License delete successfully.");
				}
			}
			context.getLogger().info("User " + userId + " is successfully leaving TekvLSDeleteUsageDetailsById Azure function");
			return request.createResponseBuilder(HttpStatus.OK).build();
		}
		catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSDeleteUsageDetailsById Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
		catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSDeleteUsageDetailsById Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}

	private enum MANDATORY_PARAMS {
		DELETED_DAYS("deletedDays");

		private final String value;

		MANDATORY_PARAMS(String value) {
			this.value = value;
		}
	}
}
