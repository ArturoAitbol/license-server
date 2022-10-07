package com.function.clients;

import java.util.ArrayList;
import java.util.List;

import com.azure.identity.ClientSecretCredential;
import com.azure.identity.ClientSecretCredentialBuilder;
import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.graph.authentication.TokenCredentialAuthProvider;
import com.microsoft.graph.models.User;
import com.microsoft.graph.requests.GraphServiceClient;

public class GraphAPIServiceClient {

	@SuppressWarnings("rawtypes")
	public static void updateUserProfile(String id, String displayName, String jobTitle, String companyName,
			String mobilePhone, ExecutionContext context) throws Exception {
		final ClientSecretCredential clientSecretCredential = new ClientSecretCredentialBuilder()
				.clientId(System.getenv("EMAIL_INVITE_CLIENT_ID"))
				.clientSecret(System.getenv("EMAIL_INVITE_CLIENT_SECRET"))
				.tenantId(System.getenv("TENANT_ID"))
				.build();

		List<String> SCOPES = new ArrayList<String>();
		SCOPES.add("https://graph.microsoft.com/.default");

		final TokenCredentialAuthProvider tokenCredAuthProvider = new TokenCredentialAuthProvider(SCOPES,
				clientSecretCredential);

		User user = new User();
		if (displayName != null)
			user.displayName = displayName;
		if (jobTitle != null)
			user.jobTitle = jobTitle;
		if (companyName != null)
			user.companyName = companyName;
		if (mobilePhone != null)
			user.mobilePhone = mobilePhone;
		GraphServiceClient graphClient = GraphServiceClient.builder().authenticationProvider(tokenCredAuthProvider)
				.buildClient();
		graphClient.users(id).buildRequest().patch(user);
	}
}
