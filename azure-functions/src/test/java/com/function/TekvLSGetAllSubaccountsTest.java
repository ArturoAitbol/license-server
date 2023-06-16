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

import java.util.Arrays;
import java.util.List;

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
    public void getAllSubaccountsTest() {
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

    @Tag("acceptance")
    @Test
    public void getSubaccountByIdTest() {
        //Given - Arrange
        String id = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c"; // Test customer - default
        String expectedName = "Test RealCustomer - 360 Small";

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
    public void getSubaccountByNonexistentIdTest() {
        //Given - Arrange
        String id = "00000000-0000-0000-0000-000000000000";

        //When - Action
        HttpResponseMessage response = getAllSubaccountsApi.run(this.request, id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_ID_NOT_FOUND;
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }

    @Tag("acceptance")
    @Test
    public void getSubaccountByCustomerIdTest() {
        //Given - Arrange
        String id = "EMPTY";
        String expectedCustomerId = "7d133fd2-8228-44ff-9636-1881f58f2dbb"; // Test customer
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

    @Tag("acceptance")
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

        JSONArray subaccounts = jsonBody.getJSONArray("subaccounts");
        assertEquals(4, subaccounts.length());

        String subaccountId;
        List<String> expectedSubaccounts = Arrays.asList("cebe6542-2032-4398-882e-ffb44ade169d","b5b91753-4c2b-43f5-afa0-feb00cefa981",
                                                        "96234b32-32d3-45a4-af26-4c912c0d6a06","8acb6997-4d6a-4427-ba2c-7bf463fa08ec");
        for (int i = 0; i < subaccounts.length();i++){
            subaccountId = subaccounts.getJSONObject(i).getString("id");
            assertTrue(expectedSubaccounts.contains(subaccountId),
                    "Subaccount not expected in response (id:" + subaccountId + ")");
        }
    }

    @Tag("acceptance")
    @Test
    public void distributorAdminRoleIncorrectIdTest() {
        //Given - Arrange
        String id = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("distributorAdmin"));

        //When - Action
        HttpResponseMessage response = getAllSubaccountsApi.run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_FOR_INVALID_ID;
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }



    @Tag("acceptance")
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

        JSONArray subaccounts = jsonBody.getJSONArray("subaccounts");
        assertTrue(subaccounts.length()>0);

        String expectedCustomerId = "7d133fd2-8228-44ff-9636-1881f58f2dbb";
        String actualCustomerId;
        JSONObject subaccount;
        for (int i = 0; i < subaccounts.length();i++){
            subaccount = subaccounts.getJSONObject(i);
            actualCustomerId = subaccount.getString("customerId");
            assertEquals(expectedCustomerId,actualCustomerId,
                    "Subaccount with customerId: "+ actualCustomerId +"not expected in response (id:" + subaccount.getString("id") + ")");
        }
    }

    @Tag("acceptance")
    @Test
    public void customerAdminRoleIncorrectIdTest() {
        //Given - Arrange
        String id = "cebe6542-2032-4398-882e-ffb44ade169d";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));

        //When - Action
        HttpResponseMessage response = getAllSubaccountsApi.run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_FOR_INVALID_ID;
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }

    @Tag("acceptance")
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

        JSONArray subaccounts = jsonBody.getJSONArray("subaccounts");
        assertEquals(1, subaccounts.length());

        JSONObject subaccount = subaccounts.getJSONObject(0);
        String expectedSubaccountId = "2c8e386b-d1bd-48b3-b73a-12bfa5d00805";
        assertEquals(expectedSubaccountId,subaccount.getString("id"));
    }

    @Tag("acceptance")
    @Test
    public void subaccountAdminRoleIncorrectIdTest() {
        //Given - Arrange
        String id = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));

        //When - Action
        HttpResponseMessage response = getAllSubaccountsApi.run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_FOR_INVALID_ID;
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }

    @Tag("security")
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
        String expectedId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";

        //When - Action
        HttpResponseMessage response = getAllSubaccountsApi.run(this.request, expectedId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Generic error";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }
    
    @Tag("acceptance")
    @Test
    public void subaccountStakeholderRoleTest() {
        //Given - Arrange
        String id = "EMPTY";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountStakeholder"));

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
        assertEquals(1, subaccounts.length());

        JSONObject subaccount = subaccounts.getJSONObject(0);
        String expectedSubaccountId = "2c8e386b-d1bd-48b3-b73a-12bfa5d00805";
        assertEquals(expectedSubaccountId,subaccount.getString("id"));
    }

    @Tag("acceptance")
    @Test
    public void subaccountStakeholderRoleIncorrectIdTest() {
        //Given - Arrange
        String id = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountStakeholder"));

        //When - Action
        HttpResponseMessage response = getAllSubaccountsApi.run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_FOR_INVALID_ID;
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }

    @Tag("acceptance")
    @Test
    public void getAllSubaccountsAdminTest() {
        //Given - Arrange
        String id = "2c8e386b-d1bd-48b3-b73a-12bfa5d00805";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));
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
    }
}
