package com.function;

import com.function.db.QueryBuilder;
import com.function.db.SelectQueryBuilder;
import com.function.db.SelectQueryBuilder.ORDER_DIRECTION;
import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.BindingName;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import static com.function.auth.RoleAuthHandler.*;

import io.jsonwebtoken.Claims;

import org.json.JSONArray;
import org.json.JSONObject;

import java.sql.*;
import java.util.*;

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
        String userId = getUserIdFromToken(tokenClaims, context);
        context.getLogger().info("User " + userId + " is Entering TekvLSGetAllFeatureToggles Azure function");
        
        // Get query parameters
        context.getLogger().info("URL parameters are: " + request.getQueryParameters());
        String subaccountId = request.getQueryParameters().getOrDefault("subaccountId", "");

        // Build SQL statement
        SelectQueryBuilder selectFTQueryBuilder = new SelectQueryBuilder("SELECT * FROM feature_toggle");
        SelectQueryBuilder selectFTExQueryBuilder = new SelectQueryBuilder("SELECT fte.feature_toggle_id, fte.subaccount_id, s.name as subaccount_name, c.name as customer_name, " +
                                                                                   "c.id as customer_id, fte.status as status " +
                                                                                   "FROM feature_toggle_exception fte, subaccount s, customer c " +
                                                                                   "WHERE fte.subaccount_id = s.id AND s.customer_id = c.id", true);
        if (!subaccountId.isEmpty()) {
            // Parameter not found
            context.getLogger().info("Found subaccount id in query params");
            selectFTExQueryBuilder.appendCustomCondition("subaccount_id = ?::uuid", subaccountId);
        }

        if (!featureToggleId.equals("EMPTY")) {
            selectFTQueryBuilder.appendEqualsCondition("id", featureToggleId, QueryBuilder.DATA_TYPE.UUID);
            selectFTExQueryBuilder.appendEqualsCondition("feature_toggle_id", featureToggleId, QueryBuilder.DATA_TYPE.UUID);
        }

        selectFTQueryBuilder.appendOrderBy("name", ORDER_DIRECTION.ASC);

        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");

        // Connect to the database
        try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
             PreparedStatement featureToggleStmt = selectFTQueryBuilder.build(connection);
             PreparedStatement exStmt = selectFTExQueryBuilder.build(connection)) {

            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

            // Map exceptions using the feature toggle id as key
            Map<String, List<FeatureToggleException>> exceptionsMap = new HashMap<>();
            context.getLogger().info("Execute SQL statement: " + exStmt);
            ResultSet eRS = exStmt.executeQuery();
            while (eRS.next()) {
                exceptionsMap.computeIfAbsent(eRS.getString("feature_toggle_id"), k -> new ArrayList<>())
                             .add(new FeatureToggleException(eRS.getBoolean("status"),
                                                             eRS.getString("subaccount_name"),
                                                             eRS.getString("subaccount_id"),
                                                             eRS.getString("customer_name"),
                                                             eRS.getString("customer_id")));
            }

            // Retrieve all feature toggles
            context.getLogger().info("Execute SQL statement: " + featureToggleStmt);
            ResultSet rs = featureToggleStmt.executeQuery();
            // Return a JSON array of feature toggles
            JSONObject json = new JSONObject();
            JSONArray array = new JSONArray();

            while (rs.next()) {
                JSONObject item = new JSONObject();
                item.put("id", rs.getString("id"));
                item.put("name", rs.getString("name"));
                item.put("status", rs.getBoolean("status"));
                item.put("author", rs.getString("author"));
                item.put("description", rs.getString("description"));
                if (exceptionsMap.containsKey(rs.getString("id"))) {
                    item.put("exceptions", exceptionsMap.get(rs.getString("id")));
                }
                array.put(item);
            }

            json.put("featureToggles", array);
            context.getLogger().info("User " + userId + " is successfully leaving TekvLSGetAllFeatureToggles Azure function");
            return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();
        } catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", "SQL Exception: " + e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSGetAllFeatureToggles Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSGetAllFeatureToggles Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }

    public static class FeatureToggleException {
        private final Boolean status;
        private final String subaccountName;
        private final String subaccountId;
        private final String customerName;
        private final String customerId;

        public FeatureToggleException(Boolean status, String subaccountName, String subaccountId, String customerName, String customerId) {
            this.status = status;
            this.subaccountName = subaccountName;
            this.subaccountId = subaccountId;
            this.customerName = customerName;
            this.customerId = customerId;
        }

        public Boolean getStatus() {
            return status;
        }

        public String getSubaccountName() {
            return subaccountName;
        }

        public String getSubaccountId() {
            return subaccountId;
        }

        public String getCustomerName() {
            return customerName;
        }

        public String getCustomerId() {
            return customerId;
        }
    }

}
