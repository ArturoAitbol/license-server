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

class TekvLSCreateLicenseUsageDetailTest extends TekvLSTest {

    private final TekvLSCreateLicenseUsageDetail tekvLSCreateLicenseUsageDetail = new TekvLSCreateLicenseUsageDetail();
    private final TekvLSDeleteLicenseUsageById tekvLSDeleteLicenseUsageById = new TekvLSDeleteLicenseUsageById();

    private final String deviceId = "ef7a4bcd-fc3f-4f87-bf87-ae934799690b";
    private final String subaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
    private final String projectId = "2bdaf2af-838f-4053-b3fa-ef22aaa11b0d";
    private final String consumptionDate = "2022-06-19";
    private final String type = "Configuration";
    private final String usageDays = "[0,4]";
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
    public void noProjectTest() {
        //Given
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
    public void staticDeviceTest() {
        //Given
        String staticDeviceId ="c49a3148-1e74-4090-9876-d062011d9bcb";
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

        // When (Re-run the request to cover another scenario that requires a License Usage created beforehand)
        response = tekvLSCreateLicenseUsageDetail.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        actualStatus = response.getStatus();
        expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        body = (String) response.getBody();
        jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("id"));
        assertEquals(this.licenseUsageId,jsonBody.getString("id"));

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
    public void staticDeviceAndNoProjectParamTest() {
        //Given
        String staticDeviceId ="c49a3148-1e74-4090-9876-d062011d9bcb";
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

    @Tag("acceptance")
    @Test
    public void noUsageDaysParamTest() {
        //Given
        String usageDays = "[]";
        String macAddress = "01-0a-01-0a-02-0b";
        String serialNumber = "ABCDEFG000";
        String bodyRequest = "{ " +
                "'subaccountId': '"+subaccountId+"'," +
                "'projectId': '"+projectId+"'," +
                "'deviceId': '"+ deviceId +"'," +
                "'consumptionDate': '"+consumptionDate+"'," +
                "'type': '"+type+"'," +
                "'usageDays': "+usageDays+","+
                "'macAddress':'" + macAddress + "'," +
                "'serialNumber':'"+ serialNumber +"'}";
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

        assertTrue(jsonBody.has("macAddress"));
        assertEquals(macAddress,jsonBody.getString("macAddress"));

        assertTrue(jsonBody.has("serialNumber"));
        assertEquals(serialNumber,jsonBody.getString("serialNumber"));
    }

    @Test
    public void noUsageDaysAndInvalidMacAddressParamTest() {
        //Given
        String usageDays = "[]";
        int macAddress = 0;
        String serialNumber = "ABCDEFG000";

        String bodyRequest = "{ " +
                "'subaccountId': '"+subaccountId+"'," +
                "'projectId': '"+projectId+"'," +
                "'deviceId': '"+ deviceId +"'," +
                "'consumptionDate': '"+consumptionDate+"'," +
                "'type': '"+type+"'," +
                "'usageDays': "+usageDays+","+
                "'macAddress':" + macAddress + "," +
                "'serialNumber':'"+ serialNumber +"'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateLicenseUsageDetail.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));
    }

    @Test
    public void missingMandatoryParamTest() {
        //Given
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
    public void noBodyTest() {
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
    public void invalidBodyTest() {
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

    @Test
    public void noUsageDaysAndInvalidProjectIdParamTest() {
        //Given
        int projectId = 123456;
        String bodyRequest = "{ " +
                "'subaccountId': '"+subaccountId+"'," +
                "'projectId': "+projectId+"," +
                "'deviceId': '"+ deviceId +"'," +
                "'consumptionDate': '"+consumptionDate+"'," +
                "'type': '"+type+"'," +
                "'usageDays': "+usageDays+"}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateLicenseUsageDetail.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));
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
    public void invalidSQLTest(){
        //Given
        String subaccountId = "invalid-id";
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
}