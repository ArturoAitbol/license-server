package com.function.clients;

import com.function.exceptions.ADException;
import com.function.util.ActiveDirectory;
import com.microsoft.azure.functions.ExecutionContext;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.function.auth.RoleAuthHandler.*;

public class GraphAPIClient {

    static public final String baseURL = "https://graph.microsoft.com/v1.0/";

    static public void createGuestUserWithProperRole(String userName, String userEmail, String role, ExecutionContext context) throws Exception {
            String token = getAccessToken(context);
            JSONObject user = getUserByEmail(userEmail,token,context);
            String userId;
            if(user != null ){
                context.getLogger().info("Guest user with email "+ userEmail +" already exists in Active Directory (AD). Getting id to assign proper role");
                userId = user.getString("id");
            }else{
                userId = createGuestUser(userName,userEmail,token,context);
            }
            assignRole(userId,role,token,context);
    }

    static public JSONObject getUserByEmail(String userEmail, String token, ExecutionContext context) throws Exception {
        String url = baseURL+"users?$filter=mail%20eq%20'"+userEmail+"'";

        HashMap<String,String> headers = new HashMap<>();
        headers.put("Authorization", "Bearer "+ token);
        JSONObject response = HttpClient.get(url,headers);

        if(response.has("error") || !response.has("value")){
            context.getLogger().severe("Request params: " + url);
            context.getLogger().severe("Error response: " + response);
            throw new ADException("Verify user by email failed (AD)");
        }
        JSONArray usersList = response.getJSONArray("value");
        return  usersList.length()>0 ? usersList.getJSONObject(0) : null;
    }

    static public String createGuestUser(String userName, String userEmail,String token,ExecutionContext context) throws Exception {
            String inviteRedirectUrl = ActiveDirectory.INSTANCE.getEmailInviteUrl();

            String customizedMessageBody = "You have requested access to the tekVizion 360 Portal. Please accept this invitation to complete the authentication process by clicking \"Accept Invitation\" below.";

            JSONObject jsonBody = new JSONObject();
            jsonBody.put("invitedUserDisplayName",userName);
            jsonBody.put("invitedUserEmailAddress",userEmail);
            jsonBody.put("sendInvitationMessage",true);
            jsonBody.put("inviteRedirectUrl",inviteRedirectUrl);

            JSONObject messageInfo = new JSONObject();
            messageInfo.put("messageLanguage","en-US");
            messageInfo.put("customizedMessageBody",customizedMessageBody);
            jsonBody.put("invitedUserMessageInfo",messageInfo);

            String url = baseURL + "invitations";

            HashMap<String,String> headers = new HashMap<>();
            headers.put("Authorization", "Bearer "+ token);
            JSONObject response = HttpClient.post(url,jsonBody.toString(),headers);

            if(response.has("error")){
                context.getLogger().severe("Request url: " + url +", Request params: "+ jsonBody);
                context.getLogger().severe("Error response: " + response);
                throw new ADException("Create a guest user failed (AD): " + response.getJSONObject("error").getString("message"));
            }
            JSONObject invitedUser = response.getJSONObject("invitedUser");
            return invitedUser.getString("id");
    }

    static public void assignRole(String userId,String role,String token,ExecutionContext context) throws Exception {

        List<HashMap<String,String>> azureApps = getAzureAppsInfo(role);

        String url = baseURL + "users/"+userId+"/appRoleAssignments";

        JSONObject appRoleAssignment = new JSONObject();
        appRoleAssignment.put("principalId",userId);

        HashMap<String,String> headers = new HashMap<>();
        headers.put("Authorization", "Bearer "+ token);
        JSONObject response;
        for (HashMap<String,String> app : azureApps) {
            appRoleAssignment.put("resourceId",app.get("objectId"));
            appRoleAssignment.put("appRoleId",app.get("roleId"));
            //Assign-role request
            response = HttpClient.post(url,appRoleAssignment.toString(),headers);
            if(response.has("error") && !response.getJSONObject("error").getString("message").contains("Permission being assigned already exists")) {
                context.getLogger().severe("Request url: " + url + "Request params: " + appRoleAssignment);
                context.getLogger().severe("Error response: " + response);
                throw new ADException("Assign role to guest user failed (AD): " + response.getJSONObject("error").getString("message"));
            }else{
                context.getLogger().info("App role assigned successfully: " + appRoleAssignment);
            }
        }
    }

