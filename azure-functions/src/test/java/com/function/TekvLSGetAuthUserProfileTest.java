package com.function;

import static com.function.auth.RoleAuthHandler.MESSAGE_FOR_MISSING_CUSTOMER_EMAIL;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

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
import org.mockito.Mockito;

public class TekvLSGetAuthUserProfileTest extends TekvLSTest {

	private final TekvLSGetAuthUserProfile tekvLSGetAuthUserProfile = new TekvLSGetAuthUserProfile();
	
	@BeforeEach
    public void setup(){
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));
	}  
    
	@Tag("acceptance")
    @Test
    public void getAuthUserProfile(){

        // When
        HttpResponseMessage response = tekvLSGetAuthUserProfile.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("userProfile"));

        JSONObject userProfileBody = (JSONObject) jsonBody.get("userProfile");
        assertTrue(userProfileBody.has("email"));
        assertTrue(userProfileBody.has("subaccountId"));
        assertTrue(userProfileBody.has("name"));
        assertTrue(userProfileBody.has("jobTitle"));
        assertTrue(userProfileBody.has("companyName"));
        assertTrue(userProfileBody.has("phoneNumber"));
    }
	
	@Tag("acceptance")
    @Test
    public void getStakeHolderAuthUserProfile(){
		this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountStakeholder"));
        // When
        HttpResponseMessage response = tekvLSGetAuthUserProfile.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("userProfile"));

        JSONObject userProfileBody = (JSONObject) jsonBody.get("userProfile");
        assertTrue(userProfileBody.has("email"));
        assertTrue(userProfileBody.has("subaccountId"));
        assertTrue(userProfileBody.has("name"));
        assertTrue(userProfileBody.has("jobTitle"));
        assertTrue(userProfileBody.has("companyName"));
        assertTrue(userProfileBody.has("phoneNumber"));
    }
	
	@Tag("acceptance")
    @Test
    public void getForDistributorRoleTest(){
        
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("distributorAdmin"));
        //When
        HttpResponseMessage response = tekvLSGetAuthUserProfile.run(this.request,  this.context);
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
	 
	@Tag("Security")
    @Test
    public void noTokenTest(){
        //Given
        this.headers.remove("authorization");

        //When
        HttpResponseMessage response = tekvLSGetAuthUserProfile.run(this.request, this.context);
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

    @Tag("acceptance")
    @Test
    public void missingEmailInDatabaseTest(){
	    //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("functional_subaccountAdmin"));

        // When
        HttpResponseMessage response = tekvLSGetAuthUserProfile.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = MESSAGE_FOR_MISSING_CUSTOMER_EMAIL;
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));

    }

    @Test
    public void genericExceptionTest() {
	    //Given
        Mockito.when(this.request.createResponseBuilder(HttpStatus.OK)).thenThrow(new RuntimeException("Generic error"));

        // When
        HttpResponseMessage response = tekvLSGetAuthUserProfile.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = "Generic error";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));

    }
}
