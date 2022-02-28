package com.function;

import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpMethod;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import com.microsoft.azure.functions.annotation.BindingName;

import java.sql.*;
import java.util.Optional;
import java.util.Calendar;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetAllLicenseUsageDetails {
    /**
     * This function listens at endpoint "/api/devices/{vendor}/{product}/{version}". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/api/devices/{vendor}/{product}/{version}
     * 2. curl "{your host}/api/devices"
     */
    @FunctionName("TekvLSGetAllLicenseUsageDetails")
    public HttpResponseMessage run(
            @HttpTrigger(
                name = "req",
                methods = {HttpMethod.GET},
                authLevel = AuthorizationLevel.ANONYMOUS,
                route = "licenseUsageDetails/{subaccountId}/{view}/{year=EMPTY}/{month=EMPTY}")
                HttpRequestMessage<Optional<String>> request,
		@BindingName("subaccountId") String subaccountId,
		@BindingName("view") String view,
		@BindingName("year") String year,
		@BindingName("month") String month,
            final ExecutionContext context) {

        context.getLogger().info("Entering TekvLSGetAllLicenseUsageDetails Azure function");

        String sql = "";
        String sqlPart1 = "";
	if (year.equals("EMPTY")) {
            Calendar cal = Calendar.getInstance();
            sql = "select * from license_usage where EXTRACT(MONTH FROM usage_date) = " + cal.get(Calendar.MONTH) + ";";
            sqlPart1 = "subaccount_id = '" + subaccountId + "' and EXTRACT(MONTH FROM usage_date) = " + cal.get(Calendar.MONTH) + " and " + 
                "EXTRACT (YEAR FROM usage_date) = " + cal.get(Calendar.YEAR) + ";";
        } else {
	    if (month.equals("EMPTY")) {
                sql = "select * from license_usage where EXTRACT(YEAR FROM usage_date) = " + year + ";";
                sqlPart1 = "subaccount_id = '" + subaccountId + "' and EXTRACT(YEAR FROM usage_date) = " + year + ";";
            } else {
                sql = "select * from license_usage where EXTRACT(MONTH FROM usage_date) = " + month + " and " + 
                    "EXTRACT (YEAR FROM usage_date) = " + year + ";";
                sqlPart1 = "subaccount_id = '" + subaccountId + "' and EXTRACT(MONTH FROM usage_date) = " + month + " and " + 
                    "EXTRACT (YEAR FROM usage_date) = " + year + ";";
            }
        }

        // Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://tekv-db-server.postgres.database.azure.com:5432/licenses?ssl=true&sslmode=require"
                + "&user=tekvdbadmin@tekv-db-server"
                + "&password=MhZJh94z9D3Db3vW";
        try (
            Connection connection = DriverManager.getConnection(dbConnectionUrl);
            Statement statement = connection.createStatement();) {
            
            context.getLogger().info("Successfully connected to: " + dbConnectionUrl);
            
            // Execute sql query. TODO: pagination
            // First get the devices connected
            JSONObject json = new JSONObject();
            JSONArray array = new JSONArray();

            // Get number of connected devices
            String sqlDevicesConnected = "select count(usage_type) from license_usage where usage_type='AutomationPlatform' and " + sqlPart1;
            context.getLogger().info("Execute SQL statement: " + sqlDevicesConnected);
            ResultSet rs = statement.executeQuery(sqlDevicesConnected);
            rs.next();
            json.put("devicesConnected", rs.getInt(1));

            // Get tokens consumed
            String sqlTokensConsumed = "select sum(tokens_to_consume) from device d inner join license_usage l on d.id=l.device_id and l." + sqlPart1;
            context.getLogger().info("Execute SQL statement: " + sqlTokensConsumed);
            rs = statement.executeQuery(sqlTokensConsumed);
            rs.next();
            json.put("tokensConsumed", rs.getInt(1));

            context.getLogger().info("Execute SQL statement: " + sql);
            rs = statement.executeQuery(sql);
            while (rs.next()) {
                JSONObject item = new JSONObject();
                item.put("id", rs.getString("id"));
                item.put("usageDate", rs.getString("usage_date"));
                array.put(item);
            }
            json.put("licenseUsageDetails", array);
            return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();
        }
        catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
    }
}
