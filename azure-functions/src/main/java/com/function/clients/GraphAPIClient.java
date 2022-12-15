package com.function.clients;

import com.function.exceptions.ADException;
import com.function.util.ActiveDirectory;
import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.graph.core.ClientException;
import com.microsoft.graph.models.AppRoleAssignment;
import com.microsoft.graph.models.Invitation;
import com.microsoft.graph.models.User;
import org.json.JSONObject;

import java.util.*;

import static com.function.auth.Roles.*;

public class GraphAPIClient {

    /**
     *
     * @param userName username of the new user
     * @param userEmail email of the new user
     * @param role AD role to assign the user
     * @param context Azure function execution context
     * @return true if the user is created, false if the user already existed
     * @throws Exception
     */
    static public boolean createGuestUserWithProperRole(String userName, String userEmail, String role, ExecutionContext context) throws Exception {
        User user = getUserByEmail(userEmail,context);
        String userId;
        boolean res = false;
        if(user != null ){
            context.getLogger().info("Guest user with email "+ userEmail +" already exists in Active Directory (AD). Getting id to assign proper role");
            userId = user.id;
        }else{
            userId = createGuestUser(userName,userEmail,context);
            res = true;
        }
        assignRole(userId,role,context);
        return res;
    }

    static public User getUserByEmail(String userEmail, ExecutionContext context) throws ADException {
        try{
            return GraphAPIServiceClient.getInstance().getUserByEmail(userEmail);
        }catch (ClientException e){
            context.getLogger().severe("Graph Method Called: getUserByEmail, Email provided: " + userEmail);
            context.getLogger().severe("Error response: " + e.getMessage());
            throw new ADException("Verify user by email failed (AD): " + userEmail);
        }
    }

    static public String createGuestUser(String userName, String userEmail,ExecutionContext context) throws ADException {
        String inviteRedirectUrl = ActiveDirectory.INSTANCE.getEmailInviteUrl();

        try{
            Invitation invitation = GraphAPIServiceClient.getInstance().inviteGuestUser(userName,userEmail,inviteRedirectUrl);
            User invitedUser = invitation.invitedUser;
            if(invitedUser == null ) return null;
            context.getLogger().info("Guest user created successfully: " + invitedUser.id);
            return invitedUser.id;
        }catch (ClientException e){
            JSONObject jsonBody = new JSONObject();
            jsonBody.put("userName",userName);
            jsonBody.put("userEmail",userEmail);
            jsonBody.put("inviteRedirectUrl",inviteRedirectUrl);
            context.getLogger().severe("Graph Method Called: inviteGuestUser, Request body: "+ jsonBody);
            context.getLogger().severe("Error Response:" + e.getMessage());
            throw new ADException("Create a guest user failed (AD): " + e.getMessage());
        }
    }

    static public void assignRole(String userId,String role,ExecutionContext context) throws ADException {
        List<HashMap<String,String>> azureApps = getAzureAppsInfo(role);
        for (HashMap<String,String> app : azureApps) {
            try{
                AppRoleAssignment response = GraphAPIServiceClient.getInstance().assignRole(userId,app.get("objectId"),app.get("roleId"));
                JSONObject responseInfo = new JSONObject();
                responseInfo.put("Azure Application Name",response.resourceDisplayName);
                responseInfo.put("userName",response.principalDisplayName);
                responseInfo.put("appRoleId",response.appRoleId);
                context.getLogger().info("App role assigned successfully: " + responseInfo);
            }
            catch (ClientException e){
                String errorMessage = e.getMessage();
                JSONObject requestBody = new JSONObject();
                requestBody.put("principalId", userId);
                requestBody.put("resourceId",app.get("objectId"));
                requestBody.put("appRoleId",app.get("roleId"));

                if(!errorMessage.contains("Permission being assigned already exists")){
                    context.getLogger().severe("Graph Method Called: assignRole, Request body: " + requestBody);
                    context.getLogger().severe("Error response: " + errorMessage);
                    throw new ADException("Assign role to guest user failed (AD). " +errorMessage.split("\n")[1]);
                }
                context.getLogger().info("IGNORING ERROR. App role is already assigned: " + requestBody);
            }
        }
    }

    static public void deleteGuestUser(String userEmail, ExecutionContext context) throws ADException {
        User user = getUserByEmail(userEmail,context);
        if(user!=null){
            try{
                GraphAPIServiceClient.getInstance().deleteGuestUser(user.id);
            }catch (ClientException e){
                context.getLogger().severe("Graph Method Called: deleteGuestUser, Request params: " + userEmail);
                context.getLogger().severe("Error response: " + e.getMessage());
                throw new ADException("Delete a guest user failed (AD): " + userEmail);
            }
        }else{
            context.getLogger().info("Ignoring Error (DELETE GUEST USER): User with email " + userEmail + " does not exist (AD)");
        }
    }

    static public void removeRole(String userEmail,String role, ExecutionContext context) throws Exception {
        User user = getUserByEmail(userEmail,context);
        if(user!=null){
            removeRoleByUserId(user.id, role, context);
        }else{
            context.getLogger().info("Ignoring Error (REMOVE APP ROLE ASSIGNMENT): User with email " + userEmail + " does not exist (AD)");
        }
    }

