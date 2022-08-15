package com.function.db;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public interface QueryBuilder {

    PreparedStatement build(Connection conn) throws SQLException;

    enum DATA_TYPE {
        UUID("uuid"),
        BOOLEAN("boolean"),
        VARCHAR("varchar"),
        INTEGER("integer"),
        DATE("date"),
        TIMESTAMP("timestamp");

        private final String value;

        DATA_TYPE(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }
}
