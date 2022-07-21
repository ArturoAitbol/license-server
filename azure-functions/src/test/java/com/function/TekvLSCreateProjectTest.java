package com.function;


import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;
import org.json.JSONObject;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Date;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.doReturn;

class TekvLSCreateProjectTest extends TekvLSTest {

    private String projectId = "EMPTY";
    private String bodyRequest = "";

    @BeforeEach
    void setUp() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @AfterEach
    void tearDown() {
        if(!this.projectId.equals("EMPTY")) {
            TekvLSDeleteProjectById deleteProjectById = new TekvLSDeleteProjectById();
            HttpResponseMessage response = deleteProjectById.run(this.request, this.projectId, this.context);
            this.context.getLogger().info(response.getStatus().toString());
            this.projectId = "EMPTY";

            HttpStatusType actualStatus = response.getStatus();
            HttpStatus expected = HttpStatus.OK;
            assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        }
    }

    @Test
    public void createProjectTest() {
        this.bodyRequest = "{'subaccountId':'0cde8c0e-9eab-4fa9-9dda-a38c0c514b3a', 'projectNumber':'1test', 'projectName':'ProjectTest','status':'Open', 'openDate':'2022-06-27 05:00:00'}";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

        TekvLSCreateProject createProject = new TekvLSCreateProject();
        HttpResponseMessage response = createProject.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("id"));
        this.projectId = jsonBody.getString("id");
        assertNotNull(this.projectId);
    }

    @Test
    public void createProjectIncorrectIdTypeTest() {
        this.bodyRequest = "{'subaccountId':'1', 'projectNumber':'1test', 'projectName':'ProjectTest','status':'Open', 'openDate':'2022-06-27 05:00:00'}";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

        TekvLSCreateProject createProject = new TekvLSCreateProject();
        HttpResponseMessage response = createProject.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected , actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "ERROR: la sintaxis de entrada no es válida para tipo uuid: «1»\n" + "  Position: 72";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void createProjectIncomplete() {
        this.bodyRequest = "{'subaccountId':'0cde8c0e-9eab-4fa9-9dda-a38c0c514b3a', 'projectNumber':'1test', 'status':'Open', 'openDate':'2022-06-27 05:00:00'}";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

        TekvLSCreateProject createProject = new TekvLSCreateProject();
        HttpResponseMessage response = createProject.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected , actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Missing mandatory parameter: projectName";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void createEmptyBodyTest() {
        this.bodyRequest = "";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

        TekvLSCreateProject createProject = new TekvLSCreateProject();
        HttpResponseMessage response = createProject.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected , actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "error: request body is empty.";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("security")
    @Test
    public void createProjectNoTokenTest() {
        this.headers.remove("authorization");
        HttpResponseMessage response = new TekvLSCreateProject().run(this.request, this.context);
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
    public void createProjectInvalidRoleTest() {
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("test"));
        HttpResponseMessage response = new TekvLSCreateProject().run(this.request, this.context);
        this.context.getLogger().info("HttpResponse: "+response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.FORBIDDEN;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String actualResponse = (String) response.getBody();

        String expectedResponse = "{\"error\":\"UNAUTHORIZED ACCESS. You do not have access as expected role is missing\"}";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void createProjectWithoutJsonTest() {
        this.bodyRequest = "test";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

        TekvLSCreateProject createProject = new TekvLSCreateProject();
        HttpResponseMessage response = createProject.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void createProjectExceptionTest() {
        String testName = String.valueOf(new Date());
        String testNumber = String.valueOf(new Date());
        this.bodyRequest = "{'subaccountId':'0cde8c0e-9eab-4fa9-9dda-a38c0c514b3a','status':'Open', 'openDate':'2022-06-27 05:00:00', " +
                "'projectNumber'" + ":" + testNumber + ", " + "'projectName'" + ":" + testName + "}'";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();
        Mockito.doThrow(new RuntimeException("Generic error")).when(request).createResponseBuilder(HttpStatus.OK);

        TekvLSCreateProject createProject = new TekvLSCreateProject();
        HttpResponseMessage response = createProject.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected , actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }


    @Test
    public void createProjectDuplicatedTest() {
        this.bodyRequest = "{'subaccountId':'0cde8c0e-9eab-4fa9-9dda-a38c0c514b3a', 'projectNumber':'1test', 'projectName':'ProjectTest','status':'Open', 'openDate':'2022-06-27 05:00:00'}";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

        TekvLSCreateProject createProject = new TekvLSCreateProject();
        HttpResponseMessage response = createProject.run(this.request, this.context);
        createProject.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("id"));
        this.projectId = jsonBody.getString("id");

        response = createProject.run(this.request, this.context);
        createProject.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        actualStatus = response.getStatus();
        expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String actualResponse = (String) response.getBody();

        String expectedResponse = response.getBody().toString();
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }
}