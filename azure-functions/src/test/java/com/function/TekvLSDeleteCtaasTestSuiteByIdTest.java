package com.function;

import java.time.LocalDateTime;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;

public class TekvLSDeleteCtaasTestSuiteByIdTest extends TekvLSTest {

    private String testSuiteId = "EMPTY";
    private final TekvLSDeleteCtaasTestSuiteById tekvLSDeleteCtaasTestSuiteById = new TekvLSDeleteCtaasTestSuiteById();
    private final TekvLSCreateCtaasTestSuite tekvLSCreateCtaasTestSuite = new TekvLSCreateCtaasTestSuite();

    @BeforeEach
    void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }
    
    @Test
    public void deleteCtaasTestSuiteTest(){
        //Given
        String name = "testSuiteTest" + LocalDateTime.now();
        String bodyRequest = "{'name':'" + name + "','subaccountId':'0e2038ec-2b9b-493b-b3f2-6702e60b5b90','totalExecutions':'7','nextExecution':'2022-10-04 00:00:00','frequency':'Hourly','deviceType':'Webex'}";
    	doReturn(Optional.of(bodyRequest)).when(request).getBody();
        
        HttpResponseMessage createResponse = tekvLSCreateCtaasTestSuite.run(this.request,this.context);
        this.context.getLogger().info(createResponse.getBody().toString());
        assertEquals(HttpStatus.OK, createResponse.getStatus(),"HTTP status doesn't match with: ".concat(HttpStatus.OK.toString()));
        JSONObject jsonBody = new JSONObject(createResponse.getBody().toString());
        assertTrue(jsonBody.has("id"));
        this.testSuiteId = jsonBody.getString("id");

        //When
        HttpResponseMessage response = tekvLSDeleteCtaasTestSuiteById.run(this.request,this.testSuiteId, this.context);
        this.context.getLogger().info(response.getStatus().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Tag("Security")
    @Test
    public void noTokenTest(){
        //Given
        this.headers.remove("authorization");

        //When
        HttpResponseMessage response = tekvLSDeleteCtaasTestSuiteById.run(this.request,this.testSuiteId, this.context);
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
        HttpResponseMessage response = tekvLSDeleteCtaasTestSuiteById.run(this.request,this.testSuiteId, this.context);
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
    public void invalidSQLTest(){
        //Given
        this.testSuiteId = "invalid-id";

        //When
        HttpResponseMessage response = tekvLSDeleteCtaasTestSuiteById.run(this.request,this.testSuiteId,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Tag("acceptance")
    @Test
    public void genericExceptionTest(){
        //Given
        this.testSuiteId = "31d82e5c-b911-460d-edbe-6860f8464233";
        doThrow(new RuntimeException("Error message")).when(this.request).createResponseBuilder(HttpStatus.OK);

        //When
        HttpResponseMessage response = tekvLSDeleteCtaasTestSuiteById.run(this.request,this.testSuiteId, this.context);
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
}
