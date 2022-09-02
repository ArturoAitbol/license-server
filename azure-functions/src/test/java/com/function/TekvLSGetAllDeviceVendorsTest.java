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
import org.mockito.Mockito;
import uk.org.webcompere.systemstubs.environment.EnvironmentVariables;

import java.util.List;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

class TekvLSGetAllDeviceVendorsTest extends TekvLSTest {

    TekvLSGetAllDeviceVendors getAllVendorsApi = new TekvLSGetAllDeviceVendors();

    @BeforeEach
    public void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));
    }

    @Tag("acceptance")
    @Test
    public void getAllVendorsTest() {
        //When - Action
        HttpResponseMessage response = getAllVendorsApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("vendors"));
        assertTrue(jsonBody.has("supportVendors"));

        List<String> vendors = jsonBody.getJSONArray("vendors").toList().stream().map(object -> (String) object).collect(Collectors.toList());
        List<String> supportVendors = jsonBody.getJSONArray("supportVendors").toList().stream().map(object -> (String) object).collect(Collectors.toList());

        assertTrue(vendors.size() > 0);
        assertTrue(vendors.contains("tekVizion"));
        assertTrue(supportVendors.size() > 0);
        assertTrue(supportVendors.contains("HylaFAX"));
    }

    @Tag("security")
    @Test
    public void unauthorizedTest() {
        //Given - Arrange
        this.headers.remove("authorization");

        //When - Action
        HttpResponseMessage response = getAllVendorsApi.run(this.request, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.UNAUTHORIZED;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = RoleAuthHandler.MESSAGE_FOR_UNAUTHORIZED;
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("security")
    @Test
    public void forbiddenTest() {
        //Given - Arrange
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("crm"));

        //When - Action
        HttpResponseMessage response = getAllVendorsApi.run(this.request, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

        //Then - Assert
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

    @Test
    public void genericExceptionTest() {
        //Given - Arrange
        Mockito.when(this.request.createResponseBuilder(HttpStatus.OK)).thenThrow(new RuntimeException("Generic error"));

        //When - Action
        HttpResponseMessage response = getAllVendorsApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Generic error";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void sqlExceptionTest() {
        //When - Action
        HttpResponseMessage response;
        try {
            response = new EnvironmentVariables("POSTGRESQL_SERVER", "test").execute(() -> getAllVendorsApi.run(this.request, this.context));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "The connection attempt failed.";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

}
