package com.function;

import com.function.db.QueryBuilder;
import com.function.db.UpdateQueryBuilder;
import com.function.util.Constants;
import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.Optional;

import static com.function.auth.RoleAuthHandler.*;

public class TekvLSCreateCallback {


    @FunctionName("TekvLSCallback")
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.POST},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "callback"
            ) HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context
    ) {
        Claims tokenClaims = getTokenClaimsFromHeader(request, context);
        String authEmail = getEmailFromToken(tokenClaims,context);
        JSONArray roles = getRolesFromToken(tokenClaims,context);
//        if(roles.isEmpty()){
//            JSONObject json = new JSONObject();
//            context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
//            json.put("error", MESSAGE_FOR_UNAUTHORIZED);
//            return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
//        }
//        if(!hasPermission(roles, Resource.CREATE_CALLBACK)){
//            JSONObject json = new JSONObject();
//            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
//            json.put("error", MESSAGE_FOR_FORBIDDEN);
//            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
//        }

        // Parse request body and extract parameters needed
		String requestBody = request.getBody().orElse("");
		context.getLogger().info("Request body: " + requestBody);
		if (requestBody.isEmpty()) {
			context.getLogger().info("error: request body is empty.");
			JSONObject json = new JSONObject();
			json.put("error", "error: request body is empty.");
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
		}

        long millisSinceLastRequest = millisSinceLastCallback(authEmail, context, tokenClaims);
        if (millisSinceLastRequest < Constants.REQUEST_CALLBACK_MINUTES_BETWEEN_REQUESTS * 60 * 1000){
            JSONObject response = new JSONObject();
            long minutes = millisSinceLastRequest / 1000 / 60;
            long seconds = (millisSinceLastRequest / 1000) % 60;
            response.put("error", "Please wait for " + minutes + " and " + seconds + " seconds more to request a new call if you still need it.");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(response.toString()).build();
        }

        JSONObject jobj; 
        try {
            jobj = new JSONObject(requestBody);
        }
        catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }

        for(MANDATORY_PARAMS mandatoryParams: MANDATORY_PARAMS.values()) {
            if (!jobj.has(mandatoryParams.value)) {
				// Parameter not found
				context.getLogger().info("Missing mandatory parameter: " + mandatoryParams.value);
				JSONObject json = new JSONObject();
				json.put("error", "Missing mandatory parameter: " + mandatoryParams.value);
				return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
			}
        }
        try {
            String pagerDutyMessage = "User callback data:  >>> " + new Date().toString();
            pagerDutyMessage += " | Name = " + jobj.getString("name");
            pagerDutyMessage += " | Phone Number = " + jobj.getString("phoneNumber");
            pagerDutyMessage += " | Email Address = " + jobj.getString("email");
            pagerDutyMessage += " | Company Name = " + jobj.getString("companyName");
            if (jobj.has("jobTitle"))
                pagerDutyMessage += " | Job Title = " + jobj.getString("jobTitle");
            context.getLogger().info(pagerDutyMessage);
            this.updateLatestCallbackRequestDate(authEmail, context, tokenClaims);
            return request.createResponseBuilder(HttpStatus.OK).body(jobj.toString()).build();
        } catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
       }

    }

    private long millisSinceLastCallback(String authEmail, ExecutionContext context, Claims tokenClaims){
        // Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");
        String sql = "SELECT * FROM subaccount_admin WHERE subaccount_admin_email = ?;";
        try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setString(1, "maintenance_test@test.com");

            context.getLogger().info("Execute SQL statement: " + statement);
            ResultSet rs = statement.executeQuery();
            if (rs.next()){
                Date latestCallback = java.text.DateFormat.getDateInstance().parse(rs.getString("latest_callback_request_date"));
                return Math.abs(latestCallback.getTime() - new Date().getTime());
            }
            return 0;
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            return 0;
        }
    }

    private void updateLatestCallbackRequestDate(String authEmail, ExecutionContext context, Claims tokenClaims){
        UpdateQueryBuilder updateSubaccountBuilder = new UpdateQueryBuilder("subaccount_admin");
        updateSubaccountBuilder.appendValueModification(
                "latest_callback_request_date",
                LocalDateTime.now().toString(),
                QueryBuilder.DATA_TYPE.TIMESTAMP
        );
        updateSubaccountBuilder.appendWhereStatement("subaccount_admin_email", authEmail, QueryBuilder.DATA_TYPE.VARCHAR);

        // Connect to the database
        String dbConnectionUrl = "jdbc:postgresql://" + System.getenv("POSTGRESQL_SERVER") +"/licenses" + System.getenv("POSTGRESQL_SECURITY_MODE")
                + "&user=" + System.getenv("POSTGRESQL_USER")
                + "&password=" + System.getenv("POSTGRESQL_PWD");

        try (Connection connection = DriverManager.getConnection(dbConnectionUrl);
             PreparedStatement updateSubaccountStatement = updateSubaccountBuilder.build(connection)) {

            context.getLogger().info("Successfully connected to: " + System.getenv("POSTGRESQL_SERVER"));
            String userId = getUserIdFromToken(tokenClaims, context);
            context.getLogger().info("Execute SQL statement (User: "+ userId + "): " + updateSubaccountStatement);
            updateSubaccountStatement.executeUpdate();
            context.getLogger().info("Subaccount updated successfully.");
        }
        catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
        }
        catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
        }
    }

    private enum MANDATORY_PARAMS {
        CUSTOMER_NAME("name"),
        CUSTOMER_COMPANY_NAME("companyName"),
        CUSTOMER_PHONE_NUMBER("phoneNumber"),
        CUSTOMER_EMAIL("email");

        private final String value;

        MANDATORY_PARAMS(String value) {
            this.value = value;
        }

    }
}
