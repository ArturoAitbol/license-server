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
import java.text.DecimalFormat;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.IntStream;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetCollectionChart {
	/**
	 * This function listens at endpoint "/v1.0/spotlightCharts/simpleChart". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/spotlightCharts/simpleChart
	 * 2. curl "{your host}/v1.0/spotlightCharts/simpleChart"
	 */

	private final String dbConnectionUrl = "jdbc:postgresql://" + Constants.TEMP_ONPOINT_ADDRESS + "/" + Constants.TEMP_ONPOINT_DB 
			+ System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + Constants.TEMP_ONPOINT_USER
			+ "&password=" + Constants.TEMP_ONPOINT_PWD;

	@FunctionName("TekvLSGetCollectionChart")
	public HttpResponseMessage run(
				@HttpTrigger(
				name = "req",
				methods = {HttpMethod.GET},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "spotlightCharts/collectionChart")
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

		context.getLogger().info("Entering TekvLSGetCollectionChart Azure function");
		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());
		String reportType = request.getQueryParameters().getOrDefault("reportType", "");
		String startDate = request.getQueryParameters().getOrDefault("startDate", "");
		String endDate = request.getQueryParameters().getOrDefault("endDate", "");
		String query = "SELECT sr.endDate::DATE, sr.status, COUNT(sr.status) as status_counter FROM sub_result sr LEFT JOIN TEST_RESULT tr ON sr.testresultid = tr.id LEFT JOIN " +
			"run_instance r ON tr.runinstanceid = r.id LEFT JOIN project p ON r.projectid = p.id LEFT JOIN test_plan tp ON p.testplanid = tp.id " +
			"WHERE sr.finalResult = true AND sr.status != 'ABORTED'AND sr.status != 'RUNNING' AND sr.status != 'QUEUED' " + 
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
		
		// Build SQL statement
		SelectQueryBuilder queryBuilder = new SelectQueryBuilder(query, true);
		queryBuilder.appendCustomCondition("sr.startdate >= ?::timestamp", startDate);
		queryBuilder.appendCustomCondition("sr.enddate <= ?::timestamp", endDate);
		queryBuilder.appendGroupByMany("sr.endDate::DATE,sr.status");
		queryBuilder.appendOrderBy("sr.endDate::DATE", SelectQueryBuilder.ORDER_DIRECTION.ASC);
		
		// Connect to the database
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			PreparedStatement statement = queryBuilder.build(connection)) {
			
			context.getLogger().info("Successfully connected to: " + Constants.TEMP_ONPOINT_ADDRESS);
			
			// Retrieve all customers.
			context.getLogger().info("Execute SQL statement: " + statement);
			ResultSet rs = statement.executeQuery();
			// Return a JSON array of customers (id and names)
			JSONObject json = new JSONObject();

			LocalDate startLocalDate = LocalDate.parse(startDate.split(" ")[0]);
			LocalDate endLocalDate = LocalDate.parse(endDate.split(" ")[0]);
			TreeMap<String,JSONObject> dates = getDatesBetween(startLocalDate,endLocalDate);

			while (rs.next()) {
				JSONObject date = dates.get(rs.getString("endDate"));
				date.put(rs.getString("status"),rs.getInt("status_counter"));
			}
			JSONArray passedEntries = new JSONArray();
			JSONArray failedEntries = new JSONArray();
			JSONArray percentages = new JSONArray();
			JSONArray categories = new JSONArray();

			Set<Map.Entry<String, JSONObject> > entries = dates.entrySet();
			DecimalFormat df = new DecimalFormat("#.00");

			entries.forEach(entry -> {
				categories.put(entry.getKey());

				JSONObject object = entry.getValue();
				int passed = object.getInt("PASSED");
				int failed = object.getInt("FAILED");
				passedEntries.put(passed);
				failedEntries.put(failed);

				float total = passed+failed;
				float percentage = total>0 ? (passed*100)/total:0;
				percentages.put(Float.valueOf(df.format(percentage)));
			});

			JSONObject series_1 = new JSONObject();
			series_1.put("name","Pass");
			series_1.put("data", passedEntries);

			JSONObject series_2 = new JSONObject();
			series_2.put("name","Fail");
			series_2.put("data", failedEntries);

			JSONObject series_3 = new JSONObject();
			series_3.put("name","Success %");
			series_3.put("data", percentages);

			JSONArray series = new JSONArray();
			series.put(series_1);
			series.put(series_2);
			series.put(series_3);


			json.put("categories",categories);
			json.put("series", series);
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
		System.out.println("numOfDaysBetween: " + numOfDaysBetween);

		IntStream.iterate(0, i -> i + 1)
				.limit(numOfDaysBetween)
				.mapToObj(i->startDate.plusDays(i).toString())
				.forEach(i -> map.put(i, new JSONObject("{PASSED:0,FAILED:0}")));

		return map;
	}
}
