package com.function;

import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;
import org.json.JSONObject;
import org.junit.jupiter.api.*;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;

class TekvLSModifyLicenseByIdTest extends TekvLSTest {

    private final TekvLSModifyLicenseById tekvLSModifyLicenseById = new TekvLSModifyLicenseById();
    private final TekvLSCreateLicense tekvLSCreateLicense = new TekvLSCreateLicense();
    private final TekvLSDeleteLicenseById tekvLSDeleteLicenseById = new TekvLSDeleteLicenseById();
    private final String licenseId = "31d82e5c-b911-460d-edbe-6860f8464233";

    @BeforeEach
    void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
        String bodyRequest = "{'subaccountId': 'f5a609c0-8b70-4a10-9dc8-9536bdb5652c'," +
                "'startDate': '2023-06-01T00:00:00.000Z'," +
                "'packageType': 'Basic'," +
                "'renewalDate': '2023-06-10T04:00:00.000Z'," +
                "'description': 'LicenseTest'," +
                "'tokensPurchased': '55'," +
                "'deviceLimit': '5000'," +
                "'licenseId':'"+licenseId+"'," +
                "'status': 'Active'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        HttpResponseMessage response = tekvLSCreateLicense.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());
        assertEquals(HttpStatus.OK, response.getStatus(),"HTTP status doesn't match with: ".concat(HttpStatus.OK.toString()));
    }

    @AfterEach
    void tearDown(){
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
        HttpResponseMessage response = tekvLSDeleteLicenseById.run(this.request,this.licenseId, this.context);
        this.context.getLogger().info(response.getStatus().toString());
        assertEquals(HttpStatus.OK, response.getStatus(),"HTTP status doesn't match with: ".concat(HttpStatus.OK.toString()));
    }

    @Tag("acceptance")
    @Test
    public void modifyLicenseTest(){
        //Given
        String bodyRequest = "{'packageType': 'Small'," +
                "'tokensPurchased': '150'," +
                "'deviceLimit': '5000'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSModifyLicenseById.run(this.request,this.licenseId,this.context);
        this.context.getLogger().info(response.getStatus().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Tag("acceptance")
    @Test
    public void modifyLicenseDescriptionTest(){
        //Given
        String bodyRequest = "{'description': 'CICDTest'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSModifyLicenseById.run(this.request,this.licenseId,this.context);
        this.context.getLogger().info(response.getStatus().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Tag("acceptance")
    @Test
    public void emptyBodyTest(){
        //Given
        String bodyRequest = "{}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSModifyLicenseById.run(this.request,this.licenseId,this.context);
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
        HttpResponseMessage response = tekvLSModifyLicenseById.run(this.request,this.licenseId,this.context);
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
        HttpResponseMessage response = tekvLSModifyLicenseById.run(this.request,this.licenseId,this.context);
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
        HttpResponseMessage response = tekvLSModifyLicenseById.run(this.request,this.licenseId, this.context);
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
        HttpResponseMessage response = tekvLSModifyLicenseById.run(this.request,this.licenseId, this.context);
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
        String invalidId = "invalid-id";
        String bodyRequest = "{'packageType': 'Small'," +
                "'tokensPurchased': '150'," +
                "'deviceLimit': '5000'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSModifyLicenseById.run(this.request,invalidId,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void genericExceptionTest(){
        //Given
        String bodyRequest = "{'packageType': 'Small'," +
                "'tokensPurchased': '150'," +
                "'deviceLimit': '5000'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        doThrow(new RuntimeException("Error message")).when(this.request).createResponseBuilder(HttpStatus.OK);

        //When
        HttpResponseMessage response = tekvLSModifyLicenseById.run(this.request,this.licenseId, this.context);
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

        this.initTestParameters();
    }
}