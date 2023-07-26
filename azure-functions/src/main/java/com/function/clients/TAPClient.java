package com.function.clients;

import com.function.util.Constants;
import com.microsoft.azure.functions.ExecutionContext;

import org.json.JSONArray;
import org.json.JSONObject;

import javax.net.ssl.*;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;
import java.sql.SQLException;
import java.util.HashMap;

public class TAPClient {

    /**
     * Method to get the access token to access TAP API (default credentials)
     *
     * @param tapURL
     * @param context
     * @return
     * @throws Exception
     */
    static public String getAccessToken(String tapURL, ExecutionContext context) throws Exception {
        return getAccessToken(tapURL, null, null, context);
    }

    /**
     * Method to get the access token to access TAP API
     *
     * @param tapURL
     * @param context
     * @return
     * @throws Exception
     */
    static public String getAccessToken(String tapURL,String username,String password, ExecutionContext context) throws Exception {
        String url = tapURL + "/api/login";
        JSONObject body = new JSONObject();
        body.put("username", username != null ? username : System.getenv("TAP_USERNAME"));
        body.put("password", password != null ? password : System.getenv("TAP_PASSWORD"));
        String bodyAsString = body.toString();
        HashMap<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        // disable SSL host verification
        TAPClient.disableSslVerification(context);
        try {
            JSONObject response = HttpClient.post(url, bodyAsString, headers);
            if (response.has("error") || (response.has("success") && !response.getBoolean("success"))) {
                context.getLogger().severe("Request params: " + bodyAsString);
                context.getLogger().severe("Error response: " + response);
                throw new Exception("Error retrieving token from Automation Platform");
            }
            JSONObject responseObj = (JSONObject) response.get("response");
            if (!responseObj.has("accessToken")) {
                context.getLogger().severe("Request body: " + bodyAsString);
                context.getLogger().severe("Error response: " + response);
                throw new Exception("Error retrieving token from Automation Platform");
            }
            context.getLogger().info("Received Bearer token from Automation Platform");
            return responseObj.get("accessToken").toString();
            
        } catch (Exception e) {
            context.getLogger().severe("Exception found on getAccessToken: "+ e.getMessage());            
            throw e;
        }
    }

    /**
     * Method to get the detailed report of STS/LTS by startDate and endDate
     *
     * @param tapURL
     * @param token
     * @param types
     * @param startDate
     * @param endDate
     * @param context
     * @return
     * @throws Exception
     */
    static public JSONObject getDetailedReport(final String tapURL, String token, String types, String startDate, 
        String endDate, String status, String regions, String users, Boolean polqaCalls, ExecutionContext context) throws Exception {
        String url = tapURL + "/" + Constants.SPOTLIGHT_API_PATH;
        url = String.format("%s/report?startDate=%s&endDate=%s", url, startDate, endDate);
        if (!types.isEmpty()) url += "&types=" + types;
        if (!status.isEmpty()) url += "&status=" + status;
        if (!regions.isEmpty()) url += "&regions=" + URLEncoder.encode(regions, StandardCharsets.UTF_8.toString());
        if (!users.isEmpty()) url += "&users=" + users;
        if (polqaCalls) url += "&polqaCalls=true";
        context.getLogger().info("TAP detailed report endpoint: " + url);
        HashMap<String, String> headers = new HashMap<>();
        headers.put("Authorization", "Bearer " + token);
        // disable SSL host verification
        TAPClient.disableSslVerification(context);
        JSONObject response = HttpClient.get(url, headers);
        if (response != null && (response.has("error"))) {
            context.getLogger().severe("Error while retrieving detailed test report from Automation Platform: " + response);
            throw new Exception("Error retrieving " + types + " detailed report from Automation Platform: " + response);
        }
        context.getLogger().info("Received detailed test report response from Automation Platform");
        return response;
    }

