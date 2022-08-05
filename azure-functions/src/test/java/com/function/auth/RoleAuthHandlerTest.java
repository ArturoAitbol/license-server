package com.function.auth;

import com.function.util.Config;
import com.function.util.TekvLSTest;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.impl.DefaultClaims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static com.function.auth.Permission.*;
import static com.function.auth.RoleAuthHandler.*;
import static org.junit.jupiter.api.Assertions.*;

class RoleAuthHandlerTest extends TekvLSTest {

    private final int totalPermissions = 36;

    @BeforeEach
    void setUp() {
        this.initTestParameters();

    }

    @Tag("security")
    @Test
    public void fullAdminPermissionsTest() {
        String role = FULL_ADMIN;
        int permissionsChecked = 0;

        List<Permission> allowedActions = Arrays.asList(
                CREATE_CUSTOMER,
                CREATE_SUBACCOUNT,
                CREATE_ADMIN_EMAIL,
                CREATE_SUBACCOUNT_ADMIN_MAIL,
                CREATE_LICENSE,
                CREATE_LICENSE_USAGE_DETAIL,
                CREATE_USAGE_DETAILS,
                CREATE_PROJECT,
                DELETE_CUSTOMER,
                DELETE_SUB_ACCOUNT,
                DELETE_ADMIN_EMAIL,
                DELETE_SUBACCOUNT_ADMIN_EMAIL,
                DELETE_LICENSE,
                DELETE_PROJECT,
                DELETE_LICENSE_USAGE,
                DELETE_USAGE_DETAILS,
                GET_ALL_CUSTOMERS,
                GET_ALL_SUBACCOUNTS,
                GET_ALL_LICENSES,
                GET_ALL_DEVICES,
                GET_ALL_PROJECTS,
                GET_ALL_BUNDLES,
                GET_ALL_LICENSE_USAGE_DETAILS,
                GET_CONSUMPTION_USAGE_DETAILS,
                GET_USER_EMAIL_INFO,
                MODIFY_CUSTOMER,
                MODIFY_SUBACCOUNT,
                MODIFY_LICENSE,
                MODIFY_PROJECT,
                MODIFY_LICENSE_USAGE);

        List<Permission> forbiddenActions = Arrays.asList(
                CREATE_DEVICE,
                CREATE_BUNDLE,
                DELETE_DEVICE,
                DELETE_BUNDLE,
                MODIFY_DEVICE,
                MODIFY_BUNDLE);


        //Then
        for (Permission allowedAction : allowedActions) {
            assertTrue(hasPermission(role, allowedAction),
                    "The provided Role does not have permission to perform the action: " + allowedAction);
            permissionsChecked++;
        }
        for (Permission forbiddenAction : forbiddenActions) {
            assertFalse(hasPermission(role, forbiddenAction),
                    "The provided Role does have permission to perform the action: " + forbiddenAction);
            permissionsChecked++;
        }

        assertEquals(totalPermissions, permissionsChecked,
                "Permissions checked do not match the amount of total permissions.");

    }

    @Tag("security")
    @Test
    public void salesAdminPermissionsTest() {
        String role = SALES_ADMIN;
        int permissionsChecked = 0;

        List<Permission> allowedActions = Arrays.asList(
                CREATE_CUSTOMER,
                CREATE_SUBACCOUNT,
                CREATE_SUBACCOUNT_ADMIN_MAIL,
                CREATE_ADMIN_EMAIL,
                CREATE_LICENSE,
                GET_ALL_CUSTOMERS,
                GET_ALL_SUBACCOUNTS,
                GET_ALL_LICENSES,
                GET_ALL_LICENSE_USAGE_DETAILS,
                GET_CONSUMPTION_USAGE_DETAILS,
                GET_ALL_DEVICES,
                GET_ALL_PROJECTS,
                GET_ALL_BUNDLES,
                MODIFY_CUSTOMER,
                MODIFY_SUBACCOUNT,
                MODIFY_LICENSE);
        List<Permission> forbiddenActions = Arrays.asList(
                CREATE_LICENSE_USAGE_DETAIL,
                CREATE_USAGE_DETAILS,
                CREATE_PROJECT,
                DELETE_CUSTOMER,
                DELETE_SUB_ACCOUNT,
                DELETE_ADMIN_EMAIL,
                DELETE_SUBACCOUNT_ADMIN_EMAIL,
                DELETE_LICENSE,
                DELETE_PROJECT,
                DELETE_LICENSE_USAGE,
                DELETE_USAGE_DETAILS,
                GET_USER_EMAIL_INFO,
                MODIFY_PROJECT,
                MODIFY_LICENSE_USAGE,
                CREATE_DEVICE,
                CREATE_BUNDLE,
                DELETE_DEVICE,
                DELETE_BUNDLE,
                MODIFY_DEVICE,
                MODIFY_BUNDLE);


        //Then
        for (Permission allowedAction : allowedActions) {
            assertTrue(hasPermission(role, allowedAction),
                    "The provided Role does not have permission to perform the action: " + allowedAction);
            permissionsChecked++;
        }
        for (Permission forbiddenAction : forbiddenActions) {
            assertFalse(hasPermission(role, forbiddenAction),
                    "The provided Role does have permission to perform the action: " + forbiddenAction);
            permissionsChecked++;
        }

        assertEquals(totalPermissions, permissionsChecked,
                "Permissions checked do not match the amount of total permissions.");
    }

