package com.function.clients;

import com.function.exceptions.ADException;
import com.microsoft.azure.functions.ExecutionContext;
import org.json.JSONObject;

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
        JSONObject response = HttpClient.post(url, bodyAsString, headers);
        context.getLogger().info("JSON response: " + response);
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
    static public JSONObject getDetailedReport(final String tapURL, String token, String type, String startDate, String endDate, ExecutionContext context) throws Exception {
//        String url = tapURL + "/v1/spotlight/" + type + "/report?startDate=" + startDate + "&endDate=" + endDate;
        String url = String.format("%s/v1/spotlight/%s/report?startDate=%s&endDate=", tapURL, type, startDate, endDate);
        context.getLogger().info("url: " + url);
        HashMap<String, String> headers = new HashMap<>();
        headers.put("Authorization", "Bearer " + token);
        JSONObject response = HttpClient.get(url, headers);
        context.getLogger().info("TAP response " + response);
        if (response != null && (response.has("error"))) {
            context.getLogger().severe("Error response: " + response);
            throw new ADException("Error retrieving " + type + " detailed report from Automation Platform");
        }
        return response;
    }

}
