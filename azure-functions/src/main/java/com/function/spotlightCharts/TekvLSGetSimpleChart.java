package com.function.spotlightCharts;

import com.function.auth.Resource;
import com.function.clients.TAPClient;
import com.function.db.SelectQueryBuilder;
import com.function.util.Constants;
import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpMethod;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;

import java.sql.*;
import java.util.*;

import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetSimpleChart {
	/**
	 * This function listens at endpoint "/v1.0/spotlightCharts/simpleChart". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/spotlightCharts/simpleChart
	 * 2. curl "{your host}/v1.0/spotlightCharts/simpleChart"
	 */

	private final String dbConnectionUrl = "jdbc:postgresql://" + Constants.TEMP_ONPOINT_ADDRESS + "/" + Constants.TEMP_ONPOINT_DB 
			+ System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + Constants.TEMP_ONPOINT_USER
			+ "&password=" + Constants.TEMP_ONPOINT_PWD;

	@FunctionName("TekvLSGetSimpleChart")
	public HttpResponseMessage run(
				@HttpTrigger(
				name = "req",
				methods = {HttpMethod.GET},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "spotlightCharts/simpleChart")
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
		if(!hasPermission(roles, Resource.GET_CHARTS)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		context.getLogger().info("Entering TekvLSGetAllCustomers Azure function");   
		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());
		String reportType = request.getQueryParameters().getOrDefault("reportType", "");
		String startDate = request.getQueryParameters().getOrDefault("startDate", "");
		String endDate = request.getQueryParameters().getOrDefault("endDate", "");

		String country = request.getQueryParameters().getOrDefault("country", "");
		String state = request.getQueryParameters().getOrDefault("state", "");
		String city = request.getQueryParameters().getOrDefault("city", "");

		String user = request.getQueryParameters().getOrDefault("user", "");

		String query = "SELECT sr.status, COUNT(sr.status) as status_counter " + 
				"FROM sub_result sr " +
				"LEFT JOIN test_result tr ON sr.testresultid = tr.id " +
				"LEFT JOIN run_instance r ON tr.runinstanceid = r.id " +
				"LEFT JOIN project p ON r.projectid = p.id " +
				"LEFT JOIN test_plan tp ON p.testplanid = tp.id " +
				"WHERE sr.finalResult = true AND sr.status != 'ABORTED' AND sr.status != 'RUNNING' AND sr.status != 'QUEUED' " +
				"AND (sr.failingerrortype IS NULL OR trim(sr.failingerrortype)='' OR sr.failingerrortype = 'Routing Issue' OR sr.failingerrortype = 'Teams Client Issue' " +
				"OR sr.failingerrortype = 'Media Quality' OR sr.failingerrortype = 'Media Routing')";
		switch (reportType) {
			case "CallingReliability":
				query += " AND tp.name='STS'";
				break;
			case "FeatureFunctionality":
				query += " AND tp.name='LTS'";
				break;
			case "VQ":
				query += " AND tp.name='POLQA'";
				break;
		}
		
		// Build region filter if present
		if (!country.isEmpty() || !user.isEmpty()) {
			query += " AND sr.id IN (SELECT sr2.id FROM test_result_resource trr LEFT JOIN sub_result sr2 ON trr.subresultid = sr2.id WHERE";
			if (user.isEmpty())
				query += " trr.country = CAST('" + country + "' AS varchar)";
			else {
				query += " trr.did = CAST('" + user + "' AS varchar)";
				if (!country.isEmpty())
					query += " AND trr.country = CAST('" + country + "' AS varchar)";
			}
			if (!state.isEmpty())
				query += " AND trr.state = CAST('" + state + "' AS varchar)";
			if (!city.isEmpty())
				query += " AND trr.city = CAST('" + city + "' AS varchar)";
			query += ")";
		}
		
		// Build SQL statement
		SelectQueryBuilder queryBuilder = new SelectQueryBuilder(query, true);
		queryBuilder.appendCustomCondition("sr.startdate >= CAST(? AS timestamp)", startDate);
		queryBuilder.appendCustomCondition("sr.startdate <= CAST(? AS timestamp)", endDate);
		queryBuilder.appendGroupBy("sr.status");

		// Connect to the API
		try {
			String statement = queryBuilder.getQuery();

			// Retrieve executions status list.
			context.getLogger().info("Execute SQL statement: " + statement);
			JSONArray rs = TAPClient.executeQuery(Constants.TEMP_ONPOINT_URL,statement,context);

			// Return a JSON array of status and counts (id and value)
			JSONObject json = new JSONObject();
			JSONArray array = new JSONArray();
			for(Object resultElement : rs) {
				JSONArray values = (JSONArray) resultElement;
				JSONObject item = new JSONObject();
				item.put("id", values.getString(0));
				item.put("value", values.getInt(1));
				array.put(item);
			}

			json.put("series", array);
			return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();
		}
		catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", "SQL Exception: " + e.getMessage());
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
		catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}
}
