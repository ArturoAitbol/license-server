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

class TekvLSDeleteLicenseUsageByIdTest extends TekvLSTest {

    private final TekvLSDeleteLicenseUsageById tekvLSDeleteLicenseUsageById = new TekvLSDeleteLicenseUsageById();
    private final TekvLSCreateLicenseUsageDetail tekvLSCreateLicenseUsageDetail = new TekvLSCreateLicenseUsageDetail();

    private String licenseUsageId = "07249fe4-92e2-4fda-8e34-1b42d58ad6f2";

    @BeforeEach
    void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @Tag("acceptance")
    @Test
    public void deleteLicenseUsageTest(){
        //Given
        String bodyRequest = "{ " +
                "    'subaccountId': 'f5a609c0-8b70-4a10-9dc8-9536bdb5652c'," +
                "    'projectId': '2bdaf2af-838f-4053-b3fa-ef22aaa11b0d'," +
                "    'deviceId': 'ef7a4bcd-fc3f-4f87-bf87-ae934799690b'," +
                "    'consumptionDate': '2022-06-19'," +
                "    'type': 'Configuration'," +
                "    'usageDays': [0,4] }";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        HttpResponseMessage responseCreate = tekvLSCreateLicenseUsageDetail.run(this.request,this.context);
        this.context.getLogger().info(responseCreate.getBody().toString());
        assertEquals(HttpStatus.OK, responseCreate.getStatus(),"HTTP status doesn't match with: ".concat(HttpStatus.OK.toString()));
        JSONObject jsonBody = new JSONObject(responseCreate.getBody().toString());
        assertTrue(jsonBody.has("id"));
        this.licenseUsageId = jsonBody.getString("id");

        //When
        HttpResponseMessage response = tekvLSDeleteLicenseUsageById.run(this.request,this.licenseUsageId,this.context);
        this.context.getLogger().info(response.getStatus().toString());

        //Then
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
        HttpResponseMessage response = tekvLSDeleteLicenseUsageById.run(this.request,this.licenseUsageId,this.context);
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
        HttpResponseMessage response = tekvLSDeleteLicenseUsageById.run(this.request,this.licenseUsageId,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.FORBIDDEN;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = RoleAuthHandler.MESSAGE_FOR_FORBIDDEN;
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void invalidIdTest(){
        //Given
        String id = "invalid-id";

        //When
        HttpResponseMessage response = tekvLSDeleteLicenseUsageById.run(this.request,id,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualError = jsonBody.getString("error");
        assertTrue(actualError.contains("ERROR: invalid input syntax for type uuid"));
    }

    @Test
    public void genericExceptionTest(){
        //Given
        doThrow(new RuntimeException("Error message")).when(this.request).createResponseBuilder(HttpStatus.OK);

        //When
        HttpResponseMessage response = tekvLSDeleteLicenseUsageById.run(this.request,this.licenseUsageId,this.context);
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