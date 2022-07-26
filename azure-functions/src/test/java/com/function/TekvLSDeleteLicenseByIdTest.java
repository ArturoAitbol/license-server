package com.function;

import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;
import org.json.JSONObject;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;

class TekvLSDeleteLicenseByIdTest extends TekvLSTest {

    private final TekvLSDeleteLicenseById tekvLSDeleteLicenseById = new TekvLSDeleteLicenseById();
    private final TekvLSCreateLicense tekvLSCreateLicense = new TekvLSCreateLicense();

    private String licenseId ="31d82e5c-b911-460d-edbe-6860f8464233";

    @BeforeEach
    void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @Test
    public void deleteLicenseTest(){
        //Given
        String bodyRequest = "{'subaccountId': '04dfda26-98f4-42e5-889a-3edccf4b799c'," +
                "'startDate': '2023-06-01T00:00:00.000Z'," +
                "'packageType': 'Basic'," +
                "'renewalDate': '2023-06-10T04:00:00.000Z'," +
                "'tokensPurchased': '55'," +
                "'deviceLimit': '5000'," +
                "'licenseId':'"+licenseId+"'," +
                "'status': 'Active'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        HttpResponseMessage createResponse = tekvLSCreateLicense.run(this.request,this.context);
        this.context.getLogger().info(createResponse.getBody().toString());
        assertEquals(HttpStatus.OK, createResponse.getStatus(),"HTTP status doesn't match with: ".concat(HttpStatus.OK.toString()));
        JSONObject jsonBody = new JSONObject(createResponse.getBody().toString());
        assertTrue(jsonBody.has("id"));
        this.licenseId = jsonBody.getString("id");

        //When
        HttpResponseMessage response = tekvLSDeleteLicenseById.run(this.request,this.licenseId, this.context);
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
        HttpResponseMessage response = tekvLSDeleteLicenseById.run(this.request,this.licenseId, this.context);
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
        HttpResponseMessage response = tekvLSDeleteLicenseById.run(this.request,this.licenseId, this.context);
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
        this.licenseId = "invalid-id";

        //When
        HttpResponseMessage response = tekvLSDeleteLicenseById.run(this.request,this.licenseId,this.context);
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
        this.licenseId = "31d82e5c-b911-460d-edbe-6860f8464233";
        doThrow(new RuntimeException("Error message")).when(this.request).createResponseBuilder(HttpStatus.OK);

        //When
        HttpResponseMessage response = tekvLSDeleteLicenseById.run(this.request,this.licenseId, this.context);
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