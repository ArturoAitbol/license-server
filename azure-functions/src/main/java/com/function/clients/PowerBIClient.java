package com.function.clients;

import java.util.HashMap;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;

import com.function.exceptions.ADException;
import com.microsoft.azure.functions.ExecutionContext;

public class PowerBIClient {
	
	static private final String baseURL = "https://api.powerbi.com/v1.0/myorg";
	static private final String REPORT_TYPE_DAILY = "Daily";
	static private final String REPORT_TYPE_WEEKLY = "Weekly";
	
	static public String getAccessToken(ExecutionContext context) throws Exception {
        String url = "https://login.microsoftonline.com/"+System.getenv("POWER_BI_TENANT_ID")+"/oauth2/v2.0/token";

        Map<String, String> parameters = new HashMap<>();
        parameters.put("client_id",System.getenv("POWER_BI_CLIENT_ID"));
        parameters.put("client_secret",System.getenv("POWER_BI_CLIENT_SECRET"));
        parameters.put("scope", "https://analysis.windows.net/powerbi/api/.default");
        parameters.put("grant_type", "client_credentials");
        String urlParameters = HttpClient.getDataString(context, parameters);


        HashMap<String,String> headers = new HashMap<>();
        headers.put("Content-Type", "application/x-www-form-urlencoded");
        JSONObject response = HttpClient.post(url,urlParameters,headers);

        if (response.has("error") || !response.has("access_token")){
            context.getLogger().severe("Request params: "+ urlParameters);
            context.getLogger().severe("Error response: " + response);
            throw new ADException("Error retrieving token from Microsoft identity platform");
        }
        return response.get("access_token").toString();
    }
	
	static public JSONObject getPowerBiDetails(String customer, String subaccount, ExecutionContext context) throws Exception {
		if(customer==null || customer.equals("null") || subaccount==null || subaccount.equals("null") ) {
			context.getLogger().severe("Failed to fetch power bi details. Invaid customer/subaccount. Customer: "+customer+" | Subaccount: "+subaccount);
			throw new ADException("Failed to fetch power bi details. Invalid customer/subaccount. Customer: "+customer+" | Subaccount: "+subaccount);
		}
		String token = getAccessToken(context);
		String workspaceId = getWorkspaceIdByName(token, customer, context);
		if(workspaceId==null) {
			context.getLogger().severe("Failed to fetch workspace id of the customer. Customer: "+customer+" | Subaccount: "+subaccount);
			throw new ADException("Failed to fetch workspace id of the customer. Customer: "+customer+" | Subaccount: "+subaccount);
		}
		context.getLogger().info("Power bI workspace details for the customer: "+customer+" | Workspace: "+workspaceId);
		JSONObject response = new JSONObject();
		JSONObject powerBiReport = getPowerBiReportDetails(token, workspaceId, subaccount, REPORT_TYPE_DAILY, context);
		response.put("daily", powerBiReport);
		powerBiReport = getPowerBiReportDetails(token, workspaceId, subaccount, REPORT_TYPE_WEEKLY, context);
		response.put("weekly", powerBiReport);	
		return response;
	}
	
	static public JSONObject getPowerBiReportDetails(String token, String workspaceId, String subaccount, String type, ExecutionContext context) throws Exception {
		JSONObject report = getReport(token, workspaceId, subaccount, type, context);
		if(report==null) {
			context.getLogger().severe("Failed to fetch "+type+" report of the subaccount. Subaccount: "+subaccount);
			throw new ADException("Failed to fetch "+type+" report of the subaccount. Subaccount: "+subaccount);
		}
		String embedToken = getEmbedToken(token, workspaceId, report.getString("id"),  report.getString("datasetId"), context);
		JSONObject response = new JSONObject();
		response.put("embedUrl", report.getString("embedUrl"));
		response.put("embedToken", embedToken);
		context.getLogger().info("Power bI "+type+" report details of subaccount - "+subaccount+" | Report Id: "+report.getString("id"));
		return response;
	}
	
	
	
	static private String getWorkspaceIdByName(String token, String name, ExecutionContext context) throws Exception {
		String url = baseURL+"/groups";
        HashMap<String,String> headers = new HashMap<>();
        headers.put("Authorization", "Bearer "+ token);
        JSONObject response = HttpClient.get(url,headers);

        if(response.has("error") || !response.has("value")){
            context.getLogger().severe("Request params: " + url);
            context.getLogger().severe("Error response: " + response);
            throw new ADException("Failed to fetch workspaces");
        }
        JSONArray workspaceList = response.getJSONArray("value");
        if(workspaceList.length()==0) {
        	context.getLogger().severe("Request params: " + url);
            context.getLogger().severe("Error response: " + response);
            throw new ADException("No workspaces available");
        }
        JSONObject workspace = null;
        for(int i=0; i<workspaceList.length(); i++) {
        	workspace = (JSONObject) workspaceList.get(i);
        	if(workspace.has("name") && workspace.getString("name").equalsIgnoreCase(name))
        		return workspace.getString("id");
        }
        return null;
	}
	
	static private JSONObject getReport(String token, String workspaceId, String name, String type, ExecutionContext context) throws Exception {
		String url = baseURL+"/groups/"+workspaceId+"/reports";
        HashMap<String,String> headers = new HashMap<>();
        headers.put("Authorization", "Bearer "+ token);
        JSONObject response = HttpClient.get(url,headers);

        if(response.has("error") || !response.has("value")){
            context.getLogger().severe("Request params: " + url);
            context.getLogger().severe("Error response: " + response);
            throw new ADException("Failed to fetch reports of given workspace: "+workspaceId);
        }
        JSONArray reportList = response.getJSONArray("value");
        if(reportList.length()==0) {
        	context.getLogger().severe("Request params: " + url);
            context.getLogger().severe("Error response: " + response);
            throw new ADException("No reports available in given workspace: "+workspaceId);
        }
        JSONObject report = null;
        for(int i=0; i<reportList.length(); i++) {
        	report = (JSONObject) reportList.get(i);
        	if(report.has("name") && report.getString("name").equalsIgnoreCase(name+"-"+type))
        		return report;
        }
        return report;
	}
	
	static private String getEmbedToken(String token, String workspaceId, String reportId, String datasetId, ExecutionContext context) throws Exception {
		String url = baseURL+"/generatetoken";
        HashMap<String,String> headers = new HashMap<>();
        headers.put("Authorization", "Bearer "+ token);
        
        JSONArray jsonDatasets = new JSONArray();
        jsonDatasets.put(new JSONObject().put("id", datasetId));
        
        JSONArray jsonReports = new JSONArray();
        jsonReports.put(new JSONObject().put("id", reportId));
        
        JSONArray jsonWorkspaces = new JSONArray();
        jsonWorkspaces.put(new JSONObject().put("id", workspaceId));
        
        JSONObject requestBody = new JSONObject();
        requestBody.put("datasets", jsonDatasets);
        requestBody.put("reports", jsonReports);
        requestBody.put("targetWorkspaces", jsonWorkspaces);
        
        JSONObject response = HttpClient.get(url, requestBody.toString(), headers);
        if(response.has("error")){
            context.getLogger().severe("Request url: " + url +", Request params: "+ requestBody);
            context.getLogger().severe("Error response: " + response);
            throw new ADException("Failed to get embed token for power Bi: " + response.getJSONObject("error").getString("message"));
        }
        return response.has("token")?response.getString("token"):"";
	}

}
