package com.function.auth;

import com.function.db.QueryBuilder;
import com.function.db.SelectQueryBuilder;
import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpRequestMessage;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.SecurityException;
import org.json.JSONArray;

import java.util.*;

import static com.function.auth.Permissions.*;
import static com.function.auth.Roles.*;

public class RoleAuthHandler {

    private static final String ISSUER = System.getenv("ISSUER");

    public static final String LOG_MESSAGE_FOR_UNAUTHORIZED = "Unauthorized error: Access denied due to missing or invalid credentials.";
    public static final String MESSAGE_FOR_UNAUTHORIZED = "UNAUTHORIZED: Access denied due to missing or invalid credentials";
    public static final String LOG_MESSAGE_FOR_FORBIDDEN = "Forbidden error: Expected permission is missing. Role provided: ";
    public static final String MESSAGE_FOR_FORBIDDEN = "FORBIDDEN ACCESS. You do not have permission to perform this action.";

    public static final String LOG_MESSAGE_FOR_INVALID_ID = "Invalid Request Error: Id provided does not belong to the account of: ";
    public static final String MESSAGE_FOR_INVALID_ID = "The id provided does not exist in your account.";
    public static final String MESSAGE_ID_NOT_FOUND = "No results found for the provided Id.";

    public static final String LOG_MESSAGE_FOR_INVALID_EMAIL = "Invalid Request Error: The authenticated user provided does not belong to the account of: ";
    public static final String MESSAGE_FOR_MISSING_CUSTOMER_EMAIL = "The authenticated user does not belong to any customer.";

    public static final String MESSAGE_SUBACCOUNT_ID_NOT_FOUND = "Subaccount id provided does not exist. ";
    public static final String LOG_MESSAGE_FOR_INVALID_SUBACCOUNT_ID = "Invalid Request Error: Subaccount id provided does not belong to the account of: ";

    public static boolean hasPermission(JSONArray roles, Resource resource) {
        for (int i = 0; i < roles.length(); i++) {
            if (hasPermission(roles.getString(i), resource))
                return true;
        }
        return false;
    }

    public static boolean hasPermission(String role, Resource resource) {
        EnumSet<Resource> rolePermissions;
        switch (role) {
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
            case IGES_ADMIN:
                rolePermissions = IGESAdminPermissions;
                break;
            default:
                return false;
        }
        return rolePermissions.contains(resource);
    }

    public static String evaluateCustomerRoles(JSONArray roles) {
        if (roles.length() == 1)
            return roles.getString(0);
        List<String> customerRoles = getCustomerRoles();
        String role;
        for (String customerRole : customerRoles) {
            for (int i = 0; i < roles.length(); i++) {
                role = roles.getString(i);
                if (role.equals(customerRole))
                    return role;
            }
        }
        return "";
    }

    public static String evaluateRoles(JSONArray roles) {
        if (roles.length() == 1)
            return roles.getString(0);
        String roleIt;
        boolean configTesterFound = false;
        for (int i = 0; i < roles.length(); i++) {
            roleIt = roles.getString(i);
            if (roleIt.equals(FULL_ADMIN))
                return FULL_ADMIN;
            if (roleIt.equals(CONFIG_TESTER))
                configTesterFound = true;
        }
        if (configTesterFound)
            return CONFIG_TESTER;
        String customerRole = evaluateCustomerRoles(roles);
        if (!customerRole.isEmpty())
            return customerRole;
        return roles.getString(0);
    }

