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
    private final TekvLSGetAllProjects getAllProjects = new TekvLSGetAllProjects();

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

    @Test
    public void getProjectByNonexistentProjectIdTest() {
        String expectedId = "00000000-0000-0000-0000-000000000000";
        HttpResponseMessage response = getAllProjects.run(this.request, expectedId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedResponse = RoleAuthHandler.MESSAGE_ID_NOT_FOUND;
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void getProjectIncompleteSubaccountIdTest() {
        String expectedId = "21";

        HttpResponseMessage response = new TekvLSGetAllProjects().run(this.request, expectedId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void getAllProjectMissingSubaccountIdTest() {
        this.queryParams.remove("subaccountId");

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

    @Test
    public void getAllProjectBySubaccountIdExceptionTest() {
        Mockito.doThrow(new RuntimeException("Generic error")).when(request).createResponseBuilder(HttpStatus.OK);

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

        HttpResponseMessage response = getAllProjects.run(this.request, emptyId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));
    }

    @Tag("acceptance")
    @Test
    public void getForCustomerAdminRoleTest() {
        //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));
        //When
        HttpResponseMessage response = getAllProjects.run(this.request, emptyId, this.context);
        this.context.getLogger().info(response.getBody().toString());
        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("projects"));

        JSONArray projects = jsonBody.getJSONArray("projects");
        assertTrue(projects.length()>0);

        String expectedSubaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        for(int i=0;i<projects.length();i++){
            JSONObject project = projects.getJSONObject(i);
            String actualSubaccount = project.getString("subaccountId");
            assertEquals(expectedSubaccountId,actualSubaccount,
                    "Project with subaccountId:"+actualSubaccount+" not expected in response (id:" + project.getString("id") + ")");
        }
    }

    @Tag("acceptance")
    @Test
    public void getForCustomerAdminRoleIncorrectSubaccountIdTest() {
        //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));
        String subaccountId = "cebe6542-2032-4398-882e-ffb44ade169d";
        this.queryParams.put("subaccountId", subaccountId);
        //When
        HttpResponseMessage response = getAllProjects.run(this.request, emptyId, this.context);
        this.context.getLogger().info(response.getBody().toString());
        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_FOR_INVALID_ID;
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }

    @Tag("security")
    @Test
    public void getForCustomerAdminRoleIncorrectProjectIdTest() {
        //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));
        String expectedId = "a42edf7f-9b38-472f-afa3-10a4632acca1";
        //When
        HttpResponseMessage response = getAllProjects.run(this.request, expectedId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_FOR_INVALID_ID;
        assertEquals(expectedMessage,jsonBody.getString("error"));

    }

    @Tag("acceptance")
    @Test
    public void getForDistributorAdminRoleTest() {
        //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("distributorAdmin"));
        String subaccountId = "cebe6542-2032-4398-882e-ffb44ade169d";
        this.queryParams.put("subaccountId", subaccountId);
        //When
        HttpResponseMessage response = getAllProjects.run(this.request, emptyId, this.context);
        this.context.getLogger().info(response.getBody().toString());
        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("projects"));

        JSONArray projects = jsonBody.getJSONArray("projects");
        assertEquals(1, projects.length());

        JSONObject project = projects.getJSONObject(0);
        assertEquals(subaccountId,project.getString("subaccountId"));
    }

    @Tag("acceptance")
    @Test
    public void getForDistributorAdminRoleIncorrectSubaccountIdTest() {
        //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("distributorAdmin"));
        //When
        HttpResponseMessage response = getAllProjects.run(this.request, emptyId, this.context);
        this.context.getLogger().info(response.getBody().toString());
        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_FOR_INVALID_ID;
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }

    @Tag("security")
    @Test
    public void getForDistributorAdminRoleIncorrectProjectIdTest() {
        //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("distributorAdmin"));
        String expectedId = "f2b57afb-c389-48ec-a54b-7d8a05a51f32";
        //When
        HttpResponseMessage response = getAllProjects.run(this.request, expectedId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_FOR_INVALID_ID;
        assertEquals(expectedMessage,jsonBody.getString("error"));

    }

    @Tag("acceptance")
    @Test
    public void getForSubaccountAdminRoleTest() {
        //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));
        String subaccountId = "96234b32-32d3-45a4-af26-4c912c0d6a06";
        this.queryParams.put("subaccountId", subaccountId);
        //When
        HttpResponseMessage response = getAllProjects.run(this.request, emptyId, this.context);
        this.context.getLogger().info(response.getBody().toString());
        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("projects"));

        JSONArray projects = jsonBody.getJSONArray("projects");
        assertEquals(1, projects.length());

        JSONObject project = projects.getJSONObject(0);
        assertEquals(subaccountId,project.getString("subaccountId"));
    }

    @Tag("security")
    @Test
    public void getForSubaccountAdminRoleIncorrectSubaccountIdTest() {
        //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));
        //When
        HttpResponseMessage response = getAllProjects.run(this.request, emptyId, this.context);
        this.context.getLogger().info(response.getBody().toString());
        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_FOR_INVALID_ID;
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }

    @Tag("security")
    @Test
    public void getForSubaccountAdminRoleIncorrectProjectIdTest() {
        //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));
        String expectedId = "f2b57afb-c389-48ec-a54b-7d8a05a51f32";
        //When
        HttpResponseMessage response = getAllProjects.run(this.request, expectedId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_FOR_INVALID_ID;
        assertEquals(expectedMessage,jsonBody.getString("error"));

    }

}