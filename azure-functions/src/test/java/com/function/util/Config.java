package com.function.util;

//import org.apache.logging.log4j.LogManager;
//import org.apache.logging.log4j.Logger;

import org.json.JSONObject;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.logging.LogManager;
import java.util.logging.Logger;

public class Config {
    private static final String postgresqlServer = "postgresql_server";
    private static final String postgresqlUser = "postgresql_user";
    private static final String postgresqlPwd = "postgresql_pwd";
    private static final String postgresqlSecurityMode = "postgresql_security_mode";
    private static final String expiredToken = "expiredToken";
    private static final String environmentName = "environment_name";
    private static final String emailInviteClientId = "email_invite_client_id";
    private static final String emailInviteClientSecret = "email_invite_client_secret";
    private static final String dashboardAppClientId = "dashboard_app_client_id";
    private static final String dashboardAppClientSecret = "dashboard_app_client_secret";
    private static final String tenantId = "tenant_id";
    private static final String storageAccountName = "storage_account_name";

    private static final String storageContainerName = "storage_container_name";
    private static final String tapUsername = "tap_username";
    private static final String tapPassword = "tap_password";

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
            if (customProperty == null) {
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

    public String getExpiredToken() {
        return getConfig(expiredToken);
    }

    public String getEnvironmentName() {
        return getConfig(environmentName);
    }

    public String getEmailInviteClientId() {
        return getConfig(emailInviteClientId);
    }

    public String getEmailInviteClientSecret() {
        return getConfig(emailInviteClientSecret);
    }

    public String getDashboardAppClientId() {
        return getConfig(dashboardAppClientId);
    }

    public String getDashboardAppClientSecret() {
        return getConfig(dashboardAppClientSecret);
    }

    public String getTenantId() {
        return getConfig(tenantId);
    }

    public String getStorageAccountName() {
        return getConfig(storageAccountName);
    }

    public String getStorageContainerName() {
        return getConfig(storageContainerName);
    }
    
    public String getTapUsername() {
        return getConfig(tapUsername);
    }

    public String getTapPassword() {
        return getConfig(tapPassword);
    }

    public String getToken(String role) {
        String roleId, roleSecret, accessToken = "", username = "", password = "";
        switch (role) {
            case "fullAdmin":
                roleId = "fullAdminId";
                roleSecret = "fullAdminSecret";
                break;
            case "devicesAdmin":
                roleId = "devicesAdminId";
                roleSecret = "devicesAdminSecret";
                break;
            case "distributorAdmin":
                roleId = "fullAdminId";
                roleSecret = "fullAdminSecret";
                username = "distributorAdmin_user";
                password = "distributorAdmin_password";
                break;
            case "customerAdmin":
                roleId = "fullAdminId";
                roleSecret = "fullAdminSecret";
                username = "customerAdmin_user";
                password = "customerAdmin_password";
                break;
            case "subaccountAdmin":
                roleId = "fullAdminId";
                roleSecret = "fullAdminSecret";
                username = "subaccountAdmin_user";
                password = "subaccountAdmin_password";
                break;
            case "nonexistent_subaccountAdmin":
                roleId = "fullAdminId";
                roleSecret = "fullAdminSecret";
                username = "nonexistent_subaccountAdmin_user";
                password = "nonexistent_subaccountAdmin_password";
                break;
            case "subaccountStakeholder":
                roleId = "fullAdminId";
                roleSecret = "fullAdminSecret";
                username = "subaccountStakeholder_user";
                password = "subaccountStakeholder_password";
                break;
            case "salesAdmin":
                roleId = "fullAdminId";
                roleSecret = "fullAdminSecret";
                username = "salesAdmin_user";
                password = "salesAdmin_password";
                break;
            case "configTester":
                roleId = "fullAdminId";
                roleSecret = "fullAdminSecret";
                username = "configTester_user";
                password = "configTester_password";
                break;
            case "crm":
                roleId = "crmId";
                roleSecret = "crmSecret";
                break;
            case "test":
                return getConfig("testRoleToken");
            case "IGESAdmin":                
                roleId = "IGESAdminId";
                roleSecret = "IGESAdminSecret";
                break;
            default:
                logger.severe("Error retrieving token using the role: " + role);
                throw new RuntimeException();
        }
        try {
            if ((username + password).isEmpty()) {
                accessToken = getAccessToken(getConfig(roleId), getConfig(roleSecret), username, password);
            } else {
                accessToken = getAccessToken(getConfig(roleId), getConfig(roleSecret), getConfig(username), getConfig(password));
            }
            if (accessToken.isEmpty()) {
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

    public String getAccessToken(String roleId, String roleSecret, String username, String password) throws IOException {
        String token = "";
        Map<String, String> parameters = new HashMap<>();
        parameters.put("client_id", roleId);
        parameters.put("client_secret", roleSecret);
        if (!username.isEmpty() && !password.isEmpty()) {
            parameters.put("scope", "api://abb49487-0434-4a82-85fa-b9be4443d158/.default");
            parameters.put("grant_type", "password");
            parameters.put("username", username);
            parameters.put("password", password);
        } else {
            parameters.put("scope", "api://e643fc9d-b127-4883-8b80-2927df90e275/.default");
            parameters.put("grant_type", "client_credentials");
        }

        String urlParameters = getDataString(parameters);
        byte[] postData = urlParameters.getBytes(StandardCharsets.UTF_8);
        URL url = new URL("https://login.microsoftonline.com/e3a46007-31cb-4529-b8cc-1e59b97ebdbd/oauth2/v2.0/token");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setDoOutput(true);
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
        conn.setRequestProperty("Content-Length", Integer.toString(postData.length));

        DataOutputStream wr = new DataOutputStream(conn.getOutputStream());
        wr.write(postData);

        int responseCode = conn.getResponseCode();
        if (responseCode == HttpURLConnection.HTTP_OK) {
            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String inputLine;
            StringBuilder content = new StringBuilder();
            while ((inputLine = in.readLine()) != null) {
                content.append(inputLine);
            }
            in.close();
            JSONObject jsonBody = new JSONObject(content.toString());
            token = jsonBody.get("access_token").toString();
        } else {
            logger.severe("Error retrieving token from Microsoft identity platform");
            logger.info("Request params: " + urlParameters);
            throw new RuntimeException();
        }
        return token;
    }

    public String getDataString(Map<String, String> params) {
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
