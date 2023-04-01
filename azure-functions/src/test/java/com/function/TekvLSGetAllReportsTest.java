package com.function;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doThrow;

import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;

public class TekvLSGetAllReportsTest extends TekvLSTest {

    private final TekvLSGetAllReports tekvLSGetAllReports = new TekvLSGetAllReports();
    private final String FEATURE_FUNCTIONALITY = "feature";
    private final String CALLING_RELIABILITY = "calling";

    @BeforeEach
    public void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @Tag("acceptance")
    @Test
    public void getAllReportsForSubaccountTest() {
        // Given
        String subaccountId = "2c8e386b-d1bd-48b3-b73a-12bfa5d00805";

        // When
        HttpResponseMessage response = tekvLSGetAllReports.run(this.request, subaccountId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus,
                "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("reports"));

        JSONArray reports = jsonBody.getJSONArray("reports");
        assertTrue(reports.length() > 0);

        JSONObject report = reports.getJSONObject(0);
        assertTrue(report.has("reportType"));
        assertTrue(report.has("startTime"));
        assertTrue(report.has("endTime"));
    }

    @Tag("acceptance")
    @Test
    public void getAllReportsForCustomerStakeholderTest() {
        // Given
        String subaccountId = "2c8e386b-d1bd-48b3-b73a-12bfa5d00805";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountStakeholder"));

        // When
        HttpResponseMessage response = tekvLSGetAllReports.run(this.request, subaccountId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus,
                "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("reports"));

        JSONArray reports = jsonBody.getJSONArray("reports");
        assertTrue(reports.length() > 0);

        JSONObject report = reports.getJSONObject(0);
        assertTrue(report.has("reportType"));
        assertTrue(report.has("startTime"));
        assertTrue(report.has("endTime"));
    }

    @Tag("acceptance")
    @Test
    public void getAllReportsForCustomerFullAdminTest() {
        // Given
        String subaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));

        // When
        HttpResponseMessage response = tekvLSGetAllReports.run(this.request, subaccountId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus,
                "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("reports"));
    }

    @Tag("acceptance")
    @Test
    public void getAllReportsForCustomerAnySubaccountIdTest() {
        // Given
        String subaccountId = "f5";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));

        // When
        HttpResponseMessage response = tekvLSGetAllReports.run(this.request, subaccountId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expectedStatus, actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));
    }

    @Tag("acceptance")
    @Test
    public void getAllReportsForCustomerUnknownSubaccountIdTest() {
        // Given
        String subaccountId = "8acb6997-4d6a-4427-ba2c-7bf463fa08ec";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));

        // When
        HttpResponseMessage response = tekvLSGetAllReports.run(this.request, subaccountId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = RoleAuthHandler.MESSAGE_SUBACCOUNT_ID_NOT_FOUND;
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("acceptance")
    @Test
    public void getFeatureFunctionalityReportsTest() {
        // Given
        String subaccountId = "2c8e386b-d1bd-48b3-b73a-12bfa5d00805";
        this.queryParams.put("reportType", FEATURE_FUNCTIONALITY);

        // When
        HttpResponseMessage response = tekvLSGetAllReports.run(this.request, subaccountId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus,
                "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("reports"));

        JSONArray reports = jsonBody.getJSONArray("reports");
        assertTrue(reports.length() > 0);

        JSONObject report = reports.getJSONObject(0);
        assertTrue(report.has("reportType"));
        assertTrue(report.has("startTime"));
        assertTrue(report.has("endTime"));

        assertEquals(report.get("reportType"), "Daily-FeatureFunctionality");
    }

    @Tag("acceptance")
    @Test
    public void getCallingReliabilityyReportsTest() {
        // Given
        String subaccountId = "2c8e386b-d1bd-48b3-b73a-12bfa5d00805";
        this.queryParams.put("reportType", CALLING_RELIABILITY);

        // When
        HttpResponseMessage response = tekvLSGetAllReports.run(this.request, subaccountId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus,
                "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("reports"));

        JSONArray reports = jsonBody.getJSONArray("reports");
        this.context.getLogger().info(Integer.toString(reports.length()));
        assertTrue(reports.length() > 0);

        JSONObject report = reports.getJSONObject(0);
        assertTrue(report.has("reportType"));
        assertTrue(report.has("startTime"));
        assertTrue(report.has("endTime"));

        assertEquals(report.get("reportType"), "Daily-CallingReliability");
    }

    @Tag("acceptance")
    @Test
    public void getReportWithEmptySubaccountId() {
        // Given
        String subaccountId = "EMPTY";

        // When
        HttpResponseMessage response = tekvLSGetAllReports.run(this.request, subaccountId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus,
                "HTTP Status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        this.context.getLogger().info("body " + body);

        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_SUBACCOUNT_ID_NOT_FOUND;
        assertEquals(expectedMessage, jsonBody.getString("error"));
    }

    @Tag("acceptance")
    @Test
    public void getDashboardWithoutSubaccountId() {
        // Given
        String subaccountId = "";

        // When
        HttpResponseMessage response = tekvLSGetAllReports.run(this.request, subaccountId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus,
                "HTTP Status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_SUBACCOUNT_ID_NOT_FOUND;
        assertEquals(expectedMessage, jsonBody.getString("error"));
    }

    @Tag("Security")
    @Test
    public void noTokenTest() {
        // Given
        String id = "EMPTY";
        this.headers.remove("authorization");

        // When
        HttpResponseMessage response = tekvLSGetAllReports.run(this.request, id, this.context);
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
    public void invalidRoleTest() {
        // Given
        String id = "EMPTY";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));

        // When
        HttpResponseMessage response = tekvLSGetAllReports.run(this.request, id, this.context);
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
    public void genericExceptionTest() {
        // Given
        String subaccountId = "b5b91753-4c2b-43f5-afa0-feb00cefa981";
        doThrow(new RuntimeException("Error message")).when(this.request).createResponseBuilder(HttpStatus.OK);

        // When
        HttpResponseMessage response = tekvLSGetAllReports.run(this.request, subaccountId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = "Error message";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }
}
