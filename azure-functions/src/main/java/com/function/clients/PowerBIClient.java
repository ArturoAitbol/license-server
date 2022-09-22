package com.function.clients;

import java.util.HashMap;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;

import com.function.exceptions.ADException;
import com.microsoft.azure.functions.ExecutionContext;

public class PowerBIClient {
	
	static private final String baseURL = "https://api.powerbi.com/v1.0/myorg";
	
	static public String getAccessToken(ExecutionContext context) throws Exception {
        String url = "https://login.microsoftonline.com/"+System.getenv("TENANT_ID")+"/oauth2/v2.0/token";

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
	
	static public JSONObject getPowerBiDetails(String workspaceId, String reportId, ExecutionContext context) throws Exception {
		if(workspaceId==null || workspaceId.equals("null") || reportId==null || reportId.equals("null") ) {
			context.getLogger().severe("Failed to fetch power bi details. Invaid workspace/report. Workspace: "+workspaceId+" | Report: "+reportId);
			throw new ADException("Failed to fetch power bi details. Invalid workspace/report. Workspace: "+workspaceId+" | Report: "+reportId);
		}
		String token = getAccessToken(context);
		JSONObject report = getReport(token, workspaceId, reportId, context);
		String embedToken = getEmbedToken(token, workspaceId, reportId,  report.getString("datasetId"), context);
		if(!report.has("embedUrl") || report.getString("embedUrl").isEmpty() || embedToken.isEmpty()) {
			context.getLogger().severe("Failed to fetch power bi details of given workspace: "+workspaceId+" | Report: "+report+" | Embed Url: "+embedToken);
			throw new ADException("Failed to fetch power bi details of given workspace: "+workspaceId);
		}
		JSONObject response = new JSONObject();
		response.put("embedUrl", report.getString("embedUrl"));
		response.put("embedToken", embedToken);
		context.getLogger().info("Power bI details fetched for given workspace: "+workspaceId);
		return response;
	}
	
	static private JSONObject getReport(String token, String workspaceId, String reportId, ExecutionContext context) throws Exception {
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
        	if(report.has("id") && report.getString("id").equals(reportId))
        		break;
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
