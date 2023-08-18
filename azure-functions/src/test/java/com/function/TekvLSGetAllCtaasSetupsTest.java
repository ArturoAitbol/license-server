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

public class TekvLSGetAllCtaasSetupsTest extends TekvLSTest {

    private TekvLSGetAllCtaasSetups tekvLSGetAllCtaasSetups;

    @BeforeEach
    public void setup(){
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
        this.tekvLSGetAllCtaasSetups = new TekvLSGetAllCtaasSetups();
    }

    @Tag("acceptance")
    @Test
    public void getAllCtaasSetupsTest(){
        //Given
        String id = "EMPTY";

        // When
        HttpResponseMessage response = tekvLSGetAllCtaasSetups.run(this.request,id,this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("ctaasSetups"));

        JSONArray ctaasSetups = jsonBody.getJSONArray("ctaasSetups");
        assertTrue(ctaasSetups.length()>0);

        JSONObject ctaasSetup = ctaasSetups.getJSONObject(0);
        assertTrue(ctaasSetup.has("id"));
        assertTrue(ctaasSetup.has("subaccountId"));
        assertTrue(ctaasSetup.has("status"));
        assertTrue(ctaasSetup.has("azureResourceGroup"));
        assertTrue(ctaasSetup.has("tapUrl"));
        assertTrue(ctaasSetup.has("onBoardingComplete"));
    }

    @Tag("acceptance")
    @Test
    public void getCtaasSetupByIdTest() {
        //Given
        String id = "39b5ed3f-9ab2-4feb-a2ac-9c450db181a0";

        //When
        HttpResponseMessage response = tekvLSGetAllCtaasSetups.run(this.request, id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus, "HTTP Status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("ctaasSetups"));

        JSONArray ctaasSetups = jsonBody.getJSONArray("ctaasSetups");
        assertEquals(1, ctaasSetups.length());

        JSONObject ctaasSetup = (JSONObject) ctaasSetups.get(0);
        String actualId = ctaasSetup.getString("id");
        assertEquals(id, actualId, "Actual Id doesn't match with: ".concat(id));
    }

    @Tag("acceptance")
    @Test
    public void getBySubaccountIdTest() {
        //Given
        String id = "EMPTY";
        String subaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        this.queryParams.put("subaccountId",subaccountId);

        //When
        HttpResponseMessage response = tekvLSGetAllCtaasSetups.run(this.request, id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus, "HTTP Status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("ctaasSetups"));

        JSONArray ctaasSetups = jsonBody.getJSONArray("ctaasSetups");
        assertTrue(ctaasSetups.length()>0);
    }

    @Tag("acceptance")
    @Test
    public void getForDistributorRoleTest(){
        
        String id="EMPTY";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("distributorAdmin"));

        //When
        HttpResponseMessage response = tekvLSGetAllCtaasSetups.run(this.request, id, this.context);
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

    @Tag("acceptance")
    @Test
    public void getForCustomerRoleTest(){
        //Given
        String id = "EMPTY";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));

        // When
        HttpResponseMessage response = tekvLSGetAllCtaasSetups.run(this.request,id,this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("ctaasSetups"));

        JSONArray ctaasSetups = jsonBody.getJSONArray("ctaasSetups");
        assertEquals(1, ctaasSetups.length());

        JSONObject ctaasSetup = ctaasSetups.getJSONObject(0);
        assertTrue(ctaasSetup.has("id"));
        assertTrue(ctaasSetup.has("subaccountId"));
        assertTrue(ctaasSetup.has("status"));
        assertTrue(ctaasSetup.has("azureResourceGroup"));
        assertTrue(ctaasSetup.has("tapUrl"));
        assertTrue(ctaasSetup.has("onBoardingComplete"));

        String expectedCtaasSetupId = "836c9f23-fd61-4aa5-a5b9-17a9333d6dca";
        assertEquals(expectedCtaasSetupId,ctaasSetup.getString("id"));
    }