    @Tag("security")
    @Test
    public void configTesterPermissionsTest() {
        String role = CONFIG_TESTER;
        int permissionsChecked = 0;

        List<Permission> allowedActions = Arrays.asList(
                CREATE_LICENSE_USAGE_DETAIL,
                CREATE_PROJECT,
                CREATE_USAGE_DETAILS,
                DELETE_LICENSE_USAGE,
                DELETE_USAGE_DETAILS,
                GET_ALL_CUSTOMERS,
                GET_ALL_SUBACCOUNTS,
                GET_ALL_LICENSES,
                GET_ALL_LICENSE_USAGE_DETAILS,
                GET_CONSUMPTION_USAGE_DETAILS,
                GET_ALL_DEVICES,
                GET_ALL_PROJECTS,
                GET_ALL_BUNDLES,
                MODIFY_PROJECT,
                MODIFY_LICENSE_USAGE);
        List<Permission> forbiddenActions = Arrays.asList(
                CREATE_CUSTOMER,
                CREATE_SUBACCOUNT,
                CREATE_ADMIN_EMAIL,
                CREATE_SUBACCOUNT_ADMIN_MAIL,
                CREATE_LICENSE,
                DELETE_CUSTOMER,
                DELETE_SUB_ACCOUNT,
                DELETE_ADMIN_EMAIL,
                DELETE_SUBACCOUNT_ADMIN_EMAIL,
                DELETE_LICENSE,
                DELETE_PROJECT,
                GET_USER_EMAIL_INFO,
                MODIFY_CUSTOMER,
                MODIFY_SUBACCOUNT,
                MODIFY_LICENSE,
                CREATE_DEVICE,
                CREATE_BUNDLE,
                DELETE_DEVICE,
                DELETE_BUNDLE,
                MODIFY_DEVICE,
                MODIFY_BUNDLE);


        //Then
        for (Permission allowedAction : allowedActions) {
            assertTrue(hasPermission(role, allowedAction),
                    "The provided Role does not have permission to perform the action: " + allowedAction);
            permissionsChecked++;
        }
        for (Permission forbiddenAction : forbiddenActions) {
            assertFalse(hasPermission(role, forbiddenAction),
                    "The provided Role does have permission to perform the action: " + forbiddenAction);
            permissionsChecked++;
        }

        assertEquals(totalPermissions, permissionsChecked,
                "Permissions checked do not match the amount of total permissions.");

    }

