package com.function;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;

import java.time.LocalDateTime;
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

public class TekvLSModifyCtaasTestSuiteByIdTest extends TekvLSTest {

    private final TekvLSModifyCtaasTestSuiteById tekvLSModifyCtaasTestSuiteById = new TekvLSModifyCtaasTestSuiteById();
    private final TekvLSCreateCtaasTestSuite tekvLSCreateCtaasTestSuite = new TekvLSCreateCtaasTestSuite();
    private final TekVLSDeleteCtaasTestSuiteById tekvLSDeleteCtaasTestSuiteById = new TekVLSDeleteCtaasTestSuiteById();
    private String ctaasTestSuiteId = "31d82e5c-b911-460d-edbe-6860f8464233";

    @BeforeEach
    void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
        
        String name = "testSuiteTest" + LocalDateTime.now();
        String bodyRequest = "{'name':'" + name + "','subaccountId':'0e2038ec-2b9b-493b-b3f2-6702e60b5b90','totalExecutions':'7','nextExecution':'2022-10-04 00:00:00','frequency':'Hourly','deviceType':'MS Teams'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        HttpResponseMessage response = tekvLSCreateCtaasTestSuite.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());
        
        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("id"));
        this.ctaasTestSuiteId = jsonBody.getString("id");
        assertEquals(HttpStatus.OK, response.getStatus(),"HTTP status doesn't match with: ".concat(HttpStatus.OK.toString()));
    }

    @AfterEach
    void tearDown(){
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
        HttpResponseMessage response = tekvLSDeleteCtaasTestSuiteById.run(this.request,this.ctaasTestSuiteId, this.context);
        this.context.getLogger().info(response.getStatus().toString());
        assertEquals(HttpStatus.OK, response.getStatus(),"HTTP status doesn't match with: ".concat(HttpStatus.OK.toString()));
    }

    @Tag("acceptance")
    @Test
    public void modifyCtaasTestSuiteTest(){
        //Given
        String name = "testSuiteTest" + LocalDateTime.now();
        String bodyRequest = "{'name':'" + name + "','totalExecutions':'15','nextExecution':'2022-10-05 00:00:00','frequency':'Monthly','deviceType':'Webex'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSModifyCtaasTestSuiteById.run(this.request,this.ctaasTestSuiteId,this.context);
        this.context.getLogger().info(response.getStatus().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
        
        JSONObject jsonBody = new JSONObject(response.getBody().toString());
        assertTrue(jsonBody.has("name"));
        assertTrue(jsonBody.has("frequency"));
    }

    @Tag("acceptance")
    @Test
    public void nextExecutionTsParamNullTest(){
        //Given
        String name = "testSuiteTest" + LocalDateTime.now();
        String bodyRequest = "{'name':'" + name + "','nextExecution':''}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSModifyCtaasTestSuiteById.run(this.request,this.ctaasTestSuiteId,this.context);
        this.context.getLogger().info(response.getStatus().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        JSONObject jsonBody = new JSONObject(response.getBody().toString());
        System.out.println(jsonBody);
    }

    @Tag("acceptance")
    @Test
    public void emptyBodyTest(){
        //Given
        String bodyRequest = "{}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSModifyCtaasTestSuiteById.run(this.request,this.ctaasTestSuiteId,this.context);
        this.context.getLogger().info(response.getStatus().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void noBodyTest(){
        //Given
        String bodyRequest = "";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSModifyCtaasTestSuiteById.run(this.request,this.ctaasTestSuiteId,this.context);
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
        HttpResponseMessage response = tekvLSModifyCtaasTestSuiteById.run(this.request,this.ctaasTestSuiteId,this.context);
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
        HttpResponseMessage response = tekvLSModifyCtaasTestSuiteById.run(this.request,this.ctaasTestSuiteId, this.context);
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
        HttpResponseMessage response = tekvLSModifyCtaasTestSuiteById.run(this.request,this.ctaasTestSuiteId, this.context);
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
    public void sqlExceptionTest(){
        //Given
        String name = "testSuiteTest" + LocalDateTime.now();
        String bodyRequest = "{'name':'" + name + "','totalExecutions':'15','nextExecution':'2022-10-05 00:00:00','frequency':'Monthly','deviceType':'Webex'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSModifyCtaasTestSuiteById.run(this.request,"000",this.context);
        this.context.getLogger().info(response.getStatus().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        assertTrue(actualResponse.contains("invalid input syntax for type uuid"));
    }

    @Test
    public void genericExceptionTest(){
        //Given
        String name = "testSuiteTest" + LocalDateTime.now();
        String bodyRequest = "{'name':'" + name + "','subaccountId':'0e2038ec-2b9b-493b-b3f2-6702e60b5b90','totalExecutions':'15','nextExecution':'2022-10-05 00:00:00','frequency':'Monthly','deviceType':'Webex'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        doThrow(new RuntimeException("Error message")).when(this.request).createResponseBuilder(HttpStatus.OK);


        //When
        HttpResponseMessage response = tekvLSModifyCtaasTestSuiteById.run(this.request,this.ctaasTestSuiteId,this.context);
        this.context.getLogger().info(response.getStatus().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expectedStatus, actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = "Error message";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));

        this.initTestParameters();
    }
    
}
