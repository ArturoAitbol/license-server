package com.function;

import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;
import org.json.JSONObject;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import java.util.Optional;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.doReturn;

class TekvLSCreateCustomerTest extends TekvLSTest {

    private String customerId = "EMPTY";
    TekvLSCreateCustomer createCustomer = new TekvLSCreateCustomer();
    private final TekvLSDeleteCustomerById deleteCustomerById = new TekvLSDeleteCustomerById();
    @BeforeEach
    void setUp() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @AfterEach
    void tearDown() {
        if (!this.customerId.equals("EMPTY")) {
            HttpResponseMessage response = this.deleteCustomerById.run(this.request, this.customerId, this.context);
            this.context.getLogger().info(response.getStatus().toString());
            this.customerId = "EMPTY";

            HttpStatusType actualStatus = response.getStatus();
            HttpStatus expected = HttpStatus.OK;
            assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        }
    }
    @Test
    public void createCustomerTest() {
        //Given - Arrange
        String name = "customerTest" + LocalDateTime.now();
        String subAccountname = "customerSubAccountTest" + LocalDateTime.now();
        String bodyRequest = "{'customerName':'"+name+"','customerType':'MSP','customerAdminEmail':'"+name+"@hotmail.com', 'subaccountAdminEmail':'"+subAccountname+"@hotmail.com', 'test':'true'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createCustomer.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("id"));
        this.customerId = jsonBody.getString("id");
        assertNotNull(this.customerId);
    }

    @Test
    public void createCustomerWhitOptionalParamsTest() {
        String name = "customerTest" + LocalDateTime.now();
        String subAccountname = "customerSubAccountTest" + LocalDateTime.now();
        String bodyRequest = "{'distributorId':'f5ac1f7b-d93e-4872-bd5e-133c00d9e2bd','customerId':'6d9a055e-0435-4348-84b7-db8db243ac4c','customerName':'"+name+"','customerType':'MSP','customerAdminEmail':'"+name+"@hotmail.com','subaccountAdminEmail':'"+subAccountname+"@hotmail.com','test':'true'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createCustomer.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("id"));
        this.customerId = jsonBody.getString("id");
        assertNotNull(this.customerId);
    }

    @Test
    public void createCustomerIncomplete() {
        String bodyRequest = "{\n" +
        "    \"customerName\": \"customerTest\",\n" +
        "    \"customerType\": \"MSP\"\n" +
        "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        TekvLSCreateCustomer createCustomer = new TekvLSCreateCustomer();
        HttpResponseMessage response = createCustomer.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected , actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Missing mandatory parameter: test";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void createCustomerIncompleteWithoutAdminEmail() {
        String bodyRequest = "{\n" +
        "    \"customerName\": \"customerTest\",\n" +
        "    \"customerType\": \"MSP\",\n" +
        "    \"test\": \"true\"\n" +
        "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        TekvLSCreateCustomer createCustomer = new TekvLSCreateCustomer();
        HttpResponseMessage response = createCustomer.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected , actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Missing mandatory parameter: customerAdminEmail";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void createCustomerWithDuplicatedAdminEmailTest() {
        //Given - Arrange
        String name = "customerTest" + LocalDateTime.now();
        String subAccountname = "customerSubAccountTest" + LocalDateTime.now();
        String bodyRequest = "{'customerName':'" + name + "','customerType':'MSP','customerAdminEmail':'test-customer-full-admin@tekvizionlabs.com','subaccountAdminEmail':'"+subAccountname+"@hotmail.com', 'test':'true'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createCustomer.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Administrator email already exists";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void createEmptyBodyTest() {
        String bodyRequest = "";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        TekvLSCreateCustomer createCustomer = new TekvLSCreateCustomer();
        HttpResponseMessage response = createCustomer.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected , actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "error: request body is empty.";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("security")
    @Test
    public void createCustomerNoTokenTest() {
        this.headers.remove("authorization");
        HttpResponseMessage response = new TekvLSCreateCustomer().run(this.request, this.context);
        this.context.getLogger().info("HttpResponse: "+response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.UNAUTHORIZED;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String actualResponse = (String) response.getBody();

        String expectedResponse = "{\"error\":\"" + RoleAuthHandler.MESSAGE_FOR_UNAUTHORIZED + "\"}";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }
    @Test
    public void createCustomerWithoutJsonTest() {
        String bodyRequest = "test";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        TekvLSCreateCustomer createCustomer = new TekvLSCreateCustomer();
        HttpResponseMessage response = createCustomer.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void createCustomerExceptionTest() {
        String name = "customerTest" + LocalDateTime.now();
        String bodyRequest = "{'customerName':'"+name+"','customerType':'MSP','customerAdminEmail':'"+name+"@hotmail.com','test':'true'}";

        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        Mockito.doThrow(new RuntimeException("Generic error")).when(request).createResponseBuilder(HttpStatus.OK);

        TekvLSCreateCustomer createCustomer = new TekvLSCreateCustomer();
        HttpResponseMessage response = createCustomer.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected , actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        
        String expectedResponse = "SQL";
        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        String actualResponse = jsonBody.getString("error");
        assertFalse(actualResponse.contains(expectedResponse), "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void createCustomerSQLExceptionTest() {
        String name = "customerTest" + LocalDateTime.now();
        String subAccountname = "customerSubAccountTest" + LocalDateTime.now();
        String bodyRequest = "{'customerId':'xxxx','customerName':'"+name+"','customerType':'MSP','customerAdminEmail':'"+name+"@hotmail.com','subaccountAdminEmail':'"+subAccountname+"@hotmail.com', 'test':'true'}";

        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        Mockito.doThrow(new RuntimeException("Generic error")).when(request).createResponseBuilder(HttpStatus.OK);

        TekvLSCreateCustomer createCustomer = new TekvLSCreateCustomer();
        HttpResponseMessage response = createCustomer.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected , actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        
        String expectedResponse = "SQL";
        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        String actualResponse = jsonBody.getString("error");
        assertTrue(actualResponse.contains(expectedResponse), "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void duplicatedCustomerTest() {
        //Given - Arrange
        String name = "customerTest" + LocalDateTime.now();
        String subAccountname = "customerSubAccountTest" + LocalDateTime.now();
        String bodyRequest = "{'customerName':'"+name+"','customerType':'MSP','customerAdminEmail':'"+name+"@hotmail.com','subaccountAdminEmail':'"+subAccountname+"@hotmail.com', 'test':'true'}";

        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createCustomer.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        //Given - Arrange
        String newBodyRequest = "{'customerName':'"+name+"','customerType':'MSP','customerAdminEmail':'"+name+"1@hotmail.com','subaccountAdminEmail':'"+subAccountname+"@hotmail.com', 'test':'true'}";

        doReturn(Optional.of(newBodyRequest)).when(request).getBody();

        //When - Action
        response = createCustomer.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        actualStatus = response.getStatus();
        expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Customer already exists";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void forbiddenTest() {
        //Given - Arrange
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));
        String name = "customerTest" + LocalDateTime.now();
        String bodyRequest = "{'distributorId':'f5ac1f7b-d93e-4872-bd5e-133c00d9e2bd','customerId':'6d9a055e-0435-4348-84b7-db8db243ac4c','customerName':'"+name+"','customerType':'MSP','customerAdminEmail':'"+name+"@hotmail.com','test':'true'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createCustomer.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

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
}
