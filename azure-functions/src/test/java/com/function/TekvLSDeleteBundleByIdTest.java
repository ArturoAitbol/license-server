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

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.doReturn;

class TekvLSDeleteBundleByIdTest extends TekvLSTest {
    private String bundleId;

    @BeforeEach
    void setUp() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));
        this.bundleId = "EMPTY";
    }

    @Test
    public void deleteBundleTest(){
        //Given - Arrange
        String bodyRequest = "{'bundleName':'UnitTestDelete','tokens':'30', 'deviceAccessToken':'5'}";
        TekvLSCreateBundle createBundle = new TekvLSCreateBundle();
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        HttpResponseMessage responseCreate = createBundle.run(this.request, this.context);
        assertEquals(HttpStatus.OK, responseCreate.getStatus(),"HTTP status doesn't match with: ".concat(HttpStatus.OK.toString()));
        JSONObject jsonBody = new JSONObject(responseCreate.getBody().toString());
        assertTrue(jsonBody.has("id"));
        this.bundleId = jsonBody.getString("id");

        //When - Action
        TekvLSDeleteBundleById deleteBundleById = new TekvLSDeleteBundleById();
        HttpResponseMessage response = deleteBundleById.run(this.request, this.bundleId, this.context);
        this.context.getLogger().info(response.getStatus().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));
    }

    @Test
    public void noId(){
        //Given - Arrange

        //When - Action
        TekvLSDeleteBundleById deleteBundleById = new TekvLSDeleteBundleById();
        HttpResponseMessage response = deleteBundleById.run(this.request, this.bundleId, this.context);
        this.context.getLogger().info(response.getStatus().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String actualResponse = response.getBody().toString();
        String expectedResponse = "{\"error\":\"Please pass an id on the query string.\"}";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void invalidId(){
        //Given - Arrange
        this.bundleId = "Medium";

        //When - Action
        TekvLSDeleteBundleById deleteBundleById = new TekvLSDeleteBundleById();
        HttpResponseMessage response = deleteBundleById.run(this.request, this.bundleId, this.context);
        this.context.getLogger().info(response.getStatus().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

/*        String expectedResponse = "invalid input syntax";
        String actualResponse = jsonBody.getString("error");
        assertTrue(actualResponse.contains(expectedResponse), "Response doesn't contain: ".concat(expectedResponse));*/
    }

    @Tag("security")
    @Test
    public void noToken(){
        this.headers.remove("authorization");
        HttpResponseMessage response = new TekvLSDeleteBundleById().run(this.request, this.bundleId, this.context);
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
    public void invalidRole(){
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("crm"));
        HttpResponseMessage response = new TekvLSDeleteBundleById().run(this.request, this.bundleId,this.context);
        this.context.getLogger().info("HttpResponse: "+response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.FORBIDDEN;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String actualResponse = (String) response.getBody();

        String expectedResponse = "{\"error\":\"" + RoleAuthHandler.MESSAGE_FOR_FORBIDDEN + "\"}";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }


    @Test
    public void genericException(){
        //Given - Arrange
        this.bundleId="a7798683-2cde-4318-ae9c-c0c77828939f";
        Mockito.doThrow(new RuntimeException("Generic error")).when(request).createResponseBuilder(HttpStatus.OK);

        //When - Action
        TekvLSDeleteBundleById deleteBundleById = new TekvLSDeleteBundleById();
        HttpResponseMessage response = deleteBundleById.run(this.request, this.bundleId, this.context);
        this.context.getLogger().info(response.getStatus().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Generic error";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));

        this.bundleId="EMPTY";
    }
}