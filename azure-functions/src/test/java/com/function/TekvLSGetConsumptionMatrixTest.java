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
import org.mockito.Mockito;
import uk.org.webcompere.systemstubs.environment.EnvironmentVariables;

import static org.junit.jupiter.api.Assertions.*;

class TekvLSGetConsumptionMatrixTest extends TekvLSTest {
    TekvLSGetConsumptionMatrix getConsumptionMatrixApi = new TekvLSGetConsumptionMatrix();

    @BeforeEach
    public void setup(){
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));
    }

    @Tag("acceptance")
    @Test
    public void getConsumptionMatrix() {
        HttpResponseMessage response = getConsumptionMatrixApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("consumptionMatrix"));

        Object consumptionMatrix = jsonBody.get("consumptionMatrix");
        assertTrue(consumptionMatrix instanceof JSONArray);

        JSONArray consumptionMatrixArray = (JSONArray) consumptionMatrix;
        assertTrue(consumptionMatrixArray.length() > 0);

        JSONObject firstFound = consumptionMatrixArray.getJSONObject(0);
        assertTrue(firstFound.has("id"));
        assertTrue(firstFound.has("tokens"));
        assertTrue(firstFound.has("dutType"));
        assertTrue(firstFound.has("callingPlatform"));
    }

    @Tag("security")
    @Test
    public void noTokenTest(){
        this.headers.remove("authorization");
        HttpResponseMessage response = getConsumptionMatrixApi.run(this.request, this.context);
        this.context.getLogger().info("HttpResponse: "+response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.UNAUTHORIZED;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String actualResponse = (String) response.getBody();

        String expectedResponse = "{\"error\":\"" + RoleAuthHandler.MESSAGE_FOR_UNAUTHORIZED + "\"}";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("security")
    @Test
    public void invalidRoleTest(){
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("distributorAdmin"));
        HttpResponseMessage response = getConsumptionMatrixApi.run(this.request, this.context);
        this.context.getLogger().info("HttpResponse: "+response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.FORBIDDEN;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String actualResponse = (String) response.getBody();

        String expectedResponse = "{\"error\":\"" + RoleAuthHandler.MESSAGE_FOR_FORBIDDEN + "\"}";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void genericExceptionTest() {
        Mockito.doThrow(new RuntimeException("Generic error")).when(request).createResponseBuilder(HttpStatus.OK);

        HttpResponseMessage response = getConsumptionMatrixApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void sqlExceptionTest() {
        //When - Action
        HttpResponseMessage response;
        try {
            response = new EnvironmentVariables("POSTGRESQL_SERVER", "test").execute(() -> getConsumptionMatrixApi.run(this.request, this.context));
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

        String expectedResponse = "SQL Exception: The connection attempt failed.";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

}
