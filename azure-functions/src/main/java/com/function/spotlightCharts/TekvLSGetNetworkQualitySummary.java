package com.function.spotlightCharts;

import com.function.auth.Resource;
import com.function.clients.TAPClient;
import com.function.db.QueryBuilder;
import com.function.db.SelectQueryBuilder;
import com.function.util.Constants;
import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import java.sql.*;
import java.util.*;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetNetworkQualitySummary {
	/**
	 * This function listens at endpoint "/v1.0/spotlightCharts/networkQualityChart". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/spotlightCharts/networkQualityChart
	 * 2. curl "{your host}/v1.0/spotlightCharts/networkQualityChart"
	 */

	@FunctionName("TekvLSGetNetworkQualitySummary")
	public HttpResponseMessage run(
				@HttpTrigger(
				name = "req",
				methods = {HttpMethod.GET},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "spotlightCharts/networkQualitySummary")
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

		context.getLogger().info("Entering TekvLSGetNetworkQualitySummary Azure function");
		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());
		String subaccountId = request.getQueryParameters().getOrDefault("subaccountId", "");
		String startDate = request.getQueryParameters().getOrDefault("startDate", "");
		String endDate = request.getQueryParameters().getOrDefault("endDate", "");

		String regions = request.getQueryParameters().getOrDefault("regions","");

		String users = request.getQueryParameters().getOrDefault("users", "");
		String usersClause = users.replace(",","', '");

		String metrics = request.getQueryParameters().getOrDefault("metric", "POLQA");
		String metricsClause = metrics.replace(",", "', '");
		String[] metricsArray = metrics.split(",");
		StringBuilder statistics = new StringBuilder();
		List<String> statisticsLabels = new ArrayList<>();
		for (String metric: metricsArray) {
			switch (metric){
				case "Received Jitter":
					statistics.append("max(case when ms.parameter_name = 'Received Jitter' then CAST(NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]','','g'), '') AS numeric) end) as maxJitter, ");
					statistics.append("count(*) FILTER (WHERE ms.parameter_name = 'Received Jitter' AND CAST(NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]','','g'), '') AS numeric) > 30) AS jitterAboveThld, ");
					statisticsLabels.add("maxJitter");
					statisticsLabels.add("jitterAboveThld");
					break;
				case "Received packet loss":
					statistics.append("max(case when ms.parameter_name = 'Received packet loss' then CAST(NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]','','g'), '') AS numeric) end) as maxPacketLoss, ");
					statistics.append("count(*) FILTER (WHERE ms.parameter_name = 'Received packet loss' AND CAST(NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]','','g'), '') AS numeric) > 2) AS packetLossAboveThld, ");
					statisticsLabels.add("maxPacketLoss");
					statisticsLabels.add("packetLossAboveThld");
					break;
				case "Round trip time":
					statistics.append("max(case when ms.parameter_name = 'Round trip time' then CAST(NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]','','g'), '') AS numeric) end) as maxRoundTripTime, ");
					statistics.append("count(*) FILTER (WHERE ms.parameter_name = 'Round trip time' AND CAST(NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]','','g'), '') AS numeric) > 200) AS roundTripTimeAboveThld, ");
					statisticsLabels.add("maxRoundTripTime");
					statisticsLabels.add("roundTripTimeAboveThld");
					break;
				case "Sent bitrate":
					statistics.append("avg(case when ms.parameter_name = 'Sent bitrate' then CAST(NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]','','g'), '') AS numeric) end) as avgSentBitrate, ");
					statisticsLabels.add("avgSentBitrate");
					break;
				case "POLQA":
					statistics.append("min(case when ms.parameter_name = 'POLQA' then CAST(ms.parameter_value AS numeric) end) as minPolqa, ");
					statisticsLabels.add("minPolqa");
					break;
			}
		}
		statistics.append("count(Distinct sr.id) totalCalls ");
		statisticsLabels.add("totalCalls");

		String query = "SELECT " + statistics +
				"FROM media_stats ms " +
				"LEFT JOIN test_result_resource trr ON ms.testresultresourceid = trr.id " +
				"LEFT JOIN sub_result sr ON trr.subresultid = sr.id " +
				"LEFT JOIN test_result tr ON sr.testresultid = tr.id " +
				"LEFT JOIN run_instance r ON tr.runinstanceid = r.id " +
				"LEFT JOIN project p ON r.projectid = p.id " +
				"LEFT JOIN test_plan tp ON p.testplanid = tp.id " +
				"WHERE sr.finalResult = true AND (sr.status = 'PASSED' OR sr.status = 'FAILED') " +
				"AND (sr.failingerrortype IS NULL or trim(sr.failingerrortype) = '' or sr.failingerrortype = 'Routing Issue' or sr.failingerrortype = 'Teams Client Issue' or sr.failingerrortype = 'Media Quality' or sr.failingerrortype = 'Media Routing') " +
				"AND tp.name in ('LTS','STS','POLQA') AND ms.parameter_name IN ('" + metricsClause + "')";

		if (!users.isEmpty()){
			query += " AND trr.did IN ('"+ usersClause +"')";
		}

		if(!regions.isEmpty()){
			StringBuilder regionCondition = Utils.getRegionSQLCondition(regions);
			if(regionCondition != null)
				query += "AND " + regionCondition;
		}

		// Build SQL statement
		SelectQueryBuilder queryBuilder = new SelectQueryBuilder(query, true);
		queryBuilder.appendCustomCondition("sr.startdate >= CAST(? AS timestamp)", startDate);
		queryBuilder.appendCustomCondition("sr.startdate <= CAST(? AS timestamp)", endDate);

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
						return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
					}
				}
			}

			// Retrieve tap URL
			context.getLogger().info("Execute SQL statement: " + selectStmtTapUrl);
			rs = selectStmtTapUrl.executeQuery();
			String tapURL = null;
			if (rs.next()) {
				tapURL = rs.getString("tap_url");
			}
			if (tapURL == null || tapURL.isEmpty()) {
				context.getLogger().info(Constants.LOG_MESSAGE_FOR_INVALID_TAP_URL + " | " + tapURL);
				json.put("error", Constants.MESSAGE_FOR_INVALID_TAP_URL);
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}
			context.getLogger().info("TAP URL for data query: " + tapURL);

			String statement = queryBuilder.getQuery();

			// Retrieve the specified statistics
			context.getLogger().info("Execute SQL statement: " + statement);
			JSONArray resultSet = TAPClient.executeQuery(tapURL,statement,context);
			for ( Object resultElement:resultSet) {
				JSONArray values = (JSONArray) resultElement;
				for(int i=0; i<statisticsLabels.size(); i++){
					json.put(statisticsLabels.get(i),values.isNull(i) ? "--" : values.getFloat(i));
				}
			}
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
