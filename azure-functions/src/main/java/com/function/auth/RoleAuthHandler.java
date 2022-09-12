package com.function.auth;

import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpRequestMessage;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.SecurityException;
import org.json.JSONArray;
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
           GET_USER_EMAIL_INFO,
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

    private static final EnumSet<Permission> devicesAdminPermissions = EnumSet.of(
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

    private static final EnumSet<Permission> automationPlatformPermissions = EnumSet.of(
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


    private static final EnumSet<Permission> distributorAdminPermissions = EnumSet.of(
            //READ
            GET_ALL_CUSTOMERS,
            GET_ALL_SUBACCOUNTS,
            GET_ALL_LICENSES,
            GET_ALL_LICENSE_USAGE_DETAILS,
            GET_CONSUMPTION_USAGE_DETAILS,
            GET_ALL_DEVICES,
            GET_ALL_PROJECTS,
            GET_ALL_BUNDLES);

    private static final EnumSet<Permission> customerAdminPermissions = EnumSet.of(
            //READ
            GET_ALL_CUSTOMERS,
            GET_ALL_SUBACCOUNTS,
            GET_ALL_LICENSES,
            GET_ALL_LICENSE_USAGE_DETAILS,
            GET_CONSUMPTION_USAGE_DETAILS,
            GET_ALL_DEVICES,
            GET_ALL_PROJECTS,
            GET_ALL_BUNDLES);

    private static final EnumSet<Permission> SubAccountAdminPermissions = EnumSet.of(
            //READ
            GET_ALL_CUSTOMERS,
            GET_ALL_SUBACCOUNTS,
            GET_ALL_LICENSES,
            GET_ALL_LICENSE_USAGE_DETAILS,
            GET_CONSUMPTION_USAGE_DETAILS,
            GET_ALL_DEVICES,
            GET_ALL_PROJECTS,
            GET_ALL_BUNDLES);
    
    private static final EnumSet<Permission> SubAccountStakeholderPermissions = EnumSet.of(
            //READ
            GET_ALL_CUSTOMERS,
            GET_ALL_SUBACCOUNTS);
            



    public static final String FULL_ADMIN = "tekvizion.FullAdmin";
    public static final String SALES_ADMIN = "tekvizion.SalesAdmin";
    public static final String CONFIG_TESTER = "tekvizion.ConfigTester";
    public static final String DEVICES_ADMIN = "tekvizion.DevicesAdmin";
    public static final String AUTOMATION_PLATFORM = "tekvizion.AutomationPlatform";
    public static final String CRM = "tekvizion.CRM";
    public static final String DISTRIBUTOR_FULL_ADMIN = "distributor.FullAdmin";
    public static final String CUSTOMER_FULL_ADMIN = "customer.FullAdmin";
    public static final String SUBACCOUNT_ADMIN = "customer.SubaccountAdmin";
    public static final String SUBACCOUNT_STAKEHOLDER = "customer.SubaccountStakeholder";

    public static final String LOG_MESSAGE_FOR_UNAUTHORIZED = "Unauthorized error: Access denied due to missing or invalid credentials.";
    public static final String MESSAGE_FOR_UNAUTHORIZED = "UNAUTHORIZED: Access denied due to missing or invalid credentials";
    public static final String LOG_MESSAGE_FOR_FORBIDDEN = "Forbidden error: Expected permission is missing. Role provided: ";
    public static final String MESSAGE_FOR_FORBIDDEN = "FORBIDDEN ACCESS. You do not have permission to perform this action.";

    public static final String LOG_MESSAGE_FOR_INVALID_ID = "Invalid Request Error: Id provided does not belong to the account of: ";
    public static final String MESSAGE_FOR_INVALID_ID = "The id provided does not exist in your account.";
    public static final String MESSAGE_ID_NOT_FOUND = "Id provided does not exist.";
    private static final String ISSUER = System.getenv("ISSUER");

    public static boolean hasPermission(String role,Permission permission){
        EnumSet<Permission> rolePermissions;
        switch (role){
            case FULL_ADMIN:
                rolePermissions = FullAdminPermissions;
                break;
            case SALES_ADMIN:
                rolePermissions = SaleAdminPermissions;
                break;
            case CONFIG_TESTER:
                rolePermissions = ConfigTesterPermissions;
                break;
            case DEVICES_ADMIN:
                rolePermissions = devicesAdminPermissions;
                break;
            case AUTOMATION_PLATFORM:
                rolePermissions = automationPlatformPermissions;
                break;
            case CRM:
                rolePermissions = crmPermissions;
                break;
            case DISTRIBUTOR_FULL_ADMIN:
                rolePermissions = distributorAdminPermissions;
                break;
            case CUSTOMER_FULL_ADMIN:
                rolePermissions = customerAdminPermissions;
                break;
            case SUBACCOUNT_ADMIN:
                rolePermissions = SubAccountAdminPermissions;
                break;
            case SUBACCOUNT_STAKEHOLDER:
                rolePermissions = SubAccountStakeholderPermissions;
                break;
            default:
                return false;
        }
       return rolePermissions.contains(permission);
    }


    public static Claims getTokenClaimsFromHeader(HttpRequestMessage<?> request,ExecutionContext context) {
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
        try{
            context.getLogger().info("ISSUER value: " + ISSUER);
            Jws<Claims> token = verifyToken(authorization[1]);
            return token.getBody();
        }catch (Exception e){
            context.getLogger().info(e.getMessage());
            return null;
        }

    }

    public static Jws<Claims> verifyToken(String jwt) throws Exception {

        try{
            SigningKeyResolver signingKeyResolver = SigningKeyResolver.getInstance();
            return Jwts.parserBuilder()
                    .setSigningKeyResolver(signingKeyResolver)
                    .requireIssuer(ISSUER)
                    .build()
                    .parseClaimsJws(jwt);
        }catch (SecurityException exception){
            throw new Exception("Invalid Signature Exception: " + exception.getMessage());
        }catch (ExpiredJwtException exception){
            throw new Exception("Expired Token Exception: " + exception.getMessage());
        }catch (JwtException exception){
            throw new Exception("JWT Exception: " + exception.getMessage());
        } catch (Exception exception){
            throw new Exception("Caught Exception: " + exception.getMessage());
        }
    }

    public static String getRoleFromToken(HttpRequestMessage<?> request,ExecutionContext context){
        Claims tokenClaims = getTokenClaimsFromHeader(request,context);
        return getRoleFromToken(tokenClaims,context);
    }

    public static String getRoleFromToken(Claims tokenClaims,ExecutionContext context){
        if(tokenClaims!=null) {
            try {
                JSONArray roles = new JSONArray(tokenClaims.get("roles").toString());
                return roles.getString(0);
            } catch (Exception e) {
                context.getLogger().info("Caught exception: Getting roles claim failed.");
            }
        }
        return "";
    }

    public static String getEmailFromToken(Claims tokenClaims,ExecutionContext context){
        if(tokenClaims!=null) {
            try {
                return tokenClaims.get("preferred_username").toString();
            } catch (Exception e) {
                context.getLogger().info("Caught exception: Getting preferred_username claim failed.");
            }
        }
        return "";
    }

    public static String getUserIdFromToken(Claims tokenClaims,ExecutionContext context){
        if(tokenClaims!=null) {
            try {
                return tokenClaims.get("oid").toString();
            } catch (Exception e) {
                context.getLogger().info("Caught exception: Getting user oid claim failed.");
            }
        }
        return "";
    }
}
