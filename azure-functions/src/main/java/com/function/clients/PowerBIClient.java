package com.function.clients;

import com.function.exceptions.ADException;
import com.microsoft.azure.functions.ExecutionContext;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class PowerBIClient {

    static private final String baseURL = "https://api.powerbi.com/v1.0/myorg";
    static private final String REPORT_TYPE_DAILY = "Daily";
    static private final String REPORT_TYPE_WEEKLY = "Weekly";

    static public String getAccessToken(ExecutionContext context) throws Exception {
        String url = "https://login.microsoftonline.com/" + System.getenv("POWER_BI_TENANT_ID") + "/oauth2/v2.0/token";

        Map<String, String> parameters = new HashMap<>();
        parameters.put("client_id", System.getenv("POWER_BI_CLIENT_ID"));
        parameters.put("client_secret", System.getenv("POWER_BI_CLIENT_SECRET"));
        parameters.put("scope", "https://analysis.windows.net/powerbi/api/.default");
        parameters.put("grant_type", "client_credentials");
        String urlParameters = HttpClient.getDataString(context, parameters);


        HashMap<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/x-www-form-urlencoded");
        JSONObject response = HttpClient.post(url, urlParameters, headers);

        if (response.has("error") || !response.has("access_token")) {
            context.getLogger().severe("Request params: " + urlParameters);
            context.getLogger().severe("Error response: " + response);
            throw new ADException("Error retrieving token from Microsoft identity platform");
        }
        return response.get("access_token").toString();
    }

    static public JSONObject getPowerBiDetails(String customer, String subaccount, ExecutionContext context) throws Exception {
        if (customer == null || customer.equals("null") || subaccount == null || subaccount.equals("null")) {
            context.getLogger().severe("Failed to fetch power bi details. Invaid customer/subaccount. Customer: " + customer + " | Subaccount: " + subaccount);
            throw new ADException("Failed to fetch power bi details. Invalid customer/subaccount. Customer: " + customer + " | Subaccount: " + subaccount);
        }
        String token = getAccessToken(context);
        String workspaceId = getWorkspaceIdByName(token, customer, context);
        if (workspaceId == null) {
            context.getLogger().severe("Failed to fetch workspace id of the customer. Customer: " + customer + " | Subaccount: " + subaccount);
            throw new ADException("Failed to fetch workspace id of the customer. Customer: " + customer + " | Subaccount: " + subaccount);
        }
        context.getLogger().info("Power bI workspace details for the customer: " + customer + " | Workspace: " + workspaceId);
        JSONObject response = getPowerBiReportDetails(token, workspaceId, subaccount, context);
        return response;
    }


    static public JSONObject getPowerBiReportDetails(String token, String workspaceId, String subaccount, ExecutionContext context) throws Exception {
        JSONObject dailyReport = getReport(token, workspaceId, subaccount, REPORT_TYPE_DAILY, context);
        if (dailyReport == null) {
            context.getLogger().severe("Failed to fetch " + REPORT_TYPE_DAILY + " report of the subaccount. Subaccount: " + subaccount);
            throw new ADException("Failed to fetch " + REPORT_TYPE_DAILY + " report of the subaccount. Subaccount: " + subaccount);
        }
        String dailyReportId = dailyReport.getString("id");

        JSONObject weeklyReport = getReport(token, workspaceId, subaccount, REPORT_TYPE_WEEKLY, context);
        if (weeklyReport == null) {
            context.getLogger().severe("Failed to fetch " + REPORT_TYPE_DAILY + " report of the subaccount. Subaccount: " + subaccount);
            throw new ADException("Failed to fetch " + REPORT_TYPE_DAILY + " report of the subaccount. Subaccount: " + subaccount);
        }
        String weeklyReportId = weeklyReport.getString("id");
        JSONArray reportIds = new JSONArray();
        reportIds.put(new JSONObject().put("id", dailyReportId));
        reportIds.put(new JSONObject().put("id", weeklyReportId));

        JSONArray datasetIds = new JSONArray();
        datasetIds.put(new JSONObject().put("id", dailyReport.getString("datasetId")));
        datasetIds.put(new JSONObject().put("id", weeklyReport.getString("datasetId")));

        JSONObject groupEmbedTokenDetails = getEmbedToken(token, workspaceId, reportIds, datasetIds, context);
        String embedToken = groupEmbedTokenDetails.has("token") ? groupEmbedTokenDetails.getString("token") : "";
        String expiresAt = groupEmbedTokenDetails.has("expiration") ? groupEmbedTokenDetails.getString("expiration") : "";

        JSONObject daily_response = new JSONObject();
        daily_response.put("id", dailyReportId);
        daily_response.put("embedToken", embedToken);
        daily_response.put("embedUrl", dailyReport.getString("embedUrl"));

        JSONObject weekly_response = new JSONObject();
        weekly_response.put("id", weeklyReportId);
        weekly_response.put("embedToken", embedToken);
        weekly_response.put("embedUrl", weeklyReport.getString("embedUrl"));

        JSONObject response = new JSONObject();
        response.put("daily", daily_response);
        response.put("weekly", weekly_response);
        response.put("expiresAt", expiresAt);
        return response;
    }


    static private String getWorkspaceIdByName(String token, String name, ExecutionContext context) throws Exception {
        String url = baseURL + "/groups";
        HashMap<String, String> headers = new HashMap<>();
        headers.put("Authorization", "Bearer " + token);
        JSONObject response = HttpClient.get(url, headers);

        if (response.has("error") || !response.has("value")) {
            context.getLogger().severe("Request params: " + url);
            context.getLogger().severe("Error response: " + response);
            throw new ADException("Failed to fetch workspaces");
        }
        JSONArray workspaceList = response.getJSONArray("value");
        if (workspaceList.length() == 0) {
            context.getLogger().severe("Request params: " + url);
            context.getLogger().severe("Error response: " + response);
            throw new ADException("No workspaces available");
        }
        JSONObject workspace = null;
        for (int i = 0; i < workspaceList.length(); i++) {
            workspace = (JSONObject) workspaceList.get(i);
            if (workspace.has("name") && workspace.getString("name").equalsIgnoreCase(name))
                return workspace.getString("id");
        }
        return null;
    }

    static private JSONObject getReport(String token, String workspaceId, String name, String type, ExecutionContext context) throws Exception {
        String url = baseURL + "/groups/" + workspaceId + "/reports";
        HashMap<String, String> headers = new HashMap<>();
        headers.put("Authorization", "Bearer " + token);
        JSONObject response = HttpClient.get(url, headers);

        if (response.has("error") || !response.has("value")) {
            context.getLogger().severe("Request params: " + url);
            context.getLogger().severe("Error response: " + response);
            throw new ADException("Failed to fetch reports of given workspace: " + workspaceId);
        }
        JSONArray reportList = response.getJSONArray("value");
        if (reportList.length() == 0) {
            context.getLogger().severe("Request params: " + url);
            context.getLogger().severe("Error response: " + response);
            throw new ADException("No reports available in given workspace: " + workspaceId);
        }
        JSONObject report = null;
        for (int i = 0; i < reportList.length(); i++) {
            report = (JSONObject) reportList.get(i);
            if (report.has("name") && report.getString("name").equalsIgnoreCase(name + "-" + type))
                return report;
        }
        return report;
    }

    static private JSONObject getEmbedToken(String token, String workspaceId, JSONArray reportIds, JSONArray datasetIds, ExecutionContext context) throws Exception {
        String url = baseURL + "/generatetoken";
        HashMap<String, String> headers = new HashMap<>();
        headers.put("Authorization", "Bearer " + token);

        JSONArray jsonDatasets = new JSONArray();
        jsonDatasets.put(new JSONObject().put("id", datasetIds));

        JSONArray jsonReports = new JSONArray();
        jsonReports.put(new JSONObject().put("id", reportIds));

        JSONArray jsonWorkspaces = new JSONArray();
        jsonWorkspaces.put(new JSONObject().put("id", workspaceId));

        JSONObject requestBody = new JSONObject();
        requestBody.put("datasets", datasetIds);
        requestBody.put("reports", reportIds);
        requestBody.put("targetWorkspaces", jsonWorkspaces);

        JSONObject response = HttpClient.get(url, requestBody.toString(), headers);
        if (response.has("error")) {
            context.getLogger().severe("Request url: " + url + ", Request params: " + requestBody);
            context.getLogger().severe("Error response: " + response);
            throw new ADException("Failed to get embed token for power Bi: " + response.getJSONObject("error").getString("message"));
        }
        return response;
    }
}
