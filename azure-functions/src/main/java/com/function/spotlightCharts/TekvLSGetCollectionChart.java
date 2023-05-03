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
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.IntStream;

import static com.function.auth.RoleAuthHandler.*;
import static com.function.auth.Roles.*;

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

		context.getLogger().info("Entering TekvLSGetCollectionChart Azure function");
		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());
		String subaccountId = request.getQueryParameters().getOrDefault("subaccountId", "");
		String reportType = request.getQueryParameters().getOrDefault("reportType", "");
		String startDate = request.getQueryParameters().getOrDefault("startDate", "");
		String endDate = request.getQueryParameters().getOrDefault("endDate", "");

		String country = request.getQueryParameters().getOrDefault("country", "");
		String state = request.getQueryParameters().getOrDefault("state", "");
		String city = request.getQueryParameters().getOrDefault("city", "");

		String user = request.getQueryParameters().getOrDefault("user", "");

		String query = "SELECT CAST(sr.endDate AS DATE), sr.status, COUNT(sr.status) as status_counter " +
			"FROM sub_result sr " +
			"LEFT JOIN test_result tr ON sr.testresultid = tr.id " +
			"LEFT JOIN run_instance r ON tr.runinstanceid = r.id " +
			"LEFT JOIN project p ON r.projectid = p.id " +
			"LEFT JOIN test_plan tp ON p.testplanid = tp.id " +
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
		
		// Build region filter if present
		if (!country.isEmpty() || !user.isEmpty()) {
			query += " AND sr.id IN (SELECT sr2.id FROM test_result_resource trr LEFT JOIN sub_result sr2 ON trr.subresultid = sr2.id WHERE";
			if (user.isEmpty())
				query += " trr.country = CAST('" + country + "' AS varchar)";
			else {
				query += " trr.did = CAST('" + user + "' AS varchar)";
				if (!country.isEmpty())
					query += " AND trr.country = CAST('" + country + "' AS varchar)";
			}
			if (!state.isEmpty())
				query += " AND trr.state = CAST('" + state + "' AS varchar)";
			if (!city.isEmpty())
				query += " AND trr.city = CAST('" + city + "' AS varchar)";
			query += ")";
		}
		
		// Build SQL statement
		SelectQueryBuilder queryBuilder = new SelectQueryBuilder(query, true);
		queryBuilder.appendCustomCondition("sr.startdate >= CAST(? AS timestamp)", startDate);
		queryBuilder.appendCustomCondition("sr.startdate <= CAST(? AS timestamp)", endDate);
		queryBuilder.appendGroupByMany("CAST(sr.endDate AS DATE),sr.status");
		queryBuilder.appendOrderBy("CAST(sr.endDate AS DATE)", SelectQueryBuilder.ORDER_DIRECTION.ASC);

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
			DecimalFormat df = new DecimalFormat("#.00");

			entries.forEach(entry -> {
				categories.put(entry.getKey());

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
				.forEach(i -> map.put(i, new JSONObject("{PASSED:0,FAILED:0,INTERRUPTED:0}")));

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
