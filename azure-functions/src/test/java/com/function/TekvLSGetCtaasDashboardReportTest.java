package com.function;

import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import com.function.util.Config;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import com.function.auth.RoleAuthHandler;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TekvLSGetCtaasDashboardReportTest extends TekvLSTest {

    TekvLSGetCtaasDashboardReport getCtaasDashboardReport = new TekvLSGetCtaasDashboardReport();

    @BeforeEach
    public void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }
    @Tag("acceptance")
    @Test
    public void getDashboardReport() {
        String subaccountId = "2c8e386b-d1bd-48b3-b73a-12bfa5d00805";
        String reportType = "LTS";
        String startDate = "230129233105";
        String endDate = "230129233105";
        this.queryParams.put("reportType",reportType);
        this.queryParams.put("startDate", startDate);
        this.queryParams.put("endDate", endDate);

        HttpResponseMessage response = getCtaasDashboardReport.run(this.request, subaccountId, this.context);
        this.context.getLogger().info(response.getBody().toString());
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("response"));

    }

    @Tag("acceptance")
    @Test
    public void getDashboardReportWithoutQueryParams() {
        String subaccountId = "21";
        String reportType = "LTS";
        String startDate = "230129233105";
        String endDate = "230129233105";
        this.queryParams.put("reportType",reportType);
        this.queryParams.put("startDate", startDate);
        this.queryParams.put("endDate", endDate);
        HttpResponseMessage response = getCtaasDashboardReport.run(this.request, subaccountId, this.context);
        this.context.getLogger().info(response.getBody().toString());
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));
    }

    @Test
    public void getDashboardReportExceptionTest() {
        Mockito.doThrow(new RuntimeException("Generic error")).when(request).createResponseBuilder(HttpStatus.OK);
        String subaccountId = "2c8e386b-d1bd-48b3-b73a-12bfa5d00805";
        String reportType = "LTS";
        String startDate = "230129233105";
        String endDate = "230129233105";
        this.queryParams.put("reportType",reportType);
        this.queryParams.put("startDate", startDate);
        this.queryParams.put("endDate", endDate);
        HttpResponseMessage response = getCtaasDashboardReport.run(this.request, subaccountId, this.context);
        this.context.getLogger().info(response.getBody().toString());
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));
    }
    @Test
    public void getDashboardReportWithCustomerFullAdmin() {
        //customerAdmin
        String subaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        //String reportType = 'STS';
        String reportType = "LTS";
        String startDate = "230129233105";
        String endDate = "230129233105";
        this.queryParams.put("reportType",reportType);
        this.queryParams.put("startDate", startDate);
        this.queryParams.put("endDate", endDate);

        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));

        HttpResponseMessage response = getCtaasDashboardReport.run(this.request, subaccountId, this.context);
        this.context.getLogger().info(response.getBody().toString());
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("response"));
    }
    @Test
    public void getDashboardReportWithUnaxistantSubaccount() {
        //customerAdmin
        String subaccountId = "2c8e386b-d1bd-48b3-b73a-12bfa5d00805";
        //String reportType = 'STS';
        String reportType = "LTS";
        String startDate = "230129233105";
        String endDate = "230129233105";
        this.queryParams.put("reportType",reportType);
        this.queryParams.put("startDate", startDate);
        this.queryParams.put("endDate", endDate);

        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));

        HttpResponseMessage response = getCtaasDashboardReport.run(this.request, subaccountId, this.context);
        this.context.getLogger().info(response.getBody().toString());
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedResponse = RoleAuthHandler.MESSAGE_SUBACCOUNT_ID_NOT_FOUND;
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }
    @Test
    public void getDashboardReportWithStakeholderAccount() {
        //customerAdmin
        String subaccountId = "2c8e386b-d1bd-48b3-b73a-12bfa5d00805";
        //String reportType = 'STS';
        String reportType = "LTS";
        String startDate = "230129233105";
        String endDate = "230129233105";
        this.queryParams.put("reportType",reportType);
        this.queryParams.put("startDate", startDate);
        this.queryParams.put("endDate", endDate);

        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountStakeholder"));

        HttpResponseMessage response = getCtaasDashboardReport.run(this.request, subaccountId, this.context);
        this.context.getLogger().info(response.getBody().toString());
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("response"));
    }

    @Test
    public void getDashboardReportWithNullStartDate() {
        String subaccountId = "2c8e386b-d1bd-48b3-b73a-12bfa5d00805";
        String endDate = "230129233105";
        String reportType = "LTS";
        this.queryParams.put("reportType",reportType);
        this.queryParams.put("endDate", endDate);

        HttpResponseMessage response = getCtaasDashboardReport.run(this.request, subaccountId, this.context);
        this.context.getLogger().info(response.getBody().toString());
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        this.context.getLogger().info("body " + body);

        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = "Start Date provided is invalid.";
        assertEquals(expectedMessage, jsonBody.getString("error"));
    }

    @Test
    public void getDashboardReportWithNullEndDate() {
        String subaccountId = "2c8e386b-d1bd-48b3-b73a-12bfa5d00805";
        String startDate = "230129233105";
        String reportType = "LTS";
        this.queryParams.put("reportType",reportType);
        this.queryParams.put("startDate", startDate);

        HttpResponseMessage response = getCtaasDashboardReport.run(this.request, subaccountId, this.context);
        this.context.getLogger().info(response.getBody().toString());
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        this.context.getLogger().info("body " + body);

        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = "End Date provided is invalid.";
        assertEquals(expectedMessage, jsonBody.getString("error"));
    }
    @Test
    public void getDashboardReportWithNullSubaccountId() {
        String subaccountId = "EMPTY";
        String reportType = "LTS";
        String startDate = "230129233105";
        String endDate = "230129233105";
        this.queryParams.put("reportType",reportType);
        this.queryParams.put("startDate", startDate);
        this.queryParams.put("endDate", endDate);

        HttpResponseMessage response = getCtaasDashboardReport.run(this.request, subaccountId, this.context);
        this.context.getLogger().info(response.getBody().toString());
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_SUBACCOUNT_ID_NOT_FOUND;
        assertEquals(expectedMessage, jsonBody.getString("error"));
    }

    @Tag("security")
    @Test
    public void unauthorizedTest() {
        this.headers.remove("authorization");
        String subaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        //When - Action
        HttpResponseMessage response = getCtaasDashboardReport.run(this.request, subaccountId, this.context);
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

    @Tag("security")
    @Test
    public void forbiddenTest() {
        //Given - Arrange
        String id = "EMPTY";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));

        //When - Action
        HttpResponseMessage response = getCtaasDashboardReport.run(this.request, id, this.context);
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
}
