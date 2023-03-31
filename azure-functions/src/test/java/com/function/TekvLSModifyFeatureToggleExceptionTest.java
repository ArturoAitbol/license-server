package com.function;

import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.doReturn;

class TekvLSModifyFeatureToggleExceptionTest extends TekvLSTest {

    TekvLSModifyFeatureToggleException modifyFeatureToggleExceptionApi = new TekvLSModifyFeatureToggleException();

    private final String featureToggleId = "df6f5bc2-2687-49df-8dc0-beff88012235";
    private final String subaccountId = "96234b32-32d3-45a4-af26-4c912c0d6a06";

    @BeforeEach
    void setUp() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));
    }

    @Test
    public void modifyFeatureToggleExceptionTest() {
        //Given - Arrange
        String bodyRequest = "{\n" +
                "    \"featureToggleId\": \""+ this.featureToggleId +"\",\n" +
                "    \"subaccountId\": \"" + this.subaccountId + "\",\n" +
                "    \"status\": false\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = modifyFeatureToggleExceptionApi.run(this.request, this.context);

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void missingParamTest() {
        //Given - Arrange
        String bodyRequest = "{\n" +
                "    \"subaccountId\": \"" + this.subaccountId + "\",\n" +
                "    \"status\": false\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = modifyFeatureToggleExceptionApi.run(this.request, this.context);

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Missing mandatory parameter: featureToggleId";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void emptyBodyTest() {
        //Given - Arrange
        String bodyRequest = "";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = modifyFeatureToggleExceptionApi.run(this.request, this.context);

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
    public void invalidBodyTest() {
        //Given - Arrange
        String bodyRequest = "Something";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = modifyFeatureToggleExceptionApi.run(this.request, this.context);

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
    public void sqlExceptionTest() {
        //Given - Arrange
        String bodyRequest = "{\n" +
                "    \"featureToggleId\": \"0\",\n" +
                "    \"subaccountId\": \"" + this.subaccountId + "\",\n" +
                "    \"status\": false\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = modifyFeatureToggleExceptionApi.run(this.request, this.context);

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void genericExceptionTest() {
        //Given - Arrange
        String bodyRequest = "{\n" +
                "    \"featureToggleId\": \""+ this.featureToggleId +"\",\n" +
                "    \"subaccountId\": \"" + this.subaccountId + "\",\n" +
                "    \"status\": false\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        Mockito.doThrow(new RuntimeException("Generic error")).when(request).createResponseBuilder(HttpStatus.OK);

        //When - Action
        HttpResponseMessage response = modifyFeatureToggleExceptionApi.run(this.request, this.context);

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

    @Test
    public void unauthorizedTest() {
        //Given - Arrange
        String bodyRequest = "{\n" +
                "    \"featureToggleId\": \""+ this.featureToggleId +"\",\n" +
                "    \"subaccountId\": \"" + this.subaccountId + "\",\n" +
                "    \"status\": false\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        this.headers.remove("authorization");
        //When - Action
        HttpResponseMessage response = modifyFeatureToggleExceptionApi.run(this.request, this.context);

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
        String bodyRequest = "{\n" +
                "    \"featureToggleId\": \""+ this.featureToggleId +"\",\n" +
                "    \"subaccountId\": \"" + this.subaccountId + "\",\n" +
                "    \"status\": false\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        this.headers.remove("authorization");
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountStakeholder"));
        //When - Action
        HttpResponseMessage response = modifyFeatureToggleExceptionApi.run(this.request, this.context);

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