    @Tag("security")
    @Test
    public void devicesAdminPermissionsTest() {
        String role = DEVICES_ADMIN;
        int permissionsChecked = 0;

        List<Permission> allowedActions = Arrays.asList(
                CREATE_DEVICE,
                CREATE_BUNDLE,
                DELETE_DEVICE,
                DELETE_BUNDLE,
                GET_ALL_DEVICES,
                GET_ALL_BUNDLES,
                MODIFY_DEVICE,
                MODIFY_BUNDLE);
        List<Permission> forbiddenActions = Arrays.asList(
                CREATE_CUSTOMER,
                CREATE_SUBACCOUNT,
                CREATE_ADMIN_EMAIL,
                CREATE_SUBACCOUNT_ADMIN_MAIL,
                CREATE_LICENSE,
                CREATE_LICENSE_USAGE_DETAIL,
                CREATE_USAGE_DETAILS,
                CREATE_PROJECT,
                DELETE_CUSTOMER,
                DELETE_SUB_ACCOUNT,
                DELETE_ADMIN_EMAIL,
                DELETE_SUBACCOUNT_ADMIN_EMAIL,
                DELETE_LICENSE,
                DELETE_PROJECT,
                DELETE_LICENSE_USAGE,
                DELETE_USAGE_DETAILS,
                GET_ALL_CUSTOMERS,
                GET_ALL_SUBACCOUNTS,
                GET_ALL_LICENSES,
                GET_ALL_PROJECTS,
                GET_ALL_LICENSE_USAGE_DETAILS,
                GET_CONSUMPTION_USAGE_DETAILS,
                GET_USER_EMAIL_INFO,
                MODIFY_CUSTOMER,
                MODIFY_SUBACCOUNT,
                MODIFY_LICENSE,
                MODIFY_PROJECT,
                MODIFY_LICENSE_USAGE);

        //Then
        for (Permission allowedAction : allowedActions) {
            assertTrue(hasPermission(role, allowedAction),
                    "The provided Role does not have permission to perform the action: " + allowedAction);
            permissionsChecked++;
        }
        for (Permission forbiddenAction : forbiddenActions) {
            assertFalse(hasPermission(role, forbiddenAction),
                    "The provided Role does have permission to perform the action: " + forbiddenAction);
            permissionsChecked++;
        }

        assertEquals(totalPermissions, permissionsChecked,
                "Permissions checked do not match the amount of total permissions.");

    }

    @Tag("security")
    @Test
    public void automationPlatformPermissionsTest() {
        String role = AUTOMATION_PLATFORM;
        int permissionsChecked = 0;

        List<Permission> allowedActions = Arrays.asList(
                CREATE_LICENSE_USAGE_DETAIL,
                CREATE_USAGE_DETAILS,
                GET_ALL_DEVICES);
        List<Permission> forbiddenActions = Arrays.asList(
                CREATE_CUSTOMER,
                CREATE_SUBACCOUNT,
                CREATE_ADMIN_EMAIL,
                CREATE_SUBACCOUNT_ADMIN_MAIL,
                CREATE_LICENSE,
                CREATE_PROJECT,
                DELETE_CUSTOMER,
                DELETE_SUB_ACCOUNT,
                DELETE_ADMIN_EMAIL,
                DELETE_SUBACCOUNT_ADMIN_EMAIL,
                DELETE_LICENSE,
                DELETE_PROJECT,
                DELETE_LICENSE_USAGE,
                DELETE_USAGE_DETAILS,
                GET_ALL_CUSTOMERS,
                GET_ALL_SUBACCOUNTS,
                GET_ALL_LICENSES,
                GET_ALL_PROJECTS,
                GET_ALL_LICENSE_USAGE_DETAILS,
                GET_CONSUMPTION_USAGE_DETAILS,
                GET_USER_EMAIL_INFO,
                MODIFY_CUSTOMER,
                MODIFY_SUBACCOUNT,
                MODIFY_LICENSE,
                MODIFY_PROJECT,
                MODIFY_LICENSE_USAGE,
                CREATE_DEVICE,
                CREATE_BUNDLE,
                DELETE_DEVICE,
                DELETE_BUNDLE,
                GET_ALL_BUNDLES,
                MODIFY_DEVICE,
                MODIFY_BUNDLE);

        //Then
        for (Permission allowedAction : allowedActions) {
            assertTrue(hasPermission(role, allowedAction),
                    "The provided Role does not have permission to perform the action: " + allowedAction);
            permissionsChecked++;
        }
        for (Permission forbiddenAction : forbiddenActions) {
            assertFalse(hasPermission(role, forbiddenAction),
                    "The provided Role does have permission to perform the action: " + forbiddenAction);
            permissionsChecked++;
        }

        assertEquals(totalPermissions, permissionsChecked,
                "Permissions checked do not match the amount of total permissions.");

    }

