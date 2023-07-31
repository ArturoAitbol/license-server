package com.function;

import static com.function.auth.RoleAuthHandler.MESSAGE_FOR_MISSING_CUSTOMER_EMAIL;
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

public class TekvLSModifyAuthUserProfileTest extends TekvLSTest {
	
	private final TekvLSModifyAuthUserProfile tekvLSModifyAuthUserProfile = new TekvLSModifyAuthUserProfile();
	
	@BeforeEach
    void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));
	}
	
	 @Tag("acceptance")
	 @Test
	 public void modifyAuthUserProfile(){
		 //Given
	        String bodyRequest = "{'notifications': 'email,text'," +
	        		 "'name': 'test-customer-subaccount-stakeholder'," +
	                 "'jobTitle': 'Software Engineer'," +
	                 "'companyName': 'TekVizion'," +
                    "'emailNotifications': true," +
	                 "'phoneNumber': '+12142425968'}";
	        doReturn(Optional.of(bodyRequest)).when(request).getBody();
	        HttpResponseMessage response = tekvLSModifyAuthUserProfile.run(this.request,this.context);
	        this.context.getLogger().info(response.getStatus().toString());
	        //Then
	        HttpStatusType actualStatus = response.getStatus();
	        HttpStatus expected = HttpStatus.OK;
	        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
	 }
	 
	 @Tag("acceptance")
	 @Test
	 public void modifyStakeHolderAuthUserProfile(){
        //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountStakeholder"));
        String bodyRequest = "{'notifications': 'email,text'," +
                 "'name': 'test-customer-subaccount-stakeholder'," +
                 "'jobTitle': 'Software Engineer'," +
                 "'companyName': 'TekVizion'," +
                "'emailNotifications': true," +
                 "'phoneNumber': '+12142425968'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        //When
        HttpResponseMessage response = tekvLSModifyAuthUserProfile.run(this.request,this.context);
        this.context.getLogger().info(response.getStatus().toString());
        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
	 }

    @Tag("acceptance")
    @Test
    public void invalidEmailTest(){
        //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("nonexistent_subaccountAdmin"));
        String bodyRequest = "{'notifications': 'email,text'," +
                "'name': 'test-customer-subaccount-stakeholder'," +
                "'jobTitle': 'Software Engineer'," +
                "'companyName': 'TekVizion'," +
                "'phoneNumber': '+12142425968'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        //When
        HttpResponseMessage response = tekvLSModifyAuthUserProfile.run(this.request,this.context);
        this.context.getLogger().info(response.getStatus().toString());
        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = MESSAGE_FOR_MISSING_CUSTOMER_EMAIL;
        assertEquals(expectedResponse,actualResponse,"Response doesn't match with: ".concat(expectedResponse));
    }
	 
	@Tag("acceptance")
    @Test
    public void emptyBodyTest(){
        //Given
        String bodyRequest = "{}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        //When
        HttpResponseMessage response = tekvLSModifyAuthUserProfile.run(this.request,this.context);
        this.context.getLogger().info(response.getStatus().toString());
        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
    }
	
	 @Test
    public void noBodyTest(){
        //Given
        String bodyRequest = "";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSModifyAuthUserProfile.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = "error: request body is empty.";
        assertEquals(expectedResponse,actualResponse,"Response doesn't match with: ".concat(expectedResponse));
    }
	 
	 @Test
    public void invalidBodyTest(){
        //Given - Arrange
        String bodyRequest = "invalid-body";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = tekvLSModifyAuthUserProfile.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
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
        HttpResponseMessage response = tekvLSModifyAuthUserProfile.run(this.request, this.context);
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
        HttpResponseMessage response = tekvLSModifyAuthUserProfile.run(this.request, this.context);
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
    	String bodyRequest = "{'notifications': 'email,text'," +
       		 "'name': 'test-customer-subaccount-stakeholder'," +
                "'jobTitle': 'Software Engineer'," +
                "'companyName': 'TekVizion'," +
                "'emailNotifications': true," +
                "'phoneNumber': '+12142425968'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        doThrow(new RuntimeException("Error message")).when(this.request).createResponseBuilder(HttpStatus.OK);

        //When
        HttpResponseMessage response = tekvLSModifyAuthUserProfile.run(this.request, this.context);
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

}
