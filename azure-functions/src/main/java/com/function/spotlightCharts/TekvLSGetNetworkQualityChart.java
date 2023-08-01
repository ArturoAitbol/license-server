package com.function.spotlightCharts;

import com.function.auth.Resource;
import com.function.clients.TAPClient;
import com.function.db.QueryBuilder;
import com.function.db.SelectQueryBuilder;
import com.function.db.SelectQueryBuilder.ORDER_DIRECTION;
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
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.IntStream;

import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetNetworkQualityChart {
	/**
	 * This function listens at endpoint "/v1.0/spotlightCharts/networkQualityChart". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/spotlightCharts/networkQualityChart
	 * 2. curl "{your host}/v1.0/spotlightCharts/networkQualityChart"
	 */

	@FunctionName("TekvLSGetNetworkQualityChart")
	public HttpResponseMessage run(
				@HttpTrigger(
				name = "req",
				methods = {HttpMethod.GET},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "spotlightCharts/networkQualityChart")
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
		String subaccountId = request.getQueryParameters().getOrDefault("subaccountId", "");
		String startDate = request.getQueryParameters().getOrDefault("startDate", "");
		String endDate = request.getQueryParameters().getOrDefault("endDate", "");
		String regions = request.getQueryParameters().getOrDefault("regions","");

		String users = request.getQueryParameters().getOrDefault("users", "");
		String usersClause = users.replace(",","', '");
		
		String groupByIndicator = request.getQueryParameters().getOrDefault("groupBy", "hour");
		String groupByClause = groupByIndicator.equals("day") ? "YYYY-MM-DD" : "YYYY-MM-DD HH24:00";

		String averageFlag = request.getQueryParameters().getOrDefault("average", "");
		String callsFilter = request.getQueryParameters().getOrDefault("callsFilter","");

		String metrics = request.getQueryParameters().getOrDefault("metric", Utils.DEFAULT_METRICS);
		String metricsClause = metrics.replace(",", "', '");
		Iterator<String> metricsArray = Arrays.stream(metrics.split(",")).iterator();
		StringBuilder statistics = new StringBuilder();
		List<String> statisticsLabels = new ArrayList<>();
		while (metricsArray.hasNext()) {
			String metric = metricsArray.next();
			String selector = "avg";
			String avgSelector = "avg";
			String value = "";
			String conditionStatement = "(case when ms.parameter_name = '%s' " +
					"then CAST(NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]','','g'), '') AS numeric) end) as \"%s\"";
			switch (metric) {
				case "Received Jitter":
					selector = "max";
					value = Utils.MEDIA_STATS_METRICS.JITTER.value();
					break;
				case "Received packet loss":
					selector = "max";
					value = Utils.MEDIA_STATS_METRICS.PACKET_LOSS.value();
					break;
				case "Round trip time":
					selector = "max";
					value = Utils.MEDIA_STATS_METRICS.ROUND_TRIP_TIME.value();
					break;
				case "Sent bitrate":
					// here the average is always the most representative value
					value = Utils.MEDIA_STATS_METRICS.BITRATE.value();
					break;
				case "POLQA":
					selector = "min";
					value = Utils.MEDIA_STATS_METRICS.POLQA.value();
					conditionStatement = "(case when ms.parameter_name = '%s' then CAST(ms.parameter_value AS numeric) end) as \"%s\"";
					break;
			}
			if(!value.isEmpty()){
				if (!averageFlag.isEmpty() && !avgSelector.equals(selector)){
					String columnName = avgSelector+ " " + value;
					statistics.append(avgSelector).append(String.format(conditionStatement,value,columnName));
					statistics.append(",");
					statisticsLabels.add(columnName);
				}
				statistics.append(selector).append(String.format(conditionStatement,value,value));
				statisticsLabels.add(value);
			}
			if (metricsArray.hasNext()) {
				 statistics.append(",");
			}
		}

		String query = "SELECT TO_CHAR(sr.startdate,'" + groupByClause + "') as date_hour, " + statistics +
				" FROM media_stats ms " +
				"LEFT JOIN test_result_resource trr ON ms.testresultresourceid = trr.id " +
				"LEFT JOIN sub_result sr ON trr.subresultid = sr.id " +
				"LEFT JOIN test_result tr ON sr.testresultid = tr.id " +
				"LEFT JOIN run_instance r ON tr.runinstanceid = r.id " +
				"LEFT JOIN project p ON r.projectid = p.id " +
				"LEFT JOIN test_plan tp ON p.testplanid = tp.id " +
				"WHERE sr.finalResult = true AND " + Utils.CONSIDERED_STATUS_SUBQUERY + " AND " + Utils.CONSIDERED_FAILURES_SUBQUERY +
				" AND tp.name in ('" + Utils.DEFAULT_TEST_PLAN_NAMES + "') AND ms.parameter_name IN ('" + metricsClause + "')";

		if(!callsFilter.isEmpty()){
			String filteredCalls = "SELECT sr.id FROM sub_result sr " +
					"JOIN test_result_resource trr ON trr.subresultid = sr.id " +
					"JOIN media_stats ms ON ms.testresultresourceid = trr.id " +
					"JOIN test_result tr ON sr.testresultid = tr.id " +
					"WHERE sr.finalResult = true AND " + Utils.CONSIDERED_STATUS_SUBQUERY + "  AND " + Utils.CONSIDERED_FAILURES_SUBQUERY +
					" AND sr.startdate >= CAST('"+startDate+"' AS timestamp) AND sr.startdate <= CAST('"+endDate+"' AS timestamp)" +
					" AND ms.parameter_name = CAST('"+callsFilter+"' AS VARCHAR) GROUP BY sr.id";
			query+= " AND sr.id IN (" + filteredCalls + ")";
		}

		if (!users.isEmpty()){
			query += " AND trr.did IN ('"+ usersClause +"')";
		}

		if(!regions.isEmpty()){
			StringBuilder regionCondition = Utils.getRegionSQLCondition(regions);
			if(regionCondition != null)
				query += " AND " + regionCondition;
		}

		// Build SQL statement
		SelectQueryBuilder queryBuilder = new SelectQueryBuilder(query, true);
		queryBuilder.appendCustomCondition("sr.startdate >= CAST(? AS timestamp)", startDate);
		queryBuilder.appendCustomCondition("sr.startdate <= CAST(? AS timestamp)", endDate);
		queryBuilder.appendGroupByMany("date_hour");
		queryBuilder.appendOrderBy("date_hour", ORDER_DIRECTION.ASC);

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
			PreparedStatement selectStmtTapUrl = tapUrlQueryBuilder.build(connection)){

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

			// Retrieve the data.
			context.getLogger().info("Execute SQL statement: " + statement);
			JSONArray resultSet = TAPClient.executeQuery(tapURL,statement,context);

			TreeMap<String,JSONObject> datesObject;
			if(groupByIndicator.equals("day")){
				LocalDate startLocalDate = LocalDate.parse(startDate.split(" ")[0]);
				LocalDate endLocalDate = LocalDate.parse(endDate.split(" ")[0]);
				datesObject = getDatesBetween(startLocalDate,endLocalDate);
			}else{
				DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
				LocalDateTime startLocalDate = LocalDateTime.parse(startDate,formatter);
				LocalDateTime endLocalDate = LocalDateTime.parse(endDate,formatter);
				datesObject = getHoursBetween(startLocalDate,endLocalDate);
			}
			context.getLogger().info("Result set  " + resultSet);

			for (Object resultElement : resultSet) {
				JSONArray values = (JSONArray) resultElement;
				// adding to dates map if not added
				String dateHour = values.getString(0);
				JSONObject dateHourObject = datesObject.get(dateHour);
				if(dateHourObject==null){
					dateHourObject = new JSONObject();
					datesObject.put(dateHour,dateHourObject);
				}

				// get metrics values from DB
				for(int i=0; i<statisticsLabels.size(); i++){
					if(!values.isNull(i+1)){
						dateHourObject.put(statisticsLabels.get(i),values.getFloat(i+1));
					}
				}
			}

			Set<Map.Entry<String, JSONObject> > entries = datesObject.entrySet();
			JSONArray datesArray = new JSONArray();
			JSONObject series = new JSONObject();
			for (String statistic : statisticsLabels) {
				series.put(statistic, new JSONArray());
			}
			DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.US);
			symbols.setDecimalSeparator('.');
			DecimalFormat df = new DecimalFormat("#.00", symbols);
			DateTimeFormatter format = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

			entries.forEach(entry -> {
				String date = entry.getKey();
				if(groupByIndicator.equals("day")){
					DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM-dd-yyyy");
					LocalDate dateKey = LocalDate.parse(date);
					datesArray.put(dateKey.format(formatter));
				}else{
					DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM-dd-yyyy HH:mm");
					LocalDateTime dateKey = LocalDateTime.parse(date.replace(" ", "T"));
					int nextHour = LocalDateTime.parse(date,format).plusHours(1).getHour();
					datesArray.put(dateKey.format(formatter) + "-" + String.format("%02d", nextHour) +":00");
				}


				JSONObject entryValue = entry.getValue();
				for (String metric : series.keySet()) {
					// get metric's array
					JSONArray increasedSerie = series.getJSONArray(metric);
					// override metric's array with new value
					increasedSerie.put(entryValue!=null && entryValue.has(metric) ?
							Float.parseFloat(df.format(entryValue.getFloat(metric))) : null);
					series.put(metric, increasedSerie);
				}
			});

			json.put("series", series);
			json.put("categories", datesArray);
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

	public TreeMap<String,JSONObject> getDatesBetween(LocalDate startDate, LocalDate endDate) {

		TreeMap<String,JSONObject> map = new TreeMap<>();

		long numOfDaysBetween = ChronoUnit.DAYS.between(startDate, endDate)+1;

		IntStream.iterate(0, i -> i + 1)
				.limit(numOfDaysBetween)
				.mapToObj(i->startDate.plusDays(i).toString())
				.forEach(i -> map.put(i,null));

		return map;
	}

	public TreeMap<String,JSONObject> getHoursBetween(LocalDateTime startDate, LocalDateTime endDate) {

		TreeMap<String,JSONObject> map = new TreeMap<>();

		long numOfDaysBetween = ChronoUnit.HOURS.between(startDate, endDate)+1;
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:00");
		IntStream.iterate(0, i -> i + 1)
				.limit(numOfDaysBetween)
				.mapToObj(i->startDate.plusHours(i).format(formatter))
				.forEach(i -> map.put(i,null));

		return map;
	}
}
