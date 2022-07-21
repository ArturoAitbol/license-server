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
        assertTrue(licenses.length()>=0);
    }

    @Tag("acceptance")
    @Test
    public void getAllLicensesDistributorRoleTest(){
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
        assertTrue(licenses.length()>=0);
    }

    @Tag("acceptance")
    @Test
    public void getAllLicensesCustomerRoleTest(){
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
        assertTrue(licenses.length()>=0);
    }

    @Tag("acceptance")
    @Test
    public void getAllLicensesSubaccountRoleTest(){
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
        assertTrue(licenses.length()>=0);
    }

    @Tag("acceptance")
    @Test
    public void getLicenseByIdTest() {
        //Given
        String id = "25e913de-5282-4231-b685-87dc40fa4856";

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
    public void getLicenseBySubaccountIdTest() {
        //Given
        String id = "EMPTY";
        String subaccountId = "04dfda26-98f4-42e5-889a-3edccf4b799c";
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
        assertTrue(licenses.length()>=0);
    }

    @Tag("Security")
    @Test
    public void getLicensesNoTokenTest(){
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
    public void getLicensesInvalidRoleTest(){
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
    public void getLicenseInvalidIdTest(){
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
    public void getAllLicensesGenericExceptionTest(){
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