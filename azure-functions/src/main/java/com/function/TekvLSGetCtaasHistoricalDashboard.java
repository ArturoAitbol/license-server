package com.function;

import java.sql.*;
import java.util.*;

import com.function.auth.Resource;
import com.function.db.QueryBuilder;
import com.function.db.SelectQueryBuilder;
import com.function.util.Base64ImageHandler;
import com.microsoft.azure.functions.annotation.*;
import com.microsoft.azure.functions.*;
import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;
import static com.function.auth.Roles.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetCtaasHistoricalDashboard {
    /**
     * This function listens at endpoint "/v1.0/ctassHistoricalDashboard/{subaccountId}/{noteId}". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/v1.0/ctassHistoricalDashboard/{subaccountId}/{noteId}
     * 2. curl {your host}/v1.0/TekvLSGetCtaasHistoricalDashboard/{subaccountId}/{noteId}
     */
    @FunctionName("TekvLSGetCtaasHistoricalDashboard")
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.GET, HttpMethod.POST},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "ctassHistoricalDashboard/{subaccountId=EMPTY}/{noteId=EMPTY}")
            HttpRequestMessage<Optional<String>> request,
            @BindingName("subaccountId") String subaccountId,
            @BindingName("noteId") String noteId,
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

        String userId = getUserIdFromToken(tokenClaims, context);
        context.getLogger().info("User " + userId + " is Entering TekvLSGetCtaasHistoricalDashboard Azure function");

        // Get query parameters
        context.getLogger().info("URL parameters are: " + request.getQueryParameters());

        // Check if subaccountId is empty
        if (subaccountId.equals("EMPTY") || subaccountId.isEmpty()) {
            context.getLogger().info(MESSAGE_SUBACCOUNT_ID_NOT_FOUND + subaccountId);
            JSONObject json = new JSONObject();
            json.put("error", MESSAGE_SUBACCOUNT_ID_NOT_FOUND);
            context.getLogger().info("User " + userId + " is leaving TekvLSGetCtaasHistoricalDashboard Azure function with error");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        // Check if noteId is empty
        if (noteId.equals("EMPTY") || noteId.isEmpty()) {
            context.getLogger().info("Note Id cannot be empty");
            JSONObject json = new JSONObject();
            json.put("error", "Note Id cannot be empty");
            context.getLogger().info("User " + userId + " is leaving TekvLSGetCtaasHistoricalDashboard Azure function with error");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }

        // Build SQL statement: Get historical dashboard
        SelectQueryBuilder queryBuilderDashboard = new SelectQueryBuilder("SELECT * FROM historical_report");
        queryBuilderDashboard.appendEqualsCondition("subaccount_id",subaccountId, QueryBuilder.DATA_TYPE.UUID);
        queryBuilderDashboard.appendEqualsCondition("note_id",noteId,QueryBuilder.DATA_TYPE.UUID);


        // Build SQL statement: role verification
        SelectQueryBuilder verificationQueryBuilder = null;
        String email = getEmailFromToken(tokenClaims, context);
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
        try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
                PreparedStatement stmt = queryBuilderDashboard.build(connection)) {

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
                        context.getLogger().info("User " + userId + " is leaving TekvLSGetCtaasHistoricalDashboard Azure function with error");
                        return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
                    }
                }
            }

            rs = stmt.executeQuery();
            JSONArray reports = new JSONArray();
            while (rs.next()) {
                JSONObject report = new JSONObject();
                byte[] bytesImage = rs.getBytes("image");
                String base64Image = Base64ImageHandler.decompressAndEncodeBytes(bytesImage);
                report.put("reportType",rs.getString("report_type"));
                report.put("startDateStr",rs.getString("start_date"));
                report.put("endDateStr",rs.getString("end_date"));
                report.put("imageBase64",base64Image);
                reports.put(report);
            }
            json.put("response",reports);
            context.getLogger().info("User " + userId + " is successfully leaving TekvLSGetCtaasHistoricalDashboard Azure function");
            return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();

        } catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSGetCtaasHistoricalDashboard Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSGetCtaasHistoricalDashboard Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }
}
