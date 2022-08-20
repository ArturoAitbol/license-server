package com.function;

import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;
import org.junit.jupiter.api.Test;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Optional;

public class TekvLSDeleteProjectByIdTest extends TekvLSTest {

    private String projectId = "EMPTY";

    @BeforeEach
    public void setup(){
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @Tag("acceptance")
    @Test
    public void deleteProjectByIdTest() {
        String bodyRequest = "{'subaccountId':'f5a609c0-8b70-4a10-9dc8-9536bdb5652c', 'licenseId':'b84852d7-0f04-4e9a-855c-7b2f01f61591', 'projectNumber':'1test', 'projectName':'ProjectTest','status':'Open', 'openDate':'2022-06-27 05:00:00', 'projectOwner':'98bbfc7e-d477-4534-a4b7-aafee90cddd3'}";
        Mockito.doReturn(Optional.of(bodyRequest)).when(request).getBody();

        TekvLSCreateProject createProject = new TekvLSCreateProject();
        HttpResponseMessage response = createProject.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        this.projectId = new JSONObject(response.getBody().toString()).getString("id");
        
        TekvLSDeleteProjectById deleteProjectById = new TekvLSDeleteProjectById();
        response = deleteProjectById.run(this.request, projectId, this.context);
        this.context.getLogger().info(response.getStatus().toString());

        actualStatus = response.getStatus();
        expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Tag("acceptance")
    @Test
    public void deleteProjectBadIdTest() {
        this.projectId = "2";
        TekvLSDeleteProjectById deleteProjectById = new TekvLSDeleteProjectById();
        HttpResponseMessage response = deleteProjectById.run(this.request, projectId, this.context);
        this.context.getLogger().info(response.getStatus().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Tag("acceptance")
    @Test
    public void deleteProjectExceptionTest() {
        this.projectId = "0abdcf08-bdec-4bc4-bb8d-d42ff84036dc";
        Mockito.doThrow(new RuntimeException("Generic error")).when(request).createResponseBuilder(HttpStatus.OK);

        TekvLSDeleteProjectById deleteProjectById = new TekvLSDeleteProjectById();
        HttpResponseMessage response = deleteProjectById.run(this.request, this.projectId, this.context);
        this.context.getLogger().info(response.getStatus().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Tag("security")
    @Test
    public void deleteProjectNoTokenTest() {
        this.headers.remove("authorization");
        HttpResponseMessage response = new TekvLSDeleteProjectById().run(this.request, this.projectId, this.context);
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
    public void deleteProjectInvalidRoleTest() {
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("crm"));
        HttpResponseMessage response = new TekvLSDeleteProjectById().run(this.request, this.projectId, this.context);
        this.context.getLogger().info("HttpResponse: "+response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.FORBIDDEN;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String actualResponse = (String) response.getBody();

        String expectedResponse = "{\"error\":\"" + RoleAuthHandler.MESSAGE_FOR_FORBIDDEN + "\"}";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }
}
