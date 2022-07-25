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

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;

class TekvLSCreateLicenseUsageDetailTest extends TekvLSTest {

    private final TekvLSCreateLicenseUsageDetail tekvLSCreateLicenseUsageDetail = new TekvLSCreateLicenseUsageDetail();
    private final TekvLSDeleteLicenseUsageById tekvLSDeleteLicenseUsageById = new TekvLSDeleteLicenseUsageById();
    private final String deviceId = "ef7a4bcd-fc3f-4f87-bf87-ae934799690b";
    private String licenseUsageId = "EMPTY";

    @BeforeEach
    void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @AfterEach
    void tearDown() {
        if (!this.licenseUsageId.equals("EMPTY")){
            HttpResponseMessage response = tekvLSDeleteLicenseUsageById.run(this.request, this.licenseUsageId, this.context);
            this.context.getLogger().info(response.getStatus().toString());
            this.licenseUsageId = "EMPTY";

            HttpStatusType actualStatus = response.getStatus();
            HttpStatus expected = HttpStatus.OK;
            assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
        }
    }

    @Tag("acceptance")
    @Test
    public void createLicenseUsageDetailTest() {
        //Given
        String subaccountId = "31c142a6-b735-4bce-bfb4-9fba6b539116";
        String projectId = "f8e757f4-a7d2-416d-80df-beefba44f88f";
        String consumptionDate = "2022-06-19";
        String type = "Configuration";
        String usageDays = "[0,4]";

        String bodyRequest = "{ " +
                "    'subaccountId': '"+subaccountId+"'," +
                "    'projectId': '"+projectId+"'," +
                "    'deviceId': '"+ deviceId +"'," +
                "    'consumptionDate': '"+consumptionDate+"'," +
                "    'type': '"+type+"'," +
                "    'usageDays': "+usageDays+" }";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateLicenseUsageDetail.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("id"));
        this.licenseUsageId = jsonBody.getString("id");
        assertNotNull(this.licenseUsageId);

        assertTrue(jsonBody.has("consumptionDate"));
        assertEquals(consumptionDate, jsonBody.getString("consumptionDate"));

        assertTrue(jsonBody.has("subaccountId"));
        assertEquals(subaccountId,jsonBody.getString("subaccountId"));

        assertTrue(jsonBody.has("usageDays"));
        assertEquals(usageDays,jsonBody.get("usageDays").toString());

        assertTrue(jsonBody.has("type"));
        assertEquals(type,jsonBody.getString("type"));

        assertTrue(jsonBody.has("projectId"));
        assertEquals(projectId,jsonBody.getString("projectId"));

