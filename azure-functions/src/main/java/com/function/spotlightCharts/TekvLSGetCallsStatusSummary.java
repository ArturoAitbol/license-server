package com.function.spotlightCharts;

import com.function.auth.Resource;
import com.function.clients.TAPClient;
import com.function.db.QueryBuilder;
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
public class TekvLSGetCallsStatusSummary {
	/**
	 * This function listens at endpoint "/v1.0/spotlightCharts/simpleChart". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/spotlightCharts/simpleChart
	 * 2. curl "{your host}/v1.0/spotlightCharts/simpleChart"
	 */

	@FunctionName("TekvLSGetCallsStatusSummary")
	public HttpResponseMessage run(
				@HttpTrigger(
				name = "req",
				methods = {HttpMethod.GET},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "spotlightCharts/callsStatusSummary")
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
		String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSGetCallsStatusSummary Azure function");
		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());
		String subaccountId = request.getQueryParameters().getOrDefault("subaccountId", "");
		String startDate = request.getQueryParameters().getOrDefault("startDate", "");
		String endDate = request.getQueryParameters().getOrDefault("endDate", "");

		String regions = request.getQueryParameters().getOrDefault("regions","");
		String callsFilter = request.getQueryParameters().getOrDefault("callsFilter","");

		String users = request.getQueryParameters().getOrDefault("users", "");
		String usersClause = users.replace(",","', '");

		String query = "SELECT tp.name, " +
				"CASE WHEN er.fromdomain = er.todomain THEN 'p2p' " +
				"	  WHEN er.fromserviceprovider = er.toserviceprovider THEN 'onNet' " +
				"	  ELSE 'offNet' END AS call_type, " +
				" sr.status, COUNT(sr.status) as status_counter " +
				"FROM sub_result sr " +
				"LEFT JOIN execution_report er ON sr.execution_report_id = er.id " +
				"LEFT JOIN test_result tr ON sr.testresultid = tr.id " +
				"LEFT JOIN run_instance r ON tr.runinstanceid = r.id " +
				"LEFT JOIN project p ON r.projectid = p.id " +
				"LEFT JOIN test_plan tp ON p.testplanid = tp.id " +
				"WHERE sr.finalResult = true AND " + Utils.CONSIDERED_STATUS_SUBQUERY + " AND " + Utils.CONSIDERED_FAILURES_SUBQUERY +
				" AND tp.name IN ('" + Utils.DEFAULT_TEST_PLAN_NAMES + "')";
		
		// Build region filter if present
		if (!regions.isEmpty() || !users.isEmpty()) {
			StringBuilder innerQueryBuilder = new StringBuilder("SELECT sr2.id FROM test_result_resource trr LEFT JOIN sub_result sr2 ON trr.subresultid = sr2.id WHERE ");
			List<String> conditions = new ArrayList<>();
			if (!users.isEmpty())
				conditions.add("trr.did IN ('"+ usersClause +"')");			
			if (!regions.isEmpty()){
				StringBuilder regionCondition = Utils.getRegionSQLCondition(regions);
				if(regionCondition != null)
					conditions.add(regionCondition.toString());
			}
			for (int i=0;i<conditions.size();i++){
				if(i!=0)
					innerQueryBuilder.append(" AND ");
				innerQueryBuilder.append(conditions.get(i));
			}
			query += " AND sr.id IN (" + innerQueryBuilder + ")";
		}

		if (!callsFilter.isEmpty()) {
			String filteredCalls = "SELECT sr.id FROM sub_result sr " +
					"JOIN test_result_resource trr ON trr.subresultid = sr.id " +
					"JOIN media_stats ms ON ms.testresultresourceid = trr.id " +
					"JOIN test_result tr ON sr.testresultid = tr.id " +
					"WHERE sr.finalResult = true AND " + Utils.CONSIDERED_STATUS_SUBQUERY + "  AND "
					+ Utils.CONSIDERED_FAILURES_SUBQUERY +
					" AND sr.startdate >= CAST('" + startDate + "' AS timestamp) AND sr.startdate <= CAST('"
					+ endDate + "' AS timestamp)" +
					" AND ms.parameter_name = CAST('" + callsFilter + "' AS VARCHAR) GROUP BY sr.id";
			query += " AND sr.id IN (" + filteredCalls + ")";
		}
		
		// Build SQL statement
		SelectQueryBuilder queryBuilder = new SelectQueryBuilder(query, true);
		queryBuilder.appendCustomCondition("sr.startdate >= CAST(? AS timestamp)", startDate);
		queryBuilder.appendCustomCondition("sr.startdate <= CAST(? AS timestamp)", endDate);
		queryBuilder.appendGroupByMany("tp.name,call_type,sr.status");

