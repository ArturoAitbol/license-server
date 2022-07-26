package com.function;

import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TekvLSGetAllSubaccountsTest extends TekvLSTest {

    TekvLSGetAllSubaccounts getAllSubaccountsApi;

    @BeforeEach
    public void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
        this.getAllSubaccountsApi = new TekvLSGetAllSubaccounts();
    }

    @Tag("acceptance")
    @Test
    public void getAllsubaccountsTest() {
        //Given - Arrange
        String id = "EMPTY";

        //When - Action
        HttpResponseMessage response = getAllSubaccountsApi.run(this.request, id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("subaccounts"));

        Object subaccounts = jsonBody.get("subaccounts");
        assertTrue(subaccounts instanceof JSONArray);

        JSONArray subaccountsArray = (JSONArray) subaccounts;
        assertTrue(subaccountsArray.length() > 0);

        JSONObject device = subaccountsArray.getJSONObject(0);
        assertTrue(device.has("name"));
        assertTrue(device.has("id"));
        assertTrue(device.has("customerId"));
    }

    @Test
    public void getSubaccountByIdTest() {
        //Given - Arrange
        String id = "d45db408-6ceb-4218-bd36-6355e0e21bfb"; // Test customer - default
        String expectedName = "Default";

        //When - Action
        HttpResponseMessage response = getAllSubaccountsApi.run(this.request, id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("subaccounts"));
        JSONArray subaccounts = jsonBody.getJSONArray("subaccounts");
        assertTrue(subaccounts.length() > 0);

        JSONObject subaccount = (JSONObject) subaccounts.get(0);
        String actualName = subaccount.getString("name");
        assertEquals(expectedName, actualName, "Actual name is not: ".concat(expectedName));
    }

    @Test
    public void getDevicesByCustomerIdTest() {
        //Given - Arrange
        String id = "EMPTY";
        String expectedCustomerId = "740162ed-3abe-4f89-89ef-452e3c0787e2"; // Test customer
        this.queryParams.put("customer-id", expectedCustomerId);

        //When - Action
        HttpResponseMessage response = getAllSubaccountsApi.run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("subaccounts"));
        JSONArray subaccounts = jsonBody.getJSONArray("subaccounts");
        assertTrue(subaccounts.length() > 0);

        JSONObject subaccount = (JSONObject) subaccounts.get(0);
        String actualCustomerId = subaccount.getString("customerId");
        assertEquals(expectedCustomerId, actualCustomerId, "Actual customer ID is not: ".concat(expectedCustomerId));
    }

    @Test
    public void distributorAdminRoleTest() {
        //Given - Arrange
        String id = "EMPTY";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("distributorAdmin"));

        //When - Action
        HttpResponseMessage response = getAllSubaccountsApi.run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("subaccounts"));
    }

    @Test
    public void customerAdminRoleTest() {
        //Given - Arrange
        String id = "EMPTY";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));

        //When - Action
        HttpResponseMessage response = getAllSubaccountsApi.run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("subaccounts"));
    }

    @Test
    public void subaccountAdminRoleTest() {
        //Given - Arrange
        String id = "EMPTY";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));

        //When - Action
        HttpResponseMessage response = getAllSubaccountsApi.run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("subaccounts"));
    }

    @Test
    public void unauthorizedTest() {
        //Given - Arrange
        String id = "EMPTY";
        this.headers.remove("authorization");

        //When - Action
        HttpResponseMessage response = getAllSubaccountsApi.run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

        //Then - Assert
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

    @Test
    public void forbiddenTest() {
        //Given - Arrange
        String id = "EMPTY";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));

        //When - Action
        HttpResponseMessage response = getAllSubaccountsApi.run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

        //Then - Assert
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

    @Test
    public void getAllSubaccountsInvalidTest() {
        //Given - Arrange
        String expectedId = "BASIC";

        //When - Action
        HttpResponseMessage response = getAllSubaccountsApi.run(this.request, expectedId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void genericExceptionTest() {
        //Given - Arrange
        Mockito.when(this.request.createResponseBuilder(HttpStatus.OK)).thenThrow(new RuntimeException("Generic error"));
        String expectedId = "00000000-0000-0000-0000-000000000000";

        //When - Action
        HttpResponseMessage response = getAllSubaccountsApi.run(this.request, expectedId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void genericException2Test() {
        //Given - Arrange
        Mockito.when(this.context.getLogger()).thenReturn(TekvLSTest.logger).thenReturn(TekvLSTest.logger)
                .thenReturn(TekvLSTest.logger).thenThrow(new RuntimeException("Generic error")).thenReturn(TekvLSTest.logger);
        String expectedId = "00000000-0000-0000-0000-000000000000";

        //When - Action
        HttpResponseMessage response = getAllSubaccountsApi.run(this.request, expectedId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }
}