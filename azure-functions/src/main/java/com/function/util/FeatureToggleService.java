package com.function.util;

import com.function.db.QueryBuilder;
import com.function.db.SelectQueryBuilder;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class FeatureToggleService {

    private static final String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
            + "&user=" + System.getenv("POSTGRESQL_USER")
            + "&password=" + System.getenv("POSTGRESQL_PWD");

    public static boolean isFeatureActiveById(String featureToggleId) throws Exception {
        SelectQueryBuilder queryBuilder = new SelectQueryBuilder("SELECT status FROM feature_toggle");
        queryBuilder.appendEqualsCondition("id", featureToggleId, QueryBuilder.DATA_TYPE.UUID);

        // Connect to the db
        try (
                Connection connection = DriverManager.getConnection(dbConnectionUrl);
                PreparedStatement selectStatement = queryBuilder.build(connection)
        ){
            ResultSet resultSet = selectStatement.executeQuery();
            resultSet.next();
            return resultSet.getString("status").equals("On");
        }
    }

    public static boolean isFeatureActiveByName(String featureToggleName) throws Exception {
        SelectQueryBuilder queryBuilder = new SelectQueryBuilder("SELECT status FROM feature_toggle");
        queryBuilder.appendEqualsCondition("name", featureToggleName, QueryBuilder.DATA_TYPE.UUID);

        // Connect to the db
        try (
                Connection connection = DriverManager.getConnection(dbConnectionUrl);
                PreparedStatement selectStatement = queryBuilder.build(connection)
        ){
            ResultSet resultSet = selectStatement.executeQuery();
            resultSet.next();
            return resultSet.getString("status").equals("On");
        }
    }
}
