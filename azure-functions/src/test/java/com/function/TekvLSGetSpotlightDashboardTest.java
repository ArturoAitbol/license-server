package com.function;

import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import javax.management.relation.Role;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TekvLSGetSpotlightDashboardTest extends TekvLSTest {
    TekvLSGetSpotlightDashboard getSpotlightDashboardApi = new TekvLSGetSpotlightDashboard();

    private String id = "EMPTY";

    @BeforeEach
    public void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));
    }

//    @Test
//    public void getSpotlightDashboard() {
//        String subaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
//        HttpResponseMessage response = getSpotlightDashboardApi.run(this.request, subaccountId, this.context);
//        this.context.getLogger().info(response.getBody().toString());
//
//        HttpStatusType actualStatus = response.getStatus();
//        HttpStatus expected = HttpStatus.OK;
//        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
//    }

    @Test
    public void getSpotlightDashboardInvalidTest() {
        String subaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        HttpResponseMessage response = getSpotlightDashboardApi.run(this.request, subaccountId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

//    @Test
//    public void getSpotlightDashboardWithUnexistantId() {
//        String subaccountId = "9f6ff46a-5f19-4bcf-9f66-c5f29b800205";
//        HttpResponseMessage response = getSpotlightDashboardApi.run(this.request, subaccountId, this.context);
//        this.context.getLogger().info(response.getBody().toString());
//
//        HttpStatusType actualStatus = response.getStatus();
//        HttpStatus expected = HttpStatus.BAD_REQUEST;
//        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
//
//        String body = (String) response.getBody();
//        JSONObject jsonBody = new JSONObject(body);
//        assertTrue(jsonBody.has("error"));
//
//        String expectedMessage = RoleAuthHandler.MESSAGE_SUBACCOUNT_ID_NOT_FOUND;
//        assertEquals(expectedMessage,jsonBody.getString("error"));
//    }

    @Test
    public void getSpotlightDashboardWithEmptyId() {
        String subaccountId = "EMPTY";
        HttpResponseMessage response = getSpotlightDashboardApi.run(this.request, subaccountId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_SUBACCOUNT_ID_NOT_FOUND;
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }

    @Test
    public void getSpotlightDashboardWithMissingSubaccountId() {
        String subaccountId = "b5b91753-4c2b-43f5-afa0-feb00cefa981";
        HttpResponseMessage response = getSpotlightDashboardApi.run(this.request, subaccountId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_SUBACCOUNT_ID_NOT_FOUND;
        assertEquals(expectedMessage, jsonBody.getString("error"));
    }

    @Tag("security")
    @Test
    public void forbiddenTest(){
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("crm"));
        HttpResponseMessage response = getSpotlightDashboardApi.run(this.request, this.id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.FORBIDDEN;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = RoleAuthHandler.MESSAGE_FOR_FORBIDDEN;
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("security")
    @Test
    public void unauthorizedTest() {
        this.headers.remove("authorization");
        HttpResponseMessage response = getSpotlightDashboardApi.run(this.request, this.id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.UNAUTHORIZED;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = RoleAuthHandler.MESSAGE_FOR_UNAUTHORIZED;
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }
}
