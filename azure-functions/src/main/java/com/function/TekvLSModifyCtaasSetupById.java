package com.function;

import com.function.auth.Resource;
import com.function.clients.EmailClient;
import com.function.clients.GraphAPIClient;
import com.function.clients.TAPClient;
import com.function.db.QueryBuilder;
import com.function.db.SelectQueryBuilder;
import com.function.db.UpdateQueryBuilder;
import com.function.util.Constants;
import com.function.util.FeatureToggleService;
import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.BindingName;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import java.sql.*;
import java.time.LocalDate;
import java.util.Optional;

import static com.function.auth.RoleAuthHandler.*;
import static com.function.auth.Roles.SUBACCOUNT_ADMIN;

public class TekvLSModifyCtaasSetupById {
    /**
     * This function listens at endpoint "/v1.0/ctaasSetups/{id}". Two ways to
     * invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/v1.0/ctaasSetups/{id}
     */
    @FunctionName("TekvLSModifyCtaasSetupById")
    public HttpResponseMessage run(
            @HttpTrigger(name = "req", methods = {
                    HttpMethod.PUT}, authLevel = AuthorizationLevel.ANONYMOUS, route = "ctaasSetups/{id}") HttpRequestMessage<Optional<String>> request,
            @BindingName("id") String id,
            final ExecutionContext context) {

        Claims tokenClaims = getTokenClaimsFromHeader(request, context);
        JSONArray roles = getRolesFromToken(tokenClaims, context);
        if (roles.isEmpty()) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
            json.put("error", MESSAGE_FOR_UNAUTHORIZED);
            return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
        }
        if (!hasPermission(roles, Resource.MODIFY_CTAAS_SETUP)) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        context.getLogger().info("Entering TekvLSModifyCtaasSetupById Azure function");

