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

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Optional;

import static com.function.auth.RoleAuthHandler.*;

public class TekvLSGetFilterOptions {

    @FunctionName("TekvLSGetFilterOptions")
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.GET},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "spotlightCharts/getFilterOptions")
            HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context)
    {
        Claims tokenClaims = getTokenClaimsFromHeader(request, context);
        JSONArray roles = getRolesFromToken(tokenClaims, context);
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
		context.getLogger().info("User " + userId + " is Entering TekvLSGetFilterOptions Azure function");
        
        // Get query parameters
        context.getLogger().info("URL parameters are: " + request.getQueryParameters());
        String subaccountId = request.getQueryParameters().getOrDefault("subaccountId","");
        String filter = request.getQueryParameters().getOrDefault("filter","");
        String regions = request.getQueryParameters().getOrDefault("regions","");
        String startDate = request.getQueryParameters().getOrDefault("startDate","");
        String endDate = request.getQueryParameters().getOrDefault("endDate","");

        // Build SQL statements to get filter options
        String basicQueryConditions = "FROM test_result_resource trr " + 
                "   LEFT JOIN sub_result sr ON trr.subresultid = sr.id" +
                "   LEFT JOIN test_result tr ON sr.testresultid = tr.id" +
                "   LEFT JOIN run_instance r ON tr.runinstanceid = r.id" +
                "   LEFT JOIN project p ON r.projectid = p.id" +
                "   LEFT JOIN test_plan tp ON p.testplanid = tp.id" +
                " WHERE sr.finalResult = true AND tp.name IN ('" + Utils.DEFAULT_TEST_PLAN_NAMES + "')" +
                "   AND " + Utils.CONSIDERED_STATUS_SUBQUERY + " AND " + Utils.CONSIDERED_FAILURES_SUBQUERY; 
        SelectQueryBuilder regionsQueryBuilder = new SelectQueryBuilder("SELECT trr.country, trr.state, trr.city " + basicQueryConditions, true);

        String userQuery = "SELECT trr.did " + basicQueryConditions;
        SelectQueryBuilder usersQueryBuilder;
        if(!regions.isEmpty()){
            StringBuilder regionCondition = Utils.getRegionSQLCondition(regions);
            if(regionCondition != null)
                userQuery += " AND " + regionCondition;
            usersQueryBuilder = new SelectQueryBuilder(userQuery, true);
        }else{
            usersQueryBuilder = new SelectQueryBuilder(userQuery, true);
        }


        if(!startDate.isEmpty() && !endDate.isEmpty()){
            regionsQueryBuilder.appendCustomCondition("sr.startdate >= CAST(? AS timestamp)", startDate);
            regionsQueryBuilder.appendCustomCondition("sr.startdate <= CAST(? AS timestamp)", endDate);

            usersQueryBuilder.appendCustomCondition("sr.startdate >= CAST(? AS timestamp)", startDate);
            usersQueryBuilder.appendCustomCondition("sr.startdate <= CAST(? AS timestamp)", endDate);
        }
        
        usersQueryBuilder.appendGroupBy("trr.did");
        regionsQueryBuilder.appendGroupByMany("trr.country, trr.state, trr.city");

        // Build SQL statement to get the TAP URL
        SelectQueryBuilder tapUrlQueryBuilder = new SelectQueryBuilder("SELECT tap_url FROM ctaas_setup");
        tapUrlQueryBuilder.appendEqualsCondition("subaccount_id", subaccountId, QueryBuilder.DATA_TYPE.UUID);

        // Build SQL statement to verify the role
        String email = getEmailFromToken(tokenClaims,context);
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
                        context.getLogger().info("User " + userId + " is leaving TekvLSGetFilterOptions Azure function with error");
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
                context.getLogger().info("User " + userId + " is leaving TekvLSGetFilterOptions Azure function with error");
                return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
            }
            context.getLogger().info("TAP URL for data query: " + tapURL);

            // Retrieve all data.
            if(filter.isEmpty() || filter.equals("regions")){
                String regionsQuery = regionsQueryBuilder.getQuery();
                context.getLogger().info("Execute Regions SQL statement: " + regionsQuery);
                JSONArray regionsRs = TAPClient.executeQuery(tapURL, regionsQuery, context);
                JSONArray regionsJson = new JSONArray();

                for (Object o : regionsRs) {
                    JSONObject jobj = new JSONObject();
                    JSONArray values = (JSONArray) o;
                    jobj.put("country", values.get(0));
                    jobj.put("state", values.get(1));
                    jobj.put("city", values.get(2));
                    regionsJson.put(jobj);
                }
                json.put("regions", regionsJson);
            }

            if(filter.isEmpty() || filter.equals("users")){
                String usersQuery = usersQueryBuilder.getQuery();
                context.getLogger().info("Execute Users SQL statement: " + usersQuery);
                JSONArray usersRs = TAPClient.executeQuery(tapURL, usersQuery, context);
                json.put("users", usersRs);
            }
            context.getLogger().info("User " + userId + " is successfully leaving TekvLSGetFilterOptions Azure function");
            return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSGetFilterOptions Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }
}
