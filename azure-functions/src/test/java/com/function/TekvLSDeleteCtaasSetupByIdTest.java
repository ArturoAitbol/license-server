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

public class TekvLSDeleteCtaasSetupByIdTest extends TekvLSTest {

    private final TekvLSDeleteCtaasSetupById tekvLSDeleteCtaasSetupById = new TekvLSDeleteCtaasSetupById();
    private final TekvLSCreateCtaasSetup tekvLSCreateCtaasSetup = new TekvLSCreateCtaasSetup();

    private String ctaasSetupId ="31d82e5c-b911-460d-edbe-6860f8464233";

    @BeforeEach
    void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @Test
    public void deleteCtaasSetupTest(){
        //Given
    	String bodyRequest = "{'subaccountId': 'f5a609c0-8b70-4a10-9dc8-9536bdb5652c'," +
                "'status': 'SETUP_INPROGRESS'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        HttpResponseMessage createResponse = tekvLSCreateCtaasSetup.run(this.request,this.context);
        this.context.getLogger().info(createResponse.getBody().toString());
        assertEquals(HttpStatus.OK, createResponse.getStatus(),"HTTP status doesn't match with: ".concat(HttpStatus.OK.toString()));
        JSONObject jsonBody = new JSONObject(createResponse.getBody().toString());
        assertTrue(jsonBody.has("id"));
        this.ctaasSetupId = jsonBody.getString("id");

        //When
        HttpResponseMessage response = tekvLSDeleteCtaasSetupById.run(this.request,this.ctaasSetupId, this.context);
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
        HttpResponseMessage response = tekvLSDeleteCtaasSetupById.run(this.request,this.ctaasSetupId, this.context);
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
        HttpResponseMessage response = tekvLSDeleteCtaasSetupById.run(this.request,this.ctaasSetupId, this.context);
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
        this.ctaasSetupId = "invalid-id";

        //When
        HttpResponseMessage response = tekvLSDeleteCtaasSetupById.run(this.request,this.ctaasSetupId,this.context);
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
        this.ctaasSetupId = "31d82e5c-b911-460d-edbe-6860f8464233";
        doThrow(new RuntimeException("Error message")).when(this.request).createResponseBuilder(HttpStatus.OK);

        //When
        HttpResponseMessage response = tekvLSDeleteCtaasSetupById.run(this.request,this.ctaasSetupId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = "Error message";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
        
    }
}
