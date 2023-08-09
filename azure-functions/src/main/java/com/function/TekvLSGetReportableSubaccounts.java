package com.function;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

import com.function.auth.Resource;
import com.function.db.QueryBuilder;
import com.function.db.SelectQueryBuilder;
import com.function.util.Constants;
import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpMethod;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;

import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

public class TekvLSGetReportableSubaccounts {
    private final String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses"
            + System.getenv("POSTGRESQL_SECURITY_MODE")
            + "&user=" + System.getenv("POSTGRESQL_USER")
            + "&password=" + System.getenv("POSTGRESQL_PWD");

    @FunctionName("TekvLSGetReportableCustomers")
    public HttpResponseMessage run(
            @HttpTrigger(name = "req", methods = {
                    HttpMethod.GET }, authLevel = AuthorizationLevel.ANONYMOUS, route = "reportable_subaccounts") HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context) {

        Claims tokenClaims = getTokenClaimsFromHeader(request, context);
        JSONArray roles = getRolesFromToken(tokenClaims, context);
        if (roles.isEmpty()) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
            json.put("error", MESSAGE_FOR_UNAUTHORIZED);
            return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
        }
        if (!hasPermission(roles, Resource.GET_REPORTABLE_SUBACCOUNTS)) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        String userId = getUserIdFromToken(tokenClaims, context);
        context.getLogger().info("User " + userId + " is Entering TekvLSGetReportableCustomers Azure function");

        SelectQueryBuilder selectStmnt = new SelectQueryBuilder(
                "SELECT s.id AS \"lsSubAccountId\", s.name AS \"lsSubAccountName\", c.id AS \"lsCustomerId\", c.name AS \"lsCustomerName\" , sa.subaccount_admin_email AS \"lsSubAccountAdminEmail\" , cs.maintenance, cse.email AS \"lsSupportEmails\" "
                        +
                        "FROM ctaas_setup cs LEFT JOIN subaccount s ON s.id = cs.subaccount_id LEFT JOIN customer c ON c.id = s.customer_id LEFT JOIN subaccount_admin sa ON s.id = sa.subaccount_id LEFT JOIN ctaas_support_email cse ON cs.id = cse.ctaas_setup_id");
        selectStmnt.appendCustomCondition("s.services LIKE ?",
                "%" + Constants.SubaccountServices.SPOTLIGHT.value() + "%");
        selectStmnt.appendEqualsCondition(" cs.status", Constants.CTaaSSetupStatus.READY.value(),
                QueryBuilder.DATA_TYPE.VARCHAR);
        selectStmnt.appendEqualsCondition(" sa.email_notifications", "true", QueryBuilder.DATA_TYPE.BOOLEAN);

        try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
                PreparedStatement selectStmt = selectStmnt.build(connection)) {
            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
            context.getLogger().info("Execute SQL statement: " + selectStmt);
            ResultSet rs = selectStmt.executeQuery();
            JSONObject json = new JSONObject();
            JSONArray array = new JSONArray();
            while (rs.next()) {
                JSONObject item = new JSONObject();
                int itemIndex = this.arrayContainsSubaccount(array, rs.getString("lsSubAccountId"), context);
                if (itemIndex != -1) {
                    JSONObject existingObject = array.getJSONObject(itemIndex);
                    JSONArray existingMails = existingObject.getJSONArray("emails");
                    JSONArray existingSupportMails = existingObject.getJSONArray("supportEmails");
                    if (rs.getString("lsSubAccountAdminEmail") != null)
                        existingMails.put(rs.getString("lsSubAccountAdminEmail"));
                    if (rs.getString("lsSupportEmails") != null)
                        existingSupportMails.put(rs.getString("lsSupportEmails"));
                    existingObject.put("emails", existingMails);
                    existingObject.put("supportEmails", existingSupportMails);
                    array.put(itemIndex, existingObject);
                } else {
                    JSONArray emails = new JSONArray();
                    JSONArray supportEmails = new JSONArray();
                    item.put("subAccountId", rs.getString("lsSubAccountId"));
                    item.put("subAccountName", rs.getString("lsSubAccountName"));
                    item.put("customerName", rs.getString("lsCustomerName"));
                    item.put("customerId", rs.getString("lsCustomerId"));
                    item.put("maintenance", rs.getBoolean("maintenance"));
                    emails.put(rs.getString("lsSubAccountAdminEmail"));
                    supportEmails.put(rs.getString("lsSupportEmails"));
                    item.put("emails", emails);
                    item.put("supportEmails", supportEmails);
                    array.put(item);
                }
            }

            json.put("subaccounts", array);
            context.getLogger().info("User " + userId + " is successfully leaving TekvLSGetReportableCustomers Azure function");
            return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json")
                    .body(json.toString()).build();
        } catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSGetReportableCustomers Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSGetReportableCustomers Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }

    private int arrayContainsSubaccount(JSONArray array, String subaccountId, ExecutionContext context) {
        int resultIndex = -1;
        for (int i = 0; i < array.length(); i++) {
            if (array.getJSONObject(i).getString("subAccountId").equals(subaccountId))
                resultIndex = i;
        }
        return resultIndex;
    }
}
