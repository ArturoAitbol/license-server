package com.function.clients;

import java.util.*;

import org.json.JSONArray;
import org.json.JSONObject;
import com.function.exceptions.ADException;
import com.function.util.ActiveDirectory;
import com.microsoft.azure.functions.ExecutionContext;
import static com.function.auth.RoleAuthHandler.*;

public class GraphAPIClientForUserProfile {

	static public JSONObject getUserProfileByEmail(String userEmail, String token, ExecutionContext context) throws Exception {
        String url = GraphAPIClient.baseURL+"users?$filter=mail%20eq%20'"+userEmail+"'&&$select=id,displayName,jobTitle,companyName,mobilePhone";
        HashMap<String,String> headers = new HashMap<>();
        headers.put("Authorization", "Bearer "+ token);
        JSONObject response = HttpClient.get(url,headers);

        if(response.has("error") || !response.has("value")){
            context.getLogger().severe("Request params: " + url);
            context.getLogger().severe("Error response: " + response);
            throw new ADException("Get user by email failed (AD)");
        }
        JSONArray usersList = response.getJSONArray("value");
        return usersList.length()>0 ? usersList.getJSONObject(0) : null;
    }
	
	static public JSONObject getUserProfileWithRoleByEmail(String userEmail, ExecutionContext context) throws Exception {
		String token = GraphAPIClient.getAccessToken(context);
        JSONObject user = getUserProfileByEmail(userEmail,token,context);
        if(user!=null) {
        	String role = "";
        	try {
        		role = getAppRole(user.getString("id"), userEmail, token, context);
        		user.put("role", role);
        	}catch (Exception e) {
        		context.getLogger().severe("Failed to fetch app role of user (AD): " + userEmail+" | Exception : "+e.getMessage());
        	}
        }
        return  user;
    } 
	
	static public void updateUserProfile(String userEmail, String displayName, String jobTitle, String companyName, String mobilePhone, ExecutionContext context) throws Exception {
		 String token = GraphAPIClient.getAccessToken(context);
	     JSONObject user = getUserProfileByEmail(userEmail,token,context);
	     if(user!=null){
				  try {
					  GraphAPIServiceClient.updateUserProfile(user.getString("id"), displayName, jobTitle, companyName, mobilePhone, context);
				  }catch(Exception e) {
					  context.getLogger().severe("Request url: GraphServiceClient, Request params: "+ user.getString("id")+", "+displayName+", "+jobTitle+", "+companyName+", "+mobilePhone);
					  context.getLogger().severe("Error response: " + e.getMessage()); 
					  throw new	  ADException("Failed to update user details (AD): " + userEmail);
				  }
	     }else {
             context.getLogger().severe("No user found with given email (AD): " + userEmail);
             throw new ADException("No user found with given email (AD): " + userEmail);
	     }
	}
	
	static public String getAppRole(String id, String email, String token, ExecutionContext context) throws Exception {
		String role = "";
	    JSONArray appRoleAssignments = getUserAppRoleAssignments(id, token, context);
	    if(appRoleAssignments.isEmpty()) {
	    	context.getLogger().severe("No app roles assigned to given user (AD): " + email);
	    	throw new ADException("No app roles assigned to given user (AD): " + email);
	    }
	    JSONObject appRole = null;
	    String appRoleId = "";
	    final String applicationCustomerFullAdminRoleId = ActiveDirectory.INSTANCE.getLicensePortalProperty("customer-role-id");
	    final String applicationSubaccountAdminRoleId = ActiveDirectory.INSTANCE.getLicensePortalProperty("subaccount-role-id");
	    final String applicationSubaccountStakeholderRoleId = ActiveDirectory.INSTANCE.getLicensePortalProperty("subaccount-stakeholder-role-id");
	    context.getLogger().info("User app roles queried from (AD): " + email+" | "+appRoleAssignments);
	    for (Object object : appRoleAssignments) {
			appRole = (JSONObject) object;
			appRoleId = appRole.getString("appRoleId");
			if(appRoleId.equals(applicationCustomerFullAdminRoleId)) {
				role = CUSTOMER_FULL_ADMIN;
				break;
			}
			if(appRoleId.equals(applicationSubaccountAdminRoleId)) {
				role = SUBACCOUNT_ADMIN;
				break;
			}
			if(appRoleId.equals(applicationSubaccountStakeholderRoleId)) {
				role = SUBACCOUNT_STAKEHOLDER;
				break;
			}
			if(!role.isEmpty())
				break;
		}
	    if(role.isEmpty()) {
	    	context.getLogger().severe("No license server portal app roles assigned to given user (AD): " + email);
	    	throw new ADException("No license server portal app roles assigned to given user (AD): " + email);
	    }
	    context.getLogger().info("License server portal app role queried from (AD): " + email+" | "+role);
		return role;
	}
	
    static public JSONArray getUserAppRoleAssignments(String id, String token, ExecutionContext context) throws Exception {
        String url = GraphAPIClient.baseURL+ "users/"+id+"/appRoleAssignments/";
        HashMap<String,String> headers = new HashMap<>();
        headers.put("Authorization", "Bearer "+ token);
        JSONObject response = HttpClient.get(url,headers);
        if(response.has("error") || !response.has("value")){
            context.getLogger().severe("Request params: " + url);
            context.getLogger().severe("Error response: " + response);
            throw new ADException("No App roles assigned for user (AD): " + id);
        }
        JSONArray appRoleAssignments = response.getJSONArray("value");
        return  appRoleAssignments;
    }	
}
