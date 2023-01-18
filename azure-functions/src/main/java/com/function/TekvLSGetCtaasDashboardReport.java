package com.function;

import com.function.auth.Resource;
import com.function.clients.TAPClient;
import com.function.db.QueryBuilder;
import com.function.db.SelectQueryBuilder;
import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import java.sql.*;
import java.util.Optional;

import static com.function.auth.RoleAuthHandler.*;
import static com.function.auth.Roles.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetCtaasDashboardReport {

    public static final String MESSAGE_FOR_INVALID_REPORT_TYPE = "Report Type provided is invalid.";
    public static final String MESSAGE_FOR_INVALID_START_DATE = "Start Date provided is invalid.";
    public static final String MESSAGE_FOR_INVALID_END_DATE = "End Date provided is invalid.";
    private static final String MESSAGE_FOR_INVALID_TAP_URL = "Failed to fetch detailed report";
    private static final String LOG_MESSAGE_FOR_INVALID_TAP_URL = "Invalid TAP URL";

    /**
     * This function listens at endpoint "/api/TekvLSGetCtaasDashboardReport". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/api/TekvLSGetCtaasDashboardReport
     * 2. curl {your host}/api/TekvLSGetCtaasDashboardReport?name=HTTP%20Query
     */
    @FunctionName("TekvLSGetCtaasDashboardReport")
    public HttpResponseMessage run(
            @HttpTrigger(name = "req",
                    methods = {HttpMethod.GET},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "ctaasDashboardReport/{subaccountId=EMPTY}") // /{subaccountId=EMPTY}/{reportType=EMPTY}/{startDate=EMPTY}/{endDate=EMPTY}
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
        if (!hasPermission(roles, Resource.GET_CTAAS_DASHBOARD)) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        context.getLogger().info("Entering TekvLSGetCtaasDashboardReport Azure function");
        /**
         * @BindingName("subaccountId") String subaccountId,
         * @BindingName("reportType") String reportType,
         * @BindingName("startDate") String startDate,
         * @BindingName("endDate") String endDate,
         */
        context.getLogger().info("URL parameters are: " + request.getQueryParameters());
        String subaccountId = request.getQueryParameters().getOrDefault("subaccountId", "");
        String reportType = request.getQueryParameters().getOrDefault("reportType", "");
        String startDate = request.getQueryParameters().getOrDefault("startDate", "");
        String endDate = request.getQueryParameters().getOrDefault("endDate", "");

        // Check if subaccount is empty
        if (subaccountId.isEmpty() || subaccountId ==null) {
            context.getLogger().info(MESSAGE_SUBACCOUNT_ID_NOT_FOUND + subaccountId);
            JSONObject json = new JSONObject();
            json.put("error", MESSAGE_SUBACCOUNT_ID_NOT_FOUND);
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        // Check if reportType is empty
        if (reportType.isEmpty() || reportType==null) {
            context.getLogger().info(MESSAGE_FOR_INVALID_REPORT_TYPE + " | Report Type: " + reportType);
            JSONObject json = new JSONObject();
            json.put("error", MESSAGE_FOR_INVALID_REPORT_TYPE);
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        // Check if start date is null
        if (startDate == null || startDate.isEmpty()) {
            context.getLogger().info(MESSAGE_FOR_INVALID_START_DATE + " | Start Date: " + null);
            JSONObject json = new JSONObject();
            json.put("error", MESSAGE_FOR_INVALID_START_DATE);
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        // Check if end date is null
        if (endDate == null || endDate.isEmpty()) {
            context.getLogger().info(MESSAGE_FOR_INVALID_END_DATE + " | End Date: " + null);
            JSONObject json = new JSONObject();
            json.put("error", MESSAGE_FOR_INVALID_END_DATE);
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        // Build SQL statement
        SelectQueryBuilder queryBuilder = new SelectQueryBuilder("SELECT c.name as customerName, s.name as subaccountName, cs.tap_url as tapURL  FROM customer c LEFT JOIN subaccount s ON c.id = s.customer_id LEFT JOIN ctaas_setup cs ON s.id = cs.subaccount_id");
        queryBuilder.appendEqualsCondition("s.id", subaccountId, QueryBuilder.DATA_TYPE.UUID);
        SelectQueryBuilder verificationQueryBuilder = null;
        String email = getEmailFromToken(tokenClaims, context);

        // adding conditions according to the role
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

        // Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");
        try (
                Connection connection = DriverManager.getConnection(dbConnectionUrl);
                PreparedStatement selectStmt = queryBuilder.build(connection)) {

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

            // Retrieve SpotLight setup.
            context.getLogger().info("Execute SQL statement: " + selectStmt);
            rs = selectStmt.executeQuery();
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
                context.getLogger().info(LOG_MESSAGE_FOR_INVALID_TAP_URL + " | " + tapURL);
                json.put("error", MESSAGE_FOR_INVALID_TAP_URL);
                return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
            }
            context.getLogger().info("Requesting TAP for detailed report. URL: " + tapURL);
            // Make a http call to TAP and get the access token
            String accessToken = TAPClient.getAccessToken(tapURL, context);
            context.getLogger().info("Report Type: " + reportType + " | Start Date: " + startDate + " | End Date: " + endDate);
            // Make a http call to North Bound API to fetch detailed test report by reportType
            JSONObject response = TAPClient.getDetailedReport(tapURL, accessToken, reportType, startDate, endDate, context);
            if (response == null) {
                json.put("error", "Error with fetching detailed test report from Automation Platform");
                context.getLogger().info("Error with fetching detailed test report from Automation Platform");
            } else {
                context.getLogger().info("Received detailed test report response from Automation Platform");
                JSONObject jsonObject = new JSONObject();
                jsonObject.put("reportType", reportType);
                jsonObject.put("report", response);
                json.put("response", jsonObject);
            }
            return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();
        } catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }
}
