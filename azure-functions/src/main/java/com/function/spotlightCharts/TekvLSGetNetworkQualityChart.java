package com.function.spotlightCharts;

import com.function.auth.Resource;
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

	private final String dbConnectionUrl = "jdbc:postgresql://" + Constants.TEMP_ONPOINT_ADDRESS + "/" + Constants.TEMP_ONPOINT_DB 
			+ System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + Constants.TEMP_ONPOINT_USER
			+ "&password=" + Constants.TEMP_ONPOINT_PWD;

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
		String startDate = request.getQueryParameters().getOrDefault("startDate", "");
		String endDate = request.getQueryParameters().getOrDefault("endDate", "");
		String metrics = request.getQueryParameters().getOrDefault("metric", "POLQA");
		String groupByIndicator = request.getQueryParameters().getOrDefault("groupBy", "hour");

		String metricsClause = metrics.replace(",", "', '");
		String groupByClause = groupByIndicator.equals("day") ? "YYYY-MM-DD" : "YYYY-MM-DD HH24:00";



		String query = "SELECT TO_CHAR(ms.last_modified_date,'"+groupByClause+"') as date_hour, ms.parameter_name, " +
				"AVG( CASE WHEN ms.parameter_value LIKE '% %' THEN CAST(SPLIT_PART(ms.parameter_value, ' ', 1) AS FLOAT) " +
						  "WHEN ms.parameter_value LIKE '--' THEN NULL " +
						  "WHEN ms.parameter_value LIKE '%\\%' THEN CAST(SPLIT_PART(ms.parameter_value, '%', 1) AS FLOAT) " +
						  "ELSE CAST(ms.parameter_value AS FLOAT) END) avg_per_hour " +
				"FROM media_stats ms LEFT JOIN test_result_resource trs ON ms.testresultresourceid = trs.id " +
				"LEFT JOIN sub_result sr ON trs.subresultid = sr.id LEFT JOIN TEST_RESULT tr ON sr.testresultid = tr.id " +
				"LEFT JOIN run_instance r ON tr.runinstanceid = r.id LEFT JOIN project p ON r.projectid = p.id LEFT JOIN test_plan tp ON p.testplanid = tp.id " +
				"WHERE sr.finalResult = true AND sr.status != 'ABORTED' AND sr.status != 'RUNNING' AND sr.status != 'QUEUED' " +
				"AND (sr.failingerrortype IS NULL OR trim(sr.failingerrortype)='' OR sr.failingerrortype = 'Routing Issue' OR sr.failingerrortype = 'Teams Client Issue' " +
				"OR sr.failingerrortype = 'Media Quality' OR sr.failingerrortype = 'Media Routing') AND tp.name='POLQA' AND ms.parameter_name IN ('" + metricsClause + "')";
		
		// Build SQL statement
		SelectQueryBuilder queryBuilder = new SelectQueryBuilder(query, true);
		queryBuilder.appendCustomCondition("sr.startdate >= ?::timestamp", startDate);
		queryBuilder.appendCustomCondition("sr.startdate <= ?::timestamp", endDate);
		queryBuilder.appendGroupByMany("date_hour, ms.parameter_name");
		queryBuilder.appendOrderBy("date_hour", ORDER_DIRECTION.ASC);
		
		// Connect to the database
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			PreparedStatement statement = queryBuilder.build(connection)) {
			
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
			
			// Retrieve all customers.
			context.getLogger().info("Execute SQL statement: " + statement);
			ResultSet rs = statement.executeQuery();
			// Return a JSON array of customers (id and names)
			JSONObject json = new JSONObject();
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


			while (rs.next()) {
				// adding to dates map if not added
				String dateHour = rs.getString("date_hour");
				JSONObject dateHourObject = datesObject.get(dateHour);
				if(dateHourObject==null){
					dateHourObject = new JSONObject();
					datesObject.put(dateHour,dateHourObject);
				}

				// get metric and avg value from db row
				String parameter = rs.getString("parameter_name");
				float avgPerHour = rs.getFloat("avg_per_hour");
				dateHourObject.put(parameter,avgPerHour);
			}

			Set<Map.Entry<String, JSONObject> > entries = datesObject.entrySet();
			JSONArray datesArray = new JSONArray();
			JSONObject series = new JSONObject();
			String[] metricsArray = metrics.split(",");
			for (String metric : metricsArray) {
				series.put(metric, new JSONArray());
			}

			DecimalFormat df = new DecimalFormat("#.00");
			DateTimeFormatter format = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

			entries.forEach(entry -> {
				String date = entry.getKey();
				if(groupByIndicator.equals("day")){
					datesArray.put(date);
				}else{
					int nextHour = LocalDateTime.parse(date,format).plusHours(1).getHour();
					datesArray.put(date+ "-" + String.format("%02d", nextHour) +":00");
				}


				JSONObject entryValue = entry.getValue();
				for (String metric : series.keySet()) {
					// get metric's array
					JSONArray increasedSerie = series.getJSONArray(metric);
					// override metric's array with new value
					increasedSerie.put(entryValue!=null && entryValue.has(metric) ?
							Float.parseFloat(df.format(entryValue.getFloat(metric))) : 0);
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
