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

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.doReturn;

class TekvLSCreateUsageDetailsTest extends TekvLSTest {

    TekvLSCreateUsageDetails createUsageDetailsApi = new TekvLSCreateUsageDetails();

    private final TekvLSCreateLicenseUsageDetail createLicenseUsageDetailApi = new TekvLSCreateLicenseUsageDetail();
    private final TekvLSDeleteLicenseUsageById deleteLicenseUsageApi = new TekvLSDeleteLicenseUsageById();
    private String consumptionId = "EMPTY";


    @BeforeEach
    public void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
        String bodyRequest = "{\n" +
                "    \"subaccountId\": \"f5a609c0-8b70-4a10-9dc8-9536bdb5652c\",\n" +
                "    \"projectId\": \"2bdaf2af-838f-4053-b3fa-ef22aaa11b0d\",\n" +
                "    \"deviceId\": \"c49a3148-1e74-4090-9876-d062011d9bcb\",\n" +
                "    \"consumptionDate\": \"2022-07-25\",\n" +
                "    \"type\": \"Configuration\",\n" +
                "    \"usageDays\":[0]\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        HttpResponseMessage response = this.createLicenseUsageDetailApi.run(this.request, this.context);
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        this.consumptionId = new JSONObject(response.getBody().toString()).getString("id");
    }

    @AfterEach
    void tearDown() {
        if (!this.consumptionId.equals("EMPTY")) {
            this.initTestParameters();
            this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
            HttpResponseMessage response = deleteLicenseUsageApi.run(this.request, this.consumptionId, this.context);
            this.context.getLogger().info(response.getStatus().toString());
            this.consumptionId = "EMPTY";

            HttpStatusType actualStatus = response.getStatus();
            HttpStatus expected = HttpStatus.OK;
            assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        }
    }

    @Test
    public void createUsageDetail() {
        //Given - Arrange
        String bodyRequest = "{\n" +
                "    \"addedDays\": [1,2],\n" +
                "    \"consumptionDate\": \"2022-07-25\"\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createUsageDetailsApi.run(this.request, this.consumptionId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        assertNotNull(this.consumptionId);
    }


    @Test
    public void incompleteBodyTest() {
        //Given - Arrange
        String bodyRequest = "{\n" +
                "    \"addedDays\": [],\n" +
                "    \"consumptionDate\": \"2022-07-25\"\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createUsageDetailsApi.run(this.request, this.consumptionId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Missing mandatory parameter: addedDays";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void invalidBodyTest() {
        //Given - Arrange
        String bodyRequest = "Something";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createUsageDetailsApi.run(this.request, this.consumptionId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "A JSONObject text must begin with '{' at 1 [character 2 line 1]";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void noBodyTest() {
        //Given - Arrange
        String bodyRequest = "";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createUsageDetailsApi.run(this.request, this.consumptionId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "error: request body is empty.";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void sqlExceptionTest() {
        //Given - Arrange
        String bodyRequest = "{\n" +
                "    \"addedDays\": [1,2],\n" +
                "    \"consumptionDate\": \"2022-07-25\"\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createUsageDetailsApi.run(this.request, "000", this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "ERROR: invalid input syntax for type uuid: \"000\"";
        String actualResponse = jsonBody.getString("error");
        assertTrue(actualResponse.contains(expectedResponse), "Response doesn't contain: ".concat(expectedResponse));
    }

    @Test
    public void genericExceptionTest() {
        //Given - Arrange
        String bodyRequest = "{\n" +
                "    \"addedDays\": [1,2],\n" +
                "    \"consumptionDate\": \"2022-07-25\"\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        Mockito.doThrow(new RuntimeException("Generic error")).when(request).createResponseBuilder(HttpStatus.OK);

        //When - Action
        HttpResponseMessage response = createUsageDetailsApi.run(this.request, this.consumptionId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Generic error";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void unauthorizedTest() {
        this.headers.remove("authorization");
        //Given - Arrange
        String bodyRequest = "";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createUsageDetailsApi.run(this.request, this.consumptionId, this.context);
        this.context.getLogger().info(response.getBody().toString());

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
        this.headers.remove("authorization");
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));
        //Given - Arrange
        String bodyRequest = "";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createUsageDetailsApi.run(this.request, this.consumptionId, this.context);
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