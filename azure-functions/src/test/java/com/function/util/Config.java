package com.function.util;

//import org.apache.logging.log4j.LogManager;
//import org.apache.logging.log4j.Logger;
import org.json.JSONObject;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;
import java.util.logging.LogManager;

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
        String roleId, roleSecret, accessToken="";
        switch (role){
            case "fullAdmin":
                roleId = "fullAdminId";
                roleSecret = "fullAdminSecret";
                break;
            case "devicesAdmin":
                roleId = "devicesAdminId";
                roleSecret = "devicesAdminSecret";
                break;
            case "distributorAdmin":
                roleId = "distributorAdminId";
                roleSecret = "distributorAdminSecret";
                break;
            case "customerAdmin":
                roleId = "customerAdminId";
                roleSecret = "customerAdminSecret";
                break;
            case "subaccountAdmin":
                roleId = "subaccountAdminId";
                roleSecret = "subaccountAdminSecret";
                break;
            case "crm":
                roleId = "crmId";
                roleSecret = "crmSecret";
                break;
            case "test":
                return getConfig("testRoleToken");
            default:
                logger.severe("Error retrieving token using the role: " + role);
                throw new RuntimeException();
        }
        try {
            accessToken = getAccessToken(getConfig(roleId), getConfig(roleSecret));
            if (accessToken.isEmpty()){
                logger.info("Access token is empty");
                throw new RuntimeException();
            }
        } catch (Exception e) {
            e.printStackTrace();
            logger.severe(e.getMessage());
            throw new RuntimeException();
        }
        return accessToken;
    }

    public String getAccessToken(String roleId, String roleSecret) throws IOException {
        String token="";
        Map<String, String> parameters = new HashMap<>();
        parameters.put("scope", "api://e643fc9d-b127-4883-8b80-2927df90e275/.default");
        parameters.put("grant_type", "client_credentials");
        parameters.put("client_id", roleId);
        parameters.put("client_secret", roleSecret);

        String urlParameters = getDataString(parameters);
        byte[] postData = urlParameters.getBytes(StandardCharsets.UTF_8 );
        URL url = new URL( "https://login.microsoftonline.com/e3a46007-31cb-4529-b8cc-1e59b97ebdbd/oauth2/v2.0/token" );
        HttpURLConnection conn= (HttpURLConnection) url.openConnection();
        conn.setDoOutput(true);
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
        conn.setRequestProperty("Content-Length", Integer.toString(postData.length));

        DataOutputStream wr = new DataOutputStream(conn.getOutputStream());
        wr.write( postData);

        int responseCode = conn.getResponseCode();
        if (responseCode == HttpURLConnection.HTTP_OK){
            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String inputLine;
            StringBuilder content = new StringBuilder();
            while ((inputLine = in.readLine()) != null) {
                content.append(inputLine);
            }
            in.close();
            JSONObject jsonBody = new JSONObject(content.toString());
            token = jsonBody.get("access_token").toString();
        }
        else {
            logger.severe("Error retrieving token from Microsoft identity platform");
            logger.info("Request params: "+ urlParameters);
            throw new RuntimeException();
        }
        return token;
    }

    public String getDataString(Map<String, String> params){
        StringBuilder result = new StringBuilder();
        try {
            for (Map.Entry<String, String> entry : params.entrySet()) {
                result.append(URLEncoder.encode(entry.getKey(), "UTF-8"));
                result.append("=");
                result.append(URLEncoder.encode(entry.getValue(), "UTF-8"));
                result.append("&");
            }
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
            logger.severe(e.getMessage());
        }
        String resultString = result.toString();
        return resultString.length() > 0
                ? resultString.substring(0, resultString.length() - 1)
                : resultString;
    }

}
