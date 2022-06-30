package com.function.auth;

import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpRequestMessage;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Base64;
import java.util.EnumSet;
import java.util.Map;

import static com.function.auth.Permission.*;

public class RoleAuthHandler {

   private static final EnumSet<Permission> FullAdminPermissions = EnumSet.of(
           //CREATE
           CREATE_CUSTOMER,
           CREATE_SUBACCOUNT,
           CREATE_ADMIN_EMAIL,
           CREATE_SUBACCOUNT_ADMIN_MAIL,
           CREATE_LICENSE,
           CREATE_LICENSE_USAGE_DETAIL,
           CREATE_USAGE_DETAILS,
           CREATE_PROJECT,
           //DELETE
           DELETE_CUSTOMER,
           DELETE_SUB_ACCOUNT,
           DELETE_ADMIN_EMAIL,
           DELETE_SUBACCOUNT_ADMIN_EMAIL,
           DELETE_LICENSE,
           DELETE_PROJECT,
           DELETE_LICENSE_USAGE,
           DELETE_USAGE_DETAILS,
           //READ
           GET_ALL_CUSTOMERS,
           GET_ALL_SUBACCOUNTS,
           GET_ALL_LICENSES,
           GET_ALL_DEVICES,
           GET_ALL_PROJECTS,
           GET_ALL_BUNDLES,
           GET_ALL_LICENSE_USAGE_DETAILS,
           GET_CONSUMPTION_USAGE_DETAILS,
           //UPDATE
           MODIFY_CUSTOMER,
           MODIFY_SUBACCOUNT,
           MODIFY_LICENSE,
           MODIFY_PROJECT,
           MODIFY_LICENSE_USAGE);


    private static final EnumSet<Permission> SaleAdminPermissions = EnumSet.of(
            //CREATE
            CREATE_CUSTOMER,
            CREATE_SUBACCOUNT,
            CREATE_SUBACCOUNT_ADMIN_MAIL,
            CREATE_ADMIN_EMAIL,
            CREATE_LICENSE,
            //READ
            GET_ALL_CUSTOMERS,
            GET_ALL_SUBACCOUNTS,
            GET_ALL_LICENSES,
            GET_ALL_LICENSE_USAGE_DETAILS,
            GET_CONSUMPTION_USAGE_DETAILS,
            GET_ALL_DEVICES,
            GET_ALL_PROJECTS,
            GET_ALL_BUNDLES,
            //UPDATE
            MODIFY_CUSTOMER,
            MODIFY_SUBACCOUNT,
            MODIFY_LICENSE);

    private static final EnumSet<Permission> ConfigTesterPermissions = EnumSet.of(
            //CREATE
            CREATE_LICENSE_USAGE_DETAIL,
            CREATE_PROJECT,
            CREATE_USAGE_DETAILS,
            //DELETE
            DELETE_LICENSE_USAGE,
            DELETE_USAGE_DETAILS,
            //READ
            GET_ALL_CUSTOMERS,
            GET_ALL_SUBACCOUNTS,
            GET_ALL_LICENSES,
            GET_ALL_LICENSE_USAGE_DETAILS,
            GET_CONSUMPTION_USAGE_DETAILS,
            GET_ALL_DEVICES,
            GET_ALL_PROJECTS,
            GET_ALL_BUNDLES,
            //UPDATE
            MODIFY_PROJECT,
            MODIFY_LICENSE_USAGE);

    private static final EnumSet<Permission> SupportDevicesAdminPermissions = EnumSet.of(
            //CREATE
            CREATE_DEVICE,
            CREATE_BUNDLE,
            //DELETE
            DELETE_DEVICE,
            DELETE_BUNDLE,
            //READ
            GET_ALL_DEVICES,
            GET_ALL_BUNDLES,
            //UPDATE
            MODIFY_DEVICE,
            MODIFY_BUNDLE);

    private static final EnumSet<Permission> AutoPlatformAppPermissions = EnumSet.of(
            //CREATE
            CREATE_LICENSE_USAGE_DETAIL,
            CREATE_USAGE_DETAILS,
            //READ
            GET_ALL_DEVICES);

    private static final EnumSet<Permission> crmPermissions = EnumSet.of(
            //CREATE
            CREATE_CUSTOMER,
            CREATE_SUBACCOUNT,
            CREATE_ADMIN_EMAIL,
            CREATE_SUBACCOUNT_ADMIN_MAIL,
            CREATE_LICENSE,
            //READ
            GET_ALL_CUSTOMERS,
            GET_ALL_SUBACCOUNTS,
            GET_ALL_LICENSES,
            GET_ALL_LICENSE_USAGE_DETAILS,
            GET_CONSUMPTION_USAGE_DETAILS,
            //UPDATE
            MODIFY_CUSTOMER,
            MODIFY_SUBACCOUNT,
            MODIFY_LICENSE);


    private static final EnumSet<Permission> customerDistFullAdminPermissions = EnumSet.of(
            //READ
            GET_ALL_CUSTOMERS,
            GET_ALL_SUBACCOUNTS,
            GET_ALL_LICENSES,
            GET_ALL_LICENSE_USAGE_DETAILS,
            GET_CONSUMPTION_USAGE_DETAILS,
            GET_ALL_DEVICES,
            GET_ALL_PROJECTS,
            GET_ALL_BUNDLES);

