package com.function;

import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;

class TekvLSGetAllLicenseUsageDetailsTest extends TekvLSTest {

    private final TekvLSGetAllLicenseUsageDetails getAllLicenseUsageDetails = new TekvLSGetAllLicenseUsageDetails();
    private final TekvLSCreateLicenseUsageDetail tekvLSCreateLicenseUsageDetail = new TekvLSCreateLicenseUsageDetail();
    private final TekvLSDeleteLicenseUsageById tekvLSDeleteLicenseUsageById = new TekvLSDeleteLicenseUsageById();

    private String licenseUsageId;
    private final String subaccountId = "31c142a6-b735-4bce-bfb4-9fba6b539116";

    @BeforeEach
    void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
        String bodyRequest = "{'subaccountId': '"+subaccountId+"'," +
                "'projectId': 'f8e757f4-a7d2-416d-80df-beefba44f88f'," +
                "'deviceId': 'ef7a4bcd-fc3f-4f87-bf87-ae934799690b'," +
                "'consumptionDate': '2022-06-19'," +
                "'type': 'Configuration'," +
                "'usageDays': [0,4] }";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        HttpResponseMessage responseCreate = tekvLSCreateLicenseUsageDetail.run(this.request,this.context);
        this.context.getLogger().info(responseCreate.getBody().toString());
        assertEquals(HttpStatus.OK, responseCreate.getStatus(),"HTTP status doesn't match with: ".concat(HttpStatus.OK.toString()));
        JSONObject jsonBody = new JSONObject(responseCreate.getBody().toString());
        assertTrue(jsonBody.has("id"));
        this.licenseUsageId = jsonBody.getString("id");
    }

    @AfterEach
    void tearDown(){
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
        HttpResponseMessage response = tekvLSDeleteLicenseUsageById.run(this.request,this.licenseUsageId,this.context);
        this.context.getLogger().info(response.getStatus().toString());
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
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

        assertTrue(jsonBody.has("configurationTokens"));
        JSONArray configurationTokens = jsonBody.getJSONArray("configurationTokens");
        assertTrue(configurationTokens.length()>=0);
    }

    @Tag("acceptance")
    @Test
    public void getAllLicenseUsageDetailsForDistributorRoleTest(){
        //Given
        this.queryParams.put("subaccountId",subaccountId);
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

        assertTrue(jsonBody.has("usage"));
        JSONArray usage = jsonBody.getJSONArray("usage");
        assertTrue(usage.length()>=0);

        assertTrue(jsonBody.has("configurationTokens"));
        JSONArray configurationTokens = jsonBody.getJSONArray("configurationTokens");
        assertTrue(configurationTokens.length()>=0);
    }

    @Tag("acceptance")
    @Test
    public void getAllLicenseUsageDetailsForCustomerRoleTest(){
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

        assertTrue(jsonBody.has("usage"));
        JSONArray usage = jsonBody.getJSONArray("usage");
        assertTrue(usage.length()>=0);

        assertTrue(jsonBody.has("configurationTokens"));
        JSONArray configurationTokens = jsonBody.getJSONArray("configurationTokens");
        assertTrue(configurationTokens.length()>=0);
    }

    @Tag("acceptance")
    @Test
    public void getAllLicenseUsageDetailsForSubaccountRoleTest(){
        //Given
        this.queryParams.put("subaccountId",subaccountId);
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

        assertTrue(jsonBody.has("usage"));
        JSONArray usage = jsonBody.getJSONArray("usage");
        assertTrue(usage.length()>=0);

        assertTrue(jsonBody.has("configurationTokens"));
        JSONArray configurationTokens = jsonBody.getJSONArray("configurationTokens");
        assertTrue(configurationTokens.length()>=0);
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

        assertTrue(jsonBody.has("configurationTokens"));
        JSONArray configurationTokens = jsonBody.getJSONArray("configurationTokens");
        assertTrue(configurationTokens.length()>=0);
    }

    @Tag("acceptance")
    @Test
    public void specialFiltersTest(){
        //Given
        this.queryParams.put("subaccountId",subaccountId);
        this.queryParams.put("year","2022");
        this.queryParams.put("month","4");
        this.queryParams.put("projectId","f8e757f4-a7d2-416d-80df-beefba44f88f");
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

        assertTrue(jsonBody.has("configurationTokens"));
        JSONArray configurationTokens = jsonBody.getJSONArray("configurationTokens");
        assertTrue(configurationTokens.length()>=0);
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

        assertTrue(jsonBody.has("configurationTokens"));
        JSONArray configurationTokens = jsonBody.getJSONArray("configurationTokens");
        assertTrue(configurationTokens.length()>=0);
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