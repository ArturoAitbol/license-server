package com.function;

import com.function.auth.Resource;
import com.function.db.QueryBuilder;
import com.function.db.SelectQueryBuilder;
import com.function.db.SelectQueryBuilder.ORDER_DIRECTION;
import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.BindingName;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import java.sql.*;
import java.util.*;

import static com.function.auth.RoleAuthHandler.*;

public class TekvLSGetAllFeatureToggles {
    /**
     * This function listens at endpoint "/v1.0/featureToggles". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/v1.0/featureToggles
     * 2. curl "{your host}/v1.0/featureToggles"
     */

    @FunctionName("TekvLSGetAllFeatureToggles")
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.GET},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "featureToggles/{featureToggleId=EMPTY}")
            HttpRequestMessage<Optional<String>> request,
            @BindingName("featureToggleId") String featureToggleId,
            final ExecutionContext context) {

        Claims tokenClaims = getTokenClaimsFromHeader(request, context);
        JSONArray roles = getRolesFromToken(tokenClaims, context);
        if (roles.isEmpty()) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
            json.put("error", MESSAGE_FOR_UNAUTHORIZED);
            return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
        }
        if (!hasPermission(roles, Resource.GET_ALL_FEATURE_TOGGLES)) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        context.getLogger().info("Entering TekvLSGetAllFeatureToggles Azure function");
        // Get query parameters
        context.getLogger().info("URL parameters are: " + request.getQueryParameters());

        // Parse request body and extract parameters needed
        String requestBody = request.getBody().orElse("{}");
        context.getLogger().info("Request body: " + requestBody);

        JSONObject jobj;
        try {
            jobj = new JSONObject(requestBody);
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }

        SelectQueryBuilder selectFTExceptionQueryBuilder = null;
        if (jobj.has(EXCEPTION_PARAMS.SUBACCOUNT_ID.value)) {
            // Parameter not found
            context.getLogger().info("Found subaccount id in request params");
            selectFTExceptionQueryBuilder = new SelectQueryBuilder("SELECT * FROM feature_toggle_exception");
            selectFTExceptionQueryBuilder.appendEqualsCondition("subaccount_id", jobj.getString("subaccountId"), QueryBuilder.DATA_TYPE.UUID);
        }

        // Build SQL statement
        SelectQueryBuilder selectFTQueryBuilder = new SelectQueryBuilder("SELECT * FROM feature_toggle");

        if (!featureToggleId.equals("EMPTY"))
            selectFTQueryBuilder.appendEqualsCondition("id", featureToggleId, QueryBuilder.DATA_TYPE.UUID);

        selectFTQueryBuilder.appendOrderBy("name", ORDER_DIRECTION.ASC);

        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");

        // Connect to the database
        try (
                Connection connection = DriverManager.getConnection(dbConnectionUrl);
                PreparedStatement statement = selectFTQueryBuilder.build(connection);
                PreparedStatement exceptionStatement = selectFTExceptionQueryBuilder != null ? selectFTExceptionQueryBuilder.build(connection) : null;
        ) {

            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

            // Retrieve all feature toggles
            context.getLogger().info("Execute SQL statement: " + statement);
            ResultSet rs = statement.executeQuery();
            // Return a JSON array of feature toggles
            JSONObject json = new JSONObject();
            JSONArray array = new JSONArray();

            Map<String, String> fteIdMap = new HashMap<>();
            if (exceptionStatement != null) {
                context.getLogger().info("Execute SQL statement: " + exceptionStatement);
                ResultSet ers = exceptionStatement.executeQuery();
                while (ers.next()) {
                    fteIdMap.put(ers.getString("feature_toggle_id"), ers.getString("status"));
                }
            }

            while (rs.next()) {
                JSONObject item = new JSONObject();
                item.put("id", rs.getString("id"));
                item.put("name", rs.getString("name"));
                if(fteIdMap.containsKey(item.getString("id")))
                    item.put("status", fteIdMap.get(item.getString("id")));
                else
                    item.put("status", rs.getString("status"));
                item.put("author", rs.getString("author"));
                item.put("description", rs.getString("description"));
                array.put(item);
            }

            json.put("featureToggles", array);
            return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();
        } catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", "SQL Exception: " + e.getMessage());
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }

    private enum EXCEPTION_PARAMS {
        SUBACCOUNT_ID("subaccountId");

        private final String value;

        EXCEPTION_PARAMS(String value) {
            this.value = value;
        }
    }
}