		// Build SQL statement to get the TAP URL
		SelectQueryBuilder tapUrlQueryBuilder = new SelectQueryBuilder("SELECT tap_url FROM ctaas_setup");
		tapUrlQueryBuilder.appendEqualsCondition("subaccount_id", subaccountId, QueryBuilder.DATA_TYPE.UUID);

		// Build SQL statement to verify the role
		String email = getEmailFromToken(tokenClaims, context);
		SelectQueryBuilder verificationQueryBuilder = getCustomerRoleVerificationQuery(subaccountId,roles,email);

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
				+ "&user=" + System.getenv("POSTGRESQL_USER")
				+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try(Connection connection = DriverManager.getConnection(dbConnectionUrl);
			PreparedStatement selectStmtTapUrl = tapUrlQueryBuilder.build(connection)) {

			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
			ResultSet rs;
			JSONObject json = new JSONObject();

			if (verificationQueryBuilder != null) {
				try (PreparedStatement verificationStmt = verificationQueryBuilder.build(connection)) {
					context.getLogger().info("Execute SQL role verification statement: " + verificationStmt);
					rs = verificationStmt.executeQuery();
					if (!rs.next()) {
						context.getLogger().info(MESSAGE_SUBACCOUNT_ID_NOT_FOUND + email);
						json.put("error", MESSAGE_SUBACCOUNT_ID_NOT_FOUND);
						context.getLogger().info("User " + userId + " is leaving TekvLSGetCallsStatusSummary Azure function with error");
						return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
					}
				}
			}

			// Retrieve tap URL			
			context.getLogger().info("Execute SQL statement TekvLSGetCallsStatusSummary: " + selectStmtTapUrl);
			
			rs = selectStmtTapUrl.executeQuery();
			String tapURL = null;
			if (rs.next()) {
				tapURL = rs.getString("tap_url");
			}
			if (tapURL == null || tapURL.isEmpty()) {
				context.getLogger().info(Constants.LOG_MESSAGE_FOR_INVALID_TAP_URL + " | " + tapURL);
				json.put("error", Constants.MESSAGE_FOR_INVALID_TAP_URL);
				context.getLogger().info("User " + userId + " is leaving TekvLSGetCallsStatusSummary Azure function with error");
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}
			context.getLogger().info("TAP URL for data query: " + tapURL);

			String statement = queryBuilder.getQuery();
			// Retrieve executions status list.			
			context.getLogger().info("Execute SQL statement, Retrieve Execution status: " + statement);
					
			// Connect to the API			
			JSONArray resultSet = TAPClient.executeQuery(tapURL,statement,context);

			// Return a JSON array of status and counts (id and value)
			HashMap<String, String> reportTypes = new HashMap<>();
			if (callsFilter.isEmpty()) {
				reportTypes.put(Utils.TEST_PLAN_NAMES.CALLING_RELIABILITY.value(), "callingReliability");
				reportTypes.put(Utils.TEST_PLAN_NAMES.FEATURE_FUNCTIONALITY.value(), "featureFunctionality");
				reportTypes.put(Utils.TEST_PLAN_NAMES.POLQA.value(), "POLQA");
			} else {
				if (callsFilter.equals("POLQA")) {
					reportTypes.put(Utils.TEST_PLAN_NAMES.POLQA.value(), "POLQA");
					for (Object result : resultSet) {
						JSONArray values = (JSONArray) result;
						values.put(0, "POLQA");
					}
					;
				}
			}			
			
			// first fill json object with callingReliability and featureFunctionality arrays
			reportTypes.forEach((tpName, reportType) -> {
				json.put(reportType, new JSONObject("{ callsByType: {p2p:0,onNet:0,offNet:0}, callsByStatus: {PASSED:0,FAILED:0}}"));
			});			
			
			for(Object resultElement : resultSet) {
				JSONArray values = (JSONArray) resultElement;
				
				String reportType = values.getString(0);
				String type = reportTypes.get(reportType);
				JSONObject reportTypeObject = json.getJSONObject(type);

				String call_type = values.getString(1);
				String status = values.getString(2);
				int counter = values.getInt(3);

				JSONObject callsByType = reportTypeObject.getJSONObject("callsByType");
				int callTypeCounter = callsByType.getInt(call_type);
				callTypeCounter += counter;
				callsByType.put(call_type, callTypeCounter);

				JSONObject callsByStatus = reportTypeObject.getJSONObject("callsByStatus");
				int statusCounter = callsByStatus.getInt(status);
				statusCounter += counter;
				callsByStatus.put(status, statusCounter);
			}
			context.getLogger().info("User " + userId + " is successfully leaving TekvLSGetCallsStatusSummary Azure function");
			return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();
		}
		catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", "SQL Exception: " + e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSGetCallsStatusSummary Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
		catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSGetCallsStatusSummary Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}
}
