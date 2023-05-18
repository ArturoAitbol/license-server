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
import static com.function.auth.RoleAuthHandler.getCustomerRoleVerificationQuery;

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

        context.getLogger().info("Entering TekvLSGetFilterOptions Azure function");
        // Get query parameters
        context.getLogger().info("URL parameters are: " + request.getQueryParameters());
        String subaccountId = request.getQueryParameters().getOrDefault("subaccountId","");
        String filter = request.getQueryParameters().getOrDefault("filter","");

        // Build SQL statements to get filter options
        String regionsQuery = "SELECT country, state, city FROM test_result_resource GROUP BY country, state, city;";
        SelectQueryBuilder usersQueryBuilder = new SelectQueryBuilder("SELECT did FROM test_result_resource");

        for(REGION_PARAMS regionParam : REGION_PARAMS.values()){
            String value = request.getQueryParameters().getOrDefault(regionParam.value,"");
            if(!value.isEmpty())
                usersQueryBuilder.appendEqualsCondition(regionParam.value,value);
        }
        usersQueryBuilder.appendGroupBy("did");

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
                return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
            }
            context.getLogger().info("TAP URL for data query: " + tapURL);

            // Retrieve all data.
            if(filter.isEmpty() || filter.equals("regions")){
                context.getLogger().info("Execute SQL statement: " + regionsQuery);
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
                context.getLogger().info("Execute SQL statement: " + usersQuery);
                JSONArray usersRs = TAPClient.executeQuery(tapURL, usersQuery, context);
                json.put("users", usersRs);
            }
            return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }

    private enum REGION_PARAMS {
        COUNTRY("country"),
        STATE("state"),
        CITY("city");

        private final String value;

        REGION_PARAMS(String value){
            this.value = value;
        }
    }

}
