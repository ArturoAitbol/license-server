package com.function;

import com.function.auth.RoleAuthHandler;
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

import java.time.LocalDateTime;
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
        this.bodyRequest = "{'subaccountId':'f5a609c0-8b70-4a10-9dc8-9536bdb5652c', 'licenseId':'b84852d7-0f04-4e9a-855c-7b2f01f61591', 'projectNumber':'1test', 'projectName':'ProjectTest','status':'Open', 'openDate':'2022-06-27 05:00:00', 'projectOwner':'98bbfc7e-d477-4534-a4b7-aafee90cddd3'}";
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
    public void createProjectIncorrectSubaccountIdTypeTest() {
        this.bodyRequest = "{'subaccountId':'1', 'licenseId':'b84852d7-0f04-4e9a-855c-7b2f01f61591', 'projectNumber':'1test', 'projectName':'ProjectTest','status':'Open', 'openDate':'2022-06-27 05:00:00'}";
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

        String expectedResponse = "ERROR: invalid input syntax for type uuid: \"1\"";
        String actualResponse = jsonBody.getString("error");
        assertTrue(actualResponse.contains(expectedResponse), "Response doesn't contain: ".concat(expectedResponse));
    }

    @Test
    public void createProjectIncomplete() {
        this.bodyRequest = "{'subaccountId':'f5a609c0-8b70-4a10-9dc8-9536bdb5652c', 'licenseId':'b84852d7-0f04-4e9a-855c-7b2f01f61591', 'projectNumber':'1test', 'status':'Open', 'openDate':'2022-06-27 05:00:00'}";
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
    public void createProjectWithoutLicenseId() {
        this.bodyRequest = "{'subaccountId':'f5a609c0-8b70-4a10-9dc8-9536bdb5652c', 'projectNumber':'CICDTest', 'projectName':'ProjectTest','status':'Open', 'openDate':'2022-06-27 05:00:00'}";
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

        String expectedResponse = "Missing mandatory parameter: licenseId";
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

        String expectedResponse = "{\"error\":\"" + RoleAuthHandler.MESSAGE_FOR_UNAUTHORIZED + "\"}";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("security")
    @Test
    public void createProjectInvalidRoleTest() {
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("crm"));
        HttpResponseMessage response = new TekvLSCreateProject().run(this.request, this.context);
        this.context.getLogger().info("HttpResponse: "+response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.FORBIDDEN;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String actualResponse = (String) response.getBody();

        String expectedResponse = "{\"error\":\"" + RoleAuthHandler.MESSAGE_FOR_FORBIDDEN + "\"}";
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
        this.bodyRequest = "{'subaccountId':'f5a609c0-8b70-4a10-9dc8-9536bdb5652c', 'licenseId':'b84852d7-0f04-4e9a-855c-7b2f01f61591', 'openDate':'2021-06-27 05:00:00', " +
                "'status':'Open', 'projectNumber':'xxxxxxx', 'projectName':'unitTest" + LocalDateTime.now() + "'}'";
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
        this.bodyRequest = "{'subaccountId':'f5a609c0-8b70-4a10-9dc8-9536bdb5652c', 'licenseId':'b84852d7-0f04-4e9a-855c-7b2f01f61591', 'projectNumber':'1test', 'projectName':'ProjectTest','status':'Open', 'openDate':'2022-06-27 05:00:00'}";
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

         body = (String) response.getBody();
         jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Project already exists";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }
}