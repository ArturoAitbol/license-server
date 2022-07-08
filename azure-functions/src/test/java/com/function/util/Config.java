package com.function.util;

//import org.apache.logging.log4j.LogManager;
//import org.apache.logging.log4j.Logger;
import java.util.logging.Logger;
import java.util.logging.LogManager;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

public class Config {
    private static final String postgresqlServer = "postgresql_server";
    private static final String postgresqlUser = "postgresql_user";
    private static final String postgresqlPwd = "postgresql_pwd";
    private static final String token = "fullAdminToken";
//    private static final Logger LOGGER = LogManager.getLogger();
    public static Logger logger = Logger.getLogger(Config.class.getName());

    private static final Config instance = new Config();
    private Properties properties;

    private Config() {
        try (FileInputStream fileInputStream = new FileInputStream("src/test/resources/config.properties")) {
            LogManager.getLogManager().readConfiguration(new FileInputStream("src/test/resources/logging.properties"));
            properties = new Properties();
            properties.load(fileInputStream);
        } catch (IOException e) {
            logger.severe(e.getMessage());
//            throw new IOException(e.getMessage(), e);
        }
    }

    public static Config getInstance() {
        return instance;
    }

    private String getConfig(String property) {
        String baseUrl = System.getProperty(property);
        if (baseUrl == null) {
            return properties.getProperty(property);
        }
        return baseUrl;
    }

    public String getServer() {
        return getConfig(postgresqlServer);
    }

    public String getUser() {
        return getConfig(postgresqlUser);
    }

    public String getPassword() {
        return getConfig(postgresqlPwd);
    }

    public String getToken(String role) {
        String token;
        switch (role){
            case "fullAdmin":
                token = "fullAdminToken";
                break;
            case "devicesAdmin":
                token = "devicesAdminToken";
                break;
            case "test":
                token = "testRoleToken";
                break;
            default:
                token ="";
                break;
        }
        return getConfig(token);
    }
}
