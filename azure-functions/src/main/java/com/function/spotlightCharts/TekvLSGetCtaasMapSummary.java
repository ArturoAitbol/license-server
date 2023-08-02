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
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

import static com.function.auth.RoleAuthHandler.*;

public class TekvLSGetCtaasMapSummary {

    @FunctionName("TekvLSGetCtaasMapSummary")
    public HttpResponseMessage run(
            @HttpTrigger(name = "req",
                    methods = {HttpMethod.GET},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "spotlighCharts/mapSummary")
            HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context) {
        Claims tokenClaims = getTokenClaimsFromHeader(request, context);
        JSONArray roles = getRolesFromToken(tokenClaims, context);
        if (roles.isEmpty()) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
            json.put("error", MESSAGE_FOR_UNAUTHORIZED);
            return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
        }
        if (!hasPermission(roles, Resource.GET_MAP)) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }
        String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSGetCtaasMapSummary Azure function");
        context.getLogger().info("URL parameters are: " + request.getQueryParameters());
        String subaccountId = request.getQueryParameters().getOrDefault("subaccountId", "");
        String startDate = request.getQueryParameters().getOrDefault("startDate", "");
        String endDate = request.getQueryParameters().getOrDefault("endDate", "");
        String regions = request.getQueryParameters().getOrDefault("regions", "");

        if (subaccountId.isEmpty()) {
            JSONObject json = new JSONObject();
            json.put("error", "Missing mandatory parameter: subaccountId");
            context.getLogger().info("User " + userId + " is leaving TekvLSGetCtaasMapSummary Azure function with error");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }

        if (startDate.isEmpty()) {
            JSONObject json = new JSONObject();
            json.put("error", "Missing mandatory parameter: startDate");
            context.getLogger().info("User " + userId + " is leaving TekvLSGetCtaasMapSummary Azure function with error");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        if (endDate.isEmpty()) {
            endDate = ZonedDateTime.parse(startDate).format(DateTimeFormatter.ofPattern("yyyy-MM-dd 23:59:59"));
            startDate = ZonedDateTime.parse(startDate).format(DateTimeFormatter.ofPattern("yyyy-MM-dd 00:00:00"));

        }

        String sqlUnifiedLocationsData = 
        "SELECT fromcity, fromstate, fromcountry, tocity, tostate, tocountry, fromcoordinates, tocoordinates,\n" +
        "	sum(total_calls) as total_calls, sum(passed) as passed, sum(failed) as failed,\n" +
        "	sum(count_jitter) as count_jitter, sum(max_jitter) as max_jitter, sum(avg_jitter) as avg_jitter,\n" +
        "	sum(count_packet_loss) as count_packet_loss, sum(max_packet_loss) as max_packet_loss, sum(avg_packet_loss) as avg_packet_loss,\n" +
        "	sum(count_round_trip) as count_round_trip, sum(max_round_trip) as max_round_trip, sum(avg_round_trip) as avg_round_trip,\n" +
        "	sum(count_bitrate) as count_bitrate, sum(avg_bitrate) as avg_bitrate,\n" +
        "	sum(count_polqa) as count_polqa, sum(min_polqa) as min_polqa, sum(avg_polqa) as avg_polqa, sum(total_call_time) as total_call_time \n";

        String sqlStats = "SELECT er.fromcity, er.fromstate, er.fromcountry, er.tocity, er.tostate, er.tocountry, er.fromcoordinates, er.tocoordinates,\n" +
            "	null as total_calls, null as passed, null as failed,\n" +
            "	count(case when ms.parameter_name = '" + Utils.MEDIA_STATS_METRICS.JITTER.value() + "' then ms.parameter_name end) as count_jitter,\n" +
            "	max(case when ms.parameter_name = '" + Utils.MEDIA_STATS_METRICS.JITTER.value() + "' then CAST(NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]', '', 'g'), '') AS numeric) end) as max_jitter,\n" +
            "	avg(case when ms.parameter_name = '" + Utils.MEDIA_STATS_METRICS.JITTER.value() + "' then CAST(NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]', '', 'g'), '') AS numeric) end) as avg_jitter,\n" +
            "	count(case when ms.parameter_name = '" + Utils.MEDIA_STATS_METRICS.PACKET_LOSS.value() + "' then ms.parameter_name end) as count_packet_loss,\n" +
            "	max(case when ms.parameter_name = '" + Utils.MEDIA_STATS_METRICS.PACKET_LOSS.value() + "' then CAST(NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]', '', 'g'), '') AS numeric) end) as max_packet_loss,\n" +
            "	avg(case when ms.parameter_name = '" + Utils.MEDIA_STATS_METRICS.PACKET_LOSS.value() + "' then CAST(NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]', '', 'g'), '') AS numeric) end) as avg_packet_loss,\n" +
            "	count(case when ms.parameter_name = '" + Utils.MEDIA_STATS_METRICS.ROUND_TRIP_TIME.value() + "' then ms.parameter_name end) as count_round_trip,\n" +
            "	max(case when ms.parameter_name = '" + Utils.MEDIA_STATS_METRICS.ROUND_TRIP_TIME.value() + "' then CAST(NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]', '', 'g'), '') AS numeric) end) as max_round_trip,\n" +
            "	avg(case when ms.parameter_name = '" + Utils.MEDIA_STATS_METRICS.ROUND_TRIP_TIME.value() + "' then CAST(NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]', '', 'g'), '') AS numeric) end) as avg_round_trip,\n" +
            "	count(case when ms.parameter_name = '" + Utils.MEDIA_STATS_METRICS.BITRATE.value() + "' then ms.parameter_name end) as count_bitrate,\n" +
            "	avg(case when ms.parameter_name = '" + Utils.MEDIA_STATS_METRICS.BITRATE.value() + "' then CAST(NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]', '', 'g'), '') AS numeric) end) as avg_bitrate,\n" +
            "	count(case when ms.parameter_name = '" + Utils.MEDIA_STATS_METRICS.POLQA.value() + "' then ms.parameter_name end) as count_polqa,\n" +
            "	min(case when ms.parameter_name = '" + Utils.MEDIA_STATS_METRICS.POLQA.value() + "' then CAST(ms.parameter_value AS numeric) end) as min_polqa,\n" +
            "	avg(case when ms.parameter_name = '" + Utils.MEDIA_STATS_METRICS.POLQA.value() + "' then CAST(ms.parameter_value AS numeric) end) as avg_polqa,\n" +
            "	null as total_call_time \n" +
            "FROM media_stats ms\n" +
            "	LEFT JOIN test_result_resource trr ON ms.testresultresourceid = trr.id\n" +
            "	LEFT JOIN sub_result sr ON trr.subresultid = sr.id\n" +
            "	LEFT JOIN test_result tr ON sr.testresultid = tr.id\n" +
            "	LEFT JOIN run_instance r ON tr.runinstanceid = r.id\n" +
            "	LEFT JOIN project p ON r.projectid = p.id\n" +
            "	LEFT JOIN test_plan tp ON p.testplanid = tp.id\n" +
            "	LEFT JOIN execution_report er on sr.execution_report_id = er.id\n" +
            "WHERE sr.finalResult = true AND tp.name IN ('" + Utils.DEFAULT_TEST_PLAN_NAMES + "') AND " + Utils.CONSIDERED_STATUS_SUBQUERY + "\n" +
            "	AND " + Utils.CONSIDERED_FAILURES_SUBQUERY + "\n" +
            "	AND ms.parameter_name IN ('" + Utils.DEFAULT_METRICS + "')\n";

        String sqlTestResults = "SELECT er.fromcity, er.fromstate, er.fromcountry,\n" +
            "	er.tocity, er.tostate, er.tocountry,\n" +
            "	er.fromcoordinates, er.tocoordinates,\n" +
            "	count(distinct sr.id) as total_calls,\n" +
            "	count(distinct sr.id) FILTER (WHERE sr.status = 'PASSED') as passed,\n" +
            "	count(distinct sr.id) FILTER (WHERE sr.status = 'FAILED') as failed,\n" +
            "	null as count_jitter, null as max_jitter, null as avg_jitter,\n" +
            "	null as count_packet_loss, null as max_packet_loss, null as avg_packet_loss,\n" +
            "	null as count_round_trip, null as max_round_trip, null as avg_round_trip,\n" +
            "	null as count_bitrate, null as avg_bitrate,\n" +
            "	null as count_polqa, null as min_polqa, null as avg_polqa,\n" +
            "	sum( EXTRACT(EPOCH FROM (sr.enddate - sr.startdate)) ) as total_call_time \n" +
            "FROM execution_report er\n" +
            "	JOIN sub_result sr on sr.execution_report_id = er.id\n" +
            "	JOIN test_result tr ON sr.testresultid = tr.id\n" +
            "	JOIN run_instance r ON tr.runinstanceid = r.id\n" +
            "	JOIN project p ON r.projectid = p.id\n" +
            "	JOIN test_plan tp ON p.testplanid = tp.id\n" +
            "WHERE sr.finalResult = true AND tp.name IN ('" + Utils.DEFAULT_TEST_PLAN_NAMES + "') AND " + Utils.CONSIDERED_STATUS_SUBQUERY + "\n" +
            "	AND " + Utils.CONSIDERED_FAILURES_SUBQUERY + "\n";

        if (!regions.isEmpty()) {
            StringBuilder innerQueryBuilder = new StringBuilder("SELECT sr2.id FROM test_result_resource trr LEFT JOIN sub_result sr2 ON trr.subresultid = sr2.id WHERE ");
            String condition = "";
            StringBuilder regionCondition = Utils.getRegionSQLCondition(regions);
            if(regionCondition != null)
                condition = regionCondition.toString();
            innerQueryBuilder.append(condition);
            sqlStats += " AND " + regionCondition;
            sqlTestResults += "\tAND sr.id IN (" + innerQueryBuilder + ")\n";
        }

        SelectQueryBuilder statsStmt = new SelectQueryBuilder(sqlStats, true);
        statsStmt.appendCustomCondition("sr.startdate >= CAST(? AS timestamp)", startDate);
        statsStmt.appendCustomCondition("sr.startdate <= CAST(? AS timestamp)", endDate);
        statsStmt.appendGroupByMany("fromcountry, fromstate, fromcity, tocountry, tostate, tocity, fromcoordinates, tocoordinates");

        SelectQueryBuilder testResultsStmt = new SelectQueryBuilder(sqlTestResults, true);
        testResultsStmt.appendCustomCondition("sr.startdate >= CAST(? AS timestamp)", startDate);
        testResultsStmt.appendCustomCondition("sr.startdate <= CAST(? AS timestamp)", endDate);
        testResultsStmt.appendGroupByMany("fromcountry, fromstate, fromcity, tocountry, tostate, tocity, fromcoordinates, tocoordinates");

        // Build SQL statement to get the TAP URL
        SelectQueryBuilder tapUrlQueryBuilder = new SelectQueryBuilder("SELECT tap_url FROM ctaas_setup");
        tapUrlQueryBuilder.appendEqualsCondition("subaccount_id", subaccountId, QueryBuilder.DATA_TYPE.UUID);

        // Build SQL statement to verify the role
        String email = getEmailFromToken(tokenClaims, context);
        SelectQueryBuilder verificationQueryBuilder = getCustomerRoleVerificationQuery(subaccountId, roles, email);

        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv(
                "POSTGRESQL_SERVER") + "/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");
        try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
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
                        context.getLogger().info("User " + userId + " is leaving TekvLSGetCtaasMapSummary Azure function with error");
                        return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
                    }
                }
            }

            // Retrieve tap URL
            context.getLogger().info("Execute TAP url SQL statement: " + selectStmtTapUrl);
            rs = selectStmtTapUrl.executeQuery();
            String tapURL = null;
            if (rs.next()) {
                tapURL = rs.getString("tap_url");
            }
            if (tapURL == null || tapURL.isEmpty()) {
                context.getLogger().info(Constants.LOG_MESSAGE_FOR_INVALID_TAP_URL + " | " + tapURL);
                json.put("error", Constants.MESSAGE_FOR_INVALID_TAP_URL);
                context.getLogger().info("User " + userId + " is leaving TekvLSGetCtaasMapSummary Azure function with error");
                return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
            }
            context.getLogger().info("TAP URL for data query: " + tapURL);

            // Build unified query with execution details and media stats
            sqlStats = statsStmt.getQuery();
            sqlTestResults = testResultsStmt.getQuery();
            sqlUnifiedLocationsData += "FROM (\n(" + sqlStats + ")\nUNION (" + sqlTestResults + ")\n) as unified_results\n" +
                "GROUP BY fromcountry, fromstate, fromcity, tocountry, tostate, tocity, fromcoordinates, tocoordinates";
            context.getLogger().info("Execute map SQL statement: " + sqlUnifiedLocationsData);

            JSONArray resultSet = TAPClient.executeQuery(tapURL, sqlUnifiedLocationsData, context);
            JSONArray result = new JSONArray();
            for (Object entry : resultSet) {
                JSONObject res = new JSONObject();
                JSONArray entryArr = ((JSONArray) entry);
                JSONObject fromObj = new JSONObject();
                JSONObject fromCoordinates = new JSONObject();
                JSONObject tooCoordinates = new JSONObject();
                if(!entryArr.get(0).equals(null) && !entryArr.get(1).equals(null) && !entryArr.get(2).equals(null) &&
                        !entryArr.get(6).equals("") && !entryArr.get(6).equals(null)) {
                    fromObj.put("city", entryArr.getString(0));
                    fromObj.put("state", entryArr.getString(1));
                    fromObj.put("country", entryArr.getString(2));
                    fromCoordinates.put("x",Float.parseFloat(entryArr.getString(6).split(",")[0]));
                    fromCoordinates.put("y",Float.parseFloat(entryArr.getString(6).split(",")[1]));
                    fromObj.put("location", fromCoordinates);
                    res.put("from", fromObj);
                }
                JSONObject toObj = new JSONObject();
                if(!entryArr.get(3).equals(null) && !entryArr.get(4).equals(null) && !entryArr.get(5).equals(null) &&
                        !entryArr.get(7).equals("") && !entryArr.get(6).equals(null)) {
                    toObj.put("city", entryArr.getString(3));
                    toObj.put("state", entryArr.getString(4));
                    toObj.put("country", entryArr.getString(5));
                    tooCoordinates.put("x", Float.parseFloat(entryArr.getString(7).split(",")[0]));
                    tooCoordinates.put("y", Float.parseFloat(entryArr.getString(7).split(",")[1]));
                    toObj.put("location", tooCoordinates);
                    res.put("to", toObj);
                }
                if(!toObj.isEmpty() && !fromObj.isEmpty()) {
                    res.put("totalCalls", entryArr.get(8));
                    res.put("passed", entryArr.get(9));
                    res.put("failed", entryArr.get(10));
                    res.put("totalCallTimes", entryArr.get(25));
                    JSONObject jitter = new JSONObject();
                    jitter.put("count", entryArr.get(11));
                    jitter.put("max", entryArr.get(12));
                    jitter.put("avg", entryArr.get(13));
                    res.put("receivedJitter", jitter);
                    JSONObject packetLoss = new JSONObject();
                    packetLoss.put("count", entryArr.get(14));
                    packetLoss.put("max", entryArr.get(15));
                    packetLoss.put("avg", entryArr.get(16));
                    res.put("receivedPacketLoss", packetLoss);
                    JSONObject roundTrip = new JSONObject();
                    roundTrip.put("count", entryArr.get(17));
                    roundTrip.put("max", entryArr.get(18));
                    roundTrip.put("avg", entryArr.get(19));
                    res.put("roundTripTime", roundTrip);
                    JSONObject bitRate = new JSONObject();
                    bitRate.put("count", entryArr.get(20));
                    bitRate.put("avg", entryArr.get(21));
                    res.put("sentBitrate", bitRate);
                    JSONObject polqa = new JSONObject();
                    polqa.put("count", entryArr.get(22));
                    polqa.put("min", entryArr.get(23));
                    polqa.put("avg", entryArr.get(24));
                    res.put("polqa", polqa);
                    result.put(res);
                }
            }
            context.getLogger().info("User " + userId + " is successfully leaving TekvLSGetCtaasMapSummary Azure function");
            return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(result.toString()).build();
        } catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSGetCtaasMapSummary Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSGetCtaasMapSummary Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }
}
