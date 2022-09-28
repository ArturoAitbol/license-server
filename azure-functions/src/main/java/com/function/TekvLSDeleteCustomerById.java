package com.function;

import com.function.auth.Permission;
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

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSDeleteCustomerById 
{
	/**
	 * This function listens at endpoint "/v1.0/customers". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/customers
	 */
	@FunctionName("TekvLSDeleteCustomerById")
	public HttpResponseMessage run(
			@HttpTrigger(
				name = "req",
				methods = {HttpMethod.DELETE},
				authLevel = AuthorizationLevel.ANONYMOUS,
				route = "customers/{id}")
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
		if(!hasPermission(roles, Permission.DELETE_CUSTOMER)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		context.getLogger().info("Entering TekvLSDeleteCustomerById Azure function");
		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());
		String forceDelete = request.getQueryParameters().getOrDefault("force", "false");
		Boolean deleteFlag = Boolean.parseBoolean(forceDelete);

		String isTestCustomerSql = "SELECT test_customer FROM customer WHERE id = ?::uuid;";
		String tombstoneSql = "UPDATE customer SET tombstone=true WHERE id = ?::uuid;";
		String deleteSql = "DELETE FROM customer WHERE id = ?::uuid;";

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			PreparedStatement isTestCustomerStmt = connection.prepareStatement(isTestCustomerSql);
			PreparedStatement tombstoneStmt = connection.prepareStatement(tombstoneSql);
			PreparedStatement deleteStmt = connection.prepareStatement(deleteSql)) {
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));

			if(FeatureToggles.INSTANCE.isFeatureActive("ad-user-creation")) {
				String getAllEmailsSql = "SELECT sa.subaccount_admin_email,sa.subaccount_id,s.customer_id as subaccount_customer_id,ca.admin_email,ca.customer_id " +
						"FROM subaccount_admin sa " +
						"JOIN subaccount s ON sa.subaccount_id = s.id " +
						"FULL JOIN customer_admin ca ON sa.subaccount_admin_email = ca.admin_email " +
						"WHERE s.customer_id = ?::uuid OR ca.customer_id = ?::uuid;";
				try(PreparedStatement getAllEmailsStmt = connection.prepareStatement(getAllEmailsSql)){
					getAllEmailsStmt.setString(1,id);
					getAllEmailsStmt.setString(2,id);
					ResultSet resultSet = getAllEmailsStmt.executeQuery();
					while (resultSet.next()){
						String customerId =  resultSet.getString("customer_id");
						String adminEmail = resultSet.getString("admin_email");
						String subaccountCustomerId =  resultSet.getString("subaccount_customer_id");
						String subaccountAdminEmail = resultSet.getString("subaccount_admin_email");

						if(subaccountCustomerId == null){
							if(FeatureToggles.INSTANCE.isFeatureActive("ad-customer-user-creation"))
								GraphAPIClient.deleteGuestUser(adminEmail, context);
								context.getLogger().info("Guest User deleted successfully from Active Directory (email: "+adminEmail+").");
							continue;
						}

						if(subaccountCustomerId.equals(id)){
							if(adminEmail==null || subaccountCustomerId.equals(customerId)){
								GraphAPIClient.deleteGuestUser(subaccountAdminEmail, context);
								context.getLogger().info("Guest User deleted successfully from Active Directory (email: "+subaccountAdminEmail+").");
								continue;
							}
							GraphAPIClient.removeRole(subaccountAdminEmail,SUBACCOUNT_ADMIN,context);
							context.getLogger().info("Guest User Role (Subaccount Admin) removed successfully from Active Directory (email: "+subaccountAdminEmail+").");
							continue;
						}

						if(FeatureToggles.INSTANCE.isFeatureActive("ad-customer-user-creation")) {
							GraphAPIClient.removeRole(adminEmail,CUSTOMER_FULL_ADMIN,context);
							context.getLogger().info("Guest User Role (Customer Admin) removed successfully from Active Directory (email: " + adminEmail + ").");
						}
					}
				}
			}

			// Get test_customer by id if not force delete
			if (!deleteFlag) {
				isTestCustomerStmt.setString(1, id);
				context.getLogger().info("Execute SQL statement: " + isTestCustomerStmt);
				ResultSet rs = isTestCustomerStmt.executeQuery();
				rs.next();
				// override delete flag with the test customer value when delete force is not true
				deleteFlag = rs.getBoolean("test_customer");
				context.getLogger().info("test_customer is: " + deleteFlag);
			}
			// Delete customer
			String userId = getUserIdFromToken(tokenClaims,context);
			if (deleteFlag) {
				deleteStmt.setString(1, id);
				context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + deleteStmt);
				deleteStmt.executeUpdate();
			}
			else {
				tombstoneStmt.setString(1, id);
				context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + tombstoneStmt);
				tombstoneStmt.executeUpdate();
			}
			context.getLogger().info("Customer delete successfully."); 

			return request.createResponseBuilder(HttpStatus.OK).build();
		}
		catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", "SQL Exception: " + e.getMessage());
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
