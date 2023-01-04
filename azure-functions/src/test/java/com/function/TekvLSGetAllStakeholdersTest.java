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

public class TekvLSGetAllStakeholdersTest  extends TekvLSTest {

    private final TekvLSGetAllStakeholders tekvLSGetAllStakeholders = new TekvLSGetAllStakeholders();
    
    @BeforeEach
    public void setup(){
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @Tag("acceptance")
    @Test
    public void getAllStakeHoldersTest(){
        //Given
        String email = "EMPTY";

        // When
        HttpResponseMessage response = tekvLSGetAllStakeholders.run(this.request,email,this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("stakeHolders"));

        JSONArray stakeHolders = jsonBody.getJSONArray("stakeHolders");
        assertTrue(stakeHolders.length()>0);

        JSONObject stakeHolder = stakeHolders.getJSONObject(0);
        assertTrue(stakeHolder.has("email"));
        assertTrue(stakeHolder.has("subaccountId"));
        assertTrue(stakeHolder.has("name"));
        assertTrue(stakeHolder.has("jobTitle"));
        assertTrue(stakeHolder.has("companyName"));
        assertTrue(stakeHolder.has("phoneNumber"));
    }

    @Tag("acceptance")
    @Test
    public void getStakeHoldersByEmailTest() {
        //Given
        String stakeHolderEmail = "test-customer-subaccount-stakeholder@tekvizionlabs.com";
       //When
        HttpResponseMessage response = tekvLSGetAllStakeholders.run(this.request, stakeHolderEmail, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus, "HTTP Status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("stakeHolders"));

        JSONArray stakeHolders = jsonBody.getJSONArray("stakeHolders");
        assertEquals(1, stakeHolders.length());

        JSONObject stakeHolder = (JSONObject) stakeHolders.get(0);
        String actualEmail = stakeHolder.getString("email");
        assertEquals(stakeHolderEmail, actualEmail, "Actual Id doesn't match with: ".concat(stakeHolderEmail));
    }

    @Tag("acceptance")
    @Test
    public void getBySubaccountIdTest() {
        //Given
        String id = "EMPTY";
        String subaccountId = "2c8e386b-d1bd-48b3-b73a-12bfa5d00805";
        this.queryParams.put("subaccountId",subaccountId);

        //When
        HttpResponseMessage response = tekvLSGetAllStakeholders.run(this.request, id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus, "HTTP Status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("stakeHolders"));

        JSONArray stakeHolders = jsonBody.getJSONArray("stakeHolders");
        assertTrue(stakeHolders.length()>0);
        
        JSONObject stakeHolder = stakeHolders.getJSONObject(0);
        assertTrue(stakeHolder.has("email"));
        assertTrue(stakeHolder.has("subaccountId"));
        assertTrue(stakeHolder.has("name"));
        assertTrue(stakeHolder.has("jobTitle"));
        assertTrue(stakeHolder.has("companyName"));
        assertTrue(stakeHolder.has("phoneNumber"));
    }

    @Tag("acceptance")
    @Test
    public void getForDistributorRoleTest(){
        //Given
        String id="EMPTY";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("distributorAdmin"));

        //When
        HttpResponseMessage response = tekvLSGetAllStakeholders.run(this.request, id, this.context);
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
        String email = "EMPTY";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));

        // When
        HttpResponseMessage response = tekvLSGetAllStakeholders.run(this.request,email,this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("stakeHolders"));

        JSONArray stakeHolders = jsonBody.getJSONArray("stakeHolders");
        assertEquals(1,stakeHolders.length());

//        JSONObject stakeHolder = stakeHolders.getJSONObject(0);
//        assertTrue(stakeHolder.has("email"));
//        assertTrue(stakeHolder.has("subaccountId"));
//        assertTrue(stakeHolder.has("name"));
//        assertTrue(stakeHolder.has("jobTitle"));
//        assertTrue(stakeHolder.has("companyName"));
//        assertTrue(stakeHolder.has("phoneNumber"));
    }

