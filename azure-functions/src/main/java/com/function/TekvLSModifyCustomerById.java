package com.function;

import com.function.auth.Resource;
import com.function.clients.TAPClient;
import com.function.db.QueryBuilder;
import com.function.db.SelectQueryBuilder;
import com.function.db.UpdateQueryBuilder;
import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.BindingName;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
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

        context.getLogger().info("Entering TekvLSModifycustomerById Azure function");

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

        int optionalParamsFound = 0;
        SelectQueryBuilder selectQueryBuilder = new SelectQueryBuilder(
                "SELECT subaccount.id AS \"lsSubAccountId\", subaccount.name AS \"lsSubAccountName\", customer.id AS \"lsCustomerId\", customer.name AS \"lsCustomerName\", ctaas_setup.tap_url AS \"url\" FROM customer JOIN subaccount ON customer.id = subaccount.customer_id JOIN ctaas_setup ON subaccount.id = ctaas_setup.subaccount_id");
        UpdateQueryBuilder queryBuilder = new UpdateQueryBuilder("customer");

        for (OPTIONAL_PARAMS param : OPTIONAL_PARAMS.values()) {
            try {
                queryBuilder.appendValueModification(param.columnName, jobj.getString(param.jsonAttrib),
                        param.dataType);
                optionalParamsFound++;
            } catch (Exception e) {
                context.getLogger().info("Ignoring exception: " + e);
            }
        }

        if (optionalParamsFound == 0)
            return request.createResponseBuilder(HttpStatus.OK).build();

        queryBuilder.appendWhereStatement("id", id, QueryBuilder.DATA_TYPE.UUID);
        selectQueryBuilder.appendEqualsCondition(" subaccount.customer_id", id, QueryBuilder.DATA_TYPE.UUID);
        // Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses"
                + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");
        try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
                PreparedStatement statement = queryBuilder.build(connection);
                PreparedStatement customerDetailStatement = selectQueryBuilder.build(connection)) {

            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
            String userId = getUserIdFromToken(tokenClaims, context);
            context.getLogger().info("Execute SQL statement (User: " + userId + "): " + statement);
            statement.executeUpdate();
            context.getLogger().info("Customer updated successfully.");
            context.getLogger().info("Execute SQL statement: " + customerDetailStatement);
            // Build JSONObject from customer details result set
            List<JSONObject> customerAndSubList = new ArrayList<>();
            if (customerDetailStatement != null) {
                context.getLogger().info("info: found customer & subaccount details by customerId: " + id);
                ResultSet customerAndSubQueryResult = customerDetailStatement.executeQuery();
                ResultSetMetaData metaData = customerAndSubQueryResult.getMetaData();
                int columnCount = metaData.getColumnCount();
                context.getLogger().info("columnCount: " + columnCount);
                while (customerAndSubQueryResult.next()) {
                    JSONObject customerDetailsJsonObject = new JSONObject();
                    JSONObject detailJsonObject = new JSONObject();
                    for (int i = 1; i <= columnCount; i++) {
                        String columnName = metaData.getColumnLabel(i);
                        Object columnValue = customerAndSubQueryResult.getObject(i);
                        if (i != columnCount)
                            detailJsonObject.put(columnName, columnValue);
                        else
                            customerDetailsJsonObject.put(columnName, columnValue);
                    }
                    customerDetailsJsonObject.put("customerDetails", detailJsonObject);
                    customerAndSubList.add(customerDetailsJsonObject);
                }
            }
            // iterate through customer subacconut details
            customerAndSubList.forEach(x -> {
                context.getLogger().info("x: " + x.toString());
                // check for url not null
                if (x.has("url") && x.getString("url") != null) {
                    context.getLogger().info("url " + x.get("url").toString());
                    try {
                        JSONObject dObject = (JSONObject) x.getJSONObject("customerDetails");
                        context.getLogger().info("dObject " + dObject);
                        TAPClient.saveCustomerDetailsOnTap(x.get("url").toString(),
                                dObject,
                                context);
                    } catch (Exception e) {
                        context.getLogger().info("Caught exception: " + e.getMessage());
                    }
                }
            });
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