    @Tag("security")
    @Test
    public void crmPermissionsTest() {
        String role = CRM;
        int permissionsChecked = 0;

        List<Permission> allowedActions = Arrays.asList(
                CREATE_CUSTOMER,
                CREATE_SUBACCOUNT,
                CREATE_ADMIN_EMAIL,
                CREATE_SUBACCOUNT_ADMIN_MAIL,
                CREATE_LICENSE,
                GET_ALL_CUSTOMERS,
                GET_ALL_SUBACCOUNTS,
                GET_ALL_LICENSES,
                GET_ALL_LICENSE_USAGE_DETAILS,
                GET_CONSUMPTION_USAGE_DETAILS,
                MODIFY_CUSTOMER,
                MODIFY_SUBACCOUNT,
                MODIFY_LICENSE);
        List<Permission> forbiddenActions = Arrays.asList(
                CREATE_LICENSE_USAGE_DETAIL,
                CREATE_USAGE_DETAILS,
                CREATE_PROJECT,
                DELETE_CUSTOMER,
                DELETE_SUB_ACCOUNT,
                DELETE_ADMIN_EMAIL,
                DELETE_SUBACCOUNT_ADMIN_EMAIL,
                DELETE_LICENSE,
                DELETE_PROJECT,
                DELETE_LICENSE_USAGE,
                DELETE_USAGE_DETAILS,
                GET_ALL_PROJECTS,
                GET_USER_EMAIL_INFO,
                MODIFY_PROJECT,
                MODIFY_LICENSE_USAGE,
                CREATE_DEVICE,
                CREATE_BUNDLE,
                DELETE_DEVICE,
                DELETE_BUNDLE,
                GET_ALL_DEVICES,
                GET_ALL_BUNDLES,
                MODIFY_DEVICE,
                MODIFY_BUNDLE);

        //Then
        for (Permission allowedAction : allowedActions) {
            assertTrue(hasPermission(role, allowedAction),
                    "The provided Role does not have permission to perform the action: " + allowedAction);
            permissionsChecked++;
        }
        for (Permission forbiddenAction : forbiddenActions) {
            assertFalse(hasPermission(role, forbiddenAction),
                    "The provided Role does have permission to perform the action: " + forbiddenAction);
            permissionsChecked++;
        }

        assertEquals(totalPermissions, permissionsChecked,
                "Permissions checked do not match the amount of total permissions.");

    }

    @Tag("security")
    @Test
    public void distributorAdminPermissionsTest() {
        String role = DISTRIBUTOR_FULL_ADMIN;
        int permissionsChecked = 0;

        List<Permission> allowedActions = Arrays.asList(
                GET_ALL_CUSTOMERS,
                GET_ALL_SUBACCOUNTS,
                GET_ALL_LICENSES,
                GET_ALL_LICENSE_USAGE_DETAILS,
                GET_CONSUMPTION_USAGE_DETAILS,
                GET_ALL_DEVICES,
                GET_ALL_PROJECTS,
                GET_ALL_BUNDLES);
        List<Permission> forbiddenActions = Arrays.asList(
                CREATE_CUSTOMER,
                CREATE_SUBACCOUNT,
                CREATE_ADMIN_EMAIL,
                CREATE_SUBACCOUNT_ADMIN_MAIL,
                CREATE_LICENSE,
                CREATE_LICENSE_USAGE_DETAIL,
                CREATE_USAGE_DETAILS,
                CREATE_PROJECT,
                DELETE_CUSTOMER,
                DELETE_SUB_ACCOUNT,
                DELETE_ADMIN_EMAIL,
                DELETE_SUBACCOUNT_ADMIN_EMAIL,
                DELETE_LICENSE,
                DELETE_PROJECT,
                DELETE_LICENSE_USAGE,
                DELETE_USAGE_DETAILS,
                GET_USER_EMAIL_INFO,
                MODIFY_CUSTOMER,
                MODIFY_SUBACCOUNT,
                MODIFY_LICENSE,
                MODIFY_PROJECT,
                CREATE_DEVICE,
                CREATE_BUNDLE,
                DELETE_DEVICE,
                DELETE_BUNDLE,
                MODIFY_DEVICE,
                MODIFY_BUNDLE,
                MODIFY_LICENSE_USAGE);

        //Then
        for (Permission allowedAction : allowedActions) {
            assertTrue(hasPermission(role, allowedAction),
                    "The provided Role does not have permission to perform the action: " + allowedAction);
            permissionsChecked++;
        }
        for (Permission forbiddenAction : forbiddenActions) {
            assertFalse(hasPermission(role, forbiddenAction),
                    "The provided Role does have permission to perform the action: " + forbiddenAction);
            permissionsChecked++;
        }

        assertEquals(totalPermissions, permissionsChecked,
                "Permissions checked do not match the amount of total permissions.");

    }

