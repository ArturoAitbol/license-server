package com.function;

import com.function.auth.Resource;
import com.function.db.QueryBuilder;
import com.function.db.SelectQueryBuilder;
import com.function.util.GenerateExcelReport;
import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.BindingName;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import io.jsonwebtoken.Claims;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.sql.*;
import java.util.Optional;

import static com.function.auth.RoleAuthHandler.*;
import static com.function.auth.Roles.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSCtaasDownloadTestReport {
    /**
     * This function listens at endpoint "/api/TekvLSCtaasDownloadTestReport". Two
     * ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/api/TekvLSCtaasDownloadTestReport
     * 2. curl {your host}/api/TekvLSCtaasDownloadTestReport?name=HTTP%20Query
     */
    @FunctionName("TekvLSCtaasDownloadTestReport")
    public HttpResponseMessage run(@HttpTrigger(name = "req",
            methods = {HttpMethod.POST},
            authLevel = AuthorizationLevel.ANONYMOUS,
            route = "ctaasDashboard/downloadReport/{subaccountId=EMPTY}/{reportType=EMPTY}")
                                   HttpRequestMessage<Optional<String>> request,
                                   @BindingName("subaccountId") String subaccountId,
                                   @BindingName("reportType") String reportType,
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

        context.getLogger().info("Entering TekvLSCtaasDownloadTestReport Azure function");

        // Check if subaccount is empty
        if (subaccountId.equals("EMPTY") || subaccountId.isEmpty()) {
            context.getLogger().info(MESSAGE_SUBACCOUNT_ID_NOT_FOUND + subaccountId);
            JSONObject json = new JSONObject();
            json.put("error", MESSAGE_SUBACCOUNT_ID_NOT_FOUND);
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        // Check if reportType is empty
        if (reportType.equals("EMPTY") || reportType.isEmpty()) {
            context.getLogger().info("Report type cannot be empty");
            JSONObject json = new JSONObject();
            json.put("error", "Report type cannot be empty");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        context.getLogger().info("Report type: " + reportType);
        // Parse request body and extract parameters needed
        String requestBody = request.getBody().orElse("");
        context.getLogger().info("Request body: " + requestBody);
        if (requestBody.isEmpty()) {
            context.getLogger().info("Error: Request body is empty.");
            JSONObject json = new JSONObject();
            json.put("error", "Request body is empty.");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        JSONObject jobj;
        try {
            jobj = new JSONObject(requestBody);
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        // Check mandatory params to be present
        for (MANDATORY_PARAMS mandatoryParam : MANDATORY_PARAMS.values()) {
            if (!jobj.has(mandatoryParam.value)) {
                // Parameter not found
                context.getLogger().info("Missing mandatory parameter: " + mandatoryParam.value);
                JSONObject json = new JSONObject();
                json.put("error", "Missing mandatory parameter: " + mandatoryParam.value);
                return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
            }
        }
        // Build SQL statement
        SelectQueryBuilder queryBuilder = new SelectQueryBuilder("SELECT c.name as customerName, s.name as subaccountName  FROM customer c LEFT JOIN subaccount s ON c.id = s.customer_id");
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

            if (rs.next()) {
                customerName = rs.getString("customerName");
                subaccountName = rs.getString("subaccountName");
                context.getLogger().info("customer name - " + customerName + " - subaccount name - " + subaccountName);
            }

            if ((customerName == null || customerName.isEmpty()) || (subaccountName == null || subaccountName.isEmpty())) {
                context.getLogger().info(LOG_MESSAGE_FOR_INVALID_SUBACCOUNT_ID + email);
                json.put("error", MESSAGE_SUBACCOUNT_ID_NOT_FOUND);
                return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
            }

            JSONObject jsonObject = jobj.getJSONObject(MANDATORY_PARAMS.DETAILED_REPORT.value);
            if (jsonObject == null) {
                json.put("error", "Detailed report response cannot be empty");
                return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
            }
            byte[] bytes = null;
            final String REPORT_NOT_FOUNT = "Cannot found the report json file with " + reportType
                    + " in the storage blob";
            XSSFWorkbook workbook = new GenerateExcelReport().generateDetailedTestReport(context, jsonObject);
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            try {
                workbook.write(bos);
                bytes = bos.toByteArray();
            } finally {
                bos.close();
            }
            if (bytes == null) {
                context.getLogger().info(REPORT_NOT_FOUNT);
                json.put("error", REPORT_NOT_FOUNT);
                return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
            }
            return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/vnd.ms-excel")
                    .body(bytes).build();
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

    private enum MANDATORY_PARAMS {
        DETAILED_REPORT("detailedReport");

        private final String value;

        MANDATORY_PARAMS(String value) {
            this.value = value;
        }
    }
}
