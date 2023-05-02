package com.function.spotlightCharts;

import com.function.auth.Resource;
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

	private final String dbConnectionUrl = "jdbc:postgresql://" + Constants.TEMP_ONPOINT_ADDRESS + "/" + Constants.TEMP_ONPOINT_DB 
			+ System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + Constants.TEMP_ONPOINT_USER
			+ "&password=" + Constants.TEMP_ONPOINT_PWD;

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
		String startDate = request.getQueryParameters().getOrDefault("startDate", "");
		String endDate = request.getQueryParameters().getOrDefault("endDate", "");
		String metrics = request.getQueryParameters().getOrDefault("metric", "POLQA");

		String metricsClause = metrics.replace(",", "', '");

		String[] metricsArray = metrics.split(",");
		StringBuilder statistics = new StringBuilder();
		List<String> statisticsLabels = new ArrayList<>();
		for (String metric: metricsArray) {
			switch (metric){
				case "Received Jitter":
					statistics.append("max(case when ms.parameter_name = 'Received Jitter' then NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]','','g'), '')::numeric end) as maxJitter, ");
					statistics.append("count(*) FILTER (WHERE ms.parameter_name = 'Received Jitter' AND NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]','','g'), '')::numeric > 30) AS jitterAboveThld, ");
					statisticsLabels.add("maxJitter");
					statisticsLabels.add("jitterAboveThld");
					break;
				case "Received packet loss":
					statistics.append("max(case when ms.parameter_name = 'Received packet loss' then NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]','','g'), '')::numeric end) as maxPacketLoss, ");
					statistics.append("count(*) FILTER (WHERE ms.parameter_name = 'Received packet loss' AND NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]','','g'), '')::numeric > 2) AS packetLossAboveThld, ");
					statisticsLabels.add("maxPacketLoss");
					statisticsLabels.add("packetLossAboveThld");
					break;
				case "Round trip time":
					statistics.append("max(case when ms.parameter_name = 'Round trip time' then NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]','','g'), '')::numeric end) as maxRoundTripTime, ");
					statistics.append("count(*) FILTER (WHERE ms.parameter_name = 'Round trip time' AND NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]','','g'), '')::numeric > 200) AS roundTripTimeAboveThld, ");
					statisticsLabels.add("maxRoundTripTime");
					statisticsLabels.add("roundTripTimeAboveThld");
					break;
				case "Sent bitrate":
					statistics.append("avg(case when ms.parameter_name = 'Sent bitrate' then NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]','','g'), '')::numeric end) as avgSentBitrate, ");
					statisticsLabels.add("avgSentBitrate");
					break;
				case "POLQA":
					statistics.append("min(case when ms.parameter_name = 'POLQA' then ms.parameter_value::numeric end) as minPolqa, ");
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
				"LEFT JOIN TEST_RESULT tr ON sr.testresultid = tr.id " +
				"LEFT JOIN run_instance r ON tr.runinstanceid = r.id " +
				"LEFT JOIN project p ON r.projectid = p.id " +
				"LEFT JOIN test_plan tp ON p.testplanid = tp.id " +
				"WHERE sr.finalResult = true AND sr.status != 'ABORTED' AND sr.status != 'RUNNING' AND sr.status != 'QUEUED' " +
				"AND (sr.failingerrortype IS NULL OR trim(sr.failingerrortype)='' OR sr.failingerrortype = 'Routing Issue' OR sr.failingerrortype = 'Teams Client Issue' OR sr.failingerrortype = 'Media Quality' OR sr.failingerrortype = 'Media Routing') AND tp.name in ('LTS','STS','POLQA') " +
				"AND ms.parameter_name IN ('" + metricsClause + "')";
		
		// Build SQL statement
		SelectQueryBuilder queryBuilder = new SelectQueryBuilder(query, true);
		queryBuilder.appendCustomCondition("sr.startdate >= ?::timestamp", startDate);
		queryBuilder.appendCustomCondition("sr.startdate <= ?::timestamp", endDate);
		
		// Connect to the database
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			PreparedStatement statement = queryBuilder.build(connection)) {
			
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
			
			// Retrieve the specified statistics
			context.getLogger().info("Execute SQL statement: " + statement);
			ResultSet rs = statement.executeQuery();
			JSONObject json = new JSONObject();
			while (rs.next()) {
				for(String statistic:statisticsLabels){
					json.put(statistic,rs.getFloat(statistic));
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
