package com.function;

import com.function.auth.Resource;
import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

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
            final ExecutionContext context) {
        Claims tokenClaims = getTokenClaimsFromHeader(request, context);
        JSONArray roles = getRolesFromToken(tokenClaims,context);
        if(roles.isEmpty()){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
            json.put("error", MESSAGE_FOR_UNAUTHORIZED);
            return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
        }
        if(!hasPermission(roles, Resource.CREATE_CALLBACK)){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        // Parse request body and extract parameters needed
		String requestBody = request.getBody().orElse("");
		context.getLogger().info("Request body: " + requestBody);
		if (requestBody.isEmpty()) {
			context.getLogger().info("error: request body is empty.");
			JSONObject json = new JSONObject();
			json.put("error", "error: request body is empty.");
			return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
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
            return request.createResponseBuilder(HttpStatus.OK).body(jobj.toString()).build();
        } catch (Exception e) {
			context.getLogger().info("Caught exception: " + e.getMessage());
			JSONObject json = new JSONObject();
			json.put("error", e.getMessage());
			return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
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