        // Parse request body and extract parameters needed
        String requestBody = request.getBody().orElse("");
        context.getLogger().info("Request body: " + requestBody);
        if (requestBody.isEmpty()) {
            context.getLogger().info("error: request body is empty.");
            JSONObject json = new JSONObject();
            json.put("error", "error: request body is empty.");
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

        try {
            if (jobj.has(OPTIONAL_PARAMS.TAP_URL.jsonAttrib)) {
                TAPClient.getAccessToken(jobj.getString(OPTIONAL_PARAMS.TAP_URL.jsonAttrib), context);
            }
        } catch (Exception e) {
            context.getLogger().info("info: The provided TAP URL is incorrect");
            JSONObject json = new JSONObject();
            json.put("error", "The provided TAP URL is incorrect");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }

        // validate SpotLight setup completion
        Boolean isSetupReady = jobj.has(OPTIONAL_PARAMS.STATUS.jsonAttrib)
                && jobj.getString(OPTIONAL_PARAMS.STATUS.jsonAttrib)
                .equalsIgnoreCase(Constants.CTaaSSetupStatus.READY.value());
        if (isSetupReady) {
            if (!jobj.has("licenseId")) {
                context.getLogger().info("error: licenseId is missing.");
                JSONObject json = new JSONObject();
                json.put("error", "error: licenseId is missing.");
                return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
            }
            if (!jobj.has(OPTIONAL_PARAMS.SUBACCOUNT_ID.jsonAttrib)) {
                context.getLogger().info("error: subaccountId is missing.");
                JSONObject json = new JSONObject();
                json.put("error", "error: subaccountId is missing.");
                return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
            }
        }

        if (jobj.has(OPTIONAL_PARAMS.MAINTENANCE.jsonAttrib)) {
            if (!jobj.has(OPTIONAL_PARAMS.SUBACCOUNT_ID.jsonAttrib)) {
                context.getLogger().info("error: subaccountId is missing.");
                JSONObject json = new JSONObject();
                json.put("error", "error: subaccountId is missing.");
                return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
            }
        }

        // Create license verifier query builder
        SelectQueryBuilder verificationBuilder = null;
        // Build SQL query for customer & subAccount details
        SelectQueryBuilder customerAndSubQueryBuilder = null;

        if (jobj.has("licenseId") && jobj.has(OPTIONAL_PARAMS.SUBACCOUNT_ID.jsonAttrib)) {
            verificationBuilder = new SelectQueryBuilder("SELECT * FROM license");
            verificationBuilder.appendEqualsCondition(
                    OPTIONAL_PARAMS.SUBACCOUNT_ID.columnName,
                    jobj.getString(OPTIONAL_PARAMS.SUBACCOUNT_ID.jsonAttrib),
                    QueryBuilder.DATA_TYPE.UUID);
        }

        if (jobj.has(OPTIONAL_PARAMS.SUBACCOUNT_ID.jsonAttrib)) {
            customerAndSubQueryBuilder = new SelectQueryBuilder(
                    "SELECT subaccount.id AS \"lsSubAccountId\", subaccount.name AS \"lsSubAccountName\", customer.id AS \"lsCustomerId\", customer.name AS \"lsCustomerName\" FROM subaccount INNER JOIN customer ON subaccount.customer_id = customer.id");
            customerAndSubQueryBuilder.appendEqualsCondition(
                    "subaccount.id",
                    jobj.getString(OPTIONAL_PARAMS.SUBACCOUNT_ID.jsonAttrib),
                    QueryBuilder.DATA_TYPE.UUID);
        }

        // Build the sql query for SpotLight setup
        UpdateQueryBuilder queryBuilder = new UpdateQueryBuilder("ctaas_setup");
        int optionalParamsFound = 0;
        for (OPTIONAL_PARAMS param : OPTIONAL_PARAMS.values()) {
            try {
                String jsonAttribValue = (param.dataType.equals(QueryBuilder.DATA_TYPE.BOOLEAN.getValue()))
                        ? String.valueOf(jobj.getBoolean(param.jsonAttrib))
                        : jobj.getString(param.jsonAttrib);
                queryBuilder.appendValueModification(param.columnName, jsonAttribValue, param.dataType);
                optionalParamsFound++;
            } catch (Exception e) {
                context.getLogger().info("Ignoring exception: " + e);
            }
        }
        if (optionalParamsFound == 0) {
            return request.createResponseBuilder(HttpStatus.OK).build();
        }
        queryBuilder.appendWhereStatement("id", id, QueryBuilder.DATA_TYPE.UUID);
        // build the sql query for project
        String sql = "INSERT INTO project (subaccount_id, code, name, status, open_date, project_owner, license_id) " +
                "VALUES (?::uuid, ?, ?, ?::project_status_type_enum, ?::timestamp, ?, ?::uuid) RETURNING id;";
        // build the sql for getting the deviceId
        String deviceSql = "SELECT id FROM device WHERE product=?;";
        // Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses"
                + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");
        try (
                Connection connection = DriverManager.getConnection(dbConnectionUrl);
                PreparedStatement statement = queryBuilder.build(connection);
                PreparedStatement projectStatement = connection.prepareStatement(sql);
                PreparedStatement ctaasDeviceStatement = connection.prepareStatement(deviceSql);
                PreparedStatement customerAndSubAccountDetails = customerAndSubQueryBuilder == null ? 
                    null : customerAndSubQueryBuilder.build(connection);
                PreparedStatement licenseVerificationStatement = verificationBuilder == null ? 
                    null : verificationBuilder.build(connection)) {

            JSONObject json = new JSONObject();

            if (licenseVerificationStatement != null) {
                ResultSet licenseQueryResult = licenseVerificationStatement.executeQuery();
                context.getLogger().info(licenseQueryResult.toString());
                if (licenseQueryResult.next()) {
                    context.getLogger().info("info: found matching license for subaccount: "
                            + jobj.getString(OPTIONAL_PARAMS.SUBACCOUNT_ID.jsonAttrib));
                } else {
                    context.getLogger().info("info: the license provided does not match with the subaccount provided");
                    json.put("error", "The license provided does not belong to the subaccount");
                    return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
                }
            }

            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
            String userId = getUserIdFromToken(tokenClaims, context);
            context.getLogger().info("Execute SQL statement (User: " + userId + "): " + statement);
            statement.executeUpdate();
            context.getLogger().info("Ctaas_setup updated successfully.");
            // check if TAP URL attribute exists
            if (jobj.has(OPTIONAL_PARAMS.TAP_URL.jsonAttrib)) {
                final String TAP_URL = jobj.getString(OPTIONAL_PARAMS.TAP_URL.jsonAttrib);
                // Build JSONObject from customer details result set
                JSONObject customerDetailsJsonObject = null;
                if (customerAndSubAccountDetails != null) {
                    context.getLogger().info("info: found customer details by subaccount: " + jobj.getString(OPTIONAL_PARAMS.SUBACCOUNT_ID.jsonAttrib));
                    customerDetailsJsonObject = new JSONObject();
                    ResultSet customerAndSubQueryResult = customerAndSubAccountDetails.executeQuery();
                    ResultSetMetaData metaData = customerAndSubQueryResult.getMetaData();
                    int columnCount = metaData.getColumnCount();

                    while (customerAndSubQueryResult.next()) {
                        for (int i = 1; i <= columnCount; i++) {
                            String columnName = metaData.getColumnLabel(i);
                            Object columnValue = customerAndSubQueryResult.getObject(i);
                            customerDetailsJsonObject.put(columnName, columnValue);
                        }
                    }
                    if (TAP_URL != null && !TAP_URL.isEmpty()) // invoke Northbound API on TAP, to save Customer details.
                        TAPClient.saveCustomerDetailsOnTap(TAP_URL, customerDetailsJsonObject, context);
                }
            }
            verifyMaintenance(jobj, userId, connection, context);
            if (isSetupReady) {
                String today = LocalDate.now().toString();
                /**
                 * Add SpotLight project
                 */
                // Set statement parameters
                projectStatement.setString(1, jobj.getString(OPTIONAL_PARAMS.SUBACCOUNT_ID.jsonAttrib));
                projectStatement.setString(2, today + " - " + id);
                projectStatement.setString(3, Constants.DEFAULT_CTAAS_PROJECT_NAME);
                projectStatement.setString(4, Constants.DEFAULT_CTAAS_PROJECT_STATUS);
                projectStatement.setString(5, today);
                projectStatement.setString(6, Constants.DEFAULT_CTAAS_PROJECT_OWNER);
                projectStatement.setString(7, jobj.getString("licenseId"));
                // Insert
                context.getLogger().info("Execute SQL projectStatement (User: " + userId + "): " + projectStatement);
                ResultSet rs = projectStatement.executeQuery();
                context.getLogger().info("Project inserted successfully.");
                // Return the id in the response
                rs.next();
                json.put("projectId", rs.getString("id"));

                /**
                 * Add License consumption for SpotLight project
                 */
                JSONObject ctaasDevice = new JSONObject();
                ctaasDevice.put("subaccountId", jobj.getString(OPTIONAL_PARAMS.SUBACCOUNT_ID.jsonAttrib));
                ctaasDevice.put("projectId", rs.getString("id"));
                ctaasDevice.put("consumptionDate", today);
                ctaasDevice.put("type", Constants.DEFAULT_CONSUMPTION_TYPE);
                // Insert parameters to statement
                ctaasDeviceStatement.setString(1, Constants.DEFAULT_CTAAS_DEVICE);
                // get deviceId
                context.getLogger().info("Execute SQL statement: " + ctaasDeviceStatement);
                rs = ctaasDeviceStatement.executeQuery();
                rs.next();
                ctaasDevice.put("deviceId", rs.getString("id"));
                json.put("deviceId", rs.getString("id"));
                TekvLSCreateLicenseUsageDetail licenseUsageDetailCreator = new TekvLSCreateLicenseUsageDetail();
                licenseUsageDetailCreator.createLicenseConsumptionEvent(tokenClaims, ctaasDevice, request, context);

                this.ADUserCreation(jobj, context, connection);

                return request.createResponseBuilder(HttpStatus.OK).body(json.toString()).build();
            }

            return request.createResponseBuilder(HttpStatus.OK).build();
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

    private void ADUserCreation(JSONObject jobj, ExecutionContext context, Connection connection) throws Exception {
        String subaccountIdParam = OPTIONAL_PARAMS.SUBACCOUNT_ID.jsonAttrib;
        String subaccountId = jobj.getString(subaccountIdParam);
        final String subaccountEmailsSql = "SELECT s.name, sa.subaccount_admin_email " +
                "FROM subaccount s, subaccount_admin sa WHERE sa.subaccount_id = s.id AND s.id = ?::uuid;";
        final String customerNameSql = "SELECT c.name FROM customer c, subaccount s WHERE c.id = s.customer_id AND s.id = ?::uuid";
        try (PreparedStatement subaccountEmailsStmt = connection.prepareStatement(subaccountEmailsSql);
             PreparedStatement customerNameStmt = connection.prepareStatement(customerNameSql)) {
            subaccountEmailsStmt.setString(1, subaccountId);
            customerNameStmt.setString(1, subaccountId);
            ResultSet customerNameRs = customerNameStmt.executeQuery();
            customerNameRs.next();
            String customerName = customerNameRs.getString("name");
            ResultSet rs = subaccountEmailsStmt.executeQuery();
            while (rs.next()) {
                GraphAPIClient.createGuestUserWithProperRole(rs.getString("name"),
                        rs.getString("subaccount_admin_email"), SUBACCOUNT_ADMIN, context);
                // Send onboarding email with link to portal
                EmailClient.sendSpotlightReadyEmail(rs.getString("subaccount_admin_email"), customerName, subaccountId, context);
            }
        }
    }

    private void verifyMaintenance(JSONObject jobj, String userId, Connection connection, ExecutionContext context)
            throws SQLException {
        if (jobj.has(OPTIONAL_PARAMS.MAINTENANCE.jsonAttrib)) {
            final String subaccountId = jobj.getString(OPTIONAL_PARAMS.SUBACCOUNT_ID.jsonAttrib);
            String subaccountUserEmailsSql = "SELECT array_to_string(array_agg(distinct \"subaccount_admin_email\"),',') AS emails FROM subaccount_admin WHERE subaccount_id = ?::uuid;";
            String customerAdminEmailsSql = null;
            String subaccountNameSql = "SELECT name FROM subaccount WHERE id = ?::uuid";
            if (FeatureToggleService.isFeatureActiveBySubaccountId("ad-customer-user-creation", subaccountId)) {
                customerAdminEmailsSql = "SELECT array_to_string(array_agg(distinct \"admin_email\"),',') AS emails FROM customer_admin "
                        +
                        "WHERE customer_id = (SELECT customer_id FROM subaccount WHERE id = ?::uuid LIMIT 1);";
            }
            try (PreparedStatement subaccountEmailsStmt = connection.prepareStatement(subaccountUserEmailsSql);
                 PreparedStatement customerAdminEmailsStmt = customerAdminEmailsSql != null
                         ? connection.prepareStatement(customerAdminEmailsSql)
                         : null;
                 PreparedStatement subaccountNameStmt = connection.prepareStatement(subaccountNameSql)) {
                subaccountEmailsStmt.setString(1, subaccountId);
                boolean newMaintenanceState = jobj.getBoolean(OPTIONAL_PARAMS.MAINTENANCE.jsonAttrib);
                context.getLogger()
                        .info("Execute SQL subaccountEmailsStmt (User: " + userId + "): " + subaccountEmailsStmt);
                ResultSet rs = subaccountEmailsStmt.executeQuery();
                rs.next();
                String emails = rs.getString("emails");
                if (customerAdminEmailsStmt != null) {
                    customerAdminEmailsStmt.setString(1, subaccountId);
                    context.getLogger().info("Execute SQL customerAdminEmailsStmt (User: " + userId + "): "
                            + customerAdminEmailsStmt);
                    rs = customerAdminEmailsStmt.executeQuery();
                    rs.next();
                    String customerAdminEmails = rs.getString("emails");
                    emails = emails + "," + customerAdminEmails;
                }
                subaccountNameStmt.setString(1, subaccountId);
                context.getLogger()
                        .info("Execute SQL subaccountNameStmt (User: " + userId + "): " + subaccountNameStmt);
                ResultSet nameRs = subaccountNameStmt.executeQuery();
                nameRs.next();
                String subaccountName = nameRs.getString("name");
                if (newMaintenanceState) {
                    EmailClient.sendMaintenanceModeEnabledAlert(emails, subaccountName, subaccountId, context);
                } else {
                    EmailClient.sendMaintenanceModeDisabledAlert(emails, subaccountName, subaccountId, context);
                }

            }
        }
    }

    private enum OPTIONAL_PARAMS {
        SUBACCOUNT_ID("subaccountId", "subaccount_id", QueryBuilder.DATA_TYPE.UUID),
        AZURE_RESOURCE_GROUP("azureResourceGroup", "azure_resource_group", QueryBuilder.DATA_TYPE.VARCHAR),
        TAP_URL("tapUrl", "tap_url", QueryBuilder.DATA_TYPE.VARCHAR),
        STATUS("status", "status", QueryBuilder.DATA_TYPE.VARCHAR),
        ON_BOARDING_COMPLETE("onBoardingComplete", "on_boarding_complete", QueryBuilder.DATA_TYPE.BOOLEAN),
        MAINTENANCE("maintenance", "maintenance", QueryBuilder.DATA_TYPE.BOOLEAN);

        private final String jsonAttrib;
        private final String columnName;

        private final String dataType;

        OPTIONAL_PARAMS(String jsonAttrib, String columnName, QueryBuilder.DATA_TYPE dataType) {
            this.jsonAttrib = jsonAttrib;
            this.columnName = columnName;
            this.dataType = dataType.getValue();
        }
    }
}
