package com.function;

import org.json.JSONObject;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.doReturn;

import java.util.Optional;

import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;

public class TekvLSCreateNewConsumptionEventTest extends TekvLSTest {

    private final TekvLSCreateNewConsumptionEvent tekvLSCreateNewTekvLSCreateNewConsumptionEvent = new TekvLSCreateNewConsumptionEvent();
    private final TekvLSDeleteLicenseUsageById tekvLSDeleteLicenseUsageById = new TekvLSDeleteLicenseUsageById();

    private final String deviceId = "ef7a4bcd-fc3f-4f87-bf87-ae934799690b";
    private final String subaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
    private final String projectId = "2bdaf2af-838f-4053-b3fa-ef22aaa11b0d";
    private final String consumptionDate = "2023-02-12";
    private final String type = "Configuration";
    private final String usageDays = "[0,4,6]";
    private final String dutId = "6d5d0317-d8dd-4ce7-80f2-ed2da1a37562";
    private final String callingPlatformId = "0e709699-3dab-47f1-a710-ebd2ae78d57b";
    private String licenseUsageId = "EMPTY";


    @BeforeEach
    void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @AfterEach
    void tearDown() {
        if (!this.licenseUsageId.equals("EMPTY")) {
            HttpResponseMessage response = tekvLSDeleteLicenseUsageById.run(this.request, this.licenseUsageId,
                    this.context);
            this.context.getLogger().info(response.getStatus().toString());
            this.licenseUsageId = "EMPTY";

            HttpStatusType actualStatus = response.getStatus();
            HttpStatus expected = HttpStatus.OK;
            assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        }
    }

    @Tag("acceptance")
    @Test
    public void createNewConsumptionEventTest() {
        //Given
        String bodyRequest = "{ " +
                "    'subaccountId': '"+subaccountId+"'," +
                "    'projectId': '"+projectId+"'," +
                "    'deviceId': '"+ deviceId +"'," +
                "    'dutId': '"+ dutId +"'," +
                "    'callingPlatformId': '"+ callingPlatformId +"'," +
                "    'consumptionDate': '"+consumptionDate+"'," +
                "    'type': '"+type+"'," +
                "    'usageDays': "+usageDays+" }";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateNewTekvLSCreateNewConsumptionEvent.run(this.request,this.context);
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
        
        assertTrue(jsonBody.has("dutId"));
        assertEquals(dutId,jsonBody.getString("dutId"));
        
        assertTrue(jsonBody.has("callingPlatformId"));
        assertEquals(callingPlatformId,jsonBody.getString("callingPlatformId"));
    }

