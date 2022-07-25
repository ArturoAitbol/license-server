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

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;

class TekvLSModifyLicenseUsageByIdTest extends TekvLSTest {

    private final TekvLSModifyLicenseUsageById tekvLSModifyLicenseUsageById = new TekvLSModifyLicenseUsageById();
    private final TekvLSCreateLicenseUsageDetail tekvLSCreateLicenseUsageDetail = new TekvLSCreateLicenseUsageDetail();
    private final TekvLSDeleteLicenseUsageById tekvLSDeleteLicenseUsageById = new TekvLSDeleteLicenseUsageById();
    private final String licenseUsageId = "00ff2ae7-eeae-4740-b950-bb0518c66d8f";
    private final String deviceId = "ef7a4bcd-fc3f-4f87-bf87-ae934799690b";

    @BeforeEach
    void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));

        String bodyRequest = "{ " +
                "    'subaccountId': '31c142a6-b735-4bce-bfb4-9fba6b539116'," +
                "    'projectId': 'f8e757f4-a7d2-416d-80df-beefba44f88f'," +
                "    'deviceId': '"+ deviceId +"'," +
                "    'consumptionDate': '2022-06-19'," +
                "    'type': 'Configuration'," +
                "    'usageDays': [0,4]" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        HttpResponseMessage response = tekvLSCreateLicenseUsageDetail.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @AfterEach
    void tearDown(){
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
        HttpResponseMessage response = tekvLSDeleteLicenseUsageById.run(this.request,this.licenseUsageId,this.context);
        this.context.getLogger().info(response.getStatus().toString());
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Tag("acceptance")
    @Test
    public void modifyLicenseUsageTest(){
        //Given
        String body = "{'type': 'AutomationPlatform'}"; //original type: Configuration
        doReturn(Optional.of(body)).when(this.request).getBody();
        //When
        HttpResponseMessage response = tekvLSModifyLicenseUsageById.run(this.request,this.licenseUsageId,this.context);
        this.context.getLogger().info(response.getStatus().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Tag("acceptance")
    @Test
    public void modifyLicenseUsageDeviceParamTest(){
        //Given
        String body = "{ 'deviceId': '"+this.deviceId+"'," +
                        "'type': 'AutomationPlatform'}";
        doReturn(Optional.of(body)).when(this.request).getBody();

        //When
        HttpResponseMessage response = tekvLSModifyLicenseUsageById.run(this.request,this.licenseUsageId,this.context);
        this.context.getLogger().info(response.getStatus().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Tag("acceptance")
    @Test
    public void modifyLicenseUsageEmptyBodyTest(){
        //Given
        String body = "{}"; //original type: Configuration
        doReturn(Optional.of(body)).when(this.request).getBody();
        //When
        HttpResponseMessage response = tekvLSModifyLicenseUsageById.run(this.request,this.licenseUsageId,this.context);
        this.context.getLogger().info(response.getStatus().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void modifyLicenseUsageNoBodyTest(){
        //Given
        String bodyRequest = "";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSModifyLicenseUsageById.run(this.request,this.licenseUsageId,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = "error: request body is empty.";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void modifyLicenseUsageInvalidBodyTest(){
        //Given
        String newConsumptionDate = LocalDateTime.now().toString();
        String bodyRequest = "{'consumptionDate': '"+newConsumptionDate+"'";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSModifyLicenseUsageById.run(this.request,this.licenseUsageId,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));
    }

    @Tag("Security")
    @Test
    public void modifyLicenseUsageNoTokenTest(){
        //Given
        this.headers.remove("authorization");

        //When
        HttpResponseMessage response = tekvLSModifyLicenseUsageById.run(this.request,this.licenseUsageId,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.UNAUTHORIZED;
        assertEquals(expectedStatus, actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = RoleAuthHandler.MESSAGE_FOR_UNAUTHORIZED;
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("Security")
    @Test
    public void modifyLicenseUsageInvalidRoleTest(){
        //Given;
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));

        //When
        HttpResponseMessage response = tekvLSModifyLicenseUsageById.run(this.request,this.licenseUsageId,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.FORBIDDEN;
        assertEquals(expectedStatus, actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = RoleAuthHandler.MESSAGE_FOR_FORBIDDEN;
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void modifyLicenseUsageInvalidIdTest(){
        //Given
        String id = "invalid-id";
        String newConsumptionDate = LocalDateTime.now().toString();
        String bodyRequest = "{'consumptionDate': '"+newConsumptionDate+"'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        //When
        HttpResponseMessage response = tekvLSModifyLicenseUsageById.run(this.request,id,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualError = jsonBody.getString("error");
        assertTrue(actualError.contains("ERROR: invalid input syntax for type uuid"));
    }

    @Test
    public void modifyLicenseUsageGenericExceptionTest(){
        //Given
        String body = "{'type': 'AutomationPlatform' }"; //original type: Configuration
        doReturn(Optional.of(body)).when(this.request).getBody();
        doThrow(new RuntimeException("Error message")).when(this.request).createResponseBuilder(HttpStatus.OK);

        //When
        HttpResponseMessage response = tekvLSModifyLicenseUsageById.run(this.request,this.licenseUsageId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String responseBody = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(responseBody);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = "Error message";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));

        this.initTestParameters();
    }

}