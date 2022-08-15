package com.function.db;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayDeque;

public class UpdateQueryBuilder implements QueryBuilder {
    private final StringBuilder query = new StringBuilder();
    private final ArrayDeque<String> queue =  new ArrayDeque<>();

    /**
     * Creates a new instance of UpdateQueryBuilder
     * @param table name of the table
     */
    public UpdateQueryBuilder(String table) {
        query.append("UPDATE ").append(table).append(" SET ");
    }

    /**
     * Appends a value modification to the query
     * @param columnName the name of the column on the DB
     * @param value the new value for the column
     * @param dataType the data type to cast the value
     */
    public void appendValueModification(String columnName, String value, String dataType) {
        query.append(columnName).append(" = ?::").append(dataType).append(", ");
        queue.add(value);
    }

    /**
     * Appends a value modification to the query
     * @param columnName the name of the column on the DB
     * @param value the new value for the column
     * @param dataType the data type to cast the value
     */
    public void appendValueModification(String columnName, String value, QueryBuilder.DATA_TYPE dataType) {
        appendValueModification(columnName, value, dataType.getValue());
    }

    /**
     * Appends a value modification to the query
     * @param columnName the name of the column on the DB
     * @param value the new value for the column
     */
    public void appendValueModification(String columnName, String value) {
        appendValueModification(columnName, value, QueryBuilder.DATA_TYPE.VARCHAR);
    }

    /**
     * Appends a WHERE statement to the query. Should only be called once per UpdateQueryBuilder instance and before the build method
     * @param columnName the name of the column on the DB
     * @param value the value for the WHERE statement
     */
    public void appendWhereStatement(String columnName, String value, QueryBuilder.DATA_TYPE dataType) {
        query.delete(query.length() - 2, query.length());
        query.append(" WHERE ").append(columnName).append(" = ?::").append(dataType.getValue());
        queue.add(value);
    }

    /**
     * Creates a new PreparedStatement and set the corresponding parameters
     * @param conn the connection to the DB
     * @return a new PreparedStatement with parameters set
     * @throws SQLException if a database access error occurs or this method is called on a closed connection
     */
    public PreparedStatement build(Connection conn) throws SQLException {
        query.append(";");
        PreparedStatement ps = conn.prepareStatement(query.toString());
        int index = 1;
        for (String value: queue){
            ps.setString(index, value);
            index++;
        }
        return ps;
    }
}
