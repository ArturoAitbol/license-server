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

    @Tag("acceptance")
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

    @Tag("acceptance")
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

    @Tag("acceptance")
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

    @Tag("acceptance")
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

    @Tag("acceptance")
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

        JSONArray customers = jsonBody.getJSONArray("customers");
        assertEquals(3, customers.length());

        String customerId;
        List<String> expectedCustomers = Arrays.asList("9f6ff46a-5f19-4bcf-9f66-c5f29b800205",
                                                        "f1b695b5-b7d9-4245-86ca-9a2a9ccbe460", "b995ecaa-d64e-4067-90e5-cbc80935d1e0");
        for (int i = 0; i < customers.length();i++){
            customerId = customers.getJSONObject(i).getString("id");
            assertTrue(expectedCustomers.contains(customerId),
                    "Subaccount not expected in response (id:" + customerId + ")");
        }
    }

    @Tag("acceptance")
    @Test
    public void distributorAdminRoleGetCustomerByIdTest() {
        //Given - Arrange
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("distributorAdmin"));
        this.id = "9f6ff46a-5f19-4bcf-9f66-c5f29b800205";
        String expectedName = "Test Distributor";

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

    @Tag("security")
    @Test
    public void distributorAdminRoleIncorrectIdTest() {
        //Given - Arrange
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("distributorAdmin"));
        this.id = "7d133fd2-8228-44ff-9636-1881f58f2dbb";

        //When - Action
        HttpResponseMessage response = getAllCustomersApi.run(this.request, this.id, this.context);
        this.context.getLogger().info(response.getBody().toString());

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

        JSONArray customers = jsonBody.getJSONArray("customers");
        assertEquals(1,customers.length());

        JSONObject customer = customers.getJSONObject(0);
        String expectedCustomerId = "7d133fd2-8228-44ff-9636-1881f58f2dbb";
        assertEquals(expectedCustomerId,customer.getString("id"));

    }

    @Tag("acceptance")
    @Test
    public void customerAdminRoleGetCustomerByIdTest() {
        //Given - Arrange
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));
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

    @Tag("security")
    @Test
    public void customerAdminRoleIncorrectIdTest() {
        //Given - Arrange
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));
        this.id = "9f6ff46a-5f19-4bcf-9f66-c5f29b800205";

        //When - Action
        HttpResponseMessage response = getAllCustomersApi.run(this.request, this.id, this.context);
        this.context.getLogger().info(response.getBody().toString());

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

        JSONArray customers = jsonBody.getJSONArray("customers");
        assertEquals(1,customers.length());

        JSONObject customer = customers.getJSONObject(0);
        String expectedCustomerId = "f1b695b5-b7d9-4245-86ca-9a2a9ccbe460";
        assertEquals(expectedCustomerId,customer.getString("id"));
    }

    @Tag("acceptance")
    @Test
    public void subaccountAdminRoleGetCustomerByIdTest() {
        //Given - Arrange
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));
        this.id = "f1b695b5-b7d9-4245-86ca-9a2a9ccbe460";
        String expectedName = "Test Subaccount";

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

    @Tag("security")
    @Test
    public void subaccountAdminRoleIncorrectIdTest() {
        //Given - Arrange
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));
        this.id = "9f6ff46a-5f19-4bcf-9f66-c5f29b800205";

        //When - Action
        HttpResponseMessage response = getAllCustomersApi.run(this.request, this.id, this.context);
        this.context.getLogger().info(response.getBody().toString());

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

    @Tag("security")
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
    public void getCustomerByNonexistentIdTest() {
        //Given - Arrange
        this.id = "00000000-0000-0000-0000-000000000000";

        //When - Action
        HttpResponseMessage response = getAllCustomersApi.run(this.request, this.id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedResponse = RoleAuthHandler.MESSAGE_ID_NOT_FOUND;
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
}