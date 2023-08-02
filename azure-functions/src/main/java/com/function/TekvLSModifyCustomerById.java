package com.function;

import com.function.auth.Resource;
import com.function.clients.TAPClient;
import com.function.db.QueryBuilder;
import com.function.db.SelectQueryBuilder;
import com.function.db.UpdateQueryBuilder;
import com.function.util.Constants;
import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.BindingName;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import java.sql.*;
import java.util.Optional;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSModifyCustomerById {
    /**
     * This function listens at endpoint "/v1.0/customers/{id}". Two ways to invoke
     * it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/v1.0/customers/{id}
     */
    @FunctionName("TekvLSModifyCustomerById")
    public HttpResponseMessage run(
            @HttpTrigger(name = "req", methods = {
                    HttpMethod.PUT }, authLevel = AuthorizationLevel.ANONYMOUS, route = "customers/{id}") HttpRequestMessage<Optional<String>> request,
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
        if (!hasPermission(roles, Resource.MODIFY_CUSTOMER)) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSModifycustomerById Azure function");        

        // Parse request body and extract parameters needed
        String requestBody = request.getBody().orElse("");
        context.getLogger().info("Request body: " + requestBody);
        if (requestBody.isEmpty()) {
            context.getLogger().info("error: request body is empty.");
            JSONObject json = new JSONObject();
            json.put("error", "error: request body is empty.");
            context.getLogger().info("User " + userId + " is leaving TekvLSModifycustomerById Azure function with error");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        JSONObject jobj;
        try {
            jobj = new JSONObject(requestBody);
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSModifycustomerById Azure function with error");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }

        int optionalParamsFound = 0;
        SelectQueryBuilder customerDetailsQueryBuilder = new SelectQueryBuilder(
                "SELECT s.id AS \"lsSubAccountId\", s.name AS \"lsSubAccountName\", c.id AS \"lsCustomerId\", c.name AS \"lsCustomerName\", cs.tap_url AS \"url\" " +
                "FROM ctaas_setup cs LEFT JOIN subaccount s ON s.id = cs.subaccount_id LEFT JOIN customer c ON c.id = s.customer_id");
        UpdateQueryBuilder queryBuilder = new UpdateQueryBuilder("customer");

        for (OPTIONAL_PARAMS param : OPTIONAL_PARAMS.values()) {
            if (jobj.has(param.jsonAttrib)) {
                queryBuilder.appendValueModification(param.columnName, jobj.getString(param.jsonAttrib), param.dataType);
                optionalParamsFound++;
            }
        }

        if (optionalParamsFound == 0)
            return request.createResponseBuilder(HttpStatus.OK).build();

        queryBuilder.appendWhereStatement("id", id, QueryBuilder.DATA_TYPE.UUID);

        customerDetailsQueryBuilder.appendEqualsCondition(" s.customer_id", id, QueryBuilder.DATA_TYPE.UUID);
        customerDetailsQueryBuilder.appendCustomCondition("s.services LIKE ?", "%" + Constants.SubaccountServices.SPOTLIGHT.value() + "%");
        customerDetailsQueryBuilder.appendCustomCondition("cs.tap_url IS NOT NULL AND cs.tap_url != ?", "");
        // Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses"
                + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");
        try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
            PreparedStatement statement = queryBuilder.build(connection);
            PreparedStatement customerDetailStatement = customerDetailsQueryBuilder.build(connection)) {

            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
            context.getLogger().info("Execute SQL statement (User: " + userId + "): " + statement);
            statement.executeUpdate();
            context.getLogger().info("Customer updated successfully.");
            context.getLogger().info("Execute SQL statement: " + customerDetailStatement);
            // Build JSONObject from customer details result set
            if (customerDetailStatement != null) {
                ResultSet customerAndSubQueryResult = customerDetailStatement.executeQuery();
                // iterate through list of customer with subaccount details
                while (customerAndSubQueryResult.next()) {
                    String TAP_URL = customerAndSubQueryResult.getString("url");
                    JSONObject customerJsonObject = new JSONObject();
                    customerJsonObject.put("lsSubAccountId", customerAndSubQueryResult.getString("lsSubAccountId"));
                    customerJsonObject.put("lsSubAccountName", customerAndSubQueryResult.getString("lsSubAccountName"));
                    customerJsonObject.put("lsCustomerName", customerAndSubQueryResult.getString("lsCustomerName"));
                    customerJsonObject.put("lsCustomerId", customerAndSubQueryResult.getString("lsCustomerId"));
                    // Update customer details on respective TAP client
                    TAPClient.saveCustomerDetailsOnTap(TAP_URL, customerJsonObject, context);
                }
            }
            context.getLogger().info("User " + userId + " is successfully leaving TekvLSModifycustomerById Azure function");
            return request.createResponseBuilder(HttpStatus.OK).build();
        } catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSModifycustomerById Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSModifycustomerById Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }

    private enum OPTIONAL_PARAMS {
        NAME("customerName", "name", QueryBuilder.DATA_TYPE.VARCHAR),
        TOKENS("distributorId", "distributor_id", QueryBuilder.DATA_TYPE.UUID),
        DEVICE_ACCESS_TOKENS("customerType", "type", QueryBuilder.DATA_TYPE.VARCHAR);

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
