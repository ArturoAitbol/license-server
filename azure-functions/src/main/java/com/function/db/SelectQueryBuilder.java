package com.function.db;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.List;

public class SelectQueryBuilder implements QueryBuilder{
    private final StringBuilder query = new StringBuilder();
    private final ArrayDeque<String> queue =  new ArrayDeque<>();
    private boolean containsWhereStmt = false;

    // the caller is responsible for closing the connection afterwards

    /**
     * Creates a new instance of QueryBuilder
     * @param initialQuery the initial query specifying the SELECT and FROM statements
     */
    public SelectQueryBuilder(String initialQuery) {
        query.append(initialQuery);
    }

    /**
     * Creates a new instance of QueryBuilder
     * @param initialQuery the initial query specifying the SELECT and FROM statements
     */
    public SelectQueryBuilder(String initialQuery, boolean containsWhereStmt) {
        query.append(initialQuery);
        this.containsWhereStmt = containsWhereStmt;
    }

    /**
     * Appends a condition to the current query
     * @param columnName the name of the column on the DB
     * @param value the value to query as a String
     * @param dataType the data type to cast the value
     */
    public void appendEqualsCondition(String columnName, String value, String dataType) {
        appendSeparator();
        query.append(columnName).append(" = CAST(? AS ").append(dataType).append(")");
        queue.add(value);
    }

    /**
     * Appends a condition to the current query
     * @param columnName the name of the column on the DB
     * @param value the value to query as a String
     * @param dataType the data type to cast the value
     */
    public void appendEqualsCondition(String columnName, String value, QueryBuilder.DATA_TYPE dataType) {
        this.appendEqualsCondition(columnName, value, dataType.getValue());
    }

    /**
     * Overload of appendCondition(String columnName, String value, DATA_TYPE dataType) with DATA_TYPE.VARCHAR as a default
     * @param columnName the name of the column on the DB
     * @param value the value to query as a String
     */
    public void appendEqualsCondition(String columnName, String value) {
        this.appendEqualsCondition(columnName, value, "varchar");
    }

    /**
     * Appends the custom sql to the query, the custom sql must have only one parameter with its type defined
     * @param sql the sql to append
     * @param value the value to replace the parameter in the sql
     */
    public void appendCustomCondition(String sql, String value) {
        appendSeparator();
        query.append(sql);
        queue.add(value);
    }

    /**
     * Appends a condition "<code>columnName</code> is NULL" to the query
     * @param columnName the name of the column on the DB
     */
    public void appendColumnIsNull(String columnName) {
        appendSeparator();
        query.append(columnName).append(" is NULL");
    }

    public void appendOrderBy(String orderByColumn, ORDER_DIRECTION orderDirection) {
        query.append(" ORDER BY ").append(orderByColumn).append(" ").append(orderDirection.name());
    }

    public void appendCustomOrderBy(String orderBySql) {
        query.append(" ORDER BY ").append(orderBySql);
    }

    public void appendGroupBy(String groupBy) {
        query.append(" GROUP BY ").append(groupBy);
    }

    public void appendGroupByMany(String values) {
        List<String> listOfValues = Arrays.asList(values.split(","));
        query.append(" GROUP BY ");
        for (int i = 0; i < listOfValues.size(); i++){
            query.append(listOfValues.get(i));
            if(i!=listOfValues.size()-1)
                query.append(",");
        }
    }

    public void appendHavingClause(String havingClause) {
        query.append(" HAVING (").append(havingClause).append(")");
    }

    public void appendLimit(String limit) {
        query.append(" LIMIT ?::integer");
        queue.add(limit);
    }

    public void appendOffset(String offset) {
        query.append(" OFFSET ?::integer");
        queue.add(offset);
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

    /**
     * Returns the current query
     * @return String
     */
    public String getQuery(){
        StringBuilder queryString = new StringBuilder(query.toString());
        for (String value: queue){
            int index = queryString.indexOf("?");
            queryString.replace(index,index+1,"'"+value+"'");
        }
        return queryString.toString();
    }

    private void appendSeparator() {
        if (queue.size() == 0 && !containsWhereStmt) {
            query.append(" WHERE ");
        }
        else {
            query.append(" AND ");
        }
    }

    public enum ORDER_DIRECTION {
        ASC,
        DESC;
    }

}
