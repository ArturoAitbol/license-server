package com.function.util;

import com.function.util.Constants.ReportTypes;
import com.microsoft.azure.functions.ExecutionContext;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.text.SimpleDateFormat;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;

public class Utils {

    public static long millisSinceLastCallback(String authEmail, ExecutionContext context){
        // Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");
        String sql = "SELECT * FROM subaccount_admin WHERE subaccount_admin_email = ?;";
        try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setString(1, authEmail);

            context.getLogger().info("Execute SQL statement: " + statement);
            ResultSet rs = statement.executeQuery();
            if (rs.next()){
                if(rs.getString("latest_callback_request_date") == null) {
                    return Constants.REQUEST_CALLBACK_MINUTES_BETWEEN_REQUESTS * 60 * 1000;
                }
                Date latestCallback = getDateFromString(rs.getString("latest_callback_request_date"));
                return getDateFromString(LocalDateTime.now(Clock.systemUTC()).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).getTime() - latestCallback.getTime();
            }
            return Constants.REQUEST_CALLBACK_MINUTES_BETWEEN_REQUESTS * 60 * 1000;
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            return Constants.REQUEST_CALLBACK_MINUTES_BETWEEN_REQUESTS * 60 * 1000;
        }
    }

    public static Date getDateFromString(String timeString) throws Exception{
        return new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").parse(timeString);
    }

    public static long millisecondsSinceDate(Date date) throws Exception {
        return getDateFromString(LocalDateTime.now(Clock.systemUTC()).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).getTime() - date.getTime();
    }

    public static String getReportNameByTestPlan(String testPlan) {
        if (testPlan.equals(ReportTypes.CALLING_RELIABILITY.value()))
            return "Calling Reliability";
        if (testPlan.equals(ReportTypes.FEATURE_FUNCTIONALITY.value()))
            return "Feature Functionality";
        if (testPlan.equals(ReportTypes.POLQA.value()))
            return "Voice Quality (POLQA)";
        return testPlan;
    }
}