    @Tag("security")
    @Test
    public void getForCustomerRoleIncorrectIdTest(){
        //Given
        String id = "d9cb5f93-c4d0-427e-8133-77905abd8487";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));

        // When
        HttpResponseMessage response = tekvLSGetAllCtaasSetups.run(this.request,id,this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_FOR_INVALID_ID;
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }

    @Tag("security")
    @Test
    public void getForCustomerRoleIncorrectSubaccountIdTest() {
        //Given
        String id = "EMPTY";
        String subaccountId = "cebe6542-2032-4398-882e-ffb44ade169d";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));
        this.queryParams.put("subaccountId",subaccountId);

        //When
        HttpResponseMessage response = tekvLSGetAllCtaasSetups.run(this.request, id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus, "HTTP Status doesn't match with: ".concat(expectedStatus.toString()));

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
        String id = "EMPTY";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));

        // When
        HttpResponseMessage response = tekvLSGetAllCtaasSetups.run(this.request,id,this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("ctaasSetups"));

        JSONArray ctaasSetups = jsonBody.getJSONArray("ctaasSetups");
        assertEquals(1, ctaasSetups.length());

        JSONObject ctaasSetup = ctaasSetups.getJSONObject(0);
        assertTrue(ctaasSetup.has("id"));
        assertTrue(ctaasSetup.has("subaccountId"));
        assertTrue(ctaasSetup.has("status"));
        assertTrue(ctaasSetup.has("azureResourceGroup"));
        assertTrue(ctaasSetup.has("tapUrl"));
        assertTrue(ctaasSetup.has("onBoardingComplete"));

        String expectedCtaasSetupId = "c079c3a9-66c7-424f-aa1b-fdc2565d617a";
        assertEquals(expectedCtaasSetupId,ctaasSetup.getString("id"));
    }
    
    @Tag("security")
    @Test
    public void getForSubaccountRoleIncorrectIdTest(){
        //Given
        String id = "b84852d7-0f04-4e9a-855c-7b2f01f61591";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));

        // When
        HttpResponseMessage response = tekvLSGetAllCtaasSetups.run(this.request,id,this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_FOR_INVALID_ID;
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }

    @Tag("security")
    @Test
    public void getForSubaccountRoleIncorrectSubaccountIdTest() {
        //Given
        String id = "EMPTY";
        String subaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));
        this.queryParams.put("subaccountId",subaccountId);

        //When
        HttpResponseMessage response = tekvLSGetAllCtaasSetups.run(this.request, id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus, "HTTP Status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_FOR_INVALID_ID;
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }

    @Tag("Security")
    @Test
    public void noTokenTest(){
        //Given
        String id = "EMPTY";
        this.headers.remove("authorization");

        //When
        HttpResponseMessage response = tekvLSGetAllCtaasSetups.run(this.request, id, this.context);
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
        String id="EMPTY";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));

        //When
        HttpResponseMessage response = tekvLSGetAllCtaasSetups.run(this.request, id, this.context);
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
    public void getCtaasSetupByNonexistentIdTest() {
        //Given
        String id = "00000000-0000-0000-0000-000000000000";

        //When
        HttpResponseMessage response = tekvLSGetAllCtaasSetups.run(this.request, id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus, "HTTP Status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedResponse = RoleAuthHandler.MESSAGE_ID_NOT_FOUND;
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void invalidIdTest(){
        //Given
        String id = "invalid-id";

        //When
        HttpResponseMessage response = tekvLSGetAllCtaasSetups.run(this.request, id, this.context);
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
        String id = "EMPTY";
        doThrow(new RuntimeException("Error message")).when(this.request).createResponseBuilder(HttpStatus.OK);

        //When
        HttpResponseMessage response = tekvLSGetAllCtaasSetups.run(this.request, id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = "Error message";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }
    
    @Tag("acceptance")
    @Test
    public void getForSalesAdminRoleTest(){
        //Given
        String id = "EMPTY";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("salesAdmin"));
        // When
        HttpResponseMessage response = tekvLSGetAllCtaasSetups.run(this.request,id,this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("ctaasSetups"));

        JSONArray ctaasSetups = jsonBody.getJSONArray("ctaasSetups");
        assertTrue(ctaasSetups.length()>0);

        JSONObject ctaasSetup = ctaasSetups.getJSONObject(0);
        assertTrue(ctaasSetup.has("id"));
        assertTrue(ctaasSetup.has("subaccountId"));
        assertTrue(ctaasSetup.has("status"));
        assertTrue(ctaasSetup.has("azureResourceGroup"));
        assertTrue(ctaasSetup.has("tapUrl"));
        assertTrue(ctaasSetup.has("onBoardingComplete"));
    }
    
    @Tag("acceptance")
    @Test
    public void getForConfigTesterRoleTest(){
        //Given
        String id = "EMPTY";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("configTester"));
        // When
        HttpResponseMessage response = tekvLSGetAllCtaasSetups.run(this.request,id,this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("ctaasSetups"));

        JSONArray ctaasSetups = jsonBody.getJSONArray("ctaasSetups");
        assertTrue(ctaasSetups.length()>0);

        JSONObject ctaasSetup = ctaasSetups.getJSONObject(0);
        assertTrue(ctaasSetup.has("id"));
        assertTrue(ctaasSetup.has("subaccountId"));
        assertTrue(ctaasSetup.has("status"));
        assertTrue(ctaasSetup.has("azureResourceGroup"));
        assertTrue(ctaasSetup.has("tapUrl"));
        assertTrue(ctaasSetup.has("onBoardingComplete"));
    }
    
    @Tag("acceptance")
    @Test
    public void getForSubaccountStakeholderRoleTest(){
        //Given
        String id = "EMPTY";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountStakeholder"));

        // When
        HttpResponseMessage response = tekvLSGetAllCtaasSetups.run(this.request,id,this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("ctaasSetups"));

        JSONArray ctaasSetups = jsonBody.getJSONArray("ctaasSetups");
        assertEquals(1, ctaasSetups.length());

        JSONObject ctaasSetup = ctaasSetups.getJSONObject(0);
        assertTrue(ctaasSetup.has("id"));
        assertTrue(ctaasSetup.has("subaccountId"));
        assertTrue(ctaasSetup.has("status"));
        assertTrue(ctaasSetup.has("azureResourceGroup"));
        assertTrue(ctaasSetup.has("tapUrl"));
        assertTrue(ctaasSetup.has("onBoardingComplete"));

        String expectedCtaasSetupId = "c079c3a9-66c7-424f-aa1b-fdc2565d617a";
        assertEquals(expectedCtaasSetupId,ctaasSetup.getString("id"));
    }
    
    @Tag("security")
    @Test
    public void getForSubaccountStakeholderRoleIncorrectIdTest(){
        //Given
        String id = "b84852d7-0f04-4e9a-855c-7b2f01f61591";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountStakeholder"));

        // When
        HttpResponseMessage response = tekvLSGetAllCtaasSetups.run(this.request,id,this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_FOR_INVALID_ID;
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }
    
}