    @Tag("acceptance")
    @Test
    public void createNewConsumptionEventWithBadDUTTypeTest() {
        //Given
        String bodyRequest = "{ " +
                "    'subaccountId': '"+subaccountId+"'," +
                "    'projectId': '"+projectId+"'," +
                "    'deviceId': '"+ deviceId +"'," +
                "    'dutId': '"+ dutId +"'," +
                "    'callingPlatformId': '00000000'," +
                "    'consumptionDate': '"+consumptionDate+"'," +
                "    'type': '"+type+"'," +
                "    'usageDays': "+usageDays+" }";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateNewTekvLSCreateNewConsumptionEvent.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = "Calling Platform provided doesn't exist";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("acceptance")
    @Test
    public void createNewConsumptionEventWithBadCallingPlataformIdTest() {
        //Given
        String bodyRequest = "{ " +
                "    'subaccountId': '"+subaccountId+"'," +
                "    'projectId': '"+projectId+"'," +
                "    'deviceId': '"+ deviceId +"'," +
                "    'dutId': '000000000'," +
                "    'callingPlatformId': '"+ callingPlatformId +"'," +
                "    'consumptionDate': '"+consumptionDate+"'," +
                "    'type': '"+type+"'," +
                "    'usageDays': "+usageDays+" }";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateNewTekvLSCreateNewConsumptionEvent.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = "DUT provided doesn't exist";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }


    @Tag("acceptance")
    @Test
    public void missingMandatoryCallingPlatformIdTest() {
        //Given
        
        String bodyRequest = "{ " +
                "    'subaccountId': '"+subaccountId+"'," +
                "    'projectId': '"+projectId+"'," +
                "    'deviceId': '"+ deviceId +"'," +
                "    'consumptionDate': '"+consumptionDate+"'," +
                "    'dutId': '"+dutId+"'," +
                "    'type': '"+type+"'," +
                "    'usageDays': "+usageDays+" }";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateNewTekvLSCreateNewConsumptionEvent.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = "Missing mandatory parameter: callingPlatformId";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));        
    }
    
    @Tag("acceptance")
    @Test
    public void missingMandatoryDUTIdTest() {
        //Given
        
        String bodyRequest = "{ " +
                "    'subaccountId': '"+subaccountId+"'," +
                "    'projectId': '"+projectId+"'," +
                "    'deviceId': '"+ deviceId +"'," +
                "    'consumptionDate': '"+consumptionDate+"'," +
                "    'callingPlatformId': '"+callingPlatformId+"'," +
                "    'type': '"+type+"'," +
                "    'usageDays': "+usageDays+" }";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateNewTekvLSCreateNewConsumptionEvent.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = "Missing mandatory parameter: dutId";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));        
    }

    @Tag("acceptance")
    @Test
    public void missingBodyTest() {
        //Given

        String bodyRequest = "";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateNewTekvLSCreateNewConsumptionEvent.run(this.request,this.context);
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


    @Tag("acceptance")
    @Test
    public void missingJsonBodyTest() {
        //Given

        String bodyRequest = "{subaccountId:}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateNewTekvLSCreateNewConsumptionEvent.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = "Missing value at 14 [character 15 line 1]";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }
    @Tag("acceptance")
    @Test
    public void noUsageDaysParamTest() {
        // Given
        String usageDays = "[]";
        String bodyRequest = "{ " +
                "'subaccountId': '" + subaccountId + "'," +
                "'projectId': '" + projectId + "'," +
                "'deviceId': '" + deviceId + "'," +
                "'consumptionDate': '" + consumptionDate + "'," +
                "'type': '" + type + "'," +
                "'usageDays': " + usageDays + "," +
                "'dutId': " + dutId + "," +
                "'callingPlatformId':'" + callingPlatformId + "'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        // When
        HttpResponseMessage response = tekvLSCreateNewTekvLSCreateNewConsumptionEvent.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("id"));
        this.licenseUsageId = jsonBody.getString("id");
        assertNotNull(this.licenseUsageId);

        assertTrue(jsonBody.has("consumptionDate"));
        assertEquals(consumptionDate, jsonBody.getString("consumptionDate"));

        assertTrue(jsonBody.has("subaccountId"));
        assertEquals(subaccountId, jsonBody.getString("subaccountId"));

        assertTrue(jsonBody.has("usageDays"));
        assertEquals(usageDays, jsonBody.get("usageDays").toString());

        assertTrue(jsonBody.has("type"));
        assertEquals(type, jsonBody.getString("type"));

        assertTrue(jsonBody.has("projectId"));
        assertEquals(projectId, jsonBody.getString("projectId"));

        assertTrue(jsonBody.has("deviceId"));
        assertEquals(deviceId, jsonBody.getString("deviceId"));

        assertTrue(jsonBody.has("dutId"));
        assertEquals(dutId, jsonBody.getString("dutId"));

        assertTrue(jsonBody.has("callingPlatformId"));
        assertEquals(callingPlatformId, jsonBody.getString("callingPlatformId"));
    }

    @Test
    public void invalidProjectIdParamTest() {
        // Given
        int projectId = 123456;
        String bodyRequest = "{ " +
                "'subaccountId': '" + subaccountId + "'," +
                "'projectId': " + projectId + "," +
                "'deviceId': '" + deviceId + "'," +
                "'dutId': '" + dutId + "'," +
                "'callingPlatformId': '" + callingPlatformId + "'," +
                "'consumptionDate': '" + consumptionDate + "'," +
                "'type': '" + type + "'," +
                "'usageDays': " + usageDays + "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        // When
        HttpResponseMessage response = tekvLSCreateNewTekvLSCreateNewConsumptionEvent.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));
    }

    @Tag("Security")
    @Test
    public void createLicenseUsageNoTokenTest() {
        // Given
        this.headers.remove("authorization");

        // When
        HttpResponseMessage response = tekvLSCreateNewTekvLSCreateNewConsumptionEvent.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.UNAUTHORIZED;
        assertEquals(expectedStatus, actualStatus,
                "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = RoleAuthHandler.MESSAGE_FOR_UNAUTHORIZED;
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("Security")
    @Test
    public void createLicenseUsageInvalidRoleTest() {
        // Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));

        // When
        HttpResponseMessage response = tekvLSCreateNewTekvLSCreateNewConsumptionEvent.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.FORBIDDEN;
        assertEquals(expectedStatus, actualStatus,
                "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = RoleAuthHandler.MESSAGE_FOR_FORBIDDEN;
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void invalidSQLTest() {
        // Given
        String subaccountId = "invalid-id";
        String bodyRequest = "{ " +
                "    'subaccountId': '" + subaccountId + "'," +
                "    'projectId': '" + projectId + "'," +
                "    'dutId': '" + dutId + "'," +
                "    'callingPlatformId': '" + callingPlatformId + "'," +
                "    'consumptionDate': '" + consumptionDate + "'," +
                "    'type': '" + type + "'," +
                "    'usageDays': " + usageDays + " }";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        // When
        HttpResponseMessage response = tekvLSCreateNewTekvLSCreateNewConsumptionEvent.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

     @Test
     public void invalidTypeSQLTest() {
         // Given
         String dutId = "6d05cf7b-fc29-4bd6-8cb0-0b3222d97925";
         String bodyRequest = "{ " +
                 "    'subaccountId': '"+subaccountId+"'," +
                 "    'projectId': '"+projectId+"'," +
                 "    'deviceId': '"+ deviceId +"'," +
                 "    'dutId': '"+ dutId+ "'," +
                 "    'callingPlatformId': '"+ callingPlatformId+"'," +
                 "    'consumptionDate': '"+consumptionDate+"'," +
                 "    'type': '"+type+"'," +
                 "    'usageDays': "+usageDays+" }";
         doReturn(Optional.of(bodyRequest)).when(request).getBody();
         this.queryParams.remove("dutId");
         // When
         HttpResponseMessage response = tekvLSCreateNewTekvLSCreateNewConsumptionEvent.run(this.request, this.context);
         this.context.getLogger().info(response.getBody().toString());
         // Then
         HttpStatusType actualStatus = response.getStatus();
         HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
         assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
     }

    @Test
    public void invalidValueDutTypeSQLTest() {
        // Given
        String dutId = "4ae11b75-a3c9-463e-82e4-b0953dc7a72b";
        String callingPlatformId = "7564aab0-5331-4ab5-85f7-e37acbdfd90d";
        String bodyRequest = "{ " +
                "    'subaccountId': '"+subaccountId+"'," +
                "    'projectId': '"+projectId+"'," +
                "    'deviceId': '"+ deviceId +"'," +
                "    'dutId': '"+ dutId + "'," +
                "    'callingPlatformId': '"+ callingPlatformId +"'," +
                "    'consumptionDate': '"+consumptionDate+"'," +
                "    'type': '"+type+"'," +
                "    'usageDays': "+usageDays+" }";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        this.queryParams.remove("dutId");
        // When
        HttpResponseMessage response = tekvLSCreateNewTekvLSCreateNewConsumptionEvent.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());
        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void createNewConsumptionWithBadUsageDaysEventTest() {
        //Given
        String bodyRequest = "{ " +
                "    'subaccountId': '"+subaccountId+"'," +
                "    'projectId': '"+projectId+"'," +
                "    'deviceId': '"+ deviceId +"'," +
                "    'dutId': '"+ dutId +"'," +
                "    'callingPlatformId': '"+ callingPlatformId +"'," +
                "    'consumptionDate': '"+consumptionDate+"'," +
                "    'type': '"+type+"'," +
                "    'usageDays': ['any'] }";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        // When
        HttpResponseMessage response = tekvLSCreateNewTekvLSCreateNewConsumptionEvent.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());
        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void invalidDutAndPlatformCombination() {
        //Given
        String dutId = "d28cf7d0-d5a8-4f8f-9002-ea40e8d2964a";
        String callingPlatformId = "1ba09c6f-9a2a-4181-ac1e-b7217763df96";
        String bodyRequest = "{ " +
                "    'subaccountId': '"+subaccountId+"'," +
                "    'projectId': '"+projectId+"'," +
                "    'deviceId': '"+ deviceId +"'," +
                "    'dutId': '"+ dutId +"'," +
                "    'callingPlatformId': '"+ callingPlatformId +"'," +
                "    'consumptionDate': '"+consumptionDate+"'," +
                "    'type': '"+type+"'," +
                "    'any': 'any'," +
                "    'usageDays': [0] }";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        // When
        HttpResponseMessage response = tekvLSCreateNewTekvLSCreateNewConsumptionEvent.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());
        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

}
