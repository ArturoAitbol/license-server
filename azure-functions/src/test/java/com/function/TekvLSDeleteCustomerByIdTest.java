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
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doReturn;

class TekvLSDeleteCustomerByIdTest extends TekvLSTest {

    TekvLSDeleteCustomerById deleteCustomerApi = new TekvLSDeleteCustomerById();

    private final TekvLSCreateCustomer createCustomerApi = new TekvLSCreateCustomer();
    private String customerId = "EMPTY";

    @BeforeEach
    public void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @AfterEach
    void tearDown() {
        if (!this.customerId.equals("EMPTY")) {
            this.initTestParameters();
            this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
            HttpResponseMessage response = deleteCustomerApi.run(this.request, this.customerId, this.context);
            this.context.getLogger().info(response.getStatus().toString());
            this.customerId = "EMPTY";

            HttpStatusType actualStatus = response.getStatus();
            HttpStatus expected = HttpStatus.OK;
            assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        }
    }

    private void createTestCustomer() {
        String name = "test_customer" + LocalDateTime.now();
        String subAccountname = "customerSubAccountTest" + LocalDateTime.now();
        String bodyRequest = "{'customerName':'"+name+"','customerType':'MSP','customerAdminEmail':'"+name+"@hotmail.com', 'subaccountAdminEmail':'"+subAccountname+"@hotmail.com', 'test':'true'}";

        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        HttpResponseMessage response = this.createCustomerApi.run(this.request, context);
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        this.customerId = new JSONObject(response.getBody().toString()).getString("id");
    }


    @Test
    public void deleteCustomerTest() {
        createTestCustomer();

        //When - Action
        HttpResponseMessage response = this.deleteCustomerApi.run(this.request, this.customerId, this.context);

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        this.customerId = "EMPTY";
    }

    @Test
    public void forceDeleteCustomerTest() {
        this.queryParams.put("force", "true");
        String customerId = "0b1ef03f-98d8-4fa3-8f9f-6b0013ce5848";

        //When - Action
        HttpResponseMessage response = this.deleteCustomerApi.run(this.request, customerId, this.context);

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void deleteRealCustomerTest() {
        String customerId = "0856df81-8d32-4adb-941a-c0d9187f36a7";

        //When - Action
        HttpResponseMessage response = this.deleteCustomerApi.run(this.request, customerId, this.context);

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        this.customerId = "EMPTY";
    }

    @Test
    public void invalidIdTest() {
        //When - Action
        HttpResponseMessage response = deleteCustomerApi.run(this.request, "0", this.context);

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "ERROR: invalid input syntax for type uuid: \"0\"";
        String actualResponse = jsonBody.getString("error");
        assertTrue(actualResponse.contains(expectedResponse), "Response doesn't contain: ".concat(expectedResponse));
    }

    @Test
    public void unauthorizedTest() {
        //Given - Arrange
        this.headers.remove("authorization");
        //When - Action
        HttpResponseMessage response = deleteCustomerApi.run(this.request, this.customerId, this.context);

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
        this.headers.remove("authorization");
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));
        //When - Action
        HttpResponseMessage response = deleteCustomerApi.run(this.request, this.customerId, this.context);

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
    public void genericExceptionTest() {
        createTestCustomer();

        //Given - Arrange
        Mockito.doThrow(new RuntimeException("Generic error")).when(request).createResponseBuilder(HttpStatus.OK);

        //When - Action
        HttpResponseMessage response = deleteCustomerApi.run(this.request, this.customerId, this.context);
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
        this.customerId = "EMPTY";
    }
}