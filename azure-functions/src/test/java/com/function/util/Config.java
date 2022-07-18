package com.function.util;

//import org.apache.logging.log4j.LogManager;
//import org.apache.logging.log4j.Logger;
import org.json.JSONObject;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;
import java.util.logging.LogManager;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;
import java.util.stream.Collectors;

public class Config {
    private static final String postgresqlServer = "postgresql_server";
    private static final String postgresqlUser = "postgresql_user";
    private static final String postgresqlPwd = "postgresql_pwd";
    private static final String postgresqlSecurityMode = "postgresql_security_mode";
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
        String systemProperty = System.getProperty(property);
        if (systemProperty == null) {
            String customProperty = properties.getProperty(property);
            if (customProperty == null)
            {
                logger.severe("Error retrieving property: " + property + " in config.properties");
                throw new RuntimeException();
            }
            return customProperty;
        }
        return systemProperty;
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
    
    public String getSecurityMode() {
        return getConfig(postgresqlSecurityMode);
    }

    public String getToken(String role) {
        String roleId="", roleSecret="";
        switch (role){
            case "fullAdmin":
                roleId = "fullAdminId";
                roleSecret = "fullAdminSecret";
                break;
            case "devicesAdmin":
                roleId = "devicesAdminId";
                roleSecret = "devicesAdminSecret";
                break;
            case "test":
                return getConfig("testRoleToken");
            default:
                logger.severe("Error retrieving token using the role: " + role);
                throw new RuntimeException();
        }
        return getAccessToken(getConfig(roleId), getConfig(roleSecret));
    }

    public String getAccessToken(String roleId, String roleSecret){
        String token="";
        Map<String, String> parameters = new HashMap<>();
        parameters.put("scope", "api://e643fc9d-b127-4883-8b80-2927df90e275/.default");
        parameters.put("grant_type", "client_credentials");
        parameters.put("client_id", roleId);
        parameters.put("client_secret", roleSecret);

        String form = parameters.entrySet()
                .stream()
                .map(e -> e.getKey() + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
                .collect(Collectors.joining("&"));

        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://login.microsoftonline.com/e3a46007-31cb-4529-b8cc-1e59b97ebdbd/oauth2/v2.0/token"))
                .headers("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(form))
                .build();

        HttpResponse<?> response = null;
        try {
            response = client.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
            logger.severe(e.getMessage());
        }
        if (response != null && response.statusCode() == 200){
            String body = (String) response.body();
            JSONObject jsonBody = new JSONObject(body);
            token = jsonBody.get("access_token").toString();
//            logger.info(token);
        }
        else
        {
            logger.severe("Error retrieving token from Microsoft identity platform");
            logger.info("Request params: "+ form);
            throw new RuntimeException();
        }
        return token;
    }

}
