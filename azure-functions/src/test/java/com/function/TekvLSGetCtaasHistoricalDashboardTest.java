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
import uk.org.webcompere.systemstubs.environment.EnvironmentVariables;

import static org.junit.Assert.assertFalse;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.doThrow;

class TekvLSGetCtaasHistoricalDashboardTest extends TekvLSTest {

    private final TekvLSGetCtaasHistoricalDashboard tekvLSGetCtaasHistoricalDashboard = new TekvLSGetCtaasHistoricalDashboard();
    private final String SUBACCOUNT_ID = "2c8e386b-d1bd-48b3-b73a-12bfa5d00805";
    private final String NOTE_ID = "be612704-c26e-48ea-ab9b-19312f03d644";
    @BeforeEach
    public void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @Tag("acceptance")
    @Test
    public void getDashboard() {
        //Given
        String subaccountId = SUBACCOUNT_ID;
        String noteId = NOTE_ID;
        // When
        HttpResponseMessage response = tekvLSGetCtaasHistoricalDashboard.run(this.request, subaccountId, noteId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("response"));

        JSONArray responseArray = jsonBody.getJSONArray("response");
        assertFalse(responseArray.isEmpty());
        JSONObject responseData = responseArray.getJSONObject(0);
        assertTrue(responseData.has("reportType"));
        assertTrue(responseData.has("startDateStr"));
        assertTrue(responseData.has("endDateStr"));
        assertTrue(responseData.has("imageBase64"));
    }

    @Tag("acceptance")
    @Test
    public void getDashboardWithEmptyNoteId() {
        //Given
        String subaccountId = SUBACCOUNT_ID;
        String noteId = "EMPTY";

        // When
        HttpResponseMessage response = tekvLSGetCtaasHistoricalDashboard.run(this.request, subaccountId, noteId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        this.context.getLogger().info("body " + body);

        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = "Note Id cannot be empty";
        assertEquals(expectedMessage, jsonBody.getString("error"));
    }

    @Tag("acceptance")
    @Test
    public void getDashboardWithEmptySubaccountId() {
        //Given
        String subaccountId = "EMPTY";
        String noteId = NOTE_ID;

        // When
        HttpResponseMessage response = tekvLSGetCtaasHistoricalDashboard.run(this.request, subaccountId, noteId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus, "HTTP Status doesn't match with: ".concat(expectedStatus.toString()));

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
        //Given
        String subaccountId = "";
        String noteId = NOTE_ID;

        // When
        HttpResponseMessage response = tekvLSGetCtaasHistoricalDashboard.run(this.request, subaccountId, noteId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus, "HTTP Status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_SUBACCOUNT_ID_NOT_FOUND;
        assertEquals(expectedMessage, jsonBody.getString("error"));
    }

    @Tag("acceptance")
    @Test
    public void getDashboardWithoutNoteId() {
        //Given
        String subaccountId = SUBACCOUNT_ID;
        String noteId = "";

        // When
        HttpResponseMessage response = tekvLSGetCtaasHistoricalDashboard.run(this.request, subaccountId, noteId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus, "HTTP Status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = "Note Id cannot be empty";
        assertEquals(expectedMessage, jsonBody.getString("error"));
    }

    @Tag("security")
    @Test
    public void getDashboardWithIncorrectSubaccountId() {
        //Given
        String subaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        String noteId = NOTE_ID;
        //When
        HttpResponseMessage response = tekvLSGetCtaasHistoricalDashboard.run(this.request, subaccountId, noteId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus, "HTTP Status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("response"));

        JSONArray responseArray = jsonBody.getJSONArray("response");
        assertTrue(responseArray.isEmpty());

    }

    @Tag("security")
    @Test
    public void getDashboardWithIncorrectNoteId() {
        //Given
        String subaccountId = SUBACCOUNT_ID;
        String noteId = "2bdaf2af-838f-4053-b3fa-ef22aaa10b0d";
        //When
        HttpResponseMessage response = tekvLSGetCtaasHistoricalDashboard.run(this.request, subaccountId, noteId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus, "HTTP Status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("response"));

        JSONArray responseArray = jsonBody.getJSONArray("response");
        assertTrue(responseArray.isEmpty());

    }

    @Tag("acceptance")
    @Test
    public void getForCustomerRoleTest() {
        //Given
        String subaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        String noteId = "2bdaf2af-838f-4053-b3fa-ef22aaa10b0d";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));

        // When
        HttpResponseMessage response = tekvLSGetCtaasHistoricalDashboard.run(this.request, subaccountId, noteId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("response"));

        JSONArray responseArray = jsonBody.getJSONArray("response");
        assertFalse(responseArray.isEmpty());
        JSONObject responseData = responseArray.getJSONObject(0);
        assertTrue(responseData.has("reportType"));
        assertTrue(responseData.has("startDateStr"));
        assertTrue(responseData.has("endDateStr"));
        assertTrue(responseData.has("imageBase64"));
    }

    @Tag("security")
    @Test
    public void getForCustomerRoleIncorrectSubaccountIdTest() {
        //Given
        String subaccountId = "cebe6542-2032-4398-882e-ffb44ade169d";
        String noteId = "2bdaf2af-838f-4053-b3fa-ef22aaa10b0d";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));
        //When
        HttpResponseMessage response = tekvLSGetCtaasHistoricalDashboard.run(this.request, subaccountId, noteId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus, "HTTP Status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_SUBACCOUNT_ID_NOT_FOUND;
        assertEquals(expectedMessage, jsonBody.getString("error"));
    }

    @Tag("security")
    @Test
    public void getForSubaccountRoleIncorrectSubaccountIdTest() {
        //Given
        String subaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        String noteId = NOTE_ID;
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));

        //When
        HttpResponseMessage response = tekvLSGetCtaasHistoricalDashboard.run(this.request, subaccountId, noteId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus, "HTTP Status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_SUBACCOUNT_ID_NOT_FOUND;
        assertEquals(expectedMessage, jsonBody.getString("error"));
    }

    @Tag("Security")
    @Test
    public void noTokenTest() {
        //Given
        String subaccountId = SUBACCOUNT_ID;
        String noteId = NOTE_ID;
        this.headers.remove("authorization");

        //When
        HttpResponseMessage response = tekvLSGetCtaasHistoricalDashboard.run(this.request, subaccountId, noteId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.UNAUTHORIZED;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

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
        //Given
        String subaccountId = SUBACCOUNT_ID;
        String noteId = NOTE_ID;
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));

        //When
        HttpResponseMessage response = tekvLSGetCtaasHistoricalDashboard.run(this.request, subaccountId, noteId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.FORBIDDEN;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = RoleAuthHandler.MESSAGE_FOR_FORBIDDEN;
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void genericExceptionTest() {
        //Given
        String subaccountId = SUBACCOUNT_ID;
        String noteId = NOTE_ID;
        doThrow(new RuntimeException("Error message")).when(this.request).createResponseBuilder(HttpStatus.OK);

        //When
        HttpResponseMessage response = tekvLSGetCtaasHistoricalDashboard.run(this.request, subaccountId, noteId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
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

    @Test
    public void sqlExceptionTest() {
        //Given
        String subaccountId = SUBACCOUNT_ID;
        String noteId = NOTE_ID;
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));

        //When - Action
        HttpResponseMessage response;
        try {
            response = new EnvironmentVariables("POSTGRESQL_SERVER", "test").execute(
                    () -> tekvLSGetCtaasHistoricalDashboard.run(this.request, subaccountId, noteId, this.context));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "The connection attempt failed.";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse);
    }
}