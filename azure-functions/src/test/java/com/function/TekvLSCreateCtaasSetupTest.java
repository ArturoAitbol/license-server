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
import com.function.util.Constants;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;

public class TekvLSCreateCtaasSetupTest extends TekvLSTest {

    private final TekvLSCreateCtaasSetup tekvLSCreateCtaasSetup = new TekvLSCreateCtaasSetup();
    private final TekvLSDeleteCtaasSetupById tekvLSDeleteCtaasSetupById = new TekvLSDeleteCtaasSetupById();
    private String ctaasSetupId = "EMPTY";

    @BeforeEach
    void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @AfterEach
    void tearDown() {
        if (!this.ctaasSetupId.equals("EMPTY")){
            HttpResponseMessage response = tekvLSDeleteCtaasSetupById.run(this.request, this.ctaasSetupId, this.context);
            this.context.getLogger().info(response.getStatus().toString());
            this.ctaasSetupId = "EMPTY";

            HttpStatusType actualStatus = response.getStatus();
            HttpStatus expected = HttpStatus.OK;
            assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
        }
    }

    @Tag("acceptance")
    @Test
    void createCtaasSetup() {
        //Given
        String bodyRequest = "{'subaccountId': '8acb6997-4d6a-4427-ba2c-7bf463fa08ec'," +
                "'status': '" + Constants.CTaaSSetupStatus.INPROGRESS + "'}";

        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateCtaasSetup.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("id"));

        this.ctaasSetupId = jsonBody.getString("id");
        assertNotNull(this.ctaasSetupId);
    }

    @Tag("acceptance")
    @Test
    void createCtaasSetupWithOnBoardingParameter() {
        //Given
        String bodyRequest = "{" +
                "'subaccountId': '8acb6997-4d6a-4427-ba2c-7bf463fa08ec'," +
                "'onBoardingComplete': 'true'," +
                "'status': '" + Constants.CTaaSSetupStatus.INPROGRESS + "'}";

        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateCtaasSetup.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("id"));

        this.ctaasSetupId = jsonBody.getString("id");
        assertNotNull(this.ctaasSetupId);
    }
    
    @Tag("acceptance")
    @Test
    void createCtaasSetupCRMRoleTest() {
    	
    	 this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("crm"));
        //Given
        String bodyRequest = "{'subaccountId': '8acb6997-4d6a-4427-ba2c-7bf463fa08ec'," +
                "'status': '" + Constants.CTaaSSetupStatus.INPROGRESS + "'}";

        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateCtaasSetup.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("id"));

        this.ctaasSetupId = jsonBody.getString("id");
        assertNotNull(this.ctaasSetupId);
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @Test
    void bodyWithoutSubaccountTest() {
        //Given
    	String bodyRequest = "{'status': '" + Constants.CTaaSSetupStatus.INPROGRESS + "'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateCtaasSetup.run(this.request,this.context);
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
    void incompleteBodyTest() {
        //Given
    	String bodyRequest = "{'subaccountId': '8acb6997-4d6a-4427-ba2c-7bf463fa08ec'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateCtaasSetup.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = "Missing mandatory parameter: status";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void noBodyTest(){
        //Given
        String bodyRequest = "";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateCtaasSetup.run(this.request, this.context);
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
        HttpResponseMessage response = tekvLSCreateCtaasSetup.run(this.request, this.context);
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
        HttpResponseMessage response = tekvLSCreateCtaasSetup.run(this.request, this.context);
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
        HttpResponseMessage response = tekvLSCreateCtaasSetup.run(this.request, this.context);
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
                "'status': '" + Constants.CTaaSSetupStatus.INPROGRESS + "'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateCtaasSetup.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void genericExceptionTest(){
        //Given
    	 String bodyRequest = "{'subaccountId': 'b5b91753-4c2b-43f5-afa0-feb00cefa981'," +
                 "'status': '" + Constants.CTaaSSetupStatus.INPROGRESS + "'}";

        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        doThrow(new RuntimeException("Error message")).when(this.request).createResponseBuilder(HttpStatus.OK);

        //When
        HttpResponseMessage response = tekvLSCreateCtaasSetup.run(this.request, this.context);
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
