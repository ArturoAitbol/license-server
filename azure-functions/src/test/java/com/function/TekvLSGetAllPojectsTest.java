package com.function;


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

public class TekvLSGetAllPojectsTest extends TekvLSTest {

    @BeforeEach
    public void setup(){
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @Tag("acceptance")
    @Test
    public void getAllProjectBySubaccountIdTest() {
        String subaccountId = "0abdff08-bdec-4974-ba8d-d42ff84036dc";

        TekvLSGetAllProjects getAllProjects = new TekvLSGetAllProjects();
        HttpResponseMessage response = getAllProjects.run(this.request, subaccountId, this.context);
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
        String id = "EMPTY";
        String subaccountId = "";
        this.queryParams.put("subaccountId", subaccountId);

        TekvLSGetAllProjects getAllProjects = new TekvLSGetAllProjects();
        HttpResponseMessage response = getAllProjects.run(this.request, id, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));
    }

    @Tag("security")
    @Test
    public void getProjectsNoTokenTest(){
        String id = "EMPTY";
        this.headers.remove("authorization");
        HttpResponseMessage response = new TekvLSGetAllProjects().run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: "+response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.UNAUTHORIZED;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String actualResponse = (String) response.getBody();

        String expectedResponse = "{\"error\":\"NOT AUTHORIZED. Access denied as role is missing.\"}";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("security")
    @Test
    public void getProjectsInvalidRoleTest(){
        String id = "EMPTY";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("test"));
        HttpResponseMessage response = new TekvLSGetAllProjects().run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: "+response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.FORBIDDEN;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String actualResponse = (String) response.getBody();

        String expectedResponse = "{\"error\":\"UNAUTHORIZED ACCESS. You do not have access as expected role is missing\"}";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("acceptance")
    @Test
    public void getAllProjectBySubaccountIdExceptionTest() {
        String subaccountId = "0abdff08-bdec-4974-ba8d-d42ff84036dc";
        Mockito.doThrow(new RuntimeException("Generic error")).when(request).createResponseBuilder(HttpStatus.OK);

        TekvLSGetAllProjects getAllProjects = new TekvLSGetAllProjects();
        HttpResponseMessage response = getAllProjects.run(this.request, subaccountId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));
    }

    @Tag("acceptance")
    @Test
    public void getAllProjectBySubaccountIdAndStatusTest() {
        String projectId = "EMPTY";
        String subaccountId = "0abdff08-bdec-4974-ba8d-d42ff84036dc";
        String status = "Open";
        this.queryParams.put("status", status);
        this.queryParams.put("subaccountId",subaccountId);

        TekvLSGetAllProjects getAllProjects = new TekvLSGetAllProjects();
        HttpResponseMessage response = getAllProjects.run(this.request, projectId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));
    }

}