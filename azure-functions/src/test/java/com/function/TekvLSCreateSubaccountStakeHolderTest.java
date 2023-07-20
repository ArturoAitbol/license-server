package com.function;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;

import java.util.Optional;

import org.json.JSONObject;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;

public class TekvLSCreateSubaccountStakeHolderTest  extends TekvLSTest {

    private final TekvLSCreateSubaccountStakeHolder tekvLSCreateSubaccountStakeHolder = new TekvLSCreateSubaccountStakeHolder();
    private final TekvLSDeleteSubaccountStakeHolderByEmail tekvLSDeleteSubaccountStakeHolderByEmail = new TekvLSDeleteSubaccountStakeHolderByEmail();
    private String stakeHolderEmail = "EMPTY";

    @BeforeEach
    void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @AfterEach
    void tearDown() {
        if (!this.stakeHolderEmail.equals("EMPTY")){
            HttpResponseMessage response = tekvLSDeleteSubaccountStakeHolderByEmail.run(this.request, this.stakeHolderEmail, this.context);
            this.context.getLogger().info(response.getStatus().toString());
            this.stakeHolderEmail = "EMPTY";

            HttpStatusType actualStatus = response.getStatus();
            HttpStatus expected = HttpStatus.OK;
            assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
        }
    }

    @Tag("acceptance")
    @Test
    void createStakeHolder() {
        //Given
    	String stakeHolderEmail = "test-customer-subaccount-stakeholder1@tekvizion.com";
        String bodyRequest = "{'subaccountId': '8acb6997-4d6a-4427-ba2c-7bf463fa08ec'," +
                "'subaccountAdminEmail': '"+stakeHolderEmail+"'," +
                "'notifications': 'email,text'," +
                "'name': 'test-customer-subaccount-stakeholder'," +
                "'jobTitle': 'Software Engineer'," +
                "'companyName': 'TekVizion'," +
                "'emailNotifications': true," +
                "'phoneNumber': '+12142425968'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateSubaccountStakeHolder.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("subaccountAdminEmail"));

        this.stakeHolderEmail = jsonBody.getString("subaccountAdminEmail");
        assertNotNull(this.stakeHolderEmail);
        assertEquals(stakeHolderEmail,this.stakeHolderEmail,"Actual email is not: ".concat(stakeHolderEmail));
    }

    @Test
    void bodyWithoutSubaccountTest() {
        //Given
    	String stakeHolderEmail = "test-customer-subaccount-stakeholder@tekvizion.com";
        String bodyRequest = "{'subaccountAdminEmail': '"+stakeHolderEmail+"'," +
        		"'name': 'test-customer-subaccount-stakeholder'," +
        		  "'notifications': 'email,text'," +
                "'jobTitle': 'Software Engineer'," +
                "'companyName': 'TekVizion'," +
                "'phoneNumber': '+12142425968'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateSubaccountStakeHolder.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = "Missing mandatory parameter: subaccountId";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }
    
    @Test
    void bodyWithoutUserProfileTest() {
        //Given
    	String stakeHolderEmail = "test-customer-subaccount-stakeholder@tekvizion.com";
        String bodyRequest = "{'subaccountId': '8acb6997-4d6a-4427-ba2c-7bf463fa08ec'," +
                "'subaccountAdminEmail': '"+stakeHolderEmail+"'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateSubaccountStakeHolder.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = "Missing mandatory parameter: name";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }
    
    @Test
    void incompleteBodyTest() {
        //Given
    	String bodyRequest = "{'subaccountId': '8acb6997-4d6a-4427-ba2c-7bf463fa08ec'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateSubaccountStakeHolder.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = "Missing mandatory parameter: subaccountAdminEmail";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void noBodyTest(){
        //Given
        String bodyRequest = "";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateSubaccountStakeHolder.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedResponse = "error: request body is empty.";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void invalidBodyTest(){
        //Given
        String bodyRequest = "invalid-body";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateSubaccountStakeHolder.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedResponse = "A JSONObject text must begin with '{' at 1 [character 2 line 1]";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("Security")
    @Test
    public void noTokenTest(){
        //Given
        this.headers.remove("authorization");

        //When
        HttpResponseMessage response = tekvLSCreateSubaccountStakeHolder.run(this.request, this.context);
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
        HttpResponseMessage response = tekvLSCreateSubaccountStakeHolder.run(this.request, this.context);
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
    public void invalidSQLTest(){
        //Given
         String bodyRequest = "{'subaccountId': 'invalid-id'," +
              "'subaccountAdminEmail': 'test-customer-subaccount-stakeholder@tekvizion.com'," +
              "'notifications': 'email,text'," +
              "'name': 'test-customer-subaccount-stakeholder'," +
              "'jobTitle': 'Software Engineer'," +
              "'companyName': 'TekVizion'," +
                 "'emailNotifications': false," +
              "'phoneNumber': '+12142425968'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateSubaccountStakeHolder.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void genericExceptionTest(){
        //Given
    	this.stakeHolderEmail = "test-customer-subaccount-stakeholder@tekvizion.com";
        String bodyRequest = "{'subaccountId': '8acb6997-4d6a-4427-ba2c-7bf463fa08ec'," +
                "'subaccountAdminEmail': '"+this.stakeHolderEmail+"'," +
                "'notifications': 'email,text'," +
                "'name': 'test-customer-subaccount-stakeholder'," +
                "'jobTitle': 'Software Engineer'," +
                "'companyName': 'TekVizion'," +
                "'emailNotifications': true," +
                "'phoneNumber': '+12142425968'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        doThrow(new RuntimeException("Error message")).when(this.request).createResponseBuilder(HttpStatus.OK);

        //When
        HttpResponseMessage response = tekvLSCreateSubaccountStakeHolder.run(this.request, this.context);
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
    void createStakeHolderWhenSetupIsNotReady() {
        //Given
        String stakeHolderEmail = "test-customer-subaccount-stakeholder1@tekvizion.com";
        String bodyRequest = "{'subaccountId': 'b5b91753-4c2b-43f5-afa0-feb00cefa981'," +
                "'subaccountAdminEmail': '"+stakeHolderEmail+"'," +
                "'notifications': 'email,text'," +
                "'name': 'test-customer-subaccount-stakeholder'," +
                "'jobTitle': 'Software Engineer'," +
                "'companyName': 'TekVizion'," +
                "'emailNotifications': true," +
                "'phoneNumber': '+12142425968'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateSubaccountStakeHolder.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = "UCaaS Continuous Testing Setup does not exist or is not ready";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }
}
