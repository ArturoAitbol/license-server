package com.function;

import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.doReturn;

public class TekvLSModifyProjectByIdTest extends TekvLSTest {
    private String projectId = "f2b57afb-c389-48ec-a54b-7d8a05a51f32";
    private String bodyRequest = "";

    @BeforeEach
    void setUp() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @Test
    public void fullModifyProjectTest() {
        this.bodyRequest = "{'licenseId':'b84852d7-0f04-4e9a-855c-7b2f01f61591', 'projectNumber':'1test', 'projectName':'ModifiedProjectTest','status':'Closed', 'openDate':'2022-06-26 05:00:00', 'closeDate':'2022-06-29 05:00:00', }";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

        TekvLSModifyProjectById modifyProject = new TekvLSModifyProjectById();
        HttpResponseMessage response = modifyProject.run(this.request, projectId, this.context);

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void reopenProjectTest() {
        this.bodyRequest = "{'status':'Open', 'closeDate':null}";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

        TekvLSModifyProjectById modifyProject = new TekvLSModifyProjectById();
        HttpResponseMessage response = modifyProject.run(this.request, projectId, this.context);

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void modifyProjectLicenseTest() {
        this.bodyRequest = "{'licenseId':'b84852d7-0f04-4e9a-855c-7b2f01f61591'}";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

        TekvLSModifyProjectById modifyProject = new TekvLSModifyProjectById();
        HttpResponseMessage response = modifyProject.run(this.request, projectId, this.context);

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void modifyProjectEmptyBodyTest() {
        this.bodyRequest = "";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

        TekvLSModifyProjectById modifyProject = new TekvLSModifyProjectById();
        HttpResponseMessage response = modifyProject.run(this.request, projectId, this.context);

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void modifyProjectIncorrectBodyTest() {
        this.bodyRequest = "test";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

        TekvLSModifyProjectById modifyProject = new TekvLSModifyProjectById();
        HttpResponseMessage response = modifyProject.run(this.request, projectId, this.context);

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void modifyProjectIncorrectProjectIdTest() {
        String projectId = "";
        this.bodyRequest = "{'projectNumber':'1test', 'projectName':'ModifiedProjectTest','status':'Closed', 'openDate':'2022-06-26 05:00:00', 'closeDate':'2022-06-29 05:00:00'}";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

        TekvLSModifyProjectById modifyProject = new TekvLSModifyProjectById();
        HttpResponseMessage response = modifyProject.run(this.request, projectId, this.context);

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void modifyProjectsNoTokenTest() {
        String id = "EMPTY";
        this.headers.remove("authorization");
        HttpResponseMessage response = new TekvLSModifyProjectById().run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: "+response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.UNAUTHORIZED;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String actualResponse = (String) response.getBody();

        String expectedResponse = "{\"error\":\"" + RoleAuthHandler.MESSAGE_FOR_UNAUTHORIZED + "\"}";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void modifyProjectEmptyOptionalParamsTest() {
        this.bodyRequest = "{}";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

        TekvLSModifyProjectById modifyProject = new TekvLSModifyProjectById();
        HttpResponseMessage response = modifyProject.run(this.request, projectId, this.context);

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void modifyProjectExceptionTest() {
        this.bodyRequest = "{'projectNumber':'1test', 'projectName':'ModifiedProjectTest','status':'Closed', 'openDate':'2022-06-26 05:00:00', 'closeDate':'2022-06-29 05:00:00'}";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();
        Mockito.doThrow(new RuntimeException("Generic error")).when(request).createResponseBuilder(HttpStatus.OK);

        TekvLSModifyProjectById modifyProject = new TekvLSModifyProjectById();
        HttpResponseMessage response = modifyProject.run(this.request, projectId, this.context);

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void modifyProjectInvalidRoleTest() {
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("crm"));
        HttpResponseMessage response = new TekvLSModifyProjectById().run(this.request, projectId, this.context);
        this.context.getLogger().info("HttpResponse: "+response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.FORBIDDEN;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String actualResponse = (String) response.getBody();

        String expectedResponse = "{\"error\":\"" + RoleAuthHandler.MESSAGE_FOR_FORBIDDEN + "\"}";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

}
