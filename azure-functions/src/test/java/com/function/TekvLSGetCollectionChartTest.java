package com.function;

import com.function.auth.RoleAuthHandler;
import com.function.spotlightCharts.TekvLSGetCallsStatusSummary;
import com.function.spotlightCharts.TekvLSGetCollectionChart;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doThrow;

public class TekvLSGetCollectionChartTest extends TekvLSTest {

    private final TekvLSGetCollectionChart getCollectionChart = new TekvLSGetCollectionChart();

    @BeforeEach
    public void setup(){
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @Tag("acceptance")
    @Test
    public void getCollectionChartWithUsersAndRegionsTest() {
        String subaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        String regions = "[{\"country\":\"United States\",\"state\":\"FL\",\"city\":Tampa}]";
        String startDate = "2023-06-24 00:00:00";
        String endDate = "2023-06-30 19:48:29";
        String users = "[2142428813]";
        String reportType = "FeatureFunctionality";
        this.queryParams.put("subaccountId",subaccountId);
        this.queryParams.put("startDate", startDate);
        this.queryParams.put("endDate", endDate);
        this.queryParams.put("regions",regions);
        this.queryParams.put("users",users);
        this.queryParams.put("reportType",reportType);
        HttpResponseMessage response = getCollectionChart.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));
    }

    @Tag("acceptance")
    @Test
    public void getCollectionChartWithCallingReliabilityTest() {
        String subaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        String regions = "[{\"country\":\"United States\",\"state\":\"FL\",\"city\":Tampa}]";
        String startDate = "2023-06-24 00:00:00";
        String endDate = "2023-06-30 19:48:29";
        String users = "[2142428813]";
        String reportType = "CallingReliability";
        this.queryParams.put("subaccountId",subaccountId);
        this.queryParams.put("startDate", startDate);
        this.queryParams.put("endDate", endDate);
        this.queryParams.put("regions",regions);
        this.queryParams.put("users",users);
        this.queryParams.put("reportType",reportType);
        HttpResponseMessage response = getCollectionChart.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void getForIncorrectTapUrlTest() {
        //Given
        String subaccountId = "0196aea4-2c5f-4e3e-8be1-4f203fab6c85";
        String startDate = "2023-06-24 00:00:00";
        String endDate = "2023-06-30 19:48:29";
        this.queryParams.put("subaccountId",subaccountId);
        this.queryParams.put("startDate", startDate);
        this.queryParams.put("endDate", endDate);

        //When
        HttpResponseMessage response = getCollectionChart.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus, "HTTP Status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = "Unable to execute the query, invalid tap url";
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }

    @Test
    public void getForIncorrectSubaccountIdTest() {
        //Given
        String subaccountId = "f5e609c0-8c70-4a10-6dc8-9556bdb5652c";
        String startDate = "2023-06-24 00:00:00";
        String endDate = "2023-06-30 19:48:29";
        this.queryParams.put("subaccountId",subaccountId);
        this.queryParams.put("startDate", startDate);
        this.queryParams.put("endDate", endDate);
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountStakeholder"));

        //When
        HttpResponseMessage response = getCollectionChart.run(this.request, this.context);
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
    public void genericExceptionTest() {
        //Given
        String subaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        String startDate = "2023-06-24 00:00:00";
        String endDate = "2023-06-30 19:48:29";
        this.queryParams.put("subaccountId",subaccountId);
        this.queryParams.put("startDate", startDate);
        this.queryParams.put("endDate", endDate);
        doThrow(new RuntimeException("Error message")).when(this.request).createResponseBuilder(HttpStatus.OK);

        //When
        HttpResponseMessage response = getCollectionChart.run(this.request, this.context);
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
        String subaccountId = "f5a60920-8b70-4a10-9dc8-9536bdb5652c";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));

        //When - Action
        HttpResponseMessage response;
        try {
            response = new EnvironmentVariables("POSTGRESQL_SERVER", "test").execute(
                    () -> getCollectionChart.run(this.request, this.context));
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

        String expectedResponse = "SQL Exception: The connection attempt failed.";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse);
    }

    @Tag("security")
    @Test
    public void unauthorizedTest() {
        //Given - Arrange
        this.headers.remove("authorization");

        //When - Action
        HttpResponseMessage response = getCollectionChart.run(this.request, this.context);
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

    @Tag("Security")
    @Test
    public void invalidRoleTest(){
        //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));

        //When
        HttpResponseMessage response = getCollectionChart.run(this.request, this.context);
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
}