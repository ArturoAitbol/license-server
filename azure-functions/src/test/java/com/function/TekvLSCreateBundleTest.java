package com.function;

import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.*;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TekvLSCreateBundleTest extends TekvLSTest {

    private String bundleId = "EMPTY";
    private String bodyRequest = "";

    @BeforeEach
    void setUp() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));
    }

    @AfterEach
    void tearDown() {
        if (!this.bundleId.equals("EMPTY")){
            TekvLSDeleteBundleById deleteBundleById = new TekvLSDeleteBundleById();
            HttpResponseMessage response = deleteBundleById.run(this.request, this.bundleId, this.context);
            this.context.getLogger().info(response.getStatus().toString());
            this.bundleId = "EMPTY";

            HttpStatusType actualStatus = response.getStatus();
            HttpStatus expected = HttpStatus.OK;
            assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
        }
    }

    @Test
    public void createBundleTest(){
        //Given - Arrange
        this.bodyRequest = "{'name':'UnitTest','tokens':'30', 'deviceAccessToken':'5'}";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

        //When - Action
        TekvLSCreateBundle createBundle = new TekvLSCreateBundle();
        HttpResponseMessage response = createBundle.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("id"));
        this.bundleId = jsonBody.getString("id");
        assertNotNull(this.bundleId);
    }

    @Test
    public void createBundleIncompleteBody(){
        //Given - Arrange
        this.bodyRequest = "{'name':'Test','tokens':'30'}";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

        //When - Action
        TekvLSCreateBundle createBundle = new TekvLSCreateBundle();
        HttpResponseMessage response = createBundle.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Missing mandatory parameter: deviceAccessToken";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void createBundleNoBody(){
        //Given - Arrange
        this.bodyRequest = "";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

        //When - Action
        TekvLSCreateBundle createBundle = new TekvLSCreateBundle();
        HttpResponseMessage response = createBundle.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Request body is empty.";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }
}