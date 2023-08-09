package com.function;

import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;
import org.json.JSONObject;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doReturn;

public class TekvLSDeleteFeatureToggleExceptionTest extends TekvLSTest {

    private  final TekvLSCreateFeatureToggleException createFeatureToggleExceptionApi = new  TekvLSCreateFeatureToggleException();

    TekvLSDeleteFeatureToggleException deleteFeatureToggleExceptionApi = new TekvLSDeleteFeatureToggleException();
    private String featureToggleId = "EMPTY";
    @BeforeEach
    public void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));
        String bodyRequest = "{ 'featureToggleId' : d43815a7-8927-4c8d-a75f-49e080493827, 'subaccountId' : 96234b32-32d3-45a4-af26-4c912c0d6a06, 'status': false }";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        HttpResponseMessage response = this.createFeatureToggleExceptionApi.run(this.request, this.context);
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        this.featureToggleId = new JSONObject(response.getBody().toString()).getString("id");
    }

    @AfterEach
    void tearDown() {
        if (!this.featureToggleId.equals("EMPTY")) {
            this.initTestParameters();
            String bodyRequest = "{ 'featureToggleId' : d43815a7-8927-4c8d-a75f-49e080493827, 'subaccountId' : 96234b32-32d3-45a4-af26-4c912c0d6a06}";
            doReturn(Optional.of(bodyRequest)).when(request).getBody();
            this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));
            HttpResponseMessage response = deleteFeatureToggleExceptionApi.run(this.request, this.context);
            this.context.getLogger().info(response.getStatus().toString());
            this.featureToggleId = "EMPTY";

            HttpStatusType actualStatus = response.getStatus();
            HttpStatus expected = HttpStatus.OK;
            assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        }
    }


    @Test
    public void deleteFeatureToggleExceptionSuccessfullyTest() {
        //When - Action
        String bodyRequest = "{ 'featureToggleId' : d43815a7-8927-4c8d-a75f-49e080493827, 'subaccountId' : 96234b32-32d3-45a4-af26-4c912c0d6a06}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        HttpResponseMessage response = deleteFeatureToggleExceptionApi.run(this.request, this.context);

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void deleteFeatureToggleExceptionWithEmptyBodyTest() {
        //When - Action
        String bodyRequest = "";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        HttpResponseMessage response = deleteFeatureToggleExceptionApi.run(this.request, this.context);

        //Then - Assert
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

    @Test
    public void deleteFeatureToggleExceptionWithMissingMandatoryParamsTest() {
        //When - Action
        String bodyRequest = "{}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        HttpResponseMessage response = deleteFeatureToggleExceptionApi.run(this.request, this.context);

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected , actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Missing mandatory parameter: subaccountId";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void deleteFeatureToggleExceptionWithBadSubaccountIdTest() {
        //When - Action
        String bodyRequest = "{ 'featureToggleId' : d43815a7-8927-4c8d-a75f-49e080493827, 'subaccountId' : '1'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        HttpResponseMessage response = deleteFeatureToggleExceptionApi.run(this.request, this.context);

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void deleteFeatureToggleExceptionWithBadRequestTest() {
        //When - Action
        String bodyRequest = "{ 'featureToggleId : d43815a7-8927-4c8d-a75f-49e080493827, 'subaccountId' : '96234b32-32d3-45a4-af26-4c912c0d6a06'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        HttpResponseMessage response = deleteFeatureToggleExceptionApi.run(this.request, this.context);

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected , actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Expected a ':' after a key at 61 [character 62 line 1]";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }
}