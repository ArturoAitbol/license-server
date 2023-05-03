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
import static com.function.auth.Roles.*;

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
		String metrics = request.getQueryParameters().getOrDefault("metric", "POLQA");
		String groupByIndicator = request.getQueryParameters().getOrDefault("groupBy", "hour");

		String metricsClause = metrics.replace(",", "', '");
		String groupByClause = groupByIndicator.equals("day") ? "YYYY-MM-DD" : "YYYY-MM-DD HH24:00";

		Iterator<String> metricsArray = Arrays.stream(metrics.split(",")).iterator();
		StringBuilder statistics = new StringBuilder();
		List<String> statisticsLabels = new ArrayList<>();
		while (metricsArray.hasNext()) {
			String metric = metricsArray.next();
			switch (metric) {
				case "Received Jitter":
					statistics.append("max(case when ms.parameter_name = 'Received Jitter' then CAST( NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]','','g'), '') AS numeric) end) as \"Received Jitter\" " );
					statisticsLabels.add("Received Jitter");
					break;
				case "Received packet loss":
					statistics.append("max(case when ms.parameter_name = 'Received packet loss' then CAST( NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]','','g'), '') AS numeric) end) as \"Received packet loss\"  ");
					statisticsLabels.add("Received packet loss");
					break;
				case "Round trip time":
					statistics.append("max(case when ms.parameter_name = 'Round trip time' then CAST( NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]','','g'), '') AS numeric) end) as \"Round trip time\" ");
					statisticsLabels.add("Round trip time");
					break;
				case "Sent bitrate":
					statistics.append("avg(case when ms.parameter_name = 'Sent bitrate' then CAST( NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]','','g'), '') AS numeric) end) as \"Sent bitrate\" ");
					statisticsLabels.add("Sent bitrate");
					break;
				case "POLQA":
					statistics.append("min(case when ms.parameter_name = 'POLQA' then CAST(ms.parameter_value AS numeric) end) as \"POLQA\" ");
					statisticsLabels.add("POLQA");
					break;
			}
			if (metricsArray.hasNext()) {
				 statistics.append(",");
			}
		}

		String query = "SELECT TO_CHAR(ms.last_modified_date,'"+groupByClause+"') as date_hour, " + statistics +
				" FROM media_stats ms " +
				"LEFT JOIN test_result_resource trs ON ms.testresultresourceid = trs.id " +
				"LEFT JOIN sub_result sr ON trs.subresultid = sr.id " +
				"LEFT JOIN TEST_RESULT tr ON sr.testresultid = tr.id " +
				"LEFT JOIN run_instance r ON tr.runinstanceid = r.id " +
				"LEFT JOIN project p ON r.projectid = p.id " +
				"LEFT JOIN test_plan tp ON p.testplanid = tp.id " +
				"WHERE sr.finalResult = true AND sr.status != 'ABORTED' AND sr.status != 'RUNNING' AND sr.status != 'QUEUED' " +
				"AND (sr.failingerrortype IS NULL OR trim(sr.failingerrortype)='' OR sr.failingerrortype = 'Routing Issue' OR sr.failingerrortype = 'Teams Client Issue' " +
				"OR sr.failingerrortype = 'Media Quality' OR sr.failingerrortype = 'Media Routing') AND tp.name in ('LTS','STS','POLQA')  AND ms.parameter_name IN ('" + metricsClause + "')";
		
		// Build SQL statement
		SelectQueryBuilder queryBuilder = new SelectQueryBuilder(query, true);
		queryBuilder.appendCustomCondition("sr.startdate >= CAST( ? AS timestamp)", startDate);
		queryBuilder.appendCustomCondition("sr.startdate <= CAST( ? AS timestamp)", endDate);
		queryBuilder.appendGroupByMany("date_hour");
		queryBuilder.appendOrderBy("date_hour", ORDER_DIRECTION.ASC);

		// Build SQL statement to get the TAP URL
		SelectQueryBuilder tapUrlQueryBuilder = new SelectQueryBuilder("SELECT c.name as customerName, s.name as subaccountName, cs.tap_url as tapURL  FROM customer c LEFT JOIN subaccount s ON c.id = s.customer_id LEFT JOIN ctaas_setup cs ON s.id = cs.subaccount_id");
		tapUrlQueryBuilder.appendEqualsCondition("s.id", subaccountId, QueryBuilder.DATA_TYPE.UUID);

		// Build SQL statement to verify the role
		String email = getEmailFromToken(tokenClaims, context);
		SelectQueryBuilder verificationQueryBuilder = getVerificationQueryBuilder(subaccountId,roles,email);
		
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
			String customerName = null;
			String subaccountName = null;
			String tapURL = null;
			if (rs.next()) {
				customerName = rs.getString("customerName");
				subaccountName = rs.getString("subaccountName");
				tapURL = rs.getString("tapURL");
				context.getLogger().info("customer name : " + customerName + " | subaccount name : " + subaccountName + " | TAP URL : " + tapURL);
			}

			if ((customerName == null || customerName.isEmpty()) || (subaccountName == null || subaccountName.isEmpty())) {
				context.getLogger().info(LOG_MESSAGE_FOR_INVALID_SUBACCOUNT_ID + email);
				json.put("error", MESSAGE_SUBACCOUNT_ID_NOT_FOUND);
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}

			if (tapURL == null || tapURL.isEmpty()) {
				context.getLogger().info(Constants.LOG_MESSAGE_FOR_INVALID_TAP_URL + " | " + tapURL);
				json.put("error", Constants.MESSAGE_FOR_INVALID_TAP_URL);
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}
			context.getLogger().info("Requesting TAP for data query. URL: " + tapURL);

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

	private SelectQueryBuilder getVerificationQueryBuilder(String subaccountId,JSONArray roles,String email){
		SelectQueryBuilder verificationQueryBuilder = null;
		String currentRole = evaluateRoles(roles);
		switch (currentRole) {
			case CUSTOMER_FULL_ADMIN:
				verificationQueryBuilder = new SelectQueryBuilder("SELECT s.id FROM subaccount s, customer_admin ca");
				verificationQueryBuilder.appendCustomCondition("s.customer_id = ca.customer_id AND admin_email = ?", email);
				break;
			case SUBACCOUNT_ADMIN:
			case SUBACCOUNT_STAKEHOLDER:
				verificationQueryBuilder = new SelectQueryBuilder("SELECT subaccount_id FROM subaccount_admin");
				verificationQueryBuilder.appendEqualsCondition("subaccount_admin_email", email);
				break;
		}
		if (verificationQueryBuilder != null) {
			if (currentRole.equals(SUBACCOUNT_ADMIN) || currentRole.equals(SUBACCOUNT_STAKEHOLDER))
				verificationQueryBuilder.appendEqualsCondition("subaccount_id", subaccountId, QueryBuilder.DATA_TYPE.UUID);
			else
				verificationQueryBuilder.appendEqualsCondition("s.id", subaccountId, QueryBuilder.DATA_TYPE.UUID);
		}

		return verificationQueryBuilder;
	}
}
