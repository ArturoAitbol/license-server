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
import java.util.List;
import java.util.Optional;

import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetAllProjects {
	/**
	 * This function listens at endpoint "/api/projects". Two ways to invoke it using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/api/projects
	 * 2. curl "{your host}/api/projects"
	 */
	@FunctionName("TekvLSGetAllProjects")
	public HttpResponseMessage run(
		@HttpTrigger(
			name = "req",
			methods = {HttpMethod.GET},
			authLevel = AuthorizationLevel.ANONYMOUS,
			route = "projects/{id=EMPTY}")
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
	   if(!hasPermission(currentRole, Permission.GET_ALL_PROJECTS)){
		   JSONObject json = new JSONObject();
		   context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + currentRole);
		   json.put("error", MESSAGE_FOR_FORBIDDEN);
		   return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
	   }

		context.getLogger().info("Entering TekvLSGetAllProjects Azure function");
		JSONObject json = new JSONObject();

		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());
		String subaccountId = request.getQueryParameters().getOrDefault("subaccountId", "");
		String status = request.getQueryParameters().getOrDefault("status", "");
		
		// Build SQL statement
		String sql = "select * from project";
	   	String subQuery;
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

	   	if (id.equals("EMPTY")) {
		   if (!subaccountId.isEmpty()){
			   conditionsList.add("subaccount_id='" + subaccountId + "'");
			   if (!status.isEmpty())
			   		conditionsList.add("status='" + status + "'");
		   }else{
			   json.put("error", "Missing mandatory parameter: subaccountId");
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		   }
		   
	   	}else{
		   conditionsList.add("id='" + id +"'");
	   	}

	   	String sqlConditions = String.join(" and ",conditionsList);

	   	if(!sqlConditions.isEmpty())
		   sql += " where "+ sqlConditions;
	   	sql += " order by open_date desc, code, name;";

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
			+ "&user=" + System.getenv("POSTGRESQL_USER")
			+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
			Connection connection = DriverManager.getConnection(dbConnectionUrl);
			Statement statement = connection.createStatement();) {
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
			
			context.getLogger().info("Execute SQL statement: " + sql);
			ResultSet rs = statement.executeQuery(sql);
			// Return a JSON array of projects
			JSONArray array = new JSONArray();
			String closeDate;
			while (rs.next()) {
				JSONObject item = new JSONObject();
				item.put("id", rs.getString("id"));
				item.put("subaccountId", rs.getString("subaccount_id"));
				item.put("name", rs.getString("name"));
				item.put("code", rs.getString("code"));
				item.put("status", rs.getString("status"));
				item.put("openDate", rs.getString("open_date").split(" ")[0]);
				closeDate = rs.getString("close_date");
				item.put("closeDate", closeDate != null ? closeDate.split(" ")[0] : JSONObject.NULL);
				if (hasPermission(currentRole, Permission.GET_USER_EMAIL_INFO))
					item.put("projectOwner", rs.getString("project_owner"));
				array.put(item);
			}
			json.put("projects", array);
			return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();
		}
		catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			json = new JSONObject();
			json.put("error", e.getMessage());
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
		catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			json = new JSONObject();
			json.put("error", e.getMessage());
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}
}
