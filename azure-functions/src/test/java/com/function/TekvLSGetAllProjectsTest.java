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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class TekvLSGetAllProjectsTest extends TekvLSTest {
    private final String emptyId = "EMPTY";

    @BeforeEach
    public void setup(){
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
        this.queryParams.put("subaccountId", "f5a609c0-8b70-4a10-9dc8-9536bdb5652c");
    }

    @Tag("acceptance")
    @Test
    public void getProjectByProjectIdTest() {
        String expectedId = "f2b57afb-c389-48ec-a54b-7d8a05a51f32";
        TekvLSGetAllProjects getAllProjects = new TekvLSGetAllProjects();
        HttpResponseMessage response = getAllProjects.run(this.request, expectedId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("projects"));

        Object projects = jsonBody.get("projects");
        assertTrue(projects instanceof JSONArray);

        JSONArray projectsArray = (JSONArray) projects;
        assertTrue(projectsArray.length() > 0);

        JSONObject firstFound = projectsArray.getJSONObject(0);
        assertTrue(firstFound.has("id"));
        assertTrue(firstFound.has("subaccountId"));
        assertTrue(firstFound.has("name"));
        assertTrue(firstFound.has("code"));
        assertTrue(firstFound.has("status"));
        assertTrue(firstFound.has("openDate"));
        assertTrue(firstFound.has("closeDate"));
        assertTrue(firstFound.has("projectOwner"));
    }

    @Tag("acceptance")
    @Test
    public void getAllProjectBySubaccountIdTest() {
        TekvLSGetAllProjects getAllProjects = new TekvLSGetAllProjects();
        HttpResponseMessage response = getAllProjects.run(this.request, emptyId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("projects"));

        Object projects = jsonBody.get("projects");
        assertTrue(projects instanceof JSONArray);

        JSONArray projectsArray = (JSONArray) projects;
        assertTrue(projectsArray.length() > 0);

        JSONObject firstFound = projectsArray.getJSONObject(0);
        assertTrue(firstFound.has("id"));
        assertTrue(firstFound.has("subaccountId"));
        assertTrue(firstFound.has("name"));
        assertTrue(firstFound.has("code"));
        assertTrue(firstFound.has("status"));
        assertTrue(firstFound.has("openDate"));
        assertTrue(firstFound.has("closeDate"));
        assertTrue(firstFound.has("projectOwner"));
    }

    @Tag("acceptance")
    @Test
    public void getProjectIncompleteSubaccountIdTest() {
        String expectedId = "21";

        HttpResponseMessage response = new TekvLSGetAllProjects().run(this.request, expectedId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Tag("acceptance")
    @Test
    public void getAllProjectMissingSubaccountIdTest() {
        this.queryParams.remove("subaccountId");

        TekvLSGetAllProjects getAllProjects = new TekvLSGetAllProjects();
        HttpResponseMessage response = getAllProjects.run(this.request, emptyId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));
    }

    @Tag("security")
    @Test
    public void getProjectsNoTokenTest(){
        this.headers.remove("authorization");
        HttpResponseMessage response = new TekvLSGetAllProjects().run(this.request, emptyId, this.context);
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
    public void getProjectsInvalidRoleTest(){
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("crm"));
        HttpResponseMessage response = new TekvLSGetAllProjects().run(this.request, emptyId, this.context);
        this.context.getLogger().info("HttpResponse: "+response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.FORBIDDEN;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String actualResponse = (String) response.getBody();

        String expectedResponse = "{\"error\":\"" + RoleAuthHandler.MESSAGE_FOR_FORBIDDEN + "\"}";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("acceptance")
    @Test
    public void getAllProjectBySubaccountIdExceptionTest() {
        Mockito.doThrow(new RuntimeException("Generic error")).when(request).createResponseBuilder(HttpStatus.OK);

        TekvLSGetAllProjects getAllProjects = new TekvLSGetAllProjects();
        HttpResponseMessage response = getAllProjects.run(this.request, emptyId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));
    }

    @Tag("acceptance")
    @Test
    public void getAllProjectBySubaccountIdAndStatusTest() {
        String status = "Open";
        this.queryParams.put("status", status);

        TekvLSGetAllProjects getAllProjects = new TekvLSGetAllProjects();
        HttpResponseMessage response = getAllProjects.run(this.request, emptyId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));
    }

    @Tag("acceptance")
    @Test
    public void getAllProjectCustomerAdminTest() {
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));

        TekvLSGetAllProjects getAllProjects = new TekvLSGetAllProjects();
        HttpResponseMessage response = getAllProjects.run(this.request, emptyId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));
    }

    @Tag("acceptance")
    @Test
    public void getAllProjectDistributorFullAdminTest() {
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("distributorAdmin"));

        TekvLSGetAllProjects getAllProjects = new TekvLSGetAllProjects();
        HttpResponseMessage response = getAllProjects.run(this.request, emptyId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));
    }

    @Tag("acceptance")
    @Test
    public void getAllProjectSubaccountAdminTest() {
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));

        TekvLSGetAllProjects getAllProjects = new TekvLSGetAllProjects();
        HttpResponseMessage response = getAllProjects.run(this.request, emptyId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));
    }

}