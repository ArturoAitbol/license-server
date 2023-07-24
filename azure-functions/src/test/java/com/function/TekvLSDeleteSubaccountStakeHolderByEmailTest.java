package com.function;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;

import java.util.Optional;

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
import uk.org.webcompere.systemstubs.environment.EnvironmentVariables;

public class TekvLSDeleteSubaccountStakeHolderByEmailTest  extends TekvLSTest {

    private final TekvLSDeleteSubaccountStakeHolderByEmail tekvLSDeleteSubaccountStakeHolderByEmail = new TekvLSDeleteSubaccountStakeHolderByEmail();
    private final TekvLSCreateSubaccountStakeHolder tekvLSCreateSubaccountStakeHolder = new TekvLSCreateSubaccountStakeHolder();

    private String stakeHolderEmail ="test-customer-subaccount-stakeholder1@tekvizion.com";

    @BeforeEach
    void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @Test
    public void deleteStakeHolderTest() {
        //Given
    	 String bodyRequest = "{'subaccountId': '8acb6997-4d6a-4427-ba2c-7bf463fa08ec'," +
                 "'subaccountAdminEmail': '"+this.stakeHolderEmail +"'," +
                 "'name': 'test-customer-subaccount-stakeholder'," +
                 "'jobTitle': 'Software Engineer'," +
                 "'companyName': 'TekVizion'," +
                 "'emailNotifications': true," +
                 "'phoneNumber': '+12142425968'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        HttpResponseMessage createResponse = tekvLSCreateSubaccountStakeHolder.run(this.request,this.context);
        this.context.getLogger().info(createResponse.getBody().toString());
        assertEquals(HttpStatus.OK, createResponse.getStatus(),"HTTP status doesn't match with: ".concat(HttpStatus.OK.toString()));
        JSONObject jsonBody = new JSONObject(createResponse.getBody().toString());
        assertTrue(jsonBody.has("subaccountAdminEmail"));
        this.stakeHolderEmail = jsonBody.getString("subaccountAdminEmail");

        //When
        HttpResponseMessage response = tekvLSDeleteSubaccountStakeHolderByEmail.run(this.request,this.stakeHolderEmail, this.context);
        this.context.getLogger().info(response.getStatus().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Tag("Security")
    @Test
    public void noTokenTest() {
        //Given
        this.headers.remove("authorization");

        //When
        HttpResponseMessage response = tekvLSDeleteSubaccountStakeHolderByEmail.run(this.request,this.stakeHolderEmail, this.context);
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
    public void invalidRoleTest() {
        //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));

        //When
        HttpResponseMessage response = tekvLSDeleteSubaccountStakeHolderByEmail.run(this.request,this.stakeHolderEmail, this.context);
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
    public void genericExceptionTest() {
        //Given
        this.stakeHolderEmail = "test-customer-subaccount-stakeholder1@tekvizion.com";
        doThrow(new RuntimeException("Error message")).when(this.request).createResponseBuilder(HttpStatus.OK);

        //When
        HttpResponseMessage response = tekvLSDeleteSubaccountStakeHolderByEmail.run(this.request,this.stakeHolderEmail, this.context);
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

    @Test
    public void sqlExceptionTest() {
        //Given
        String bodyRequest = "{'notifications': 'email,text'," +
                "'name': 'test-customer-subaccount-stakeholder'," +
                "'jobTitle': 'Software Engineer'," +
                "'companyName': 'TekVizion'," +
                "'phoneNumber': '+12142425968'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response;
        try {
            response = new EnvironmentVariables("POSTGRESQL_SERVER", "test").execute(
                    () -> tekvLSDeleteSubaccountStakeHolderByEmail.run(this.request,this.stakeHolderEmail, this.context));
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
}
