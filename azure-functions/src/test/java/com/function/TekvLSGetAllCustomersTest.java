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
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TekvLSGetAllCustomersTest extends TekvLSTest {

    TekvLSGetAllCustomers getAllCustomersApi;
    private String id = "EMPTY";

    @BeforeEach
    public void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
        this.getAllCustomersApi = new TekvLSGetAllCustomers();
    }

    @Tag("acceptance")
    @Test
    public void getAllCustomersTest() {
        //Given - Arrange

        //When - Action
        HttpResponseMessage response = getAllCustomersApi.run(this.request, this.id, this.context);
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
    }

    @Test
    public void getAllCustomersByTypeTest() {
        //Given - Arrange
        String expectedType = "Reseller";
        this.queryParams.put("type", expectedType);

        //When - Action
        HttpResponseMessage response = getAllCustomersApi.run(this.request, this.id, this.context);
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
        String actualType = customer.getString("customerType");
        assertEquals(expectedType, actualType, "Actual customerType is not: ".concat(expectedType));
    }

    @Test
    public void getAllCustomersByNameTest() {
        //Given - Arrange
        String expectedName = "Test RealCustomer";
        this.queryParams.put("name", expectedName);

        //When - Action
        HttpResponseMessage response = getAllCustomersApi.run(this.request, this.id, this.context);
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
    public void getCustomerByIdTest() {
        //Given - Arrange
        this.id = "7d133fd2-8228-44ff-9636-1881f58f2dbb";
        String expectedName = "Test RealCustomer";

        //When - Action
        HttpResponseMessage response = getAllCustomersApi.run(this.request, this.id, this.context);
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
    public void getCustomerByIdWithoutDistributorIdTest() {
        //Given - Arrange
        this.id = "cb1b268a-850a-4459-8033-09854d9ac015";

        //When - Action
        HttpResponseMessage response = getAllCustomersApi.run(this.request, this.id, this.context);
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
        String expectedDistributorId = "";
        String actualDistributorId = customer.getString("distributorId");
        assertEquals(expectedDistributorId, actualDistributorId, "Actual name is not: ".concat(expectedDistributorId));
    }

    @Test
    public void distributorAdminRoleTest() {
        //Given - Arrange
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("distributorAdmin"));

        //When - Action
        HttpResponseMessage response = getAllCustomersApi.run(this.request, this.id, this.context);
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
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));

        //When - Action
        HttpResponseMessage response = getAllCustomersApi.run(this.request, this.id, this.context);
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
    public void subaccountAdminRoleTest() {
        //Given - Arrange
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));

        //When - Action
        HttpResponseMessage response = getAllCustomersApi.run(this.request, this.id, this.context);
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
        this.headers.remove("authorization");

        //When - Action
        HttpResponseMessage response = getAllCustomersApi.run(this.request, this.id, this.context);
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
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));

        //When - Action
        HttpResponseMessage response = getAllCustomersApi.run(this.request, this.id, this.context);
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
        String expectedId = "EMPTY";

        //When - Action
        HttpResponseMessage response = getAllCustomersApi.run(this.request, expectedId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        
        String expectedResponse = "SQL";
        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        String actualResponse = jsonBody.getString("error");
        assertFalse(actualResponse.contains(expectedResponse), "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void genericException2Test() {
        //Given - Arrange
        Mockito.when(this.context.getLogger()).thenReturn(TekvLSTest.logger).thenReturn(TekvLSTest.logger)
                .thenReturn(TekvLSTest.logger).thenThrow(new RuntimeException("Generic error")).thenReturn(TekvLSTest.logger);
        String expectedId = "xxxx";

        //When - Action
        HttpResponseMessage response = getAllCustomersApi.run(this.request, expectedId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        
        String expectedResponse = "SQL";
        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        String actualResponse = jsonBody.getString("error");
        assertTrue(actualResponse.contains(expectedResponse), "Response doesn't contain: ".concat(expectedResponse));
    }
}