        assertTrue(jsonBody.has("deviceId"));
        assertEquals(deviceId,jsonBody.getString("deviceId"));
    }

    @Tag("acceptance")
    @Test
    public void createLicenseUsageDetailNoProjectTest() {
        //Given
        String subaccountId = "31c142a6-b735-4bce-bfb4-9fba6b539116";
        String consumptionDate = "2022-06-19";
        String type = "Configuration";
        String usageDays = "[0,4]";

        String bodyRequest = "{ " +
                "    'subaccountId': '"+subaccountId+"'," +
                "    'deviceId': '"+ deviceId +"'," +
                "    'consumptionDate': '"+consumptionDate+"'," +
                "    'type': '"+type+"'," +
                "    'usageDays': "+usageDays+" }";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateLicenseUsageDetail.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("id"));
        this.licenseUsageId = jsonBody.getString("id");
        assertNotNull(this.licenseUsageId);

        assertTrue(jsonBody.has("consumptionDate"));
        assertEquals(consumptionDate, jsonBody.getString("consumptionDate"));

        assertTrue(jsonBody.has("subaccountId"));
        assertEquals(subaccountId,jsonBody.getString("subaccountId"));

        assertTrue(jsonBody.has("usageDays"));
        assertEquals(usageDays,jsonBody.get("usageDays").toString());

        assertTrue(jsonBody.has("type"));
        assertEquals(type,jsonBody.getString("type"));

        assertTrue(jsonBody.has("deviceId"));
        assertEquals(deviceId,jsonBody.getString("deviceId"));
    }

    @Tag("acceptance")
    @Test
    public void createLicenseUsageDetailStaticDeviceTest() {
        //Given
        String staticDeviceId ="c49a3148-1e74-4090-9876-d062011d9bcb";
        String subaccountId = "31c142a6-b735-4bce-bfb4-9fba6b539116";
        String projectId = "f8e757f4-a7d2-416d-80df-beefba44f88f";
        String consumptionDate = "2022-06-19";
        String type = "Configuration";
        String usageDays = "[0,4]";

        String bodyRequest = "{ " +
                "    'subaccountId': '"+subaccountId+"'," +
                "    'projectId': '"+projectId+"'," +
                "    'deviceId': '"+ staticDeviceId +"'," +
                "    'consumptionDate': '"+consumptionDate+"'," +
                "    'type': '"+type+"'," +
                "    'usageDays': "+usageDays+" }";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateLicenseUsageDetail.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("id"));

        this.licenseUsageId = jsonBody.getString("id");
        assertNotNull(this.licenseUsageId);

        assertTrue(jsonBody.has("consumptionDate"));
        assertEquals(consumptionDate, jsonBody.getString("consumptionDate"));

        assertTrue(jsonBody.has("subaccountId"));
        assertEquals(subaccountId,jsonBody.getString("subaccountId"));

        assertTrue(jsonBody.has("usageDays"));
        assertEquals(usageDays,jsonBody.get("usageDays").toString());

        assertTrue(jsonBody.has("type"));
        assertEquals(type,jsonBody.getString("type"));

        assertTrue(jsonBody.has("projectId"));
        assertEquals(projectId,jsonBody.getString("projectId"));

        assertTrue(jsonBody.has("deviceId"));
        assertEquals(staticDeviceId,jsonBody.getString("deviceId"));
    }

    @Tag("acceptance")
    @Test
    public void createLicenseUsageDetailStaticDeviceAndNoProjectTest() {
        //Given
        String staticDeviceId ="c49a3148-1e74-4090-9876-d062011d9bcb";
        String subaccountId = "31c142a6-b735-4bce-bfb4-9fba6b539116";
        String consumptionDate = "2022-06-19";
        String type = "Configuration";
        String usageDays = "[0,4]";

        String bodyRequest = "{ " +
                "    'subaccountId': '"+subaccountId+"'," +
                "    'deviceId': '"+ staticDeviceId +"'," +
                "    'consumptionDate': '"+consumptionDate+"'," +
                "    'type': '"+type+"'," +
                "    'usageDays': "+usageDays+" }";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateLicenseUsageDetail.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("id"));

        this.licenseUsageId = jsonBody.getString("id");
        assertNotNull(this.licenseUsageId);

        assertTrue(jsonBody.has("consumptionDate"));
        assertEquals(consumptionDate, jsonBody.getString("consumptionDate"));

        assertTrue(jsonBody.has("subaccountId"));
        assertEquals(subaccountId,jsonBody.getString("subaccountId"));

        assertTrue(jsonBody.has("usageDays"));
        assertEquals(usageDays,jsonBody.get("usageDays").toString());

        assertTrue(jsonBody.has("type"));
        assertEquals(type,jsonBody.getString("type"));

        assertTrue(jsonBody.has("deviceId"));
        assertEquals(staticDeviceId,jsonBody.getString("deviceId"));
    }

    @Test
    public void createLicenseUsageDetailMissingMandatoryParamTest() {
        //Given
        String projectId = "f8e757f4-a7d2-416d-80df-beefba44f88f";
        String consumptionDate = "2022-06-19";
        String type = "Configuration";
        String usageDays = "[0,4]";

        String bodyRequest = "{ " +
                "    'projectId': '"+projectId+"'," +
                "    'deviceId': '"+ deviceId +"'," +
                "    'consumptionDate': '"+consumptionDate+"'," +
                "    'type': '"+type+"'," +
                "    'usageDays': "+usageDays+" }";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateLicenseUsageDetail.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = "Missing mandatory parameter: subaccountId";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }


    @Test
    public void createLicenseUsageNoBodyDetail() {
        //Given
        String bodyRequest = "";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateLicenseUsageDetail.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedResponse = "error: request body is empty.";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void createLicenseUsageInvalidBodyDetail() {
        //Given
        String bodyRequest = "invalid-body";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateLicenseUsageDetail.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedResponse = "A JSONObject text must begin with '{' at 1 [character 2 line 1]";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("Security")
    @Test
    public void createLicenseUsageNoTokenTest(){
        //Given
        this.headers.remove("authorization");

        //When
        HttpResponseMessage response = tekvLSCreateLicenseUsageDetail.run(this.request,this.context);
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
    public void createLicenseUsageInvalidRoleTest(){
        //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));

        //When
        HttpResponseMessage response = tekvLSCreateLicenseUsageDetail.run(this.request,this.context);
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
    public void createLicenseUsageInvalidSQLTest(){
        //Given
        String subaccountId = "invalid-id";
        String projectId = "f8e757f4-a7d2-416d-80df-beefba44f88f";
        String consumptionDate = "2022-06-19";
        String type = "Configuration";
        String usageDays = "[0,4]";

        String bodyRequest = "{ " +
                "    'subaccountId': '"+subaccountId+"'," +
                "    'projectId': '"+projectId+"'," +
                "    'deviceId': '"+ deviceId +"'," +
                "    'consumptionDate': '"+consumptionDate+"'," +
                "    'type': '"+type+"'," +
                "    'usageDays': "+usageDays+" }";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateLicenseUsageDetail.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void createLicenseUsageGenericExceptionTest(){
        //Given
        String subaccountId = "invalid-id";
        String projectId = "f8e757f4-a7d2-416d-80df-beefba44f88f";
        String consumptionDate = "2022-06-19";
        String type = "Configuration";
        String usageDays = "[0,4]";

        String bodyRequest = "{ " +
                "    'subaccountId': '"+subaccountId+"'," +
                "    'projectId': '"+projectId+"'," +
                "    'deviceId': '"+ deviceId +"'," +
                "    'consumptionDate': '"+consumptionDate+"'," +
                "    'type': '"+type+"'," +
                "    'usageDays': "+usageDays+" }";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        doThrow(new RuntimeException("Error message")).when(this.request).createResponseBuilder(HttpStatus.OK);

        //When
        HttpResponseMessage response = tekvLSCreateLicenseUsageDetail.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = "Error message";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));

        this.initTestParameters();
    }
}