    static public String getAccessToken(ExecutionContext context) throws Exception {
        String url = "https://login.microsoftonline.com/"+System.getenv("TENANT_ID")+"/oauth2/v2.0/token";

        Map<String, String> parameters = new HashMap<>();
        parameters.put("client_id",System.getenv("EMAIL_INVITE_CLIENT_ID"));
        parameters.put("client_secret",System.getenv("EMAIL_INVITE_CLIENT_SECRET"));
        parameters.put("scope", "https://graph.microsoft.com/.default");
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

    static public void deleteGuestUser(String userEmail, ExecutionContext context) throws Exception {
        String token = getAccessToken(context);
        JSONObject user = getUserByEmail(userEmail,token,context);
        if(user!=null){
            String url = baseURL + "users/"+user.getString("id");
            HashMap<String,String> headers = new HashMap<>();
            headers.put("Authorization", "Bearer "+ token);
            boolean response = HttpClient.delete(url,headers);
            if(!response){
                throw new ADException("Delete a guest user failed (AD): " + url);
            }
        }else{
            context.getLogger().info("Ignoring Error: the user with email " + userEmail + " does not exist. (DELETE GUEST USER)");
        }
    }

    static public void removeRole(String userEmail,String role, ExecutionContext context) throws Exception {
        String token = getAccessToken(context);
        JSONObject user = getUserByEmail(userEmail,token,context);
        if(user!=null){
            List<HashMap<String,String>> azureApps = getAzureAppsInfo(role);

            String appRoleAssignmentsUrl = baseURL + "users/"+user.getString("id")+"/appRoleAssignments/";
            HashMap<String,String> headers = new HashMap<>();
            headers.put("Authorization", "Bearer "+ token);
            JSONObject response = HttpClient.get(appRoleAssignmentsUrl,headers);

            if(response.has("error")){
                throw new Exception("App Role Assignments not found.");
            }

            JSONArray appRoleAssignments = response.getJSONArray("value");
            String url;
            for (HashMap<String,String> app : azureApps) {
                String appRoleAssignmentId = "";
                for (int i = 0; i < appRoleAssignments.length(); i++) {

                    JSONObject appRoleAssignment = appRoleAssignments.getJSONObject(i);
                    String resourceId = appRoleAssignment.getString("resourceId");
                    String appRoleId = appRoleAssignment.getString("appRoleId");

                    if(resourceId.equals(app.get("objectId")) && appRoleId.equals(app.get("roleId"))){
                        appRoleAssignmentId = appRoleAssignment.getString("id");
                        break;
                    }
                }
                if(!appRoleAssignmentId.isEmpty()) {
                    url = appRoleAssignmentsUrl + appRoleAssignmentId;
                    if(!HttpClient.delete(url,headers)){
                        throw new ADException("Remove guest user role failed (AD): " + url);
                    }
                }else{
                    context.getLogger().info("Ignoring Error: There is no App role assignment to delete.");
                }
            }
        }else{
            context.getLogger().info("Ignoring Error: the user with email " + userEmail + " does not exist.(REMOVE GUEST USER ROLE)");
        }
    }

    static private List<HashMap<String,String>> getAzureAppsInfo(String role) throws ADException {
        HashMap<String,String> licenseServer = new HashMap<>();
        licenseServer.put("objectId",ActiveDirectory.INSTANCE.getLicenseAPIProperty("object-id"));
        HashMap<String,String> licensePortal = new HashMap<>();
        licensePortal.put("objectId",ActiveDirectory.INSTANCE.getLicensePortalProperty("object-id"));

        switch (role){
            case CUSTOMER_FULL_ADMIN:
                licenseServer.put("roleId",ActiveDirectory.INSTANCE.getLicenseAPIProperty("customer-role-id"));
                licensePortal.put("roleId",ActiveDirectory.INSTANCE.getLicensePortalProperty("customer-role-id"));
                break;
            case SUBACCOUNT_ADMIN:
                licenseServer.put("roleId",ActiveDirectory.INSTANCE.getLicenseAPIProperty("subaccount-role-id"));
                licensePortal.put("roleId",ActiveDirectory.INSTANCE.getLicensePortalProperty("subaccount-role-id"));
                break;
            case SUBACCOUNT_STAKEHOLDER:
                licenseServer.put("roleId",ActiveDirectory.INSTANCE.getLicenseAPIProperty("subaccount-stakeholder-role-id"));
                licensePortal.put("roleId",ActiveDirectory.INSTANCE.getLicensePortalProperty("subaccount-stakeholder-role-id"));
                break;
            default:
                throw new ADException("Invalid role provided");
        }

        List<HashMap<String,String>> azureAppsList = new ArrayList<>();
        azureAppsList.add(licenseServer);
        azureAppsList.add(licensePortal);
        return azureAppsList;
    }
}
