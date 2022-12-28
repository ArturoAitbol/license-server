package com.function.auth;

import com.function.util.Config;
import com.function.util.TekvLSTest;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.impl.DefaultClaims;
import org.json.JSONArray;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.EnumMap;
import java.util.List;

import static com.function.auth.Resource.*;
import static com.function.auth.Roles.*;
import static com.function.auth.RoleAuthHandler.*;
import static org.junit.jupiter.api.Assertions.*;

class RoleAuthHandlerTest extends TekvLSTest {

    @BeforeEach
    void setUp() {
        this.initTestParameters();

    }

    @Tag("security")
    @Test
    public void rolePermissionsTest() {
        List<String> roles = Roles.getAllRoles();
        Resource[] resources = Resource.values();
        EnumMap<Resource, ExpectedPermissions> verifiers = RBACVerifier.getInstance().verifiers;

        for(String role : roles){
            for(Resource resource : resources){
                ExpectedPermissions expectedPermissions = verifiers.get(resource);
                assertNotNull(expectedPermissions,"RBAC verifier for "+ resource + " has not been defined");

                Boolean expectedPermission = expectedPermissions.getExpectation(role);
                assertNotNull(expectedPermission,"Expected Permissions for "+ role + " have not been defined");

                assertEquals(expectedPermission,hasPermission(role,resource),
                        "The provided Role ("+role+") does not have the expected permission: " + resource);
            }
        }
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
        JSONArray roles = getRolesFromToken(this.request, this.context);
        //Then
        assertEquals(FULL_ADMIN, roles.getString(0));
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
        JSONArray roles = getRolesFromToken(claims, this.context);
        //Then
        assertEquals(roles.length(),0);
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

    @Tag("security")
    @Test
    public void evaluateCustomerRolesTest(){
        //Given
        JSONArray roles = new JSONArray();
        roles.put(SUBACCOUNT_ADMIN);
        roles.put(CUSTOMER_FULL_ADMIN);
        //When
        String role = evaluateRoles(roles);
        //Then
        assertEquals(CUSTOMER_FULL_ADMIN,role);
    }

    @Tag("security")
    @Test
    public void evaluateTekvizionRolesTest(){
        //Given
        JSONArray roles = new JSONArray();
        roles.put(CONFIG_TESTER);
        roles.put(FULL_ADMIN);

        //When
        String role = evaluateRoles(roles);
        //Then
        assertEquals(FULL_ADMIN,role);
    }

    @Tag("security")
    @Test
    public void evaluateTekvizionRolesTest2(){
        //Given
        JSONArray roles = new JSONArray();
        roles.put(DEVICES_ADMIN);
        roles.put(CONFIG_TESTER);

        //When
        String role = evaluateRoles(roles);
        //Then
        assertEquals(CONFIG_TESTER,role);
    }

    @Tag("security")
    @Test
    public void evaluateTekvizionRolesTest3(){
        //Given
        JSONArray roles = new JSONArray();
        roles.put(DEVICES_ADMIN);
        roles.put(SALES_ADMIN);

        //When
        String role = evaluateRoles(roles);
        //Then
        assertEquals(DEVICES_ADMIN,role);
    }

    @Tag("security")
    @Test
    public void evaluateTekvizionRolesOverCustomerRolesTest(){
        //Given
        JSONArray roles = new JSONArray();
        roles.put(CONFIG_TESTER);
        roles.put(FULL_ADMIN);

        //When
        String role = evaluateRoles(roles);
        //Then
        assertEquals(FULL_ADMIN,role);
    }
}