    public static void removeRoleByUserId(String userId, String role, ExecutionContext context) throws Exception {
        List<HashMap<String,String>> azureApps = getAzureAppsInfo(role);

        List<AppRoleAssignment> appRoleAssignments = getUserAppRoleAssignments(userId, context);
        if(appRoleAssignments.isEmpty()){
            throw new ADException("App Role Assignments not found for given user (AD): " + userId);
        }

        for (HashMap<String,String> app : azureApps) {
            String appRoleAssignmentId = "";
            for (AppRoleAssignment appRoleAssignment : appRoleAssignments) {

                String resourceId = String.valueOf(appRoleAssignment.resourceId);
                String appRoleId = String.valueOf(appRoleAssignment.appRoleId);

                if (resourceId.equals(app.get("objectId")) && appRoleId.equals(app.get("roleId"))) {
                    appRoleAssignmentId = appRoleAssignment.id != null ? appRoleAssignment.id : "";
                    break;
                }
            }
            if(!appRoleAssignmentId.isEmpty()) {
                try{
                    GraphAPIServiceClient.getInstance().removeRole(userId, appRoleAssignmentId);
                }catch (Exception e){
                    JSONObject params = new JSONObject();
                    params.put("userId", userId);
                    params.put("appRoleAssignmentId",appRoleAssignmentId);
                    context.getLogger().severe("Graph method called: removeRole, Request params: " + params);
                    context.getLogger().severe("Error response: " + e.getMessage());
                    throw new ADException("Remove guest user role failed (AD)");
                }

            }else{
                context.getLogger().info("Ignoring Error (REMOVE APP ROLE ASSIGNMENT): There is no App role assignment to delete (AD)");
            }
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
    
    static public User getUserProfileByEmail(String userEmail, ExecutionContext context) throws Exception {
        String filter = "mail eq '"+userEmail+"' or userPrincipalName eq '"+userEmail+"'";
        String select = "id,displayName,jobTitle,companyName,mobilePhone";

        try{
            return GraphAPIServiceClient.getInstance().getUserProfile(filter,select);
        }
        catch(Exception e){
            context.getLogger().severe("Graph Method called: getUserProfileByEmail, Request params: {filter:" + filter + "select: " + select + "}");
            context.getLogger().severe("Error response: " + e.getMessage());
            throw new ADException("Get user by email failed (AD)");
        }
    }
	
	static public JSONObject getUserProfileWithRoleByEmail(String userEmail, ExecutionContext context) throws Exception {
        User userObject = getUserProfileByEmail(userEmail,context);
        JSONObject user = null;
        if(userObject!=null) {
            user = new JSONObject();
            user.put("id", userObject.id);
            user.put("displayName", userObject.displayName !=null ? userObject.displayName : "");
            user.put("jobTitle", userObject.jobTitle != null ? userObject.jobTitle : "");
            user.put("companyName", userObject.companyName != null ? userObject.companyName : "");
            user.put("mobilePhone", userObject.mobilePhone != null ? userObject.mobilePhone : "");
        	String role;
        	try {
        		role = getAppRole(userObject.id,userEmail,context);
        		user.put("role", role);
        	}catch (Exception e) {
        		context.getLogger().severe("Failed to fetch app role of user (AD): " + userEmail+" | Exception : "+e.getMessage());
        	}
        }
        return  user;
    } 
	
	static public User updateUserProfile(String userEmail, String displayName, String jobTitle, String companyName, String mobilePhone, ExecutionContext context) throws Exception {
	     User user = getUserProfileByEmail(userEmail,context);
	     if(user!=null){
				  try {
					  GraphAPIServiceClient.getInstance().updateUserProfile(user.id, displayName, jobTitle, companyName, mobilePhone);
				  }catch(Exception e) {
					  context.getLogger().severe("Request url: GraphServiceClient, Request params: "+ user.id+", "+displayName+", "+jobTitle+", "+companyName+", "+mobilePhone);
					  context.getLogger().severe("Error response: " + e.getMessage()); 
					  throw new	  ADException("Failed to update user details (AD): " + userEmail);
				  }
	     }else {
             context.getLogger().severe("No user found with given email (AD): " + userEmail);
             throw new ADException("No user found with given email (AD): " + userEmail);
	     }
         return user;
	}
	
	static public String getAppRole(String userId,String userEmail, ExecutionContext context) throws Exception {
		String role = "";
	    List<AppRoleAssignment> appRoleAssignments = getUserAppRoleAssignments(userId,context);
	    if(appRoleAssignments.isEmpty()) {
	    	context.getLogger().severe("No app roles assigned to given user (AD): " + userEmail);
	    	throw new ADException("No app roles assigned to given user (AD): " + userEmail);
	    }
	    String appRoleId;
	    final String applicationCustomerFullAdminRoleId = ActiveDirectory.INSTANCE.getLicensePortalProperty("customer-role-id");
	    final String applicationSubaccountAdminRoleId = ActiveDirectory.INSTANCE.getLicensePortalProperty("subaccount-role-id");
	    final String applicationSubaccountStakeholderRoleId = ActiveDirectory.INSTANCE.getLicensePortalProperty("subaccount-stakeholder-role-id");
	    context.getLogger().info("User app roles queried from (AD): " + userEmail+" | "+appRoleAssignments);
	    for (AppRoleAssignment appRoleAssignment : appRoleAssignments) {
			appRoleId = String.valueOf(appRoleAssignment.appRoleId);
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
        }
	    if(role.isEmpty()) {
	    	context.getLogger().severe("No license server portal app roles assigned to given user (AD): " + userEmail);
	    	throw new ADException("No license server portal app roles assigned to given user (AD): " + userEmail);
	    }
	    context.getLogger().info("License server portal app role queried from (AD): " + userEmail+" | "+role);
		return role;
	}
	
    static public List<AppRoleAssignment> getUserAppRoleAssignments(String id, ExecutionContext context) throws Exception {
        try {
            return GraphAPIServiceClient.getInstance().getAppRoleAssignments(id);
        }catch(Exception e){
            context.getLogger().severe("Graph Method called: getAppRoleAssignment, Request params: { userId: " + id + " }");
            context.getLogger().severe("Error response: " + e.getMessage());
            throw new ADException("No App roles assigned for user (AD): " + id);
        }
    }	
}
