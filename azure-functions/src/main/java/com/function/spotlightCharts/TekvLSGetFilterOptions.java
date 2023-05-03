package com.function.spotlightCharts;

import com.function.auth.Resource;
import com.function.clients.TAPClient;
import com.function.util.Constants;
import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Optional;

import static com.function.auth.RoleAuthHandler.*;

public class TekvLSGetFilterOptions {

    @FunctionName("TekvLSGetFilterOptions")
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.GET},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "spotlightCharts/getFilterOptions")
            HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context)
    {
        Claims tokenClaims = getTokenClaimsFromHeader(request, context);
        JSONArray roles = getRolesFromToken(tokenClaims, context);
        if(roles.isEmpty()){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
            json.put("error", MESSAGE_FOR_UNAUTHORIZED);
            return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
        }
        if(!hasPermission(roles, Resource.GET_CHARTS)){
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }
        String regionsQuery = "SELECT country, state, city FROM test_result_resource GROUP BY country, state, city;";
        String usersQuery = "SELECT did FROM test_result_resource GROUP BY did;";
        try {
            // Retrieve all data.
            context.getLogger().info("Execute SQL statement: " + regionsQuery);
            JSONArray regionsRs = TAPClient.executeQuery(Constants.TEMP_ONPOINT_URL, regionsQuery, context);
            JSONArray regionsJson = new JSONArray();

            for (Object o : regionsRs) {
                JSONObject jobj = new JSONObject();
                JSONArray values = (JSONArray) o;
                jobj.put("country", values.get(0));
                jobj.put("state", values.get(1));
                jobj.put("city", values.get(2));
                regionsJson.put(jobj);
            }
            JSONObject res = new JSONObject();
            res.put("regions", regionsJson);
            JSONArray usersRs = TAPClient.executeQuery(Constants.TEMP_ONPOINT_URL, usersQuery, context);
            res.put("users", usersRs);
            return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(res.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }

}
