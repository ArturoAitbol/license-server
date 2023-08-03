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
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
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
		String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSGetCollectionChart Azure function");
		
		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());
		String subaccountId = request.getQueryParameters().getOrDefault("subaccountId", "");
		String reportType = request.getQueryParameters().getOrDefault("reportType", "");
		String startDate = request.getQueryParameters().getOrDefault("startDate", "");
		String endDate = request.getQueryParameters().getOrDefault("endDate", "");

		String regions = request.getQueryParameters().getOrDefault("regions","");

		String users = request.getQueryParameters().getOrDefault("users", "");
		String usersClause = users.replace(",","', '");

		String query = "SELECT CAST(sr.startdate AS DATE) as date, sr.status, COUNT(sr.status) as status_counter " +
			"FROM sub_result sr " +
			"LEFT JOIN test_result tr ON sr.testresultid = tr.id " +
			"LEFT JOIN run_instance r ON tr.runinstanceid = r.id " +
			"LEFT JOIN project p ON r.projectid = p.id " +
			"LEFT JOIN test_plan tp ON p.testplanid = tp.id " +
			"WHERE sr.finalResult = true AND " + Utils.CONSIDERED_STATUS_SUBQUERY + " AND " + Utils.CONSIDERED_FAILURES_SUBQUERY;
		switch (reportType) {
			case "FeatureFunctionality":
				query += " AND tp.name='" + Utils.TEST_PLAN_NAMES.FEATURE_FUNCTIONALITY.value() + "'";
				break;
			case "CallingReliability":
				query += " AND (tp.name='" + Utils.TEST_PLAN_NAMES.CALLING_RELIABILITY.value() + "' OR tp.name='" + Utils.TEST_PLAN_NAMES.POLQA.value() + "')";
				break;
			default:
				query += " AND tp.name IN ('" + Utils.DEFAULT_TEST_PLAN_NAMES + "')";
				break;
		}
		
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
		queryBuilder.appendGroupByMany("date,sr.status");
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
						context.getLogger().info("User " + userId + " is leaving TekvLSGetCollectionChart Azure function with error");
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
				context.getLogger().info("User " + userId + " is leaving TekvLSGetCollectionChart Azure function with error");
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}
			context.getLogger().info("TAP URL for data query: " + tapURL);

			String statement = queryBuilder.getQuery();

			// Retrieve all data.
			context.getLogger().info("Execute SQL statement: " + statement);
			JSONArray resultSet = TAPClient.executeQuery(tapURL,statement,context);

			LocalDate startLocalDate = LocalDate.parse(startDate.split(" ")[0]);
			LocalDate endLocalDate = LocalDate.parse(endDate.split(" ")[0]);
			TreeMap<String,JSONObject> dates = getDatesBetween(startLocalDate,endLocalDate);

			for (Object resultElement : resultSet) {
				JSONArray values = (JSONArray) resultElement;
				JSONObject date = dates.get(values.getString(0));
				date.put(values.getString(1),values.getInt(2));
			}
			JSONArray categories = new JSONArray();

			JSONObject seriesObject = new JSONObject();
			seriesObject.put("PERCENTAGE",new JSONArray());

			Set<Map.Entry<String, JSONObject> > entries = dates.entrySet();
			DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.US);
			symbols.setDecimalSeparator('.');
			DecimalFormat df = new DecimalFormat("#.00", symbols);

			entries.forEach(entry -> {
				DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM-dd-yyyy");
				LocalDate dateKey = LocalDate.parse(entry.getKey());
				categories.put(dateKey.format(formatter));

				JSONObject object = entry.getValue();

				float total = 0;
				float pass = 0;

				for (String key:object.keySet()) {
					if(!seriesObject.has(key)){
						seriesObject.put(key,new JSONArray());
					}

					JSONArray array = seriesObject.getJSONArray(key);
					int value = object.getInt(key);
					array.put(value);

					total += value;
					if(key.equals("PASSED"))
						pass+=value;
				}
				JSONArray percentageArray = seriesObject.getJSONArray("PERCENTAGE");
				percentageArray.put(Float.valueOf(df.format(total>0 ? (pass*100)/total:0)));
			});

			JSONArray failedArray = seriesObject.getJSONArray("FAILED");
			JSONArray interruptedArray = seriesObject.getJSONArray("INTERRUPTED");
			for (int i = 0; i < failedArray.length(); i++) {
				int number = failedArray.getInt(i)+ interruptedArray.getInt(i);
				failedArray.put(i,number);
			}


			JSONObject seriesObject_1 = new JSONObject();
			seriesObject_1.put("failed",failedArray);
			seriesObject_1.put("passed",seriesObject.getJSONArray("PASSED"));
			seriesObject_1.put("percentage",seriesObject.getJSONArray("PERCENTAGE"));
			json.put("categories",categories);
			json.put("series", seriesObject_1);
			context.getLogger().info("User " + userId + " is successfully leaving TekvLSGetCollectionChart Azure function");
			return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();
		}
		catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", "SQL Exception: " + e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSGetCollectionChart Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
		catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSGetCollectionChart Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}

	public TreeMap<String,JSONObject> getDatesBetween(LocalDate startDate, LocalDate endDate) {

		TreeMap<String,JSONObject> map = new TreeMap<>();

		long numOfDaysBetween = ChronoUnit.DAYS.between(startDate, endDate)+1;

		IntStream.iterate(0, i -> i + 1)
				.limit(numOfDaysBetween)
				.mapToObj(i->startDate.plusDays(i).toString())
				.forEach(i -> map.put(i, new JSONObject("{PASSED:0,FAILED:0,INTERRUPTED:0}")));

		return map;
	}
}
