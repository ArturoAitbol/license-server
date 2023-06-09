package com.function.clients;

import com.function.exceptions.ADException;
import com.microsoft.azure.functions.ExecutionContext;
import org.json.JSONObject;

import javax.net.ssl.*;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;
import java.util.HashMap;

public class TAPClient {

    /**
     * Method to get the access token to access TAP API
     *
     * @param tapURL
     * @param context
     * @return
     * @throws Exception
     */
    static public String getAccessToken(String tapURL, ExecutionContext context) throws Exception {
        String url = tapURL + "/api/login";
        JSONObject body = new JSONObject();
        body.put("username", System.getenv("TAP_USERNAME"));
        body.put("password", System.getenv("TAP_PASSWORD"));
        String bodyAsString = body.toString();
        HashMap<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        // disable SSL host verification
        TAPClient.disableSslVerification(context);
        JSONObject response = HttpClient.post(url, bodyAsString, headers);
        if (response.has("error") || (response.has("success") && !response.getBoolean("success"))) {
            context.getLogger().severe("Request params: " + bodyAsString);
            context.getLogger().severe("Error response: " + response);
            throw new ADException("Error retrieving token from Automation Platform");
        }
        JSONObject responseObj = (JSONObject) response.get("response");
        if (!responseObj.has("accessToken")) {
            context.getLogger().severe("Request body: " + bodyAsString);
            context.getLogger().severe("Error response: " + response);
            throw new ADException("Error retrieving token from Automation Platform");
        }
        context.getLogger().info("Received Bearer token from Automation Platform");
        return responseObj.get("accessToken").toString();
    }

    /**
     * Method to get the detailed report of STS/LTS by startDate and endDate
     *
     * @param tapURL
     * @param token
     * @param type
     * @param startDate
     * @param endDate
     * @param context
     * @return
     * @throws Exception
     */
    static public JSONObject getDetailedReport(final String tapURL, String token, String type, String startDate,
                                               String endDate, ExecutionContext context) throws Exception {
        final String url = String.format("%s/v1/spotlight/%s/report?startDate=%s&endDate=%s", tapURL, type, startDate,
                endDate);
        context.getLogger().info("TAP detailed report endpoint: " + url);
        HashMap<String, String> headers = new HashMap<>();
        headers.put("Authorization", "Bearer " + token);
        // disable SSL host verification
        TAPClient.disableSslVerification(context);
        JSONObject response = HttpClient.get(url, headers);
        if (response != null && (response.has("error"))) {
            context.getLogger()
                    .severe("Error while retrieving detailed test report from Automation Platform: " + response);
            throw new ADException("Error retrieving " + type + " detailed report from Automation Platform");
        }
        context.getLogger().info("Received detailed test report response from Automation Platform");
        return response;
    }

    /**
     * disable SSL host name
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
        } catch (NoSuchAlgorithmException e) {
            context.getLogger().info("Error while disabling SSL host name");
            e.printStackTrace();
        } catch (KeyManagementException e) {
            context.getLogger().info("Error while disabling SSL host name");
            e.printStackTrace();
        }
    }
}
