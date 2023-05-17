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
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetVoiceQualityChart {
	/**
	 * This function listens at endpoint "/v1.0/spotlightCharts/simpleChart". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/spotlightCharts/simpleChart
	 * 2. curl "{your host}/v1.0/spotlightCharts/simpleChart"
	 */

	@FunctionName("TekvLSGetVoiceQualityChart")
	public HttpResponseMessage run(
			@HttpTrigger(
					name = "req",
					methods = {HttpMethod.GET},
					authLevel = AuthorizationLevel.ANONYMOUS,
					route = "spotlightCharts/voiceQualityChart")
			HttpRequestMessage<Optional<String>> request,
			final ExecutionContext context) {

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

		context.getLogger().info("Entering TekvLSGetVoiceQualityChart Azure function");
		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());
		String subaccountId = request.getQueryParameters().getOrDefault("subaccountId", "");
		String startDateStr = request.getQueryParameters().getOrDefault("startDate", "");
		String endDateStr = request.getQueryParameters().getOrDefault("endDate", "");

		String country = request.getQueryParameters().getOrDefault("country", "");
		String state = request.getQueryParameters().getOrDefault("state", "");
		String city = request.getQueryParameters().getOrDefault("city", "");

		String user = request.getQueryParameters().getOrDefault("user", "");

		String reportPeriod = request.getQueryParameters().getOrDefault("reportPeriod", "daily");

		String innerQuery = " SELECT sr.id as call_id, trr.did as user, AVG(CAST(ms.parameter_value AS numeric)) as polqa, DATE(sr.startdate) as date " +
				"FROM media_stats ms " +
				"LEFT JOIN test_result_resource trr ON ms.testresultresourceid = trr.id " +
				"LEFT JOIN sub_result sr ON trr.subresultid = sr.id " +
				"LEFT JOIN test_result tr ON sr.testresultid = tr.id " +
				"LEFT JOIN run_instance r ON tr.runinstanceid = r.id " +
				"LEFT JOIN project p ON r.projectid = p.id " +
				"LEFT JOIN test_plan tp ON p.testplanid = tp.id " +
				"WHERE sr.finalresult = true AND sr.status != 'ABORTED' AND sr.status != 'RUNNING' AND sr.status != 'QUEUED' " +
				"AND (sr.failingerrortype IS NULL OR trim(sr.failingerrortype) = '' OR sr.failingerrortype = 'Routing Issue' OR sr.failingerrortype = 'Teams Client Issue' OR sr.failingerrortype = 'Media Quality' OR sr.failingerrortype = 'Media Routing') " +
				"AND tp.name='POLQA' AND ms.parameter_name = 'POLQA'";

		// Build SQL statement
		SelectQueryBuilder innerQueryBuilder = new SelectQueryBuilder(innerQuery, true);
		innerQueryBuilder.appendCustomCondition("sr.startdate >= CAST(? AS timestamp)", startDateStr);
		innerQueryBuilder.appendCustomCondition("sr.startdate <= CAST(? AS timestamp)", endDateStr);
		if (!country.isEmpty())
			innerQueryBuilder.appendCustomCondition("trr.country = CAST(? AS varchar)", country);
		if (!state.isEmpty())
			innerQueryBuilder.appendCustomCondition("trr.state = CAST(? AS varchar)", state);
		if (!city.isEmpty())
			innerQueryBuilder.appendCustomCondition("trr.city = CAST(? AS varchar)", city);
		if (!user.isEmpty())
			innerQueryBuilder.appendCustomCondition("trr.did = CAST(? AS varchar)", user);
		innerQueryBuilder.appendGroupByMany("sr.id, trr.did");

		SelectQueryBuilder outerQuery = new SelectQueryBuilder(
				"SELECT date," +
						"sum(CASE WHEN polqa >= 4 then 1 else 0 end) as excellent," +
						"sum(CASE WHEN polqa >= 3 AND polqa < 4 then 1 else 0 end) as good," +
						"sum(CASE WHEN polqa >= 2 AND polqa < 3 then 1 else 0 end) as fair," +
						"sum(CASE WHEN polqa >= 0 AND polqa < 2 then 1 else 0 end) as bad," +
						"count(*) as streams," +
						"count(distinct call_id) as calls " +
						"FROM (" + innerQueryBuilder.getQuery() + ") as _",
				true);
		outerQuery.appendGroupBy("date");

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

			String statement = outerQuery.getQuery();

			// Retrieve all the calls.
			context.getLogger().info("Execute SQL statement: " + statement);
			JSONArray resultSet = TAPClient.executeQuery(tapURL,statement,context);
			if (Objects.equals(reportPeriod, "daily")) {
				JSONArray percentages;
				int streams = 0;
				int totalCalls = 0;
				if(!resultSet.isEmpty() && resultSet.getJSONArray(0).getInt(5) > 0){
					JSONArray values = resultSet.getJSONArray(0);
					streams = values.getInt(5);
					totalCalls = values.getInt(6);
					percentages = new JSONArray();
					percentages.put(values.getInt(1) / streams * 100);
					percentages.put(values.getInt(2) / streams * 100);
					percentages.put(values.getInt(3) / streams * 100);
					percentages.put(values.getInt(4) / streams * 100);
				}else{
					percentages = new JSONArray("[0,0,0,0]");
				}
				JSONArray categories = new JSONArray("['Excellent [4-5]','Good [3-4)','Fair [2-3)','Poor [0-2)']");
				JSONObject summary = new JSONObject();
				summary.put("calls_stream", streams);
				summary.put("calls", totalCalls);

				json.put("summary",summary);
				json.put("percentages",percentages);
				json.put("categories",categories);

			} else if (reportPeriod.equals("weekly")){
				LocalDate startDate = LocalDate.parse(startDateStr.split(" ")[0]);
				LocalDate endDate = LocalDate.parse(endDateStr.split(" ")[0]);
				long numOfDaysBetween = ChronoUnit.DAYS.between(startDate, endDate) + 1;
				List<String> dates = IntStream.iterate(0, i -> i + 1)
											  .limit(numOfDaysBetween)
											  .mapToObj(i -> startDate.plusDays(i).format(DateTimeFormatter.ofPattern("yyyy-MM-dd")))
											  .collect(Collectors.toList());
				JSONArray categories = new JSONArray();
				JSONArray excellent = new JSONArray();
				JSONArray good = new JSONArray();
				JSONArray fair = new JSONArray();
				JSONArray bad = new JSONArray();
				int totalStreams = 0;
				int totalCalls = 0;
				Map<String, JSONArray> percentagesMap = getPercentagesMap(resultSet);
				for (String date : dates) {
					categories.put(date);
					if (percentagesMap.containsKey(date)) {
						JSONArray values = percentagesMap.get(date);
						float streams = values.getInt(5);
						excellent.put(values.getInt(1) / streams * 100);
						good.put(values.getInt(2) / streams * 100);
						fair.put(values.getInt(3) / streams * 100);
						bad.put(values.getInt(4) / streams * 100);
						totalStreams += streams;
						totalCalls += values.getInt(6);
					} else {
						excellent.put(0);
						good.put(0);
						fair.put(0);
						bad.put(0);
					}
				}
				JSONObject summary = new JSONObject();
				summary.put("streams", totalStreams);
				summary.put("calls", totalCalls);
				json.put("summary", summary);
				JSONObject percentages = new JSONObject();
				percentages.put("excellent", excellent);
				percentages.put("good", good);
				percentages.put("fair", fair);
				percentages.put("bad", bad);
				json.put("percentages", percentages);
				json.put("categories", categories);
			}

			return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();
		} catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", "SQL Exception: " + e.getMessage());
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		} catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}

	private Map<String, JSONArray> getPercentagesMap(JSONArray array) {
		Map<String, JSONArray> map = new HashMap<>();
		array.forEach(item -> {
			JSONArray arr = (JSONArray) item;
			map.put(arr.getString(0), arr);
		});
		return map;
	}
}
