package com.function;
import com.function.auth.RoleAuthHandler;
import com.function.spotlightCharts.TekvLSGetCtaasMapSummary;
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

public class TekvLSGetCtaasMapSummaryTest extends TekvLSTest {
    TekvLSGetCtaasMapSummary getCtaasMapSummary;

    @BeforeEach
    public void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
        this.getCtaasMapSummary = new TekvLSGetCtaasMapSummary();
    }

    @Tag("acceptance")
    @Test
    public void getMapDataWithoutRegions() {
        String subaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        String startDate = "2023-06-29 00:00:00";
        String endDate = "2023-06-29 19:27:19";
        this.queryParams.put("subaccountId", subaccountId);
        this.queryParams.put("startDate", startDate);
        this.queryParams.put("endDate", endDate);

        HttpResponseMessage response = getCtaasMapSummary.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));
    }

    @Tag("acceptance")
    @Test
    public void getMapDataWithRegions() {
        String subaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        String startDate = "2023-06-29 00:00:00";
        String endDate = "2023-06-29 19:27:19";
        String regions = "[{\"country\":\"United States\",\"state\":\"IL\",\"city\":\"Chicago\",\"displayName\":\"Chicago, IL, United States\"}]";
        this.queryParams.put("subaccountId", subaccountId);
        this.queryParams.put("startDate", startDate);
        this.queryParams.put("endDate", endDate);
        this .queryParams.put("regions", regions);
        HttpResponseMessage response = getCtaasMapSummary.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));
    }

    @Test
    public void getMapDataSQLException() {
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
        String subaccountId = "b5b91753-4c2b-43f5-afa0-feb00cefa981";
        String startDate = "2023-06-29 00:00:00";
        String endDate = "2023-06-29 19:27:19";
        String regions = "[{\"country\":\"United States\",\"state\":\"IL\",\"city\":\"Chicago\",\"displayName\":\"Chicago, IL, United States\"}]";
        this.queryParams.put("subaccountId", subaccountId);
        this.queryParams.put("startDate", startDate);
        this.queryParams.put("endDate", endDate);
        this .queryParams.put("regions", regions);

        HttpResponseMessage response;
        try {
            response = new EnvironmentVariables("POSTGRESQL_SERVER", "test").execute(
                    () -> getCtaasMapSummary.run(this.request, this.context));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void getMapDataWithoutStartDate() {
        String subaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        String endDate = "2023-06-29 19:27:19";
        String regions = "[{\"country\":\"United States\",\"state\":\"IL\",\"city\":\"Chicago\",\"displayName\":\"Chicago, IL, United States\"}]";
        this.queryParams.put("subaccountId", subaccountId);
        this.queryParams.put("endDate", endDate);
        this .queryParams.put("regions", regions);
        HttpResponseMessage response = getCtaasMapSummary.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        this.context.getLogger().info("body " + body);

        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = "Missing mandatory parameter: startDate";
        assertEquals(expectedMessage, jsonBody.getString("error"));

    }

    @Test
    public void getMapDataWithoutEndDate() {
        String subaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        String startDate = "2023-06-29T00:00:00Z";
        String regions = "[{\"country\":\"United States\",\"state\":\"IL\",\"city\":\"Chicago\",\"displayName\":\"Chicago, IL, United States\"}]";
        this.queryParams.put("subaccountId", subaccountId);
        this.queryParams.put("startDate", startDate);
        this .queryParams.put("regions", regions);
        HttpResponseMessage response = getCtaasMapSummary.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));
    }

    @Test
    public void getMapDataWithoutSubaccountId() {
        String startDate = "2023-06-29 00:00:00";
        String endDate = "2023-06-29 19:27:19";
        String regions = "[{\"country\":\"United States\",\"state\":\"IL\",\"city\":\"Chicago\",\"displayName\":\"Chicago, IL, United States\"}]";
        this.queryParams.put("endDate", endDate);
        this.queryParams.put("startDate", startDate);
        this .queryParams.put("regions", regions);
        HttpResponseMessage response = getCtaasMapSummary.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        this.context.getLogger().info("body " + body);

        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = "Missing mandatory parameter: subaccountId";
        assertEquals(expectedMessage, jsonBody.getString("error"));
    }

    @Tag("Security")
    @Test
    public void noTokenTest() {
        //Given
        this.headers.remove("authorization");

        //When
        HttpResponseMessage response = getCtaasMapSummary.run(this.request, this.context);
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
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));

        //When
        HttpResponseMessage response = getCtaasMapSummary.run(this.request, this.context);
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
        String subaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        String startDate = "2023-06-29 00:00:00";
        String endDate = "2023-06-29 19:27:19";
        this.queryParams.put("subaccountId", subaccountId);
        this.queryParams.put("startDate", startDate);
        this.queryParams.put("endDate", endDate);
        doThrow(new RuntimeException("Error message")).when(this.request).createResponseBuilder(HttpStatus.OK);

        //When
        HttpResponseMessage response = getCtaasMapSummary.run(this.request, this.context);
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
    public void getMapDataWithoutTAPurl() {
        String subaccountId = "0196aea4-2c5f-4e3e-8be1-4f203fab6c85";
        String startDate = "2023-06-29 00:00:00";
        String endDate = "2023-06-29 19:27:19";
        this.queryParams.put("subaccountId", subaccountId);
        this.queryParams.put("startDate", startDate);
        this.queryParams.put("endDate", endDate);

        HttpResponseMessage response = getCtaasMapSummary.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));


        String body = (String) response.getBody();
        this.context.getLogger().info("body " + body);

        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = "Unable to execute the query, invalid tap url";
        assertEquals(expectedMessage, jsonBody.getString("error"));
    }

    @Test
    public void getMapDataUnExistantSubaccountId() {
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountStakeholder"));
        String subaccountId = "2196bea4-2b5e-6e3e-3be1-4a203fae6a65";
        String startDate = "2023-06-29 00:00:00";
        String endDate = "2023-06-29 19:27:19";
        this.queryParams.put("subaccountId", subaccountId);
        this.queryParams.put("startDate", startDate);
        this.queryParams.put("endDate", endDate);

        HttpResponseMessage response = getCtaasMapSummary.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));


        String body = (String) response.getBody();
        this.context.getLogger().info("body " + body);

        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));
    }

    @Test
    public void getMapDataWithMoreThanOneRegion() {
        String subaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        String startDate = "2023-06-29 00:00:00";
        String endDate = "2023-06-29 19:27:19";
        String regions = "[{\"country\":\"United States\",\"state\":\"IL\",\"city\":\"Chicago\"},{\"country\":\"United States\",\"state\":\"NV\",\"city\":\"Las Vegas\"}]";
        this.queryParams.put("subaccountId", subaccountId);
        this.queryParams.put("startDate", startDate);
        this.queryParams.put("endDate", endDate);
        this .queryParams.put("regions", regions);
        HttpResponseMessage response = getCtaasMapSummary.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));
    }
}