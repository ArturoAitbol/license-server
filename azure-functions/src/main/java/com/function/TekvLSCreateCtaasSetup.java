package com.function;

import static com.function.auth.RoleAuthHandler.LOG_MESSAGE_FOR_FORBIDDEN;
import static com.function.auth.RoleAuthHandler.LOG_MESSAGE_FOR_UNAUTHORIZED;
import static com.function.auth.RoleAuthHandler.MESSAGE_FOR_FORBIDDEN;
import static com.function.auth.RoleAuthHandler.MESSAGE_FOR_UNAUTHORIZED;
import static com.function.auth.RoleAuthHandler.getRoleFromToken;
import static com.function.auth.RoleAuthHandler.getTokenClaimsFromHeader;
import static com.function.auth.RoleAuthHandler.getUserIdFromToken;
import static com.function.auth.RoleAuthHandler.hasPermission;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

import org.json.JSONObject;

import com.function.auth.Permission;
import com.function.db.QueryBuilder;
import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpMethod;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;

import io.jsonwebtoken.Claims;

public class TekvLSCreateCtaasSetup {
	/**
	 * This function listens at endpoint "/v1.0/ctaasSetup". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/ctaasSetup
	 */
	@FunctionName("TekvLSCreateCtaasSetup")
	public HttpResponseMessage run(
			@HttpTrigger(
				name = "req",
				methods = {HttpMethod.POST},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "ctaasSetup")
				HttpRequestMessage<Optional<String>> request,
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
		if(!hasPermission(currentRole, Permission.CREATE_CTAAS_SETUP)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + currentRole);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		context.getLogger().info("Entering TekvLSCreateCtaasSetup Azure function");

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

		String sql;
		if (jobj.has(OPTIONAL_PARAMS.ON_BOARDING_COMPLETE.value)) {
			sql = "INSERT INTO public.ctaas_setup(subaccount_id, status, on_boarding_complete) VALUES (?::uuid, ?, ?) RETURNING id;";
		} else {
			sql = "INSERT INTO public.ctaas_setup(subaccount_id, status, on_boarding_complete) VALUES (?::uuid, ?, ?) RETURNING id;";
		}

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
				PreparedStatement statement = connection.prepareStatement(sql)) {
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

			// Set statement parameters
			statement.setString(1, jobj.getString(MANDATORY_PARAMS.SUBACCOUNT_ID.value));
			statement.setString(2, jobj.getString(MANDATORY_PARAMS.STATUS.value));

			if (jobj.has(OPTIONAL_PARAMS.ON_BOARDING_COMPLETE.value))
				statement.setBoolean(3,Boolean.valueOf(jobj.getString(OPTIONAL_PARAMS.ON_BOARDING_COMPLETE.value)));
			else
				statement.setBoolean(3, false);
			// Insert
			String userId = getUserIdFromToken(tokenClaims,context);
			context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + statement);
			ResultSet rs = statement.executeQuery();
			context.getLogger().info("Ctaas_setup inserted successfully."); 

			// Return the id in the response
			rs.next();
			JSONObject json = new JSONObject();
			json.put("id", rs.getString("id"));
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
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}

	private enum MANDATORY_PARAMS {
		SUBACCOUNT_ID("subaccountId"),
		STATUS("status");

		private final String value;

		MANDATORY_PARAMS(String value) {
			this.value = value;
		}
	}

	private enum OPTIONAL_PARAMS {
		ON_BOARDING_COMPLETE("onBoardingComplete");

		private final String value;

		OPTIONAL_PARAMS(String value) {
			this.value = value;
		}
	}
}
