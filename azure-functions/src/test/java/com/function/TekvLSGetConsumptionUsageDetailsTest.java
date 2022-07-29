package com.function;

import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;

class TekvLSGetConsumptionUsageDetailsTest extends TekvLSTest {

    TekvLSGetConsumptionUsageDetails getConsumptionUsageDetailsApi = new TekvLSGetConsumptionUsageDetails();

    @BeforeEach
    public void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @Tag("acceptance")
    @Test
    public void getConsumptionUsageDetailsById() {
        //Given - Arrange
        String id = "c323f5f8-cd49-4b0b-ac74-fe2113b658b8";

        //When - Action
        HttpResponseMessage response = getConsumptionUsageDetailsApi.run(this.request, id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("usageDays"));
        assertTrue(jsonBody.has("modifiedBy"));

        Object usageDays = jsonBody.get("usageDays");
        assertTrue(usageDays instanceof JSONArray);

        JSONArray usageDaysArray = (JSONArray) usageDays;
        assertTrue(usageDaysArray.length() > 0);

        JSONObject device = usageDaysArray.getJSONObject(0);
        assertTrue(device.has("usageDate"));
        assertTrue(device.has("macAddress"));
        assertTrue(device.has("dayOfWeek"));
        assertTrue(device.has("serialNumber"));
        assertTrue(device.has("consumptionId"));
        assertTrue(device.has("id"));
        assertTrue(device.has("modifiedBy"));
    }

    @Test
    public void distributorAdminRoleTest() {
        //Given - Arrange
        String id = "c323f5f8-cd49-4b0b-ac74-fe2113b658b8";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("distributorAdmin"));

        //When - Action
        HttpResponseMessage response = getConsumptionUsageDetailsApi.run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("usageDays"));
    }

    @Test
    public void customerAdminRoleTest() {
        //Given - Arrange
        String id = "c323f5f8-cd49-4b0b-ac74-fe2113b658b8";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));

        //When - Action
        HttpResponseMessage response = getConsumptionUsageDetailsApi.run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("usageDays"));
    }

    @Test
    public void subaccountAdminRoleTest() {
        //Given - Arrange
        String id = "c323f5f8-cd49-4b0b-ac74-fe2113b658b8";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));

        //When - Action
        HttpResponseMessage response = getConsumptionUsageDetailsApi.run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("usageDays"));
    }

    @Test
    public void unauthorizedTest() {
        //Given - Arrange
        String id = "EMPTY";
        this.headers.remove("authorization");

        //When - Action
        HttpResponseMessage response = getConsumptionUsageDetailsApi.run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

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
        String id = "EMPTY";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));

        //When - Action
        HttpResponseMessage response = getConsumptionUsageDetailsApi.run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

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
    public void getAllDevicesInvalidTest() {
        //Given - Arrange
        String expectedId = "BASIC";

        //When - Action
        HttpResponseMessage response = getConsumptionUsageDetailsApi.run(this.request, expectedId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void sqlExceptionTest() {
        //Given - Arrange
        Mockito.when(this.request.createResponseBuilder(HttpStatus.OK)).thenThrow(new RuntimeException("Generic error"));
        String expectedId = "00000000-0000-0000-0000-000000000000";

        //When - Action
        HttpResponseMessage response = getConsumptionUsageDetailsApi.run(this.request, expectedId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String expectedResponse = "SQL";
        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        String actualResponse = jsonBody.getString("error");
        assertTrue(actualResponse.contains(expectedResponse), "Response doesn't contain: ".concat(expectedResponse));
    }

    @Test
    public void genericExceptionTest() {
        //Given - Arrange
        Mockito.when(this.request.createResponseBuilder(HttpStatus.OK)).thenThrow(new RuntimeException("Generic error"));
        String expectedId = "c323f5f8-cd49-4b0b-ac74-fe2113b658b8";

        //When - Action
        HttpResponseMessage response = getConsumptionUsageDetailsApi.run(this.request, expectedId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String expectedResponse = "SQL";
        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        String actualResponse = jsonBody.getString("error");
        assertFalse(actualResponse.contains(expectedResponse), "Response doesn't match with: ".concat(expectedResponse));
    }
}