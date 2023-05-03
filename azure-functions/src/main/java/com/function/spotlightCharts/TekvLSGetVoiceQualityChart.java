package com.function.spotlightCharts;

import com.function.auth.Resource;
import com.function.clients.TAPClient;
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
public class TekvLSGetVoiceQualityChart {
	/**
	 * This function listens at endpoint "/v1.0/spotlightCharts/simpleChart". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/spotlightCharts/simpleChart
	 * 2. curl "{your host}/v1.0/spotlightCharts/simpleChart"
	 */

	private final String dbConnectionUrl = "jdbc:postgresql://" + Constants.TEMP_ONPOINT_ADDRESS + "/" + Constants.TEMP_ONPOINT_DB 
			+ System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + Constants.TEMP_ONPOINT_USER
			+ "&password=" + Constants.TEMP_ONPOINT_PWD;

	@FunctionName("TekvLSGetVoiceQualityChart")
	public HttpResponseMessage run(
				@HttpTrigger(
				name = "req",
				methods = {HttpMethod.GET},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "spotlightCharts/voiceQualityChart")
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

		context.getLogger().info("Entering TekvLSGetVoiceQualityChart Azure function");
		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());
		String startDate = request.getQueryParameters().getOrDefault("startDate", "");
		String endDate = request.getQueryParameters().getOrDefault("endDate", "");

		String country = request.getQueryParameters().getOrDefault("country", "");
		String state = request.getQueryParameters().getOrDefault("state", "");
		String city = request.getQueryParameters().getOrDefault("city", "");

		String user = request.getQueryParameters().getOrDefault("user", "");

		String query = " SELECT sr.id as call_id, trr.did as user, AVG(CAST(ms.parameter_value AS numeric)) as \"POLQA\" " +
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
		SelectQueryBuilder queryBuilder = new SelectQueryBuilder(query, true);
		queryBuilder.appendCustomCondition("sr.startdate >= CAST(? AS timestamp)", startDate);
		queryBuilder.appendCustomCondition("sr.startdate <= CAST(? AS timestamp)", endDate);
		if (!country.isEmpty())
			queryBuilder.appendCustomCondition("trr.country = CAST(? AS varchar)", country);
		if (!state.isEmpty())
			queryBuilder.appendCustomCondition("trr.country = CAST(? AS varchar)", country);
		if (!city.isEmpty())
			queryBuilder.appendCustomCondition("trr.country = CAST(? AS varchar)", country);
		if (!user.isEmpty())
			queryBuilder.appendCustomCondition("trr.country = CAST(? AS varchar)", country);
		queryBuilder.appendGroupByMany("sr.id, trr.did");

		// Connect to the database
		try {

			String statement = queryBuilder.getQuery();

			// Retrieve all the calls.
			context.getLogger().info("Execute SQL statement: " + statement);
			JSONArray rs = TAPClient.executeQuery(Constants.TEMP_ONPOINT_URL,statement,context);

			float excellent = 0;
			float good = 0;
			float fair = 0;
			float bad = 0;
			float totalCalls = 0;
			HashSet<String> callIds = new HashSet<>();
			for (Object resultElement : rs) {
				JSONArray values = (JSONArray) resultElement;
				float polqa = values.getFloat(2);
				totalCalls+=1;
				callIds.add(values.getString(0));
				if(polqa>=4){ excellent+=1; continue; }
				if(polqa>=3 && polqa<4) { good += 1; continue; }
				if(polqa>=2 && polqa<3) { fair += 1; continue; }
				if(polqa>=0 && polqa<2) { bad += 1; }
			}
			JSONArray percentages;
			if(totalCalls>0){
				percentages = new JSONArray();
				percentages.put((excellent/totalCalls)*100);
				percentages.put((good/totalCalls)*100);
				percentages.put((fair/totalCalls)*100);
				percentages.put((bad/totalCalls)*100);
			}else{
				percentages = new JSONArray("[0,0,0,0]");
			}


			JSONArray categories = new JSONArray("['Excellent [4-5]','Good [3-4)','Fair [2-3)','Poor [0-2)']");
			JSONObject summary = new JSONObject();
			summary.put("calls_stream",totalCalls);
			summary.put("calls",callIds.size());

			JSONObject json = new JSONObject();
			json.put("summary",summary);
			json.put("percentages",percentages);
			json.put("categories",categories);
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