    @Tag("security")
    @Test
    public void customerAdminPermissionsTest() {
        String role = CUSTOMER_FULL_ADMIN;
        int permissionsChecked = 0;

        List<Permission> allowedActions = Arrays.asList(
                GET_ALL_CUSTOMERS,
                GET_ALL_SUBACCOUNTS,
                GET_ALL_LICENSES,
                GET_ALL_LICENSE_USAGE_DETAILS,
                GET_CONSUMPTION_USAGE_DETAILS,
                GET_ALL_DEVICES,
                GET_ALL_PROJECTS,
                GET_ALL_BUNDLES);
        List<Permission> forbiddenActions = Arrays.asList(
                CREATE_CUSTOMER,
                CREATE_SUBACCOUNT,
                CREATE_ADMIN_EMAIL,
                CREATE_SUBACCOUNT_ADMIN_MAIL,
                CREATE_LICENSE,
                CREATE_LICENSE_USAGE_DETAIL,
                CREATE_USAGE_DETAILS,
                CREATE_PROJECT,
                DELETE_CUSTOMER,
                DELETE_SUB_ACCOUNT,
                DELETE_ADMIN_EMAIL,
                DELETE_SUBACCOUNT_ADMIN_EMAIL,
                DELETE_LICENSE,
                DELETE_PROJECT,
                DELETE_LICENSE_USAGE,
                DELETE_USAGE_DETAILS,
                GET_USER_EMAIL_INFO,
                MODIFY_CUSTOMER,
                MODIFY_SUBACCOUNT,
                MODIFY_LICENSE,
                MODIFY_PROJECT,
                CREATE_DEVICE,
                CREATE_BUNDLE,
                DELETE_DEVICE,
                DELETE_BUNDLE,
                MODIFY_DEVICE,
                MODIFY_BUNDLE,
                MODIFY_LICENSE_USAGE);


        //Then
        for (Permission allowedAction : allowedActions) {
            assertTrue(hasPermission(role, allowedAction),
                    "The provided Role does not have permission to perform the action: " + allowedAction);
            permissionsChecked++;
        }
        for (Permission forbiddenAction : forbiddenActions) {
            assertFalse(hasPermission(role, forbiddenAction),
                    "The provided Role does have permission to perform the action: " + forbiddenAction);
            permissionsChecked++;
        }

        assertEquals(totalPermissions, permissionsChecked,
                "Permissions checked do not match the amount of total permissions.");

    }

    @Tag("security")
    @Test
    public void subaccountAdminPermissionsTest() {
        String role = SUBACCOUNT_ADMIN;
        int permissionsChecked = 0;

        List<Permission> allowedActions = Arrays.asList(
                GET_ALL_CUSTOMERS,
                GET_ALL_SUBACCOUNTS,
                GET_ALL_LICENSES,
                GET_ALL_LICENSE_USAGE_DETAILS,
                GET_CONSUMPTION_USAGE_DETAILS,
                GET_ALL_DEVICES,
                GET_ALL_PROJECTS,
                GET_ALL_BUNDLES);
        List<Permission> forbiddenActions = Arrays.asList(
                CREATE_CUSTOMER,
                CREATE_SUBACCOUNT,
                CREATE_ADMIN_EMAIL,
                CREATE_SUBACCOUNT_ADMIN_MAIL,
                CREATE_LICENSE,
                CREATE_LICENSE_USAGE_DETAIL,
                CREATE_USAGE_DETAILS,
                CREATE_PROJECT,
                DELETE_CUSTOMER,
                DELETE_SUB_ACCOUNT,
                DELETE_ADMIN_EMAIL,
                DELETE_SUBACCOUNT_ADMIN_EMAIL,
                DELETE_LICENSE,
                DELETE_PROJECT,
                DELETE_LICENSE_USAGE,
                DELETE_USAGE_DETAILS,
                GET_USER_EMAIL_INFO,
                MODIFY_CUSTOMER,
                MODIFY_SUBACCOUNT,
                MODIFY_LICENSE,
                MODIFY_PROJECT,
                CREATE_DEVICE,
                CREATE_BUNDLE,
                DELETE_DEVICE,
                DELETE_BUNDLE,
                MODIFY_DEVICE,
                MODIFY_BUNDLE,
                MODIFY_LICENSE_USAGE);


        //Then
        for (Permission allowedAction : allowedActions) {
            assertTrue(hasPermission(role, allowedAction),
                    "The provided Role does not have permission to perform the action: " + allowedAction);
            permissionsChecked++;
        }
        for (Permission forbiddenAction : forbiddenActions) {
            assertFalse(hasPermission(role, forbiddenAction),
                    "The provided Role does have permission to perform the action: " + forbiddenAction);
            permissionsChecked++;
        }

        assertEquals(totalPermissions, permissionsChecked,
                "Permissions checked do not match the amount of total permissions.");

    }

