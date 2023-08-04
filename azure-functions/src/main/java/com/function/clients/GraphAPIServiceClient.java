package com.function.clients;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.azure.identity.ClientSecretCredential;
import com.azure.identity.ClientSecretCredentialBuilder;
import com.microsoft.graph.authentication.TokenCredentialAuthProvider;
import com.microsoft.graph.core.ClientException;
import com.microsoft.graph.models.*;
import com.microsoft.graph.requests.*;

@SuppressWarnings("rawtypes")
public class GraphAPIServiceClient {


	private final GraphServiceClient graphClient;

	private static final GraphAPIServiceClient instance = new GraphAPIServiceClient();

	public static GraphAPIServiceClient getInstance() {
		return instance;
	}

	private GraphAPIServiceClient() {
		final ClientSecretCredential clientSecretCredential = new ClientSecretCredentialBuilder()
				.clientId(System.getenv("EMAIL_INVITE_CLIENT_ID"))
				.clientSecret(System.getenv("EMAIL_INVITE_CLIENT_SECRET"))
				.tenantId(System.getenv("TENANT_ID"))
				.build();

		List<String> SCOPES = new ArrayList<>();
		SCOPES.add("https://graph.microsoft.com/.default");

		final TokenCredentialAuthProvider tokenCredAuthProvider = new TokenCredentialAuthProvider(SCOPES,
				clientSecretCredential);

		graphClient = GraphServiceClient.builder().authenticationProvider(tokenCredAuthProvider).buildClient();
	}

	public void updateUserProfile(String id, String displayName, String jobTitle, String companyName,
			String mobilePhone) throws Exception {
		User user = new User();
		if (displayName != null && !displayName.isEmpty())
			user.displayName = displayName;
		if (jobTitle != null && !jobTitle.isEmpty())
			user.jobTitle = jobTitle;
		if (companyName != null && !companyName.isEmpty())
			user.companyName = companyName;
		if (mobilePhone != null && !mobilePhone.isEmpty())
			user.mobilePhone = mobilePhone;
		graphClient.users(id).buildRequest().patch(user);
	}

	public User getUserByEmail(String userEmail){
		UserCollectionPage usersCollectionPage = graphClient.users().buildRequest().filter("mail eq '"+userEmail+"'").get();
		if(usersCollectionPage!=null){
			List<User> users = usersCollectionPage.getCurrentPage();
			return users.size() == 0 ? null : users.get(0);
		}
		return null;
	}

	public Invitation inviteGuestUser(String userName, String userEmail,String inviteRedirectUrl) throws ClientException {
		Invitation invitation = new Invitation();
		invitation.invitedUserDisplayName=userName;
		invitation.invitedUserEmailAddress=userEmail;
		invitation.sendInvitationMessage=false;
		invitation.inviteRedirectUrl= inviteRedirectUrl;
		return graphClient.invitations().buildRequest().post(invitation);
	}

	public AppRoleAssignment assignRole(String userId,String resourceId,String appRoleId) throws ClientException {
		AppRoleAssignment appRoleAssignment = new AppRoleAssignment();
		appRoleAssignment.principalId = UUID.fromString(userId);
		appRoleAssignment.resourceId = UUID.fromString(resourceId);
		appRoleAssignment.appRoleId = UUID.fromString(appRoleId);

		return graphClient.users(userId).appRoleAssignments()
				.buildRequest()
				.post(appRoleAssignment);
	}

	public void deleteGuestUser(String userId) throws ClientException {
		graphClient.users(userId)
				.buildRequest()
				.delete();
	}

	public List<AppRoleAssignment> getAppRoleAssignments(String userId) throws ClientException{
		AppRoleAssignmentCollectionPage appRoleAssignmentCollectionPage = graphClient.users(userId).appRoleAssignments()
				.buildRequest()
				.get();
		if(appRoleAssignmentCollectionPage!=null){
			return appRoleAssignmentCollectionPage.getCurrentPage();
		}
		return new ArrayList<>();
	}

	public void removeRole(String userId,String roleAssignment){
		graphClient.users(userId).appRoleAssignments(roleAssignment)
				.buildRequest()
				.delete();
	}

	public User getUserProfile(String filter,String select){
		UserCollectionPage usersCollectionPage = graphClient.users().buildRequest().filter(filter).select(select).get();
		if(usersCollectionPage!=null){
			List<User> users = usersCollectionPage.getCurrentPage();
			return users.size() == 0 ? null : users.get(0);
		}
		return null;
	}
}
