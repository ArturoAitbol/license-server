package com.function;

import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;


import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;

class TekvLSDeleteSubaccountAdminDeviceTest extends TekvLSTest {
    private final TekvLSCreateSubaccountAdminDevice tekvLSCreateSubaccountAdminDevice = new TekvLSCreateSubaccountAdminDevice();
    private final TekvLSDeleteSubaccountAdminDevice tekvLSDeleteSubaccountAdminDevice = new TekvLSDeleteSubaccountAdminDevice();

    private String sampleDeviceToken = "ecnSvfv5Q3qiPaybB5ggCb:APA91bECmrjV5fg2LQ5D7-rC3sarELg0puT2Qh8xWsX4Nf-DhkuCOpx4WTX5GcngPDFEAUOq-Y5lm0nWxsyJMMDBxfljZnFmzDfV2BN11n2eM1Jm1iWOjPkWVT15aI43nJJGKNiu0LKE";

    @BeforeEach
    void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));
    }

    @Test
    public void deleteStakeHolderTest(){
        //Given
        String bodyRequest = "{'deviceToken': '" + sampleDeviceToken + "'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        HttpResponseMessage createResponse = tekvLSCreateSubaccountAdminDevice.run(this.request,this.context);
        assertEquals(HttpStatus.OK, createResponse.getStatus(),"HTTP status doesn't match with: ".concat(HttpStatus.OK.toString()));

        //When
        HttpResponseMessage response = tekvLSDeleteSubaccountAdminDevice.run(this.request,this.sampleDeviceToken, this.context);
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
        HttpResponseMessage response = tekvLSDeleteSubaccountAdminDevice.run(this.request,this.sampleDeviceToken, this.context);
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
        HttpResponseMessage response = tekvLSDeleteSubaccountAdminDevice.run(this.request,this.sampleDeviceToken, this.context);
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
    public void genericExceptionTest(){
        //Given
        doThrow(new RuntimeException("Error message")).when(this.request).createResponseBuilder(HttpStatus.OK);

        //When
        HttpResponseMessage response = tekvLSDeleteSubaccountAdminDevice.run(this.request,this.sampleDeviceToken, this.context);
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
