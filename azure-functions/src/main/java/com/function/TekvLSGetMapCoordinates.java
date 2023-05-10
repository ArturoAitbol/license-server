package com.function;

import com.function.auth.Resource;
import com.function.clients.MapClient;
import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.BindingName;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import io.jsonwebtoken.Claims;
import org.json.JSONArray;
import org.json.JSONObject;


import java.sql.SQLException;
import java.util.Optional;

import static com.function.auth.RoleAuthHandler.*;

public class TekvLSGetMapCoordinates {
    
    private static final String zipCodeAndAddress = "Plano%20Texas";
//    private final JSONArray data = new JSONArray();
//    private final JSONObject obj1 = new JSONObject();


    @FunctionName("TekvLSGetMapCoordinates")
    public HttpResponseMessage run(
            @HttpTrigger(name = "req",
                    methods = {HttpMethod.GET},
                    authLevel = AuthorizationLevel.ANONYMOUS,
                    route = "ctaasMap")
            HttpRequestMessage<Optional<String>> request,
            //@BindingName("subaccountId") String subaccountId,
            final ExecutionContext context) {
       Claims tokenClaims = getTokenClaimsFromHeader(request,context);
       JSONArray roles = getRolesFromToken(tokenClaims,context);
       if(roles.isEmpty()){
           JSONObject json = new JSONObject();
           context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
           json.put("error", MESSAGE_FOR_UNAUTHORIZED);
           return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
       }
       if(!hasPermission(roles, Resource.GET_CTAAS_DASHBOARD)){
           JSONObject json = new JSONObject();
           context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
           json.put("error", MESSAGE_FOR_FORBIDDEN);
           return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
       }

    //    if (subaccountId.equals("EMPTY") || subaccountId.isEmpty()) {
    //        context.getLogger().info(MESSAGE_SUBACCOUNT_ID_NOT_FOUND + subaccountId);
    //        JSONObject json = new JSONObject();
    //        json.put("error", MESSAGE_SUBACCOUNT_ID_NOT_FOUND);
    //        return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
    //    }

        try{
             JSONArray array = new JSONArray();
             JSONObject obj1 = new JSONObject();
             obj1.put("vendor", "Microsoft");
             obj1.put("model", "MS-TEAMS");
             obj1.put("did", "9725989023");
             obj1.put("firmware", "1.6.00.6754");
             obj1.put("serviceProvider", "verizon");
             obj1.put("domain", "tekvizionlabs.com");
             obj1.put("state", "Texas");
             obj1.put("city", "Plano");
             array.put(obj1);
            JSONObject json = new JSONObject();
            JSONObject response = MapClient.getMapCoordinates(obj1.getString("city"),obj1.getString("state"), context);
            context.getLogger().info("!!!!!!!!!!!!!!!!!!!!!" + array );
            if (response == null) {
                json.put("error", "Error with fetching detailed test report from Automation Platform");
                context.getLogger().info("Error with fetching detailed test report from Automation Platform");
            } else {
                context.getLogger().info("Received detailed test report response from Automation Platform");
                JSONObject jsonObject = new JSONObject();
                jsonObject.put("report", response);
                json.put("response", jsonObject);
            }
            return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/json").body(json.toString()).build();
        } catch (SQLException e) {
            context.getLogger().info("SQL exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }
}