    @Tag("security")
    @Test
    public void getForCustomerRoleIncorrectIdTest(){
        //Given
        String email = "test-customer-subaccount-stakeholder@tekvizionlabs.com";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));

        // When
        HttpResponseMessage response = tekvLSGetAllStakeholders.run(this.request,email,this.context);
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
        HttpResponseMessage response = tekvLSGetAllStakeholders.run(this.request, id, this.context);
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
        HttpResponseMessage response = tekvLSGetAllStakeholders.run(this.request,id,this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("stakeHolders"));

        JSONArray stakeHolders = jsonBody.getJSONArray("stakeHolders");
        assertEquals(2, stakeHolders.length());

        JSONObject stakeHolder = stakeHolders.getJSONObject(0);
        assertTrue(stakeHolder.has("email"));
        assertTrue(stakeHolder.has("subaccountId"));
        assertTrue(stakeHolder.has("name"));
        assertTrue(stakeHolder.has("jobTitle"));
        assertTrue(stakeHolder.has("companyName"));
        assertTrue(stakeHolder.has("phoneNumber"));
    }
    
    @Tag("security")
    @Test
    public void getForSubaccountRoleIncorrectIdTest(){
        //Given
    	String email = "test-customer-subaccount-stakeholder1@tekvizionlabs.com";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));

        // When
        HttpResponseMessage response = tekvLSGetAllStakeholders.run(this.request,email,this.context);
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
    public void getForSubaccountRoleIncorrectIdTest2(){
        //Given
        String email = "test-customer-subaccount-stakeholder1@tekvizionlabs.com";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("configTester"));

        // When
        HttpResponseMessage response = tekvLSGetAllStakeholders.run(this.request,email,this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_ID_NOT_FOUND;
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }

    @Tag("security")
    @Test
    public void getForSubaccountRoleIncorrectSubaccountIdTest() {
        //Given
        String email = "EMPTY";
        String subaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));
        this.queryParams.put("subaccountId",subaccountId);

        //When
        HttpResponseMessage response = tekvLSGetAllStakeholders.run(this.request, email, this.context);
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
        String email = "EMPTY";
        this.headers.remove("authorization");

        //When
        HttpResponseMessage response = tekvLSGetAllStakeholders.run(this.request, email, this.context);
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
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @Tag("Security")
    @Test
    public void invalidRoleTest(){
        //Given
        String id="EMPTY";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));

        //When
        HttpResponseMessage response = tekvLSGetAllStakeholders.run(this.request, id, this.context);
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
    public void genericExceptionTest(){
        //Given
        String email = "EMPTY";
        doThrow(new RuntimeException("Error message")).when(this.request).createResponseBuilder(HttpStatus.OK);

        //When
        HttpResponseMessage response = tekvLSGetAllStakeholders.run(this.request, email, this.context);
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
        
        this.initTestParameters();
    }
    
    @Tag("acceptance")
    @Test
    public void getForConfigTesterRoleTest(){
        //Given
        String id = "EMPTY";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("configTester"));
        // When
        HttpResponseMessage response = tekvLSGetAllStakeholders.run(this.request,id,this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("stakeHolders"));

        JSONArray stakeHolders = jsonBody.getJSONArray("stakeHolders");
        assertTrue(stakeHolders.length()>0);

        JSONObject stakeHolder = stakeHolders.getJSONObject(0);
        assertTrue(stakeHolder.has("email"));
        assertTrue(stakeHolder.has("subaccountId"));
        assertTrue(stakeHolder.has("name"));
        assertTrue(stakeHolder.has("jobTitle"));
        assertTrue(stakeHolder.has("companyName"));
        assertTrue(stakeHolder.has("phoneNumber"));
    }

    @Tag("acceptance")
    @Test
    public void sqlExceptionTest() {
        //Given
        String id = "EMPTY";
        String subaccountId = "INVALID";
        this.queryParams.put("subaccountId",subaccountId);

        //When
        HttpResponseMessage response = tekvLSGetAllStakeholders.run(this.request, id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expectedStatus, actualStatus, "HTTP Status doesn't match with: ".concat(expectedStatus.toString()));


        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = "ERROR: invalid input syntax for type uuid: \"INVALID\"";
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }
    
}
