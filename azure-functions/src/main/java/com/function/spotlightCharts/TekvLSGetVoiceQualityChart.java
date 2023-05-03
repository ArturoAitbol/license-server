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
import java.util.*;

import static com.function.auth.RoleAuthHandler.*;
import static com.function.auth.Roles.*;

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
		String subaccountId = request.getQueryParameters().getOrDefault("subaccountId", "");
		String startDate = request.getQueryParameters().getOrDefault("startDate", "");
		String endDate = request.getQueryParameters().getOrDefault("endDate", "");
		String query = " SELECT sr.id as call_id, trs.did as user, AVG(CAST(ms.parameter_value AS numeric)) as \"POLQA\" " +
				"FROM media_stats ms " +
				"LEFT JOIN test_result_resource trs ON ms.testresultresourceid = trs.id " +
				"LEFT JOIN sub_result sr ON trs.subresultid = sr.id " +
				"LEFT JOIN TEST_RESULT tr ON sr.testresultid = tr.id " +
				"LEFT JOIN run_instance r ON tr.runinstanceid = r.id " +
				"LEFT JOIN project p ON r.projectid = p.id " +
				"LEFT JOIN test_plan tp ON p.testplanid = tp.id " +
				"WHERE sr.finalresult = true AND sr.status != 'ABORTED' AND sr.status != 'RUNNING' AND sr.status != 'QUEUED' " +
				"AND (sr.failingerrortype IS NULL OR trim(sr.failingerrortype) = '' OR sr.failingerrortype = 'Routing Issue' OR sr.failingerrortype = 'Teams Client Issue' OR sr.failingerrortype = 'Media Quality' OR sr.failingerrortype = 'Media Routing') " +
				"AND tp.name='POLQA' AND ms.parameter_name = 'POLQA'";
		
		// Build SQL statement
		SelectQueryBuilder queryBuilder = new SelectQueryBuilder(query, true);
		queryBuilder.appendCustomCondition("sr.startdate >= CAST( ? AS timestamp)", startDate);
		queryBuilder.appendCustomCondition("sr.startdate <= CAST( ? AS timestamp)", endDate);
		queryBuilder.appendGroupByMany("sr.id, trs.did");

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

			// Retrieve all the calls.
			context.getLogger().info("Execute SQL statement: " + statement);
			JSONArray resultSet = TAPClient.executeQuery(tapURL,statement,context);

			float excellent = 0;
			float good = 0;
			float fair = 0;
			float bad = 0;
			float totalCalls = 0;
			HashSet<String> callIds = new HashSet<>();
			for (Object resultElement : resultSet) {
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
