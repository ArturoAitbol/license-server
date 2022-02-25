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

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetAllDevices {
    /**
     * This function listens at endpoint "/api/devices/{vendor}/{product}/{version}". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/api/devices/{vendor}/{product}/{version}
     * 2. curl "{your host}/api/devices"
     */
    @FunctionName("TekvLSGetAllDevices")
    public HttpResponseMessage run(
            @HttpTrigger(
                name = "req",
                methods = {HttpMethod.GET},
                authLevel = AuthorizationLevel.ANONYMOUS,
                route = "devices/{vendor=EMPTY}/{product=EMPTY}/{version=EMPTY}")
                HttpRequestMessage<Optional<String>> request,
		@BindingName("vendor") String vendor,
		@BindingName("product") String product,
		@BindingName("version") String version,
            final ExecutionContext context) {

        context.getLogger().info("Entering TekvLSGetAllDevices Azure function");
        context.getLogger().info("vendor=" + vendor + ", product=" + product + ", version=" + version);

        String sql = "";
	if (vendor.equals("EMPTY")) {
            sql = "select * from device;";
        } else {
            sql += " vendor='" + vendor + "' and";
	    if (!product.equals("EMPTY")) {
                sql += " product='" + product + "' and";
	        if (!version.equals("EMPTY")) {
                    sql += " version='" + version + "' and";
                }
            }
            // Remove the " and"  after the last parameter and add the where clause
            sql = sql.substring(0, sql.length() - 3);
            sql = "select * from device where " + sql + ";";
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
            context.getLogger().info("Execute SQL statement: " + sql);
            ResultSet rs = statement.executeQuery(sql);
            // Return a JSON array
            JSONObject json = new JSONObject();
            JSONArray array = new JSONArray();
            while (rs.next()) {
                JSONObject item = new JSONObject();
                item.put("id", rs.getString("id"));
                item.put("vendor", rs.getString("vendor"));
                item.put("product", rs.getString("product"));
                item.put("version", rs.getString("version"));
                item.put("deviceType", rs.getString("device_type"));
                item.put("granularity", rs.getString("granularity"));
                item.put("tokensToConsume", rs.getInt("tokens_to_consume"));
                array.put(item);
            }
            json.put("devices", array);
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
