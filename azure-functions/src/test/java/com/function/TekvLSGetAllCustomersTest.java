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

class TekvLSGetAllCustomersTest extends TekvLSTest {

    TekvLSGetAllCustomers getAllCustomersApi;

    @BeforeEach
    public void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
        this.getAllCustomersApi = new TekvLSGetAllCustomers();
    }

    @Tag("acceptance")
    @Test
    public void getAllcustomersTest() {
        //Given - Arrange
        String id = "EMPTY";

        //When - Action
        HttpResponseMessage response = getAllCustomersApi.run(this.request, id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("customers"));

        Object customers = jsonBody.get("customers");
        assertTrue(customers instanceof JSONArray);

        JSONArray customersArray = (JSONArray) customers;
        assertTrue(customersArray.length() > 0);
    }

    @Test
    public void getCustomerByIdTest() {
        //Given - Arrange
        String id = "9f6ff46a-5f19-4bcf-9f66-c5f29b800205";
        String expectedName = "Test Demo";

        //When - Action
        HttpResponseMessage response = getAllCustomersApi.run(this.request, id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("customers"));
        JSONArray customers = jsonBody.getJSONArray("customers");
        assertTrue(customers.length() > 0);

        JSONObject customer = (JSONObject) customers.get(0);
        String actualName = customer.getString("name");
        assertEquals(expectedName, actualName, "Actual name is not: ".concat(expectedName));
    }

    @Test
    public void distributorAdminRoleTest() {
        //Given - Arrange
        String id = "EMPTY";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("distributorAdmin"));

        //When - Action
        HttpResponseMessage response = getAllCustomersApi.run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("customers"));
    }

    @Test
    public void customerAdminRoleTest() {
        //Given - Arrange
        String id = "EMPTY";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));

        //When - Action
        HttpResponseMessage response = getAllCustomersApi.run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("customers"));
    }

    @Test
    public void unauthorizedTest() {
        //Given - Arrange
        String id = "EMPTY";
        this.headers.remove("authorization");

        //When - Action
        HttpResponseMessage response = getAllCustomersApi.run(this.request, id, this.context);
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
        HttpResponseMessage response = getAllCustomersApi.run(this.request, id, this.context);
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
    public void getAllCustomersInvalidTest() {
        //Given - Arrange
        String expectedId = "BASIC";

        //When - Action
        HttpResponseMessage response = getAllCustomersApi.run(this.request, expectedId, this.context);
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
        String expectedId = "00000000-0000-0000-0000";

        //When - Action
        HttpResponseMessage response = getAllCustomersApi.run(this.request, expectedId, this.context);
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
        HttpResponseMessage response = getAllCustomersApi.run(this.request, expectedId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }
}