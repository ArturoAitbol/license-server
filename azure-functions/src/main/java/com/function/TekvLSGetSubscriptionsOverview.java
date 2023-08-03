package com.function;

import com.function.auth.Resource;
import com.function.db.SelectQueryBuilder;
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

public class TekvLSGetSubscriptionsOverview {

    @FunctionName("TekvLSGetSubscriptionsOverview")
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.GET},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "subscriptions/")
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
        if (!hasPermission(roles, Resource.GET_SUBSCRIPTIONS_OVERVIEW)) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        String userId = getUserIdFromToken(tokenClaims, context);
        context.getLogger().info("User " + userId + " is Entering TekvLSGetSubscriptionsOverview Azure function");

        // Build SQL statement, customers left outer join subaccount, license, project, license_consumption
        SelectQueryBuilder queryBuilder = new SelectQueryBuilder("SELECT c.id as customer_id, c.name as customer_name, s.id as subaccount_id, s.name as subaccount_name, " +
                "l.id as license_id, l.description as license_description, l.start_date as start_date, l.renewal_date as renewal_date, l.package_type as license_package_type, " +
                "l.tokens as tokens_purchased, l.status as license_status, SUM(lc.tokens_consumed) as tokens_consumed " +
                "FROM customer c LEFT OUTER JOIN subaccount s on c.id = s.customer_id LEFT OUTER JOIN license l on s.id = l.subaccount_id  LEFT JOIN project p on p.license_id = l.id " +
                "LEFT JOIN license_consumption lc on p.id = lc.project_id " +
                "WHERE tombstone = false", true);

        // adding conditions according to the role in case we need to allow this roles to access this method
//        String email = getEmailFromToken(tokenClaims, context);
//        String currentRole = evaluateRoles(roles);
//        switch (currentRole) {
//            case DISTRIBUTOR_FULL_ADMIN:
//                queryBuilder.appendCustomCondition("customer_id IN (SELECT id FROM customer WHERE distributor_id = (SELECT distributor_id FROM customer c,customer_admin ca " +
//                        "WHERE c.id = ca.customer_id AND admin_email = ?))", email);
//                break;
//            case CUSTOMER_FULL_ADMIN:
//                queryBuilder.appendCustomCondition("customer_id = (select customer_id from customer_admin where admin_email = ?)", email);
//                break;
//            case SUBACCOUNT_ADMIN:
//            case SUBACCOUNT_STAKEHOLDER:
//                queryBuilder.appendCustomCondition("s.id = (SELECT subaccount_id FROM subaccount_admin WHERE subaccount_admin_email = ?)", email);
//                break;
//        }

        queryBuilder.appendGroupBy("l.id, c.id, s.id");

        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER") + "&password=" + System.getenv("POSTGRESQL_PWD");

        // Connect to the database
        try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
             PreparedStatement statement = queryBuilder.build(connection)) {

            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

            // Retrieve all customers.
            context.getLogger().info("Execute SQL statement: " + statement);
            ResultSet rs = statement.executeQuery();
            // Return a JSON array of customers (id and names)
            JSONObject json = new JSONObject();
            JSONArray array = new JSONArray();
            while (rs.next()) {
                JSONObject item = new JSONObject();
                item.put("customerId", rs.getString("customer_id"));
                item.put("customerName", rs.getString("customer_name"));
                item.put("subaccountId", rs.getString("subaccount_id"));
                item.put("subaccountName", rs.getString("subaccount_name"));
                item.put("licenseId", rs.getString("license_id"));
                item.put("licenseDescription", rs.getString("license_description"));
                item.put("licenseStatus", rs.getString("license_status"));
                item.put("licensePackageType", rs.getString("license_package_type"));
                item.put("licenseStartDate", rs.getString("start_date") != null ? rs.getString("start_date").split(" ")[0] : null);
                item.put("licenseRenewalDate", rs.getString("renewal_date") != null ? rs.getString("renewal_date").split(" ")[0] : null);
                item.put("licenseTokens", rs.getInt("tokens_purchased"));
                item.put("licenseTokensConsumed", rs.getInt("tokens_consumed"));
                array.put(item);
            }

            json.put("subscriptions", array);
            context.getLogger().info("User " + userId + " is succesfully leaving TekvLSGetSubscriptionsOverview Azure function");        
            return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();
        } catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", "SQL Exception: " + e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSGetSubscriptionsOverview Azure function with error");        
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSGetSubscriptionsOverview Azure function with error");        
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }
}