    private static final EnumSet<Permission> customerFullAdminPermissions = EnumSet.of(
            //READ
            GET_ALL_CUSTOMERS,
            GET_ALL_SUBACCOUNTS,
            GET_ALL_LICENSES,
            GET_ALL_LICENSE_USAGE_DETAILS,
            GET_CONSUMPTION_USAGE_DETAILS,
            GET_ALL_DEVICES,
            GET_ALL_PROJECTS,
            GET_ALL_BUNDLES);

    private static final EnumSet<Permission> customerSubAccountPermissions = EnumSet.of(
            //READ
            GET_ALL_CUSTOMERS,
            GET_ALL_SUBACCOUNTS,
            GET_ALL_LICENSES,
            GET_ALL_LICENSE_USAGE_DETAILS,
            GET_CONSUMPTION_USAGE_DETAILS,
            GET_ALL_DEVICES,
            GET_ALL_PROJECTS,
            GET_ALL_BUNDLES);

    public static final String DISTRIBUTOR_FULL_ADMIN = "distributor.FullAdmin";
    public static final String CUSTOMER_FULL_ADMIN = "customer.FullAdmin";
    public static final String SUBACCOUNT_ADMIN = "customer.SubaccountAdmin";

    public static final String LOG_MESSAGE_FOR_UNAUTHORIZED = "Unauthorized error: Access denied as role is missing.";
    public static final String MESSAGE_FOR_UNAUTHORIZED = "NOT AUTHORIZED. Access denied as role is missing.";
    public static final String LOG_MESSAGE_FOR_FORBIDDEN = "Forbidden error: Expected role is missing. Role provided: ";
    public static final String MESSAGE_FOR_FORBIDDEN = "UNAUTHORIZED ACCESS. You do not have access as expected role is missing";

    public static boolean hasPermission(String role,Permission permission){
        EnumSet<Permission> rolePermissions;
        switch (role){
            case "tekvizion.FullAdmin":
                rolePermissions = FullAdminPermissions;
                break;
            case "tekvizion.SalesAdmin":
                rolePermissions = SaleAdminPermissions;
                break;
            case "tekvizion.ConfigTester":
                rolePermissions = ConfigTesterPermissions;
                break;
            case "tekvizion.DevicesAdmin":
                rolePermissions = SupportDevicesAdminPermissions;
                break;
            case "tekvizion.AutomationPlatformApplication":
                rolePermissions = AutoPlatformAppPermissions;
                break;
            case "tekvizion.CRM":
                rolePermissions = crmPermissions;
                break;
            case DISTRIBUTOR_FULL_ADMIN:
                rolePermissions = customerDistFullAdminPermissions;
                break;
            case CUSTOMER_FULL_ADMIN:
                rolePermissions = customerFullAdminPermissions;
                break;
            case SUBACCOUNT_ADMIN:
                rolePermissions = customerSubAccountPermissions;
                break;
            default:
                return false;
        }
       return rolePermissions.contains(permission);
    }


    public static JSONObject getTokenClaimsFromHeader(HttpRequestMessage<?> request,ExecutionContext context) {
        Map<String, String> headers = request.getHeaders();
        String authHeader = headers.get("authorization");
        if(authHeader==null){
            context.getLogger().info("error: Authorization Header is missing.");
            return null;
        }
        String[] authorization = authHeader.split(" ");
        if (authorization.length!=2) {
            context.getLogger().info("error: Invalid Authorization Header format.");
            return null;
        }
        if(!authorization[0].equals("Bearer")){
            context.getLogger().info("error: Invalid token type: "+ authorization[0] + ". Required: Bearer");
            return null;
        }
        String[] tokenChunks = authorization[1].split("\\.");
        if (tokenChunks.length != 3) {
            context.getLogger().info("error: Invalid token format.");
            return null;
        }
        String tokenPayload = tokenChunks[1];
        Base64.Decoder decoder = Base64.getUrlDecoder();
        String tokenDecode = new String(decoder.decode(tokenPayload));
        return new JSONObject(tokenDecode);
    }

    public static String getRoleFromToken(HttpRequestMessage<?> request,ExecutionContext context){
        JSONObject tokenClaims = getTokenClaimsFromHeader(request,context);
        if(tokenClaims!=null) {
            try {
                JSONArray roles = tokenClaims.getJSONArray("roles");
                return roles.getString(0);
            } catch (Exception e) {
                context.getLogger().info("Caught exception: " + e.getMessage());
            }
        }
        return "";
    }

    public static String getRoleFromToken(JSONObject tokenClaims,ExecutionContext context){
        if(tokenClaims!=null) {
            try {
                JSONArray roles = tokenClaims.getJSONArray("roles");
                return roles.getString(0);
            } catch (Exception e) {
                context.getLogger().info("Caught exception: " + e.getMessage());
            }
        }
        return "";
    }

    public static String getEmailFromToken(HttpRequestMessage<?> request,ExecutionContext context){
        JSONObject tokenClaims = getTokenClaimsFromHeader(request,context);
        if(tokenClaims!=null) {
            try {
                return tokenClaims.getString("preferred_username");
            } catch (Exception e) {
                context.getLogger().info("Caught exception: " + e.getMessage());
            }
        }
        return "";
    }

    public static String getEmailFromToken(JSONObject tokenClaims,ExecutionContext context){
        if(tokenClaims!=null) {
            try {
                return tokenClaims.getString("preferred_username");
            } catch (Exception e) {
                context.getLogger().info("Caught exception: " + e.getMessage());
            }
        }
        return "";
    }
}