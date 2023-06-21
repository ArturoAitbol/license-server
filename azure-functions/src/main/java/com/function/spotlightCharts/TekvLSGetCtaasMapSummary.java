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
import java.util.ArrayList;
import java.util.List;
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
        context.getLogger().info("Entering TekvLSGetCtaasMapSummary Azure function");
        context.getLogger().info("URL parameters are: " + request.getQueryParameters());
        String subaccountId = request.getQueryParameters().getOrDefault("subaccountId", "");
        String startDate = request.getQueryParameters().getOrDefault("startDate", "");
        String endDate = request.getQueryParameters().getOrDefault("endDate", "");
        String regions = request.getQueryParameters().getOrDefault("regions", "");

        if (subaccountId.isEmpty()) {
            JSONObject json = new JSONObject();
            json.put("error", "Missing mandatory parameter: subaccountId");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }

        if (startDate.isEmpty()) {
            JSONObject json = new JSONObject();
            json.put("error", "Missing mandatory parameter: startDate");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        if (endDate.isEmpty()) {
            endDate = ZonedDateTime.parse(startDate).format(DateTimeFormatter.ofPattern("yyyy-MM-dd 23:59:59"));
            startDate = ZonedDateTime.parse(startDate).format(DateTimeFormatter.ofPattern("yyyy-MM-dd 00:00:00"));

        }

        String sql = "SELECT er.fromcity as from_city, er.fromstate as from_state, er.fromcountry as from_country," +
                "       er.tocity as to_city, er.tostate as to_state, er.tocountry as to_country, er.fromcoordinates as from_coordinates, er.tocoordinates as to_coordinates," +
                "       count(distinct sr.id) as total_calls,\n" +
                "       count(distinct sr.id) FILTER (WHERE sr.status = 'PASSED') as passed,\n" +
                "       count(distinct sr.id) FILTER (WHERE sr.status = 'FAILED') as failed," +
                "       count(case when ms.parameter_name = 'Received Jitter' then ms.parameter_name end) as count_jitter," +
                "       max(case when ms.parameter_name = 'Received Jitter'" +
                "           then CAST(NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]', '', 'g'), '') AS numeric) end) as max_jitter," +
                "       avg(case when ms.parameter_name = 'Received Jitter'" +
                "           then CAST(NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]', '', 'g'), '') AS numeric) end) as avg_jitter," +
                "       count(case when ms.parameter_name = 'Received packet loss' then ms.parameter_name end) as count_packet_loss," +
                "       max(case when ms.parameter_name = 'Received packet loss'" +
                "           then CAST(NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]', '', 'g'), '') AS numeric) end) as max_packet_loss," +
                "       avg(case when ms.parameter_name = 'Received packet loss'" +
                "           then CAST(NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]', '', 'g'), '') AS numeric) end) as avg_packet_loss," +
                "       count(case when ms.parameter_name = 'Round trip time' then ms.parameter_name end) as count_round_trip," +
                "       max(case when ms.parameter_name = 'Round trip time'" +
                "           then CAST(NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]', '', 'g'), '') AS numeric) end) as max_round_trip," +
                "       avg(case when ms.parameter_name = 'Round trip time'" +
                "           then CAST(NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]', '', 'g'), '') AS numeric) end) as avg_round_trip," +
                "       count(case when ms.parameter_name = 'Sent bitrate' then ms.parameter_name end) as count_bitrate," +
                "       avg(case when ms.parameter_name = 'Sent bitrate'" +
                "           then CAST(NULLIF(regexp_replace(ms.parameter_value, '[^\\.\\d]', '', 'g'), '') AS numeric) end) as avg_bitrate," +
                "       count(case when ms.parameter_name = 'POLQA' then ms.parameter_name end) as count_polqa," +
                "       min(case when ms.parameter_name = 'POLQA' then CAST(ms.parameter_value AS numeric) end) as min_polqa," +
                "       avg(case when ms.parameter_name = 'POLQA' then CAST(ms.parameter_value AS numeric) end) as avg_polqa " +
                "FROM media_stats ms" +
                "         LEFT JOIN test_result_resource trr ON ms.testresultresourceid = trr.id" +
                "         LEFT JOIN sub_result sr ON trr.subresultid = sr.id" +
                "         LEFT JOIN test_result tr ON sr.testresultid = tr.id" +
                "         LEFT JOIN run_instance r ON tr.runinstanceid = r.id" +
                "         LEFT JOIN project p ON r.projectid = p.id" +
                "         LEFT JOIN test_plan tp ON p.testplanid = tp.id" +
                "         LEFT JOIN execution_report er on sr.execution_report_id = er.id " +
                "WHERE sr.finalResult = true AND tp.name IN ('" + Utils.DEFAULT_TEST_PLAN_NAMES + "')" +
                "  AND " + Utils.CONSIDERED_STATUS_SUBQUERY + " AND " + Utils.CONSIDERED_FAILURES_SUBQUERY +
                "  AND ms.parameter_name IN ('Received Jitter', 'Received packet loss', 'Round trip time', 'Sent bitrate', 'POLQA')";

        if (!regions.isEmpty()) {
            StringBuilder innerQueryBuilder = new StringBuilder("SELECT sr2.id FROM test_result_resource trr LEFT JOIN sub_result sr2 ON trr.subresultid = sr2.id WHERE ");
            List<String> conditions = new ArrayList<>();
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
            sql += " AND sr.id IN (" + innerQueryBuilder + ")";
        }

        SelectQueryBuilder locationsQB = new SelectQueryBuilder(sql, true);
        locationsQB.appendCustomCondition("sr.startdate >= CAST(? AS timestamp)", startDate);
        locationsQB.appendCustomCondition("sr.startdate <= CAST(? AS timestamp)", endDate);
        locationsQB.appendGroupByMany("fromcountry, fromstate, fromcity, tocountry, tostate, tocity, fromcoordinates, tocoordinates");

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
                return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
            }
            context.getLogger().info("TAP URL for data query: " + tapURL);

            String locationsSql = locationsQB.getQuery();
            context.getLogger().info("Execute map SQL statement: " + locationsSql);
            JSONArray resultSet = TAPClient.executeQuery(tapURL, locationsSql, context);
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
            return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(result.toString()).build();
        } catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }
}
