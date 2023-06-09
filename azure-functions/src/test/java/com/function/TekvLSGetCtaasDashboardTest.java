package com.function;

import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import uk.org.webcompere.systemstubs.environment.EnvironmentVariables;

import static org.junit.Assert.assertFalse;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doThrow;

public class TekvLSGetCtaasDashboardTest extends TekvLSTest {

    private final TekvLSGetCtaasDashboard tekvLSGetCtaasDashboard = new TekvLSGetCtaasDashboard();
    private final String DAILY_FEATURE_FUNCTIONALITY = "Daily-FeatureFunctionality";

    @BeforeEach
    public void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @Tag("acceptance")
    @Test
    public void getDashboard() {
        //Given
        String subaccountId = "2c8e386b-d1bd-48b3-b73a-12bfa5d00805";

        // When
        HttpResponseMessage response = tekvLSGetCtaasDashboard.run(this.request, subaccountId, DAILY_FEATURE_FUNCTIONALITY, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("response"));

        JSONObject responseData = jsonBody.getJSONObject("response");
        assertTrue(responseData.has("reportType"));
        assertTrue(responseData.has("lastUpdatedTS"));
        assertTrue(responseData.has("timestampId"));
        assertTrue(responseData.has("imageBase64"));
    }

    @Tag("acceptance")
    @Test
    public void getDashboardByTimestampId() {
        //Given
        String subaccountId = "2c8e386b-d1bd-48b3-b73a-12bfa5d00805";
        String timestampId = "230110002112";
        this.queryParams.put("timestampId", timestampId);

        // When
        HttpResponseMessage response = tekvLSGetCtaasDashboard.run(this.request, subaccountId, DAILY_FEATURE_FUNCTIONALITY, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("response"));

        JSONObject responseData = jsonBody.getJSONObject("response");
        assertTrue(responseData.has("reportType"));
        assertTrue(responseData.has("lastUpdatedTS"));
        assertTrue(responseData.has("timestampId"));
        assertTrue(responseData.has("imageBase64"));

        assertEquals(timestampId,responseData.getString("timestampId"));
    }

    @Tag("acceptance")
    @Test
    public void getDashboardWithEmptyReportType() {
        //Given
        String subaccountId = "2c8e386b-d1bd-48b3-b73a-12bfa5d00805";

        // When
        HttpResponseMessage response = tekvLSGetCtaasDashboard.run(this.request, subaccountId, "", this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        this.context.getLogger().info("body " + body);

        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = "Report type cannot be empty";
        assertEquals(expectedMessage, jsonBody.getString("error"));
    }

    @Tag("acceptance")
    @Test
    public void getDashboardWithEmptySubaccountId() {
        //Given
        String subaccountId = "EMPTY";

        // When
        HttpResponseMessage response = tekvLSGetCtaasDashboard.run(this.request, subaccountId, DAILY_FEATURE_FUNCTIONALITY, this.context);
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

        // When
        HttpResponseMessage response = tekvLSGetCtaasDashboard.run(this.request, subaccountId, DAILY_FEATURE_FUNCTIONALITY, this.context);
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
    public void getForCustomerRoleTest() {
        //Given
        String subaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));

        // When
        HttpResponseMessage response = tekvLSGetCtaasDashboard.run(this.request, subaccountId, DAILY_FEATURE_FUNCTIONALITY, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));
    }

    @Tag("security")
    @Test
    public void getForCustomerRoleIncorrectSubaccountIdTest() {
        //Given
        String subaccountId = "cebe6542-2032-4398-882e-ffb44ade169d";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));
        //When
        HttpResponseMessage response = tekvLSGetCtaasDashboard.run(this.request, subaccountId, DAILY_FEATURE_FUNCTIONALITY, this.context);
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
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));

        //When
        HttpResponseMessage response = tekvLSGetCtaasDashboard.run(this.request, subaccountId, DAILY_FEATURE_FUNCTIONALITY, this.context);
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
        String subaccountId = "b5b91753-4c2b-43f5-afa0-feb00cefa981";
        this.headers.remove("authorization");

        //When
        HttpResponseMessage response = tekvLSGetCtaasDashboard.run(this.request, subaccountId, DAILY_FEATURE_FUNCTIONALITY, this.context);
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
        String subaccountId = "b5b91753-4c2b-43f5-afa0-feb00cefa981";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));

        //When
        HttpResponseMessage response = tekvLSGetCtaasDashboard.run(this.request, subaccountId, DAILY_FEATURE_FUNCTIONALITY, this.context);
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
        String subaccountId = "b5b91753-4c2b-43f5-afa0-feb00cefa981";
        doThrow(new RuntimeException("Error message")).when(this.request).createResponseBuilder(HttpStatus.OK);

        //When
        HttpResponseMessage response = tekvLSGetCtaasDashboard.run(this.request, subaccountId, DAILY_FEATURE_FUNCTIONALITY, this.context);
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

    @Tag("acceptance")
    @Test
    public void getForSalesAdminRoleTest() {
        //Given
        String subaccountId = "b5b91753-4c2b-43f5-afa0-feb00cefa981";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("salesAdmin"));
        // When
        HttpResponseMessage response = tekvLSGetCtaasDashboard.run(this.request, subaccountId, DAILY_FEATURE_FUNCTIONALITY, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));
    }

    @Tag("acceptance")
    @Test
    public void getForConfigTesterRoleTest() {
        //Given
        String subaccountId = "b5b91753-4c2b-43f5-afa0-feb00cefa981";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("configTester"));
        // When
        HttpResponseMessage response = tekvLSGetCtaasDashboard.run(this.request, subaccountId, DAILY_FEATURE_FUNCTIONALITY, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));
    }

    @Tag("acceptance")
    @Test
    public void getForSubaccountStakeHolderRoleTest() {
        //Given
        String subaccountId = "2c8e386b-d1bd-48b3-b73a-12bfa5d00805";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountStakeholder"));
        // When
        HttpResponseMessage response = tekvLSGetCtaasDashboard.run(this.request, subaccountId, DAILY_FEATURE_FUNCTIONALITY, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertFalse(jsonBody.has("error"));
    }

    @Tag("security")
    @Test
    public void getForIncorrectSubaccountIdTest() {
        //Given
        String subaccountId = "f5a60920-8b70-4a10-9dc8-9536bdb5652c";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));

        //When
        HttpResponseMessage response = tekvLSGetCtaasDashboard.run(this.request, subaccountId, DAILY_FEATURE_FUNCTIONALITY, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus, "HTTP Status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_SUBACCOUNT_ID_NOT_FOUND;
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }

    @Test
    public void sqlExceptionTest() {
        //Given
        String subaccountId = "f5a60920-8b70-4a10-9dc8-9536bdb5652c";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));

        //When - Action
        HttpResponseMessage response;
        try {
            response = new EnvironmentVariables("POSTGRESQL_SERVER", "test").execute(
                    () -> tekvLSGetCtaasDashboard.run(this.request, subaccountId, DAILY_FEATURE_FUNCTIONALITY, this.context));
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
