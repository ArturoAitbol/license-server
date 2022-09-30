package com.function;

import com.function.auth.Resource;
import com.function.clients.GraphAPIClient;
import com.function.util.FeatureToggles;
import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpMethod;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import com.microsoft.azure.functions.annotation.BindingName;

import java.sql.*;
import java.util.Optional;

import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;
import static com.function.auth.Roles.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSDeleteSubaccountById 
{
	/**
	 * This function listens at endpoint "/v1.0/subaccounts". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/subaccounts
	 */
	@FunctionName("TekvLSDeleteSubaccountById")
	public HttpResponseMessage run(
			@HttpTrigger(
				name = "req",
				methods = {HttpMethod.DELETE},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "subaccounts/{id}")
				HttpRequestMessage<Optional<String>> request,
				@BindingName("id") String id,
				final ExecutionContext context) 
	{

		Claims tokenClaims = getTokenClaimsFromHeader(request,context);
		JSONArray roles = getRolesFromToken(tokenClaims,context);
		if(roles.isEmpty()){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
			json.put("error", MESSAGE_FOR_UNAUTHORIZED);
			return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
		if(!hasPermission(roles, Resource.DELETE_SUB_ACCOUNT)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		context.getLogger().info("Entering TekvLSDeleteSubaccountById Azure function");

		String sql = "DELETE FROM subaccount WHERE id = ?::uuid;";
		
		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			PreparedStatement statement = connection.prepareStatement(sql)) {
			
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

			if(FeatureToggles.INSTANCE.isFeatureActive("ad-user-creation")) {
				String emailSql = "SELECT sa.subaccount_admin_email, ca.admin_email FROM subaccount_admin sa " +
						"LEFT JOIN customer_admin ca ON sa.subaccount_admin_email = ca.admin_email " +
						"WHERE subaccount_id = ?::uuid;";

				try(PreparedStatement emailStatement = connection.prepareStatement(emailSql)){
					emailStatement.setString(1, id);
					context.getLogger().info("Execute SQL statement: " + emailStatement);
					ResultSet rs = emailStatement.executeQuery();
					String adminEmail,subaccountAdminEmail;
					while(rs.next()) {
						adminEmail = rs.getString("admin_email");
						if(adminEmail!=null){
							GraphAPIClient.removeRole(adminEmail, SUBACCOUNT_ADMIN, context);
							context.getLogger().info("Guest User Role removed successfully from Active Directory (email: "+adminEmail+").");
							continue;
						}
						subaccountAdminEmail = rs.getString("subaccount_admin_email");
						GraphAPIClient.deleteGuestUser(subaccountAdminEmail,context);
						context.getLogger().info("Guest User deleted successfully from Active Directory (email: "+subaccountAdminEmail+").");
					}
				}
			}

			statement.setString(1, id);

			// Delete subaccount
			String userId = getUserIdFromToken(tokenClaims,context);
			context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + statement);
			statement.executeUpdate();
			context.getLogger().info("Subaccount deleted successfully.");

			return request.createResponseBuilder(HttpStatus.OK).build();
		}
		catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
		catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}
}
