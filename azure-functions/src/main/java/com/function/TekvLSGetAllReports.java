package com.function;

import com.function.auth.Resource;
import com.function.clients.StorageBlobClient;
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
import java.util.Optional;

import static com.function.auth.RoleAuthHandler.*;
import static com.function.auth.Roles.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSGetAllReports {
	/**
	 * This function listens at endpoint
	 * "/v1.0/reports/subaccountId={subaccountId}". Two ways to invoke it using
	 * "curl" command in bash:
	 * 1. curl -d "HTTP Body" {your host}/v1.0/reports/subaccountId={subaccountId}
	 * 2. curl "{your host}/v1.0/reports"
	 */
	@FunctionName("TekvLSGetAllReports")
	public HttpResponseMessage run(
			@HttpTrigger(name = "req", methods = {
					HttpMethod.GET }, authLevel = AuthorizationLevel.ANONYMOUS, route = "reports/{subaccountId=EMPTY}") HttpRequestMessage<Optional<String>> request,
			@BindingName("subaccountId") String subaccountId,
			final ExecutionContext context) {

		Claims tokenClaims = getTokenClaimsFromHeader(request, context);
		JSONArray roles = getRolesFromToken(tokenClaims, context);
		if (roles.isEmpty()) {
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
			json.put("error", MESSAGE_FOR_UNAUTHORIZED);
			return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
		}
		if (!hasPermission(roles, Resource.GET_ALL_REPORTS)) {
			JSONObject json = new JSONObject();
			context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
			json.put("error", MESSAGE_FOR_FORBIDDEN);
			return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
		}

		String userId = getUserIdFromToken(tokenClaims, context);
		context.getLogger().info("User " + userId + " is Entering TekvLSGetAllReports Azure function");

		// Get query parameters
		context.getLogger().info("URL parameters are: " + request.getQueryParameters());
		String reportType = request.getQueryParameters().getOrDefault("reportType", "");
		String timestamp = request.getQueryParameters().getOrDefault("timestamp", "");

		// Check if subaccount is empty
		if (subaccountId.equals("EMPTY") || subaccountId.isEmpty()) {
			context.getLogger().info(MESSAGE_SUBACCOUNT_ID_NOT_FOUND + subaccountId);
			JSONObject json = new JSONObject();
			json.put("error", MESSAGE_SUBACCOUNT_ID_NOT_FOUND);
			context.getLogger().info("User " + userId + " is leaving TekvLSGetAllReports Azure function with error");
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}

		// Build SQL statement
		SelectQueryBuilder queryBuilder = new SelectQueryBuilder(
				"SELECT c.name as customerName, s.name as subaccountName FROM customer c LEFT JOIN subaccount s ON c.id = s.customer_id");
		queryBuilder.appendEqualsCondition("s.id", subaccountId, QueryBuilder.DATA_TYPE.UUID);
		SelectQueryBuilder verificationQueryBuilder = null;
		String email = getEmailFromToken(tokenClaims, context);

		// adding conditions according to the role
		String currentRole = evaluateRoles(roles);
		switch (currentRole) {
			case CUSTOMER_FULL_ADMIN:
				verificationQueryBuilder = new SelectQueryBuilder("SELECT s.id FROM subaccount s, customer_admin ca");
				verificationQueryBuilder.appendCustomCondition("s.customer_id = ca.customer_id AND admin_email = ?",
						email);
				break;
			case SUBACCOUNT_ADMIN:
			case SUBACCOUNT_STAKEHOLDER:
				verificationQueryBuilder = new SelectQueryBuilder("SELECT subaccount_id FROM subaccount_admin");
				verificationQueryBuilder.appendEqualsCondition("subaccount_admin_email", email);
				break;
		}

		if (verificationQueryBuilder != null) {
			if (currentRole.equals(SUBACCOUNT_ADMIN) || currentRole.equals(SUBACCOUNT_STAKEHOLDER))
				verificationQueryBuilder.appendEqualsCondition("subaccount_id", subaccountId,
						QueryBuilder.DATA_TYPE.UUID);
			else
				verificationQueryBuilder.appendEqualsCondition("s.id", subaccountId, QueryBuilder.DATA_TYPE.UUID);
		}
		JSONObject json = new JSONObject();
		// Connect to the database
		String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") + "/licenses"
				+ System.getenv("POSTGRESQL_SECURITY_MODE") + "&user=" + System.getenv("POSTGRESQL_USER") + "&password="
				+ System.getenv("POSTGRESQL_PWD");
		try (
				Connection connection = DriverManager.getConnection(dbConnectionUrl);
				PreparedStatement selectStmt = queryBuilder.build(connection)) {
			context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
			ResultSet rs;

			if (verificationQueryBuilder != null) {
				try (PreparedStatement verificationStmt = verificationQueryBuilder.build(connection)) {
					context.getLogger().info("Execute SQL role verification statement: " + verificationStmt);
					rs = verificationStmt.executeQuery();
					if (!rs.next()) {
						context.getLogger().info(MESSAGE_SUBACCOUNT_ID_NOT_FOUND + email);
						json.put("error", MESSAGE_SUBACCOUNT_ID_NOT_FOUND);
						context.getLogger().info("User " + userId + " is leaving TekvLSGetAllReports Azure function with error");
						return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
					}
				}
			}

			context.getLogger().info("Execute SQL statement: " + selectStmt);
			rs = selectStmt.executeQuery();
			String customerName = null;
			String subaccountName = null;
			String frequency = "Daily"; // Hardcoded value since currently we support Daily frequency only

			if (rs.next()) {
				customerName = rs.getString("customerName");
				subaccountName = rs.getString("subaccountName");
				context.getLogger().info("customer name - " + customerName + " - subaccount name - " + subaccountName);
			}

			if ((customerName == null || customerName.isEmpty())
					|| (subaccountName == null || subaccountName.isEmpty())) {
				context.getLogger().info(LOG_MESSAGE_FOR_INVALID_SUBACCOUNT_ID + email);
				json.put("error", MESSAGE_SUBACCOUNT_ID_NOT_FOUND);
				context.getLogger().info("User " + userId + " is leaving TekvLSGetAllReports Azure function with error");
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}

			JSONArray reportArray = StorageBlobClient.getInstance().fetchReportsPerCustomer(context, customerName,
					subaccountName, frequency, getReportType(reportType), timestamp);
			if (reportArray == null) {
				json.put("error", "Cannot find reports for customer");
				context.getLogger().info("Cannot find reports for customer");
			} else {
				json.put("reports", reportArray);
			}
			context.getLogger().info("User " + userId + " is successfully leaving TekvLSGetAllReports Azure function");
			return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json")
					.body(json.toString()).build();
		} catch (SQLException e) {
			context.getLogger().info("SQL exception: " + e.getMessage());
			json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSGetAllReports Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		} catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			json = new JSONObject();
			json.put("error", e.getMessage());
			context.getLogger().info("User " + userId + " is leaving TekvLSGetAllReports Azure function with error");
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
		}
	}

	public String getReportType(String type) {
		switch (type) {
			case "calling":
				return "CallingReliability";
			case "feature":
				return "FeatureFunctionality";
			default:
				return "";
		}
	}
}
