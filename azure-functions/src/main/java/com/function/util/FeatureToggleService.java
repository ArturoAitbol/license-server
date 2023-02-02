package com.function.util;

import com.function.db.QueryBuilder;
import com.function.db.SelectQueryBuilder;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class FeatureToggleService {

    private static final String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER")
            + "/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
            + "&user=" + System.getenv("POSTGRESQL_USER")
            + "&password=" + System.getenv("POSTGRESQL_PWD");

    public static boolean isFeatureActiveById(String featureToggleId) {
        final String selectQuery = "SELECT * FROM feature_toggle WHERE id = ?";

        // Connect to the db
        try (
                Connection connection = DriverManager.getConnection(dbConnectionUrl);
                PreparedStatement selectStatement = connection.prepareStatement(selectQuery)) {
            selectStatement.setString(1, featureToggleId);
            ResultSet resultSet = selectStatement.executeQuery();
            if (resultSet.next())
                return resultSet.getBoolean("status");

            return false;
        } catch (Exception e) {
            System.out.println("EXCEPTION FOUND: " + e.getMessage());
            return false;
        }
    }

    public static boolean isFeatureActiveByName(String featureToggleName) {
        final String selectQuery = "SELECT * FROM feature_toggle WHERE name = ?";

        // Connect to the db
        try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
                PreparedStatement selectStatement = connection.prepareStatement(selectQuery)) {
            selectStatement.setString(1, featureToggleName);
            ResultSet resultSet = selectStatement.executeQuery();
            if (resultSet.next())
                return resultSet.getBoolean("status");

            return false;
        } catch (Exception e) {
            System.out.println("EXCEPTION FOUND: " + e.getMessage());
            return false;
        }
    }

    public static boolean isFeatureActiveBySubaccountId(String featureToggleName, String subaccountId) {
        SelectQueryBuilder queryBuilder = new SelectQueryBuilder("SELECT * FROM feature_toggle");
        queryBuilder.appendEqualsCondition("name", featureToggleName, QueryBuilder.DATA_TYPE.VARCHAR);

        // Connect to the db
        try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
                PreparedStatement selectStatement = queryBuilder.build(connection)) {
            ResultSet resultSet = selectStatement.executeQuery();
            resultSet.next();

            String toggleId = resultSet.getString("id");
            SelectQueryBuilder resultsQueryBuilder = new SelectQueryBuilder("SELECT * FROM feature_toggle_exception");
            resultsQueryBuilder.appendEqualsCondition("feature_toggle_id", toggleId, QueryBuilder.DATA_TYPE.UUID);
            resultsQueryBuilder.appendEqualsCondition("subaccount_id", subaccountId, QueryBuilder.DATA_TYPE.UUID);
            PreparedStatement statusStatement = resultsQueryBuilder.build(connection);
            ResultSet statusSet = statusStatement.executeQuery();

            if (statusSet.next()) {
                System.out.println("++++++++++++++++++++++++");
                System.out.println("HERE WWE ARE");
                return statusSet.getBoolean("status");
            }

            return false;
        } catch (Exception e) {
            System.out.println("++++++++++++++++++++++++");
            System.out.println("Exception found: " + e.getMessage());
            System.out.println("++++++++++++++++++++++++");
            return false;
        }

    }
}