    public static Claims getTokenClaimsFromHeader(HttpRequestMessage<?> request, ExecutionContext context) {
        Map<String, String> headers = request.getHeaders();
        String authHeader = headers.get("authorization");
        if (authHeader == null) {
            context.getLogger().info("error: Authorization Header is missing.");
            return null;
        }
        String[] authorization = authHeader.split(" ");
        if (authorization.length != 2) {
            context.getLogger().info("error: Invalid Authorization Header format.");
            return null;
        }
        if (!authorization[0].equals("Bearer")) {
            context.getLogger().info("error: Invalid token type: " + authorization[0] + ". Required: Bearer");
            return null;
        }
        String[] tokenChunks = authorization[1].split("\\.");
        if (tokenChunks.length != 3) {
            context.getLogger().info("error: Invalid token format.");
            return null;
        }
        try {
            context.getLogger().info("ISSUER value: " + ISSUER);
            Jws<Claims> token = verifyToken(authorization[1]);
            return token.getBody();
        } catch (Exception e) {
            context.getLogger().info(e.getMessage());
            return null;
        }

    }

    public static Jws<Claims> verifyToken(String jwt) throws Exception {

        try {
            SigningKeyResolver signingKeyResolver = SigningKeyResolver.getInstance();
            return Jwts.parserBuilder()
                    .setSigningKeyResolver(signingKeyResolver)
                    .requireIssuer(ISSUER)
                    .build()
                    .parseClaimsJws(jwt);
        } catch (SecurityException exception) {
            throw new Exception("Invalid Signature Exception: " + exception.getMessage());
        } catch (ExpiredJwtException exception) {
            throw new Exception("Expired Token Exception: " + exception.getMessage());
        } catch (JwtException exception) {
            throw new Exception("JWT Exception: " + exception.getMessage());
        } catch (Exception exception) {
            throw new Exception("Caught Exception: " + exception.getMessage());
        }
    }

    public static JSONArray getRolesFromToken(HttpRequestMessage<?> request, ExecutionContext context) {
        Claims tokenClaims = getTokenClaimsFromHeader(request, context);
        return getRolesFromToken(tokenClaims, context);
    }

    public static JSONArray getRolesFromToken(Claims tokenClaims, ExecutionContext context) {
        if (tokenClaims != null) {
            try {
                return new JSONArray(tokenClaims.get("roles").toString());
            } catch (Exception e) {
                context.getLogger().info("Caught exception: Getting roles claim failed.");
            }
        }
        return new JSONArray();
    }

    public static String getEmailFromToken(Claims tokenClaims, ExecutionContext context) {
        if (tokenClaims != null) {
            try {
                return tokenClaims.get("preferred_username").toString().toLowerCase();
            } catch (Exception e) {
                context.getLogger().info("Caught exception: Getting preferred_username claim failed.");
            }
        }
        return "";
    }

    public static String getUserIdFromToken(Claims tokenClaims, ExecutionContext context) {
        if (tokenClaims != null) {
            try {
                return tokenClaims.get("oid").toString();
            } catch (Exception e) {
                context.getLogger().info("Caught exception: Getting user oid claim failed.");
            }
        }
        return "";
    }

    public static SelectQueryBuilder getCustomerRoleVerificationQuery(String subaccountId, JSONArray roles,
            String email) {
        SelectQueryBuilder verificationQueryBuilder = null;
        String currentRole = evaluateRoles(roles);
        switch (currentRole) {
            case CUSTOMER_FULL_ADMIN:
                verificationQueryBuilder = new SelectQueryBuilder("SELECT s.id FROM subaccount s, customer_admin ca");
                verificationQueryBuilder.appendCustomCondition("s.customer_id = ca.customer_id AND admin_email = ?",
                        email);
                verificationQueryBuilder.appendEqualsCondition("s.id", subaccountId, QueryBuilder.DATA_TYPE.UUID);
                break;
            case SUBACCOUNT_ADMIN:
            case SUBACCOUNT_STAKEHOLDER:
                verificationQueryBuilder = new SelectQueryBuilder("SELECT subaccount_id FROM subaccount_admin");
                verificationQueryBuilder.appendEqualsCondition("subaccount_admin_email", email);
                verificationQueryBuilder.appendEqualsCondition("subaccount_id", subaccountId,
                        QueryBuilder.DATA_TYPE.UUID);
                break;
        }
        return verificationQueryBuilder;
    }
}
