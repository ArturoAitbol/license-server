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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TekvLSGetAllDevicesTest extends TekvLSTest {

    TekvLSGetAllDevices getAllDevicesApi = new TekvLSGetAllDevices();

    @BeforeEach
    public void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @Tag("acceptance")
    @Test
    public void getAllDevicesTest() {
        //Given - Arrange
        String id = "EMPTY";
        //When - Action
        HttpResponseMessage response = getAllDevicesApi.run(this.request, id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("devices"));

        Object devices = jsonBody.get("devices");
        assertTrue(devices instanceof JSONArray);

        JSONArray devicesArray = (JSONArray) devices;
        assertTrue(devicesArray.length() > 0);

        JSONObject device = devicesArray.getJSONObject(0);
        assertTrue(device.has("supportType"));
        assertTrue(device.has("product"));
        assertTrue(device.has("vendor"));
        assertTrue(device.has("id"));
        assertTrue(device.has("version"));
        assertTrue(device.has("tokensToConsume"));
    }

    @Tag("acceptance")
    @Test
    public void getAllDevicesWithEmptyLimitTest() {
        //Given - Arrange
        String id = "EMPTY";
        this.queryParams.put("limit", "2");
        //When - Action
        HttpResponseMessage response = getAllDevicesApi.run(this.request, id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("devices"));

        Object devices = jsonBody.get("devices");
        assertTrue(devices instanceof JSONArray);

        JSONArray devicesArray = (JSONArray) devices;
        assertTrue(devicesArray.length() > 0);

        JSONObject device = devicesArray.getJSONObject(0);
        assertTrue(device.has("supportType"));
        assertTrue(device.has("product"));
        assertTrue(device.has("vendor"));
        assertTrue(device.has("id"));
        assertTrue(device.has("version"));
        assertTrue(device.has("tokensToConsume"));
    }

    @Tag("acceptance")
    @Test
    public void getAllDevicesWithEmptyOffsetTest() {
        //Given - Arrange
        String id = "EMPTY";
        this.queryParams.put("offset", "1");
        //When - Action
        HttpResponseMessage response = getAllDevicesApi.run(this.request, id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("devices"));

        Object devices = jsonBody.get("devices");
        assertTrue(devices instanceof JSONArray);

        JSONArray devicesArray = (JSONArray) devices;
        assertTrue(devicesArray.length() > 0);

        JSONObject device = devicesArray.getJSONObject(0);
        assertTrue(device.has("supportType"));
        assertTrue(device.has("product"));
        assertTrue(device.has("vendor"));
        assertTrue(device.has("id"));
        assertTrue(device.has("version"));
        assertTrue(device.has("tokensToConsume"));
    }
    @Test
    public void getDeviceById() {
        String expectedId = "c49a3148-1e74-4090-9876-d062011d9bcb";

        HttpResponseMessage response = getAllDevicesApi.run(this.request, expectedId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("devices"));
        JSONArray devices = jsonBody.getJSONArray("devices");
        assertTrue(devices.length() > 0);

        JSONObject device = (JSONObject) devices.get(0);
        String actualId = device.getString("id");
        assertEquals(expectedId, actualId, "Actual Id is not: ".concat(expectedId));
    }

    @Test
    public void getDevicesByVendor() {
        String id = "EMPTY";
        String expectedVendor = "HylaFAX";
        this.queryParams.put("vendor", expectedVendor);

        HttpResponseMessage response = getAllDevicesApi.run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("devices"));
        JSONArray devices = jsonBody.getJSONArray("devices");
        assertTrue(devices.length() > 0);

        JSONObject device = (JSONObject) devices.get(0);
        String actualVendor = device.getString("vendor");
        assertEquals(expectedVendor, actualVendor, "Actual vendor is not: ".concat(expectedVendor));
    }

    @Test
    public void getDevicesByProduct() {
        String id = "EMPTY";
        String expectedProduct = "HylaFAX Enterprise";
        this.queryParams.put("product", expectedProduct);

        HttpResponseMessage response = getAllDevicesApi.run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("devices"));
        JSONArray devices = jsonBody.getJSONArray("devices");
        assertTrue(devices.length() > 0);

        JSONObject device = (JSONObject) devices.get(0);
        String actualProduct = device.getString("product");
        assertEquals(expectedProduct, actualProduct, "Actual product is not: ".concat(expectedProduct));
    }

    @Test
    public void getDevicesByVersion() {
        String id = "EMPTY";
        String expectedVersion = "6.2";
        this.queryParams.put("version", expectedVersion);

        HttpResponseMessage response = getAllDevicesApi.run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("devices"));
        JSONArray devices = jsonBody.getJSONArray("devices");
        assertTrue(devices.length() > 0);

        JSONObject device = (JSONObject) devices.get(0);
        String actualVersion = device.getString("version");
        assertEquals(expectedVersion, actualVersion, "Actual version is not: ".concat(expectedVersion));
    }

    // If test is failing make sure there is a device in the DB with id=eb2e8d89-b5a0-4e6c-8b11-83aad2674d7f, and the device has a startDate before 2022-07-18
    @Tag("acceptance")
    @Test
    public void getDevicesByDate() {
        String id = "EMPTY";
        String date = "2022-07-18";
        this.queryParams.put("date", date);

        HttpResponseMessage response = getAllDevicesApi.run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("devices"));
        JSONArray devices = jsonBody.getJSONArray("devices");
        assertTrue(devices.length() > 0);
    }

    @Tag("acceptance")
    @Test
    public void getDevicesBySubaccountId() {
        String id = "EMPTY";
        String expectedSubaccountId = "5f1fa1f7-92e3-4c92-b18b-d30f26ef4f73";
        this.queryParams.put("subaccountId", expectedSubaccountId);

        HttpResponseMessage response = getAllDevicesApi.run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("devices"));
        JSONArray devices = jsonBody.getJSONArray("devices");
        assertTrue(devices.length() > 0);
    }

    @Tag("acceptance")
    @Test
    public void getDevicesWithLimitAndOffset() {
        String id = "EMPTY";
        String limit = "2", offset = "0";
        this.queryParams.put("limit", limit);
        this.queryParams.put("offset", offset);

        HttpResponseMessage response = getAllDevicesApi.run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("devices"));
        JSONArray devices = jsonBody.getJSONArray("devices");
        assertEquals(devices.length(), Integer.parseInt(limit),"The number of devices returned doesn't match the limit defined");
    }

    @Test
    public void unauthorizedTest() {
        String id = "EMPTY";
        this.headers.remove("authorization");
        HttpResponseMessage response = getAllDevicesApi.run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

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
        String id = "EMPTY";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("crm"));
        HttpResponseMessage response = getAllDevicesApi.run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

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
        String expectedId = "BASIC";

        HttpResponseMessage response = getAllDevicesApi.run(this.request, expectedId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void genericExceptionTest() {
        Mockito.when(this.request.createResponseBuilder(HttpStatus.OK)).thenThrow(new RuntimeException("Generic error"));
        String expectedId = "00000000-0000-0000-0000-000000000000";

        HttpResponseMessage response = getAllDevicesApi.run(this.request, expectedId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }
}