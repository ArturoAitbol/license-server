package com.function;

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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.doReturn;

import java.time.LocalDateTime;
import java.util.Optional;


public class TekvLSCreateCtaasTestSuiteTest extends TekvLSTest {

    private String testSuiteId = "EMPTY";
    TekvLSCreateCtaasTestSuite createTestSuite = new TekvLSCreateCtaasTestSuite();

    private final TekvLSDeleteCtaasTestSuiteById deleteTestSuiteById = new TekvLSDeleteCtaasTestSuiteById();

    @BeforeEach
    void setUp() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @AfterEach
    void tearDown() {
        if (!this.testSuiteId.equals("EMPTY")) {
            HttpResponseMessage response = this.deleteTestSuiteById.run(this.request, this.testSuiteId, this.context);
            this.context.getLogger().info(response.getStatus().toString());
            this.testSuiteId = "EMPTY";

            HttpStatusType actualStatus = response.getStatus();
            HttpStatus expected = HttpStatus.OK;
            assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        }
    }

    @Test
    public void createTestSuiteTest() {
        // Given - Arrange
        String name = "testSuiteTest" + LocalDateTime.now();
        String bodyRequest = "{'name':'" + name + "','subaccountId':'0e2038ec-2b9b-493b-b3f2-6702e60b5b90','totalExecutions':'7','nextExecution':'2022-10-04 00:00:00','frequency':'Hourly','deviceType':'MS Teams'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        // When - Action
        HttpResponseMessage response = createTestSuite.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("id"));
        this.testSuiteId = jsonBody.getString("id");
        assertNotNull(this.testSuiteId);
    }

    @Test
    public void createTestSuiteIncomplete() {
        String bodyRequest = "{'subaccountId':'0e2038ec-2b9b-493b-b3f2-6702e60b5b90','totalExecutions':'7','nextExecution':'2022-10-04 00:00:00','frequency':'Hourly'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        HttpResponseMessage response = createTestSuite.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());        

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Missing mandatory parameter: deviceType";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }
    
    @Test
    public void createTestSuiteWrongSubaccountId() {
        String name = "testSuiteTest" + LocalDateTime.now();
        String bodyRequest = "{'name':'" + name + "','subaccountId':'00000000-2b9b-493b-0000-6702e60b5b90','totalExecutions':'7','nextExecution':'2022-10-04 00:00:00','frequency':'Hourly','deviceType':'MS Teams'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        HttpResponseMessage response = createTestSuite.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());        

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));
        
        String actualResponse = jsonBody.getString("error");
        assertTrue(actualResponse.contains("violates foreign key constraint \"fk_subaccount\""));        
    }

    @Test
    public void createEmptyBodyTest() {
        String bodyRequest = "";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        
        HttpResponseMessage response = createTestSuite.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "error: request body is empty.";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("security")
    @Test
    public void createTestSuiteNoTokenTest() {
        this.headers.remove("authorization");
        HttpResponseMessage response = createTestSuite.run(this.request, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.UNAUTHORIZED;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String actualResponse = (String) response.getBody();

        String expectedResponse = "{\"error\":\"" + RoleAuthHandler.MESSAGE_FOR_UNAUTHORIZED + "\"}";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }


    @Test
    public void createTestSuiteWithoutJsonTest() {
        String bodyRequest = "test";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        
        HttpResponseMessage response = createTestSuite.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void forbiddenTest() {
        // Given - Arrange
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));
        String name = "testSuiteTest" + LocalDateTime.now();
        String bodyRequest = "{'name':'" + name + "','subaccountId':'00000000-2b9b-493b-0000-6702e60b5b90','totalExecutions':'7','nextExecution':'2022-10-04 00:00:00','frequency':'Hourly','deviceType':'MS Teams'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        // When - Action
        HttpResponseMessage response = createTestSuite.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.FORBIDDEN;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = RoleAuthHandler.MESSAGE_FOR_FORBIDDEN;
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }
}
