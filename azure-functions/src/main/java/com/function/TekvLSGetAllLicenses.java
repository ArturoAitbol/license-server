package com.function;

import com.function.auth.Permission;
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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetAllLicenses 
{
	/**
	* This function listens at endpoint "/api/licenses?subaccountId={subaccountId}". Two ways to invoke it using "curl" command in bash:
	* 1. curl -d "HTTP Body" {your host}/api/licenses?subaccountId={subaccountId}
	* 2. curl "{your host}/api/licenses"
	*/
	@FunctionName("TekvLSGetAllLicenses")
		public HttpResponseMessage run(
		@HttpTrigger(
		name = "req",
		methods = {HttpMethod.GET},
		authLevel = AuthorizationLevel.ANONYMOUS,
		route = "licenses/{id=EMPTY}")
		HttpRequestMessage<Optional<String>> request,
		@BindingName("id") String id,
		final ExecutionContext context) 
	{

		Claims tokenClaims = getTokenClaimsFromHeader(request,context);
		String currentRole = getRoleFromToken(tokenClaims,context);
		if(currentRole.isEmpty()){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
			json.put("error", MESSAGE_FOR_UNAUTHORIZED);
			return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
		if(!hasPermission(currentRole, Permission.GET_ALL_LICENSES)){
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + currentRole);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		context.getLogger().info("Entering TekvLSGetAllLicenses Azure function");
		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());
		String subaccountId = request.getQueryParameters().getOrDefault("subaccountId", "");
  
		// Build SQL statement
		String sql = "select * from license";
		String subQuery="";
		String email = getEmailFromToken(tokenClaims,context);
		List<String> conditionsList = new ArrayList<>();
		// adding conditions according to the role
		switch (currentRole){
			case DISTRIBUTOR_FULL_ADMIN:
				String distributorId = "select distributor_id from customer c,customer_admin ca " +
						"where c.id = ca.customer_id and admin_email='"+email+"'";
				subQuery = "select s.id from subaccount s, customer c " +
						"where s.customer_id = c.id and distributor_id =("+ distributorId +")";
				conditionsList.add("subaccount_id IN (" + subQuery + ")");
				break;
			case CUSTOMER_FULL_ADMIN:
				subQuery = "select s.id from subaccount s, customer_admin ca where s.customer_id = ca.customer_id " +
						"and admin_email = '"+email+"'";
				conditionsList.add("subaccount_id IN (" + subQuery + ")");
				break;
			case SUBACCOUNT_ADMIN:
				subQuery = "select subaccount_id from subaccount_admin where subaccount_admin_email ='"+email+"'";
				conditionsList.add("subaccount_id=(" + subQuery + ")");
				break;
		}

		if (id.equals("EMPTY")){
			if (!subaccountId.isEmpty())
				conditionsList.add("subaccount_id = '" + subaccountId + "'");
		}else{
			conditionsList.add("id='" + id +"'");
		}

		String sqlConditions = String.join(" and ",conditionsList);

		if(!sqlConditions.isEmpty())
			sql += " where "+ sqlConditions;
		sql += " order by start_date desc;";
		
		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			Statement statement = connection.createStatement()) {
			
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
			ResultSet rs;
			JSONObject json = new JSONObject();

			if(!subQuery.isEmpty() && id.equals("EMPTY") && !subaccountId.isEmpty()){
				String sqlVerifySubaccount = subQuery + "and " + (currentRole.equals(SUBACCOUNT_ADMIN) ? "subaccount_id='" : "s.id='")+subaccountId+"';";

				context.getLogger().info("Execute SQL devices statement: " + sqlVerifySubaccount);
				rs = statement.executeQuery(sqlVerifySubaccount);
				if(!rs.next()){
					context.getLogger().info(LOG_MESSAGE_FOR_INVALID_ID + email);
					json.put("error",MESSAGE_FOR_INVALID_ID);
					return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
				}
			}

			if(id.equals("EMPTY") && subaccountId.isEmpty()){
				//Update status by checking renewal date
				String updateStatus = "update license set status = 'Expired' where DATE(renewal_date) < CURRENT_DATE;";
				context.getLogger().info("Execute SQL statement: " + updateStatus);
				statement.executeUpdate(updateStatus);
				context.getLogger().info("Licenses status updated successfully.");
			}

			// Retrieve licenses.
			context.getLogger().info("Execute SQL statement: " + sql);
			rs = statement.executeQuery(sql);
			// Return a JSON array of licenses
			JSONArray array = new JSONArray();
			while (rs.next()) {
				JSONObject item = new JSONObject();
				item.put("id", rs.getString("id"));
				item.put("subaccountId", rs.getString("subaccount_id"));
				item.put("status", rs.getString("status"));
				if (!id.equals("EMPTY") || !subaccountId.isEmpty()){
					item.put("startDate", rs.getString("start_date").split(" ")[0]);
					item.put("packageType", rs.getString("package_type"));
					item.put("renewalDate", rs.getString("renewal_date").split(" ")[0]);
					item.put("tokensPurchased", rs.getInt("tokens"));
					item.put("deviceLimit", rs.getString("device_access_limit"));
				}
				array.put(item);
			}

			if(!id.equals("EMPTY") && array.isEmpty()){
				context.getLogger().info( LOG_MESSAGE_FOR_INVALID_ID + email);
				List<String> customerRoles = Arrays.asList(DISTRIBUTOR_FULL_ADMIN,CUSTOMER_FULL_ADMIN,SUBACCOUNT_ADMIN);
				json.put("error",customerRoles.contains(currentRole) ? MESSAGE_FOR_INVALID_ID : MESSAGE_ID_NOT_FOUND);
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}

			json.put("licenses", array);
			return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();
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
