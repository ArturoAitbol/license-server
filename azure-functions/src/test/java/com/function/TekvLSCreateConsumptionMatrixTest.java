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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.doReturn;

class TekvLSCreateConsumptionMatrixTest extends TekvLSTest {


    TekvLSCreateConsumptionMatrix createConsumptionMatrixApi = new TekvLSCreateConsumptionMatrix();
    private String consumptionMatrixEntryId = "EMPTY";
    private String bodyRequest = "";

    @BeforeEach
    void setUp() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));
    }

    @AfterEach
    void tearDown() {
        if(!this.consumptionMatrixEntryId.equals("EMPTY")) {
            TekvLSDeleteConsumptionMatrixById deleteConsumptionMatrixById = new TekvLSDeleteConsumptionMatrixById();
            HttpResponseMessage response = deleteConsumptionMatrixById.run(this.request, this.consumptionMatrixEntryId, this.context);
            this.context.getLogger().info(response.getStatus().toString());
            this.consumptionMatrixEntryId = "EMPTY";

            HttpStatusType actualStatus = response.getStatus();
            HttpStatus expected = HttpStatus.OK;
            assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        }
    }

    @Test
    public void createConsumptionMatrix() {
        //Given
        this.bodyRequest = "{\n" +
                "            \"tokens\": \"2\",\n" +
                "            \"dutType\": \"Device/Phone/ATA\",\n" +
                "            \"callingPlatform\": \"CCaaS\"\n" +
                "        }";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = this.createConsumptionMatrixApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("id"));

        this.consumptionMatrixEntryId = jsonBody.getString("id");
        assertNotNull(this.consumptionMatrixEntryId);
    }

    @Test
    public void missingMandatoryParameterTest() {
        //Given
        this.bodyRequest = "{\n" +
                "            \"dutType\": \"Device/Phone/ATA\",\n" +
                "            \"callingPlatform\": \"CCaaS\"\n" +
                "        },";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = this.createConsumptionMatrixApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected , actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Missing mandatory parameter: tokens";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void invalidBodyTest() {
        //Given
        this.bodyRequest = "test";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();
        //When
        HttpResponseMessage response = this.createConsumptionMatrixApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());
        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void emptyBodyTest() {
        //Given
        this.bodyRequest = "";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = this.createConsumptionMatrixApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
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
    public void noTokenTest() {
        //Given
        this.headers.remove("authorization");

        //When
        HttpResponseMessage response = this.createConsumptionMatrixApi.run(this.request, this.context);
        this.context.getLogger().info("HttpResponse: "+response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.UNAUTHORIZED;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String actualResponse = (String) response.getBody();
        String expectedResponse = "{\"error\":\"" + RoleAuthHandler.MESSAGE_FOR_UNAUTHORIZED + "\"}";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("security")
    @Test
    public void invalidRoleTest() {
        //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("crm"));

        //When
        HttpResponseMessage response = this.createConsumptionMatrixApi.run(this.request, this.context);
        this.context.getLogger().info("HttpResponse: "+response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.FORBIDDEN;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String actualResponse = (String) response.getBody();
        String expectedResponse = "{\"error\":\"" + RoleAuthHandler.MESSAGE_FOR_FORBIDDEN + "\"}";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void genericExceptionTest() {
        //Given
        this.bodyRequest = "{\n" +
                "            \"tokens\": \"2\",\n" +
                "            \"dutType\": \"Device/Phone/ATA\",\n" +
                "            \"callingPlatform\": \"CCaaS\"\n" +
                "        },'";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();
        Mockito.doThrow(new RuntimeException("Generic error")).when(request).createResponseBuilder(HttpStatus.OK);
        //When
        HttpResponseMessage response = this.createConsumptionMatrixApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());
        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected , actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void SqlExceptionTest() {
        //Given
        this.bodyRequest = "{\n" +
                "            \"tokens\": \"2\",\n" +
                "            \"dutType\": \"Invalid\",\n" +
                "            \"callingPlatform\": \"CCaaS\"\n" +
                "        },'";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();
        Mockito.doThrow(new RuntimeException("Generic error")).when(request).createResponseBuilder(HttpStatus.OK);
        //When
        HttpResponseMessage response = this.createConsumptionMatrixApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());
        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected , actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

}