    @Tag("security")
    @Test
    public void invalidRoleTest() {
        //Given
        String role = "invalid-role";
        //Then
        assertFalse(hasPermission(role, GET_ALL_CUSTOMERS));
    }

    @Tag("security")
    @Test
    public void getRoleFromTokenTest() {
        //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
        //When
        String role = getRoleFromToken(this.request, this.context);
        //Then
        assertEquals(FULL_ADMIN, role);
    }

    @Tag("security")
    @Test
    public void noAuthorizationHeaderTest() {
        //When
        Claims tokenClaims = getTokenClaimsFromHeader(this.request, this.context);
        //Then
        assertNull(tokenClaims);
    }

    @Tag("security")
    @Test
    public void invalidHeaderFormatTest() {
        //Given
        this.headers.put("authorization", Config.getInstance().getToken("fullAdmin"));
        //When
        Claims tokenClaims = getTokenClaimsFromHeader(this.request, this.context);
        //Then
        assertNull(tokenClaims);
    }

    @Tag("security")
    @Test
    public void invalidAuthorizationTypeTest() {
        //Given
        this.headers.put("authorization", "Basic " + Config.getInstance().getToken("fullAdmin"));
        //When
        Claims tokenClaims = getTokenClaimsFromHeader(this.request, this.context);
        //Then
        assertNull(tokenClaims);
    }

    @Tag("security")
    @Test
    public void invalidTokenFormatTest() {
        //Given
        this.headers.put("authorization", "Bearer eyJ0eXAiOiJKV1QiLCJ.eyJhdWQiOiJlNjQzZmM5ZC1iMTI3LTQ4ODMtO");
        //When
        Claims tokenClaims = getTokenClaimsFromHeader(this.request, this.context);
        //Then
        assertNull(tokenClaims);
    }

    @Tag("security")
    @Test
    public void invalidTokenSignatureTest() {
        //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("test"));
        //When
        Claims tokenClaims = getTokenClaimsFromHeader(this.request, this.context);
        //Then
        assertNull(tokenClaims);
    }

    @Tag("security")
    @Test
    public void ExpiredTokenTest() {
        //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getExpiredToken());
        //When
        Claims tokenClaims = getTokenClaimsFromHeader(this.request, this.context);
        //Then
        assertNull(tokenClaims);
    }

    @Tag("security")
    @Test
    public void jwtExceptionTest() {
        //Given
        this.headers.put("authorization", "Bearer " + "eyJ0eXAiOiJKV1QiLCJ.eyJhdWQiOiJlNjQzZmM5ZC1iMTI3LTQ4ODMtO.5ZC1iMTI3LTQ4ODMtO");
        //When
        Claims tokenClaims = getTokenClaimsFromHeader(this.request, this.context);
        //Then
        assertNull(tokenClaims);
    }

    @Tag("security")
    @Test
    public void getRoleFromTokenExceptionTest() {
        //Given
        Claims claims = new DefaultClaims();
        //When
        String role = getRoleFromToken(claims, this.context);
        //Then
        assertTrue(role.isEmpty());
    }

    @Tag("security")
    @Test
    public void getEmailFromTokenTest() {
        //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));
        //When
        Claims tokenClaims = getTokenClaimsFromHeader(this.request, this.context);
        String email = getEmailFromToken(tokenClaims, this.context);
        //Then
        assertFalse(email.isEmpty());
    }

    @Tag("security")
    @Test
    public void getEmailFromTokenExceptionTest() {
        //Given
        Claims claims = new DefaultClaims();
        //When
        String role = getEmailFromToken(claims, this.context);
        //Then
        assertTrue(role.isEmpty());
    }

    @Tag("security")
    @Test
    public void getUserIdFromTokenTest() {
        //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
        //When
        Claims tokenClaims = getTokenClaimsFromHeader(this.request, this.context);
        String userId = getUserIdFromToken(tokenClaims, this.context);
        //Then
        assertFalse(userId.isEmpty());
    }

    @Tag("security")
    @Test
    public void getUserIdFromTokenExceptionTest() {
        //Given
        Claims claims = new DefaultClaims();
        //When
        String userId = getUserIdFromToken(claims, this.context);
        //Then
        assertTrue(userId.isEmpty());
    }


}