    /**
     * Method to execute a query in the DB of the Automation Platform
     *
     * @param tapURL
     * @param query
     * @param context
     * @return
     * @throws Exception
     */
    static public JSONArray executeQuery(final String tapURL, String query, ExecutionContext context) throws Exception {
        try {
            String token = TAPClient.getAccessToken(tapURL, Constants.TEMP_ONPOINT_USERNAME,
                    Constants.TEMP_ONPOINT_PASSWORD, context);
    
            String resource = "/query/data";
            String queryParam = "queryString=" + URLEncoder.encode(query, "UTF-8");
            final String url = String.format("%s/%s/%s?%s", tapURL, Constants.SPOTLIGHT_API_PATH, resource, queryParam);
            context.getLogger().info("TAP data query endpoint: " + url);
    
            HashMap<String, String> headers = new HashMap<>();
            headers.put("Authorization", "Bearer " + token);
            // context.getLogger().severe("TAP token: " + token);
    
            // disable SSL host verification
            TAPClient.disableSslVerification(context);
            JSONObject response = HttpClient.get(url, headers);
            if (response.has("error")) {
                context.getLogger().severe("Error while retrieving data query from Automation Platform: " + response);
                throw new SQLException("Error retrieving data query from Automation Platform: " + response);
            }
            context.getLogger().info("Data were retrieved from the Automation Platform successfully");
            return response.getJSONArray("resultSet");            
        } catch (Exception e) {
            context.getLogger().severe("Exception found on executeQuery, query: " + query);
            context.getLogger().severe("Exception found on executeQuery, exception: "+ e.getMessage());
            throw e;
        }
    }

    static public JSONObject saveCustomerDetailsOnTap(String tapURL, JSONObject request, ExecutionContext context) {
        // throws Exception {
        JSONObject response = null;
        try {
            String token = TAPClient.getAccessToken(tapURL, context);
            final String resource = "customerInfo";
            final String url = String.format("%s/%s/%s", tapURL, Constants.SPOTLIGHT_API_PATH, resource);
            context.getLogger().info("TAP Customer Info endpoint: " + url);
            HashMap<String, String> headers = new HashMap<>();
            headers.put("Authorization", "Bearer " + token);
            // disable SSL host verification
            TAPClient.disableSslVerification(context);
            response = HttpClient.post(url, request.toString(), headers);
            if (response != null && !response.getBoolean("success")) {
                context.getLogger().severe("Error occurred while updating customer details to the Automation Platform: " + response);
                // throw new Exception("Error occurred while updating customer details to the Automation Platform");
            }
            context.getLogger().info("Updated customer details to the Automation Platform successfully.");
        } catch (Exception e) {
            context.getLogger().info("Error updating customer details to Automation Platform with URL=" + tapURL);
			context.getLogger().info("Caught exception: " + e.getMessage());
        }
        return response;
    }

    /**
     * disable SSL host name
     *
     * @param context: ExecutionContext
     */
    public static void disableSslVerification(ExecutionContext context) {
        try {
            // Create a trust manager that does not validate certificate chains
            TrustManager[] trustAllCerts = new TrustManager[]{
                    new X509TrustManager() {
                        public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                            return null;
                        }

                        public void checkClientTrusted(X509Certificate[] certs, String authType) {
                        }

                        public void checkServerTrusted(X509Certificate[] certs, String authType) {
                        }
                    }
            };
            // Install the all-trusting trust manager
            SSLContext sc = SSLContext.getInstance("SSL");
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
            // Create all-trusting host name verifier
            HostnameVerifier allHostsValid = new HostnameVerifier() {
                public boolean verify(String hostname, SSLSession session) {
                    context.getLogger().info("Disabled SSL host name");
                    return true;
                }
            };
            // Install the all-trusting host verifier
            HttpsURLConnection.setDefaultHostnameVerifier(allHostsValid);
        } catch (NoSuchAlgorithmException | KeyManagementException e) {
            context.getLogger().info("Error while disabling SSL host name");
            e.printStackTrace();
        }
    }
}
