package com.function;

import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;


import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TekvLSGetAllLicensesTest extends TekvLSTest {

    private final TekvLSGetAllLicenses tekvLSGetAllLicenses = new TekvLSGetAllLicenses();

    @BeforeEach
    public void setup(){
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @Tag("acceptance")
    @Test
    public void getAllLicensesTest(){
        //Given
        String id = "EMPTY";

        // When
        HttpResponseMessage response = tekvLSGetAllLicenses.run(this.request,id,this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("licenses"));

        JSONArray licenses = jsonBody.getJSONArray("licenses");
        assertTrue(licenses.length()>0);

        JSONObject license = licenses.getJSONObject(0);
        assertTrue(license.has("id"));
        assertTrue(license.has("subaccountId"));
        assertTrue(license.has("status"));
        assertTrue(license.has("description"));
    }

    @Tag("acceptance")
    @Test
    public void getLicenseByIdTest() {
        //Given
        String id = "b84852d7-0f04-4e9a-855c-7b2f01f61591";

        //When
        HttpResponseMessage response = tekvLSGetAllLicenses.run(this.request, id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus, "HTTP Status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("licenses"));

        JSONArray licenses = jsonBody.getJSONArray("licenses");
        assertEquals(1, licenses.length());

        JSONObject license = (JSONObject) licenses.get(0);
        String actualId = license.getString("id");
        assertEquals(id, actualId, "Actual Id doesn't match with: ".concat(id));
    }

    @Tag("acceptance")
    @Test
    public void getLicensesBySubaccountIdTest() {
        //Given
        String id = "EMPTY";
        String subaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        this.queryParams.put("subaccountId",subaccountId);

        //When
        HttpResponseMessage response = tekvLSGetAllLicenses.run(this.request, id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus, "HTTP Status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("licenses"));

        JSONArray licenses = jsonBody.getJSONArray("licenses");
        assertTrue(licenses.length()>0);
    }

    @Tag("acceptance")
    @Test
    public void getForDistributorRoleTest(){
        //Given
        String id = "EMPTY";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("distributorAdmin"));

        // When
        HttpResponseMessage response = tekvLSGetAllLicenses.run(this.request,id,this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("licenses"));

        JSONArray licenses = jsonBody.getJSONArray("licenses");
        assertEquals(4, licenses.length());

        JSONObject license = licenses.getJSONObject(0);
        assertTrue(license.has("id"));
        assertTrue(license.has("subaccountId"));
        assertTrue(license.has("status"));
        assertTrue(license.has("description"));

        String licenseId;
        List<String> expectedLicenses = Arrays.asList("ebc71e49-4f63-44b2-9c90-7750d3ccca05",
                "d9cb5f93-c4d0-427e-8133-77905abd8487",
                "16f4f014-5bed-4166-b10a-574b2e6655e5",
                "16f4f014-5bed-4166-b10a-574b2e6655e4");
        
        for (int i = 0; i < licenses.length();i++){
            licenseId = licenses.getJSONObject(i).getString("id");
            assertTrue(expectedLicenses.contains(licenseId),
                    "License not expected in response (id:" + licenseId + ")");
        }

    }

    @Tag("security")
    @Test
    public void getForDistributorRoleIncorrectIdTest(){
        //Given
        String id = "b84852d7-0f04-4e9a-855c-7b2f01f61591";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("distributorAdmin"));

        // When
        HttpResponseMessage response = tekvLSGetAllLicenses.run(this.request,id,this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_FOR_INVALID_ID;
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }

    @Tag("security")
    @Test
    public void getForDistributorRoleIncorrectSubaccountIdTest() {
        //Given
        String id = "EMPTY";
        String subaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("distributorAdmin"));
        this.queryParams.put("subaccountId",subaccountId);

        //When
        HttpResponseMessage response = tekvLSGetAllLicenses.run(this.request, id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus, "HTTP Status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_FOR_INVALID_ID;
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }

    @Tag("acceptance")
    @Test
    public void getForCustomerRoleTest(){
        //Given
        String id = "EMPTY";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));

        // When
        HttpResponseMessage response = tekvLSGetAllLicenses.run(this.request,id,this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("licenses"));

        JSONArray licenses = jsonBody.getJSONArray("licenses");
        assertEquals(2, licenses.length());

        JSONObject license = licenses.getJSONObject(0);
        assertTrue(license.has("id"));
        assertTrue(license.has("subaccountId"));
        assertTrue(license.has("status"));
        assertTrue(license.has("description"));

        String expectedSubaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        assertEquals(expectedSubaccountId,license.getString("subaccountId"));
        assertEquals(expectedSubaccountId,licenses.getJSONObject(1).getString("subaccountId"));
    }

    @Tag("security")
    @Test
    public void getForCustomerRoleIncorrectIdTest(){
        //Given
        String id = "d9cb5f93-c4d0-427e-8133-77905abd8487";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));

        // When
        HttpResponseMessage response = tekvLSGetAllLicenses.run(this.request,id,this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_FOR_INVALID_ID;
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }

    @Tag("security")
    @Test
    public void getForCustomerRoleIncorrectSubaccountIdTest() {
        //Given
        String id = "EMPTY";
        String subaccountId = "cebe6542-2032-4398-882e-ffb44ade169d";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));
        this.queryParams.put("subaccountId",subaccountId);

        //When
        HttpResponseMessage response = tekvLSGetAllLicenses.run(this.request, id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus, "HTTP Status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_FOR_INVALID_ID;
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }

    @Tag("acceptance")
    @Test
    public void getForSubaccountRoleTest(){
        //Given
        String id = "EMPTY";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));

        // When
        HttpResponseMessage response = tekvLSGetAllLicenses.run(this.request,id,this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("licenses"));

        JSONArray licenses = jsonBody.getJSONArray("licenses");
        assertEquals(1, licenses.length());

        JSONObject license = licenses.getJSONObject(0);
        assertTrue(license.has("id"));
        assertTrue(license.has("subaccountId"));
        assertTrue(license.has("status"));
        assertTrue(license.has("description"));

        String expectedLicenseId = "b84852d7-0f04-4e9a-855c-7b2f01f61592";
        assertEquals(expectedLicenseId,license.getString("id"));
    }

    @Tag("security")
    @Test
    public void getForSubaccountRoleIncorrectIdTest(){
        //Given
        String id = "b84852d7-0f04-4e9a-855c-7b2f01f61591";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));

        // When
        HttpResponseMessage response = tekvLSGetAllLicenses.run(this.request,id,this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_FOR_INVALID_ID;
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }

    @Tag("security")
    @Test
    public void getForSubaccountRoleIncorrectSubaccountIdTest() {
        //Given
        String id = "EMPTY";
        String subaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));
        this.queryParams.put("subaccountId",subaccountId);

        //When
        HttpResponseMessage response = tekvLSGetAllLicenses.run(this.request, id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus, "HTTP Status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_FOR_INVALID_ID;
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }

    @Tag("Security")
    @Test
    public void noTokenTest(){
        //Given
        String id = "EMPTY";
        this.headers.remove("authorization");

        //When
        HttpResponseMessage response = tekvLSGetAllLicenses.run(this.request, id, this.context);
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
        HttpResponseMessage response = tekvLSGetAllLicenses.run(this.request, id, this.context);
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
    public void getLicenseByNonexistentIdTest() {
        //Given
        String id = "00000000-0000-0000-0000-000000000000";

        //When
        HttpResponseMessage response = tekvLSGetAllLicenses.run(this.request, id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus, "HTTP Status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedResponse = RoleAuthHandler.MESSAGE_ID_NOT_FOUND;
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void invalidIdTest(){
        //Given
        String id = "invalid-id";

        //When
        HttpResponseMessage response = tekvLSGetAllLicenses.run(this.request, id, this.context);
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
        String id = "EMPTY";
        doThrow(new RuntimeException("Error message")).when(this.request).createResponseBuilder(HttpStatus.OK);

        //When
        HttpResponseMessage response = tekvLSGetAllLicenses.run(this.request, id, this.context);
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