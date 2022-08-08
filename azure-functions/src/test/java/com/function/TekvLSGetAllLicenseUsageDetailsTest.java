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


import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.doThrow;

class TekvLSGetAllLicenseUsageDetailsTest extends TekvLSTest {

    private final TekvLSGetAllLicenseUsageDetails getAllLicenseUsageDetails = new TekvLSGetAllLicenseUsageDetails();

    private final String subaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";

    @BeforeEach
    void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @Tag("acceptance")
    @Test
    public void getAllLicenseUsageDetailsTest(){
        //Given
        this.queryParams.put("subaccountId",subaccountId);

        //When
        HttpResponseMessage response = getAllLicenseUsageDetails.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("usageTotalCount"));

        assertTrue(jsonBody.has("tokenConsumption"));

        assertTrue(jsonBody.has("usage"));
        JSONArray usage = jsonBody.getJSONArray("usage");
        assertTrue(usage.length()>=0);

        assertTrue(jsonBody.has("weeklyConsumption"));
        JSONArray weeklyConsumption = jsonBody.getJSONArray("weeklyConsumption");
        assertTrue(weeklyConsumption.length()>=0);

        assertTrue(jsonBody.has("projectConsumption"));
        JSONArray projectConsumption= jsonBody.getJSONArray("projectConsumption");
        assertTrue(projectConsumption.length()>=0);
    }

    @Tag("acceptance")
    @Test
    public void getForDistributorRoleTest(){
        //Given
        this.queryParams.put("subaccountId","cebe6542-2032-4398-882e-ffb44ade169d");
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("distributorAdmin"));

        //When
        HttpResponseMessage response = getAllLicenseUsageDetails.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("usageTotalCount"));

        assertTrue(jsonBody.has("tokenConsumption"));

        assertTrue(jsonBody.has("weeklyConsumption"));
        JSONArray weeklyConsumption = jsonBody.getJSONArray("weeklyConsumption");
        assertEquals(1, weeklyConsumption.length());

        assertTrue(jsonBody.has("usage"));
        JSONArray usage = jsonBody.getJSONArray("usage");
        assertEquals(1, usage.length());

        String expectedProjectId = "a42edf7f-9b38-472f-afa3-10a4632acca1";
        assertEquals(expectedProjectId,usage.getJSONObject(0).getString("projectId"));

        assertTrue(jsonBody.has("projectConsumption"));
        JSONArray projectConsumption= jsonBody.getJSONArray("projectConsumption");
        assertTrue(projectConsumption.length()>=0);
    }

    @Tag("security")
    @Test
    public void getForDistributorRoleIncorrectSubaccountIdTest(){
        //Given
        this.queryParams.put("subaccountId",subaccountId);
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("distributorAdmin"));

        //When
        HttpResponseMessage response = getAllLicenseUsageDetails.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_FOR_INVALID_ID;
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }


    @Tag("acceptance")
    @Test
    public void getForCustomerRoleTest(){
        //Given
        this.queryParams.put("subaccountId",subaccountId);
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));

        //When
        HttpResponseMessage response = getAllLicenseUsageDetails.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("usageTotalCount"));

        assertTrue(jsonBody.has("tokenConsumption"));

        assertTrue(jsonBody.has("weeklyConsumption"));
        JSONArray weeklyConsumption = jsonBody.getJSONArray("weeklyConsumption");
        assertEquals(1, weeklyConsumption.length());

        assertTrue(jsonBody.has("usage"));
        JSONArray usage = jsonBody.getJSONArray("usage");
        assertEquals(1, usage.length());

        String expectedProjectId = "2bdaf2af-838f-4053-b3fa-ef22aaa11b0d";
        assertEquals(expectedProjectId,usage.getJSONObject(0).getString("projectId"));

        assertTrue(jsonBody.has("projectConsumption"));
        JSONArray projectConsumption= jsonBody.getJSONArray("projectConsumption");
        assertTrue(projectConsumption.length()>=0);
    }

    @Tag("security")
    @Test
    public void getForCustomerRoleIncorrectSubaccountIdTest(){
        //Given
        this.queryParams.put("subaccountId","cebe6542-2032-4398-882e-ffb44ade169d");
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));

        //When
        HttpResponseMessage response = getAllLicenseUsageDetails.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_FOR_INVALID_ID;
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }


    @Tag("acceptance")
    @Test
    public void getForSubaccountRoleTest(){
        //Given
        this.queryParams.put("subaccountId","96234b32-32d3-45a4-af26-4c912c0d6a06");
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));

        //When
        HttpResponseMessage response = getAllLicenseUsageDetails.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("usageTotalCount"));

        assertTrue(jsonBody.has("tokenConsumption"));

        assertTrue(jsonBody.has("weeklyConsumption"));
        JSONArray weeklyConsumption = jsonBody.getJSONArray("weeklyConsumption");
        assertEquals(1, weeklyConsumption.length());

        assertTrue(jsonBody.has("usage"));
        JSONArray usage = jsonBody.getJSONArray("usage");
        assertEquals(1, usage.length());

        String expectedProjectId = "be612704-c26e-48ea-ab9b-19312f03d644";
        assertEquals(expectedProjectId,usage.getJSONObject(0).getString("projectId"));

        assertTrue(jsonBody.has("projectConsumption"));
        JSONArray projectConsumption= jsonBody.getJSONArray("projectConsumption");
        assertTrue(projectConsumption.length()>=0);
    }

    @Tag("security")
    @Test
    public void getForSubaccountRoleIncorrectSubaccountIdTest(){
        //Given
        this.queryParams.put("subaccountId",subaccountId);
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));

        //When
        HttpResponseMessage response = getAllLicenseUsageDetails.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_FOR_INVALID_ID;
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }

    @Tag("acceptance")
    @Test
    public void startAndEndDateFilterTest(){
        //Given
        this.queryParams.put("subaccountId",subaccountId);
        this.queryParams.put("startDate","2022-01-01");
        this.queryParams.put("endDate","2022-06-01");

        //When
        HttpResponseMessage response = getAllLicenseUsageDetails.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("usageTotalCount"));

        assertTrue(jsonBody.has("tokenConsumption"));

        assertTrue(jsonBody.has("usage"));
        JSONArray usage = jsonBody.getJSONArray("usage");
        assertTrue(usage.length()>=0);

        assertTrue(jsonBody.has("weeklyConsumption"));
        JSONArray weeklyConsumption = jsonBody.getJSONArray("weeklyConsumption");
        assertTrue(weeklyConsumption.length()>=0);

        assertTrue(jsonBody.has("projectConsumption"));
        JSONArray projectConsumption= jsonBody.getJSONArray("projectConsumption");
        assertTrue(projectConsumption.length()>=0);
    }

    @Tag("acceptance")
    @Test
    public void specialFiltersTest(){
        //Given
        this.queryParams.put("subaccountId",subaccountId);
        this.queryParams.put("year","2022");
        this.queryParams.put("month","4");
        this.queryParams.put("projectId","2bdaf2af-838f-4053-b3fa-ef22aaa11b0d");
        this.queryParams.put("type","Configuration");

        //When
        HttpResponseMessage response = getAllLicenseUsageDetails.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("usageTotalCount"));

        assertTrue(jsonBody.has("tokenConsumption"));

        assertTrue(jsonBody.has("usage"));
        JSONArray usage = jsonBody.getJSONArray("usage");
        assertTrue(usage.length()>=0);

        assertTrue(jsonBody.has("weeklyConsumption"));
        JSONArray weeklyConsumption = jsonBody.getJSONArray("weeklyConsumption");
        assertTrue(weeklyConsumption.length()>=0);

        assertTrue(jsonBody.has("projectConsumption"));
        JSONArray projectConsumption= jsonBody.getJSONArray("projectConsumption");
        assertTrue(projectConsumption.length()>=0);
    }

    @Tag("acceptance")
    @Test
    public void limitAndOffsetFilterTest(){
        //Given
        this.queryParams.put("subaccountId",subaccountId);
        this.queryParams.put("limit","10");
        this.queryParams.put("offset","1");

        //When
        HttpResponseMessage response = getAllLicenseUsageDetails.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("usageTotalCount"));

        assertTrue(jsonBody.has("tokenConsumption"));

        assertTrue(jsonBody.has("usage"));
        JSONArray usage = jsonBody.getJSONArray("usage");
        assertTrue(usage.length()>=0);

        assertTrue(jsonBody.has("weeklyConsumption"));
        JSONArray weeklyConsumption = jsonBody.getJSONArray("weeklyConsumption");
        assertTrue(weeklyConsumption.length()>=0);

        assertTrue(jsonBody.has("projectConsumption"));
        JSONArray projectConsumption= jsonBody.getJSONArray("projectConsumption");
        assertTrue(projectConsumption.length()>=0);
    }

    @Tag("acceptance")
    @Test
    public void summaryViewTest(){
        //Given
        this.queryParams.put("subaccountId",subaccountId);
        this.queryParams.put("view","summary");

        //When
        HttpResponseMessage response = getAllLicenseUsageDetails.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("devicesConnected"));
        assertTrue(jsonBody.has("tokensConsumed"));
    }

    @Tag("acceptance")
    @Test
    public void equipmentViewTest(){
        //Given
        this.queryParams.put("subaccountId",subaccountId);
        this.queryParams.put("view","equipment");

        //When
        HttpResponseMessage response = getAllLicenseUsageDetails.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("equipmentSummary"));

        JSONArray equipmentSummary = jsonBody.getJSONArray("equipmentSummary");
        assertTrue(equipmentSummary.length()>=0);
    }

    @Test
    public void noSubaccountIdTest(){
        //When
        HttpResponseMessage response = getAllLicenseUsageDetails.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = "Missing mandatory parameter: subaccountId";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("Security")
    @Test
    public void noTokenTest(){
        //Given
        this.headers.remove("authorization");

        //When
        HttpResponseMessage response = getAllLicenseUsageDetails.run(this.request, this.context);
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
    public void invalidRoleTest(){
        //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));

        //When
        HttpResponseMessage response = getAllLicenseUsageDetails.run(this.request, this.context);
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
    public void invalidIdTest(){
        //Given
        String subaccountId = "invalid-id";
        this.queryParams.put("subaccountId",subaccountId);
        //When
        HttpResponseMessage response = getAllLicenseUsageDetails.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualError = jsonBody.getString("error");
        assertTrue(actualError.contains("ERROR: invalid input syntax for type uuid"));
    }

    @Test
    public void genericExceptionTest(){
        //Given
        this.queryParams.put("subaccountId",subaccountId);
        doThrow(new RuntimeException("Error message")).when(this.request).createResponseBuilder(HttpStatus.OK);

        //When
        HttpResponseMessage response = getAllLicenseUsageDetails.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = "Error message";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));

        this.initTestParameters();
    }
}