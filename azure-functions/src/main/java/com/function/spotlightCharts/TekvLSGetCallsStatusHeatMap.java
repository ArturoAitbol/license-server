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
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetCallsStatusHeatMap {
	/**
	 * This function listens at endpoint "/v1.0/spotlightCharts/callsStatusHeatMap". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/spotlightCharts/callsStatusHeatMap
	 * 2. curl "{your host}/v1.0/spotlightCharts/callsStatusHeatMap"
	 */

	@FunctionName("TekvLSGetCallsStatusHeatMap")
	public HttpResponseMessage run(
				@HttpTrigger(
				name = "req",
				methods = {HttpMethod.GET},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "spotlightCharts/callsStatusHeatMap")
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
		context.getLogger().info("User " + userId + " is Entering TekvLSGetCallsStatusHeatMap Azure function");
		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());
		String subaccountId = request.getQueryParameters().getOrDefault("subaccountId", "");
		String startDate = request.getQueryParameters().getOrDefault("startDate", "");
		String endDate = request.getQueryParameters().getOrDefault("endDate", "");

		String regions = request.getQueryParameters().getOrDefault("regions","");

		String users = request.getQueryParameters().getOrDefault("users", "");
		String usersClause = users.replace(",","', '");

		String query = "SELECT sr.status, CAST(sr.startDate AS DATE) AS date, TO_CHAR(sr.startDate,'HH24:00') AS hour, COUNT(sr.status) as status_counter " +
				"FROM sub_result sr " +
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

		// Build SQL statement
		SelectQueryBuilder queryBuilder = new SelectQueryBuilder(query, true);
		queryBuilder.appendCustomCondition("sr.startdate >= CAST(? AS timestamp)", startDate);
		queryBuilder.appendCustomCondition("sr.startdate <= CAST(? AS timestamp)", endDate);
		queryBuilder.appendGroupByMany("sr.status, date, hour");
		queryBuilder.appendOrderBy("date", SelectQueryBuilder.ORDER_DIRECTION.ASC);

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
						context.getLogger().info("User " + userId + " is leaving TekvLSGetCallsStatusHeatMap Azure function with error");
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
				context.getLogger().info("User " + userId + " is leaving TekvLSGetCallsStatusHeatMap Azure function with error");
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}
			context.getLogger().info("TAP URL for data query: " + tapURL);

			String statement = queryBuilder.getQuery();

			// Retrieve all data.
			context.getLogger().info("Execute SQL statement: " + statement);
			JSONArray resultSet = TAPClient.executeQuery(tapURL, statement, context);

			LocalDate startLocalDate = LocalDate.parse(startDate.split(" ")[0]);
			LocalDate endLocalDate = LocalDate.parse(endDate.split(" ")[0]);
			JSONObject statusTypes = new JSONObject();
			List<String> allowedStatus = Arrays.asList("failed","passed","total");
			for(String status : allowedStatus){
				statusTypes.put(status,getDatesBetween(startLocalDate, endLocalDate));
			}
			int totalCallsCounter = 0;
			int totalFailedCallsCounter = 0;
			for (Object resultElement : resultSet) {
				JSONArray values = (JSONArray) resultElement;
				String status = values.getString(0);
				String date = values.getString(1);
				String hour = values.getString(2);
				int calls = values.getInt(3);

				JSONObject datesObject = statusTypes.getJSONObject(status.toLowerCase());
				JSONObject dateObject = datesObject.getJSONObject(date);
				dateObject.put(hour, calls);

				JSONObject datesTotal = statusTypes.getJSONObject("total");
				JSONObject dateTotal = datesTotal.getJSONObject(date);
				int totalCalls = dateTotal.getInt(hour);
				dateTotal.put(hour, totalCalls + calls);

				if(status.equals("FAILED"))
					totalFailedCallsCounter += calls;
				totalCallsCounter += calls;
			}

			JSONObject series = new JSONObject();
			JSONObject maxValues = new JSONObject();

			//get dates an hours in order
			LocalTime initialHour = LocalTime.parse("00:00");
			List<String> hoursInOrder = IntStream.iterate(0, i -> i + 1)
					.limit(24)
					.mapToObj(i -> initialHour.plusHours(i).toString())
					.collect(Collectors.toList());

			long numOfDaysBetween = ChronoUnit.DAYS.between(startLocalDate, endLocalDate)+1;
			List<String> datesInOrder = IntStream.iterate(0, i -> i + 1)
					.limit(numOfDaysBetween)
					.mapToObj(i->startLocalDate.plusDays(i).toString())
					.collect(Collectors.toList());


			for (String status:statusTypes.keySet()) {

				JSONObject dates = statusTypes.getJSONObject(status);
				JSONArray statusArray = new JSONArray();
				int maxValue = 0;
				for (String date : datesInOrder) {
					JSONObject dateObject = dates.getJSONObject(date);
					JSONArray array = new JSONArray();
					for (String hour : hoursInOrder) {
						int value = dateObject.getInt(hour);
						maxValue = Math.max(value, maxValue);

						JSONObject data = new JSONObject();
						LocalTime nextHour = LocalTime.parse(hour).plusHours(1);
						data.put("x", hour.split(":")[0] + "-" + nextHour.toString().split(":")[0]);
						data.put("y", value);
						array.put(data);
					}

					JSONObject statusSeries = new JSONObject();
					DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM-dd-yyyy");
					LocalDate dateKey = LocalDate.parse(date);
					statusSeries.put("name",dateKey.format(formatter));
					statusSeries.put("data",array);
					statusArray.put(statusSeries);
				}

				series.put(status,statusArray);
				maxValues.put(status,maxValue);
			}
			JSONObject summary = new JSONObject();
			summary.put("totalCalls",totalCallsCounter);
			summary.put("failedCalls",totalFailedCallsCounter);

			json.put("series", series);
			json.put("maxValues",maxValues);
			json.put("summary",summary);
			context.getLogger().info("User " + userId + " is successfully leaving TekvLSGetCallsStatusHeatMap Azure function");
			return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();
		}
		catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", "SQL Exception: " + e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSGetCallsStatusHeatMap Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
		catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSGetCallsStatusHeatMap Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}

	public TreeMap<String,JSONObject> getDatesBetween(LocalDate startDate, LocalDate endDate) {

		TreeMap<String,JSONObject> map = new TreeMap<>();

		long numOfDaysBetween = ChronoUnit.DAYS.between(startDate, endDate)+1;

		IntStream.iterate(0, i -> i + 1)
				.limit(numOfDaysBetween)
				.mapToObj(i->startDate.plusDays(i).toString())
				.forEach(i -> map.put(i,getHoursOfADay()));
		return map;
	}
	public JSONObject getHoursOfADay() {

		JSONObject map = new JSONObject();
		LocalTime hour = LocalTime.parse("00:00");
		IntStream.iterate(0, i -> i + 1)
				.limit(24)
				.mapToObj(i->hour.plusHours(i).toString())
				.forEach(i -> map.put(i,0));
		return map;
	}	
}
