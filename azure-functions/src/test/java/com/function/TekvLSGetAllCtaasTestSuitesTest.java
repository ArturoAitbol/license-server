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

public class TekvLSGetAllCtaasTestSuitesTest extends TekvLSTest {

    private final TekvLSGetAllCtaasTestSuites tekvLSGetAllCtaasTestSuites = new TekvLSGetAllCtaasTestSuites();

    @BeforeEach
    public void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));
    }
    /*
    @Tag("acceptance")
    @Test
    public void getAllCtaasTestSuitesTest() {
        // Given
        String id = "EMPTY";

        // When
        HttpResponseMessage response = tekvLSGetAllCtaasTestSuites.run(this.request, id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus,
                "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("ctaasTestSuites"));

        JSONArray ctaasTestSuites = jsonBody.getJSONArray("ctaasTestSuites");
        assertTrue(ctaasTestSuites.length() > 0);

        JSONObject ctaasTestSuite = ctaasTestSuites.getJSONObject(0);
        assertTrue(ctaasTestSuite.has("id"));
        assertTrue(ctaasTestSuite.has("subaccountId"));
        assertTrue(ctaasTestSuite.has("totalExecutions"));
        assertTrue(ctaasTestSuite.has("nextExecution"));
        assertTrue(ctaasTestSuite.has("frequency"));
        assertTrue(ctaasTestSuite.has("deviceType"));
        assertTrue(ctaasTestSuite.has("name"));
    } */

    @Tag("Security")
    @Test
    public void noTokenTest(){
        //Given
        String id = "EMPTY";
        this.headers.remove("authorization");

        //When
        HttpResponseMessage response = tekvLSGetAllCtaasTestSuites.run(this.request, id, this.context);
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
        HttpResponseMessage response = tekvLSGetAllCtaasTestSuites.run(this.request, id, this.context);
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
        String id = "EMPTY";
        doThrow(new RuntimeException("Error message")).when(this.request).createResponseBuilder(HttpStatus.OK);

        //When
        HttpResponseMessage response = tekvLSGetAllCtaasTestSuites.run(this.request, id, this.context);
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
