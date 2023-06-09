package com.function;

import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;
import org.json.JSONObject;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TekvLSCreateLicenseTest extends TekvLSTest {

    private final TekvLSCreateLicense tekvLSCreateLicense = new TekvLSCreateLicense();
    private final TekvLSDeleteLicenseById tekvLSDeleteLicenseById = new TekvLSDeleteLicenseById();
    private String licenseId = "EMPTY";

    @BeforeEach
    void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @AfterEach
    void tearDown() {
        if (!this.licenseId.equals("EMPTY")){
            HttpResponseMessage response = tekvLSDeleteLicenseById.run(this.request, this.licenseId, this.context);
            this.context.getLogger().info(response.getStatus().toString());
            this.licenseId = "EMPTY";

            HttpStatusType actualStatus = response.getStatus();
            HttpStatus expected = HttpStatus.OK;
            assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
        }
    }

    @Tag("acceptance")
    @Test
    void createLicenseTest() {
        //Given
        String licenseId = "31d82e5c-b911-460d-edbe-6860f8464233";
        String bodyRequest = "{'subaccountId': 'f5a609c0-8b70-4a10-9dc8-9536bdb5652c'," +
                "'startDate': '2023-06-01T00:00:00.000Z'," +
                "'subscriptionType': 'Basic'," +
                "'renewalDate': '2023-06-10T04:00:00.000Z'," +
                "'description': 'LicenseTest'," +
                "'tokensPurchased': '55'," +
                "'deviceLimit': '5000'," +
                "'licenseId':'" + licenseId + "'," +
                "'status': 'Active'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateLicense.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("id"));

        this.licenseId = jsonBody.getString("id");
        assertNotNull(this.licenseId);

        assertEquals(licenseId,this.licenseId,"Actual Id is not: ".concat(licenseId));
    }

    @Tag("acceptance")
    @Test
    void createLicenseWithNoIdParamTest() {
        //Given
        String bodyRequest = "{'subaccountId': 'f5a609c0-8b70-4a10-9dc8-9536bdb5652c'," +
                "'startDate': '2023-06-01T00:00:00.000Z'," +
                "'subscriptionType': 'Basic'," +
                "'renewalDate': '2023-06-10T04:00:00.000Z'," +
                "'description': 'LicenseTest'," +
                "'tokensPurchased': '55'," +
                "'deviceLimit': '5000'," +
                "'status': 'Active'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateLicense.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("id"));

        this.licenseId = jsonBody.getString("id");
        assertNotNull(this.licenseId);
    }

    @Tag("acceptance")
    @Test
    void createExpiredLicenseTest() {
        //Given
        LocalDateTime currentDate = LocalDateTime.now();
        String renewalDate = currentDate.minusDays(1).toString();
        String licenseId = "31d82e5c-b911-460d-edbe-6860f8464233";
        String bodyRequest = "{'subaccountId': 'f5a609c0-8b70-4a10-9dc8-9536bdb5652c'," +
                "'startDate': '2022-06-01T04:00:00.000Z'," +
                "'subscriptionType': 'Basic'," +
                "'renewalDate': '"+renewalDate+"'," +
                "'description': 'LicenseTest'," +
                "'tokensPurchased': '55'," +
                "'deviceLimit': '5000'," +
                "'licenseId':'" + licenseId + "'," +
                "'status': 'Active'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateLicense.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("id"));

        this.licenseId = jsonBody.getString("id");
        assertNotNull(this.licenseId);
        assertEquals(licenseId,this.licenseId,"Actual Id is not: ".concat(licenseId));
    }

    @Test
    void bodyWithoutSubaccountTest() {
        //Given
        String licenseId = "31d82e5c-b911-460d-edbe-6860f8464233";
        String bodyRequest = "{ "+
                "'startDate': '2023-06-01T00:00:00.000Z'," +
                "'subscriptionType': 'Basic'," +
                "'renewalDate': '2023-06-10T04:00:00.000Z'," +
                "'description': 'LicenseTest'," +
                "'tokensPurchased': '55'," +
                "'deviceLimit': '5000'," +
                "'licenseId':'" + licenseId + "'," +
                "'status': 'Active'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateLicense.run(this.request,this.context);
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
        String licenseId = "31d82e5c-b911-460d-edbe-6860f8464233";
        String bodyRequest = "{'subaccountId': 'f5a609c0-8b70-4a10-9dc8-9536bdb5652c'," +
                "'startDate': '2023-06-01T00:00:00.000Z'," +
                "'subscriptionType': 'Basic'," +
                "'renewalDate': '2023-06-10T04:00:00.000Z'," +
                "'tokensPurchased': '55'," +
                "'deviceLimit': '5000'," +
                "'licenseId':'" + licenseId + "'," +
                "'status': 'Active'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateLicense.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = "Missing mandatory parameter: description";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void noBodyTest(){
        //Given
        String bodyRequest = "";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateLicense.run(this.request, this.context);
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
        HttpResponseMessage response = tekvLSCreateLicense.run(this.request, this.context);
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
        HttpResponseMessage response = tekvLSCreateLicense.run(this.request, this.context);
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
        HttpResponseMessage response = tekvLSCreateLicense.run(this.request, this.context);
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
        String licenseId = "invalid-id";
        String bodyRequest = "{'subaccountId': 'f5a609c0-8b70-4a10-9dc8-9536bdb5652c'," +
                "'startDate': '2023-06-01T00:00:00.000Z'," +
                "'subscriptionType': 'Basic'," +
                "'renewalDate': '2023-06-10T04:00:00.000Z'," +
                "'description': 'LicenseTest'," +
                "'tokensPurchased': '55'," +
                "'deviceLimit': '5000'," +
                "'licenseId':'" + licenseId + "'," +
                "'status': 'Active'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = tekvLSCreateLicense.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void genericExceptionTest(){
        //Given
        String licenseId = "31d82e5c-b911-460d-edbe-6860f8464233";
        String bodyRequest = "{'subaccountId': 'f5a609c0-8b70-4a10-9dc8-9536bdb5652c'," +
                "'startDate': '2023-06-01T00:00:00.000Z'," +
                "'subscriptionType': 'Basic'," +
                "'renewalDate': '2023-06-10T04:00:00.000Z'," +
                "'description': 'LicenseTest'," +
                "'tokensPurchased': '55'," +
                "'deviceLimit': '5000'," +
                "'licenseId':'" + licenseId + "'," +
                "'status': 'Active'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        doThrow(new RuntimeException("Error message")).when(this.request).createResponseBuilder(HttpStatus.OK);

        //When
        HttpResponseMessage response = tekvLSCreateLicense.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());
        this.licenseId = licenseId;

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