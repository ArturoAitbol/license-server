package com.function;

import com.function.auth.Resource;
import com.function.db.QueryBuilder;
import com.function.db.SelectQueryBuilder;
import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.BindingName;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import java.sql.*;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static com.function.auth.RoleAuthHandler.*;
import static com.function.auth.Roles.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetAllProjects {
	/**
	 * This function listens at endpoint "/v1.0/projects". Two ways to invoke it
	 * using "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/projects
	 * 2. curl "{your host}/v1.0/projects"
	 */
	@FunctionName("TekvLSGetAllProjects")
	public HttpResponseMessage run(
			@HttpTrigger(name = "req", methods = {
					HttpMethod.GET }, authLevel = AuthorizationLevel.ANONYMOUS, route = "projects/{id=EMPTY}") HttpRequestMessage<Optional<String>> request,
			@BindingName("id") String id,
			final ExecutionContext context) {

		Claims tokenClaims = getTokenClaimsFromHeader(request, context);
		JSONArray roles = getRolesFromToken(tokenClaims, context);
		if (roles.isEmpty()) {
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
			json.put("error", MESSAGE_FOR_UNAUTHORIZED);
			return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
		if (!hasPermission(roles, Resource.GET_ALL_PROJECTS)) {
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSGetAllProjects Azure function");
		JSONObject json = new JSONObject();

		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());
		String subaccountId = request.getQueryParameters().getOrDefault("subaccountId", "");
		String licenseId = request.getQueryParameters().getOrDefault("licenseId", "");
		String status = request.getQueryParameters().getOrDefault("status", "");

		// Build SQL statement
		SelectQueryBuilder queryBuilder = new SelectQueryBuilder("SELECT * FROM project");
		SelectQueryBuilder verificationQueryBuilder = null;
		String email = getEmailFromToken(tokenClaims, context);
		// adding conditions according to the role
		String currentRole = evaluateRoles(roles);
		switch (currentRole) {
			case DISTRIBUTOR_FULL_ADMIN:
				queryBuilder.appendCustomCondition("subaccount_id IN (SELECT s.id FROM subaccount s, customer c " +
						"WHERE s.customer_id = c.id AND distributor_id = (SELECT distributor_id FROM customer c,customer_admin ca "
						+
						"WHERE c.id = ca.customer_id AND admin_email = ?))", email);
				verificationQueryBuilder = new SelectQueryBuilder("SELECT s.id FROM subaccount s, customer c");
				verificationQueryBuilder.appendCustomCondition(
						"s.customer_id = c.id and distributor_id = (SELECT distributor_id FROM customer c, customer_admin ca "
								+
								"WHERE c.id = ca.customer_id AND admin_email = ?)",
						email);
				break;
			case CUSTOMER_FULL_ADMIN:
				queryBuilder.appendCustomCondition(
						"subaccount_id IN (SELECT s.id FROM subaccount s, customer_admin ca WHERE s.customer_id = ca.customer_id AND admin_email = ?)",
						email);
				verificationQueryBuilder = new SelectQueryBuilder("SELECT s.id FROM subaccount s, customer_admin ca");
				verificationQueryBuilder.appendCustomCondition("s.customer_id = ca.customer_id AND admin_email = ?",
						email);
				break;
			case SUBACCOUNT_ADMIN:
				queryBuilder.appendCustomCondition(
						"subaccount_id = (SELECT subaccount_id FROM subaccount_admin WHERE subaccount_admin_email = ?)",
						email);
				verificationQueryBuilder = new SelectQueryBuilder("SELECT subaccount_id FROM subaccount_admin");
				verificationQueryBuilder.appendEqualsCondition("subaccount_admin_email", email);
				break;
		}

		if (id.equals("EMPTY")) {
			if (!subaccountId.isEmpty()) {
				queryBuilder.appendEqualsCondition("subaccount_id", subaccountId, QueryBuilder.DATA_TYPE.UUID);
				if (!licenseId.isEmpty()) {
					queryBuilder.appendEqualsCondition("license_id", licenseId, QueryBuilder.DATA_TYPE.UUID);
				}
				if (!status.isEmpty()) {
					queryBuilder.appendEqualsCondition("status", status, "project_status_type_enum");
				}
			} else {
				json.put("error", "Missing mandatory parameter: subaccountId");
				context.getLogger()
						.info("User " + userId + " is leaving TekvLSGetAllProjects Azure function with error");
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}
		} else
			queryBuilder.appendEqualsCondition("id", id, QueryBuilder.DATA_TYPE.UUID);

		queryBuilder.appendCustomOrderBy("open_date DESC, code, name");
		if (verificationQueryBuilder != null) {
			if (currentRole.equals(SUBACCOUNT_ADMIN))
				verificationQueryBuilder.appendEqualsCondition("subaccount_id", subaccountId,
						QueryBuilder.DATA_TYPE.UUID);
			else
				verificationQueryBuilder.appendEqualsCondition("s.id", subaccountId, QueryBuilder.DATA_TYPE.UUID);
		}

		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses"
				+ System.getenv("POSTGRESQL_SECURITY_MODE")
				+ "&user=" + System.getenv("POSTGRESQL_USER")
				+ "&password=" + System.getenv("POSTGRESQL_PWD");
		try (
				Connection connection = DriverManager.getConnection(dbConnectionUrl);
				PreparedStatement selectStmt = queryBuilder.build(connection)) {
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
			ResultSet rs;

			if (verificationQueryBuilder != null && id.equals("EMPTY")) {
				try (PreparedStatement verificationStmt = verificationQueryBuilder.build(connection)) {
					context.getLogger().info("Execute SQL role verification statement: " + verificationStmt);
					rs = verificationStmt.executeQuery();
					if (!rs.next()) {
						context.getLogger().info(LOG_MESSAGE_FOR_INVALID_ID + email);
						json.put("error", MESSAGE_FOR_INVALID_ID);
						context.getLogger()
								.info("User " + userId + " is leaving TekvLSGetAllProjects Azure function with error");
						return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
					}
				}
			}

			context.getLogger().info("Execute SQL statement: " + selectStmt);
			rs = selectStmt.executeQuery();
			// Return a JSON array of projects
			JSONArray array = new JSONArray();
			String closeDate;
			while (rs.next()) {
				JSONObject item = new JSONObject();
				item.put("id", rs.getString("id"));
				item.put("subaccountId", rs.getString("subaccount_id"));
				item.put("licenseId", rs.getString("license_id"));
				item.put("projectName", rs.getString("name"));
				item.put("projectNumber", rs.getString("code"));
				item.put("status", rs.getString("status"));
				item.put("openDate", rs.getString("open_date").split(" ")[0]);
				closeDate = rs.getString("close_date");
				item.put("closeDate", closeDate != null ? closeDate.split(" ")[0] : JSONObject.NULL);
				if (hasPermission(roles, Resource.GET_USER_EMAIL_INFO))
					item.put("projectOwner", rs.getString("project_owner"));
				array.put(item);
			}

			if (!id.equals("EMPTY") && array.isEmpty()) {
				context.getLogger().info(LOG_MESSAGE_FOR_INVALID_ID + email);
				List<String> customerRoles = Arrays.asList(DISTRIBUTOR_FULL_ADMIN, CUSTOMER_FULL_ADMIN,
						SUBACCOUNT_ADMIN);
				json.put("error", customerRoles.contains(currentRole) ? MESSAGE_FOR_INVALID_ID : MESSAGE_ID_NOT_FOUND);
				context.getLogger()
						.info("User " + userId + " is leaving TekvLSGetAllProjects Azure function with error");
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}

			json.put("projects", array);
			context.getLogger().info("User " + userId + " is successfully leaving TekvLSGetAllProjects Azure function");
			return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json")
					.body(json.toString()).build();
		} catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSGetAllProjects Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		} catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSGetAllProjects Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}
}
