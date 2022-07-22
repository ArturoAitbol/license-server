package com.function;

import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.*;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class TekvLSGetAllBundlesTest extends TekvLSTest {

    @BeforeEach
    public void setup(){
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @Tag("acceptance")
    @Test
    public void getAllBundlesTest(){
        //Given - Arrange
        String id = "EMPTY";

        //When - Action
        TekvLSGetAllBundles getAllBundles = new TekvLSGetAllBundles();
        HttpResponseMessage response = getAllBundles.run(this.request, id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("bundles"));

        Object bundles = jsonBody.get("bundles");
        assertTrue(bundles instanceof JSONArray);

        JSONArray bundlesArray = (JSONArray) bundles;
        assertTrue(bundlesArray.length() > 0);

        JSONObject firstBund = bundlesArray.getJSONObject(0);
        assertTrue(firstBund.has("id"));
        assertTrue(firstBund.has("name"));
        assertTrue(firstBund.has("deviceAccessTokens"));
        assertTrue(firstBund.has("tokens"));
    }

    @Tag("acceptance")
    @Test
    public void getBundleByIdTest(){
        String expectedId = "874929e5-a1b3-47dd-a683-93ad417a586f";

        HttpResponseMessage response = new TekvLSGetAllBundles().run(this.request, expectedId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("bundles"));
        JSONArray bundles = jsonBody.getJSONArray("bundles");
        assertTrue(((JSONArray) bundles).length() > 0);

        JSONObject bundle = (JSONObject) bundles.get(0);
        String actualId = bundle.getString("id");
        assertEquals(expectedId, actualId, "Actual Id is not: ".concat(expectedId));
    }

    @Tag("acceptance")
    @Test
    public void getBundleByNameTest(){
        String id = "EMPTY";
        String expectedName = "Medium";
        this.queryParams.put("name", expectedName);

        HttpResponseMessage response = new TekvLSGetAllBundles().run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: "+response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("bundles"));
        JSONArray bundles = jsonBody.getJSONArray("bundles");
        assertTrue(bundles.length() > 0);

        JSONObject bundle = (JSONObject) bundles.get(0);
        String actualName = bundle.getString("name");
        assertEquals(expectedName, actualName, "Actual name is not: ".concat(expectedName));
    }

    @Tag("security")
    @Test
    public void getBundlesNoTokenTest(){
        String id = "EMPTY";
        this.headers.remove("authorization");
        HttpResponseMessage response = new TekvLSGetAllBundles().run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: "+response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.UNAUTHORIZED;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String actualResponse = (String) response.getBody();

        String expectedResponse = "{\"error\":\"NOT AUTHORIZED: Access denied due to missing or invalid credentials\"}";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("security")
    @Test
    public void getBundlesInvalidRoleTest(){
        String id = "EMPTY";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("crm"));
        HttpResponseMessage response = new TekvLSGetAllBundles().run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: "+response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.FORBIDDEN;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String actualResponse = (String) response.getBody();

        String expectedResponse = "{\"error\":\"UNAUTHORIZED ACCESS. You do not have access as expected role is missing\"}";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void getBundleInvalidIdTest(){
        String expectedId = "BASIC";

        HttpResponseMessage response = new TekvLSGetAllBundles().run(this.request, expectedId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
    }
}