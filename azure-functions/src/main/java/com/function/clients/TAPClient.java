package com.function.clients;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.json.JSONObject;

import com.function.exceptions.ADException;
import com.microsoft.azure.functions.ExecutionContext;

public class TAPClient {
	
	/**
	 * Method to get the access token to access TAP API
	 * @param tapURL
	 * @param context
	 * @return
	 * @throws Exception
	 */
	static public String getAccessToken(String tapURL, ExecutionContext context) throws Exception {
        String url = tapURL+"/api/login";
        Map<String, String> parameters = new HashMap<>();
        //parameters.put("username", "administrator@tekvizion.com");
        //parameters.put("password", "admin123");
        parameters.put("username", System.getenv("TAP_USERNAME"));
        parameters.put("password", System.getenv("TAP_PASSWORD"));
        String urlParameters = HttpClient.getDataString(context, parameters);

        HashMap<String,String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        JSONObject response = HttpClient.post(url,urlParameters,headers);

        if (response.has("error") || (response.has("success") && !response.getBoolean("success"))){
            context.getLogger().severe("Request params: "+ urlParameters);
            context.getLogger().severe("Error response: " + response);
            throw new ADException("Error retrieving token from Automation Platform");
        }
        JSONObject responseObj =  (JSONObject) response.get("response");
        if (!responseObj.has("accessToken")){
            context.getLogger().severe("Request params: "+ urlParameters);
            context.getLogger().severe("Error response: " + response);
            throw new ADException("Error retrieving token from Automation Platform");
        }
        return responseObj.get("accessToken").toString();
    }
	
	/**
	 * Method to get the detailed report of STS/LTS by startDate and endDate
	 * @param tapURL
	 * @param token
	 * @param type
	 * @param startDate
	 * @param endDate
	 * @param context
	 * @return
	 * @throws Exception
	 */
	static public JSONObject getDetailedReport(String tapURL, String token, String type, Date startDate,  Date endDate, ExecutionContext context) throws Exception {
		String url = tapURL+"/v1/spotlight/"+type+"/report";
        HashMap<String,String> headers = new HashMap<>();
        headers.put("Authorization", "Bearer "+ token);
        
        JSONObject requestBody = new JSONObject();
        requestBody.put("startDate", startDate);
        requestBody.put("endDate", endDate);
        
        JSONObject response = HttpClient.get(url, requestBody.toString(), headers);
        if (response.has("error") || (response.has("success") && !response.getBoolean("success"))){
            context.getLogger().severe("Request params: "+ requestBody);
            context.getLogger().severe("Error response: " + response);
            throw new ADException("Error retrieving "+type+" detailed report from Automation Platform");
        }
        JSONObject responseObj =  (JSONObject) response.get("response");
        return responseObj;
	}
	
}
