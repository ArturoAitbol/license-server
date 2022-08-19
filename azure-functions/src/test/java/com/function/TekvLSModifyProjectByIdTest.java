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


    private String bodyRequest = "";

    @BeforeEach
    void setUp() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @Test
    public void fullModifyProjectTest() {
        String projectId = "069dc3aa-dcb1-45e6-886f-be8f2345080f";
        this.bodyRequest = "{'projectNumber':'1test', 'projectName':'ProjectTest','status':'Closed', 'openDate':'2022-06-26 05:00:00', 'closeDate':'2022-06-29 05:00:00', }";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

        TekvLSModifyProjectById modifyProject = new TekvLSModifyProjectById();
        HttpResponseMessage response = modifyProject.run(this.request, projectId, this.context);

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void partialModifyProjectTest() {
        String projectId = "069dc3aa-dcb1-45e6-886f-be8f2345080f";
        this.bodyRequest = "{'closeDate':'2022-06-30 05:00:00'}";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

        TekvLSModifyProjectById modifyProject = new TekvLSModifyProjectById();
        HttpResponseMessage response = modifyProject.run(this.request, projectId, this.context);

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void modifyProjectStatusToOpenTest() {
        String projectId = "069dc3aa-dcb1-45e6-886f-be8f2345080f";
        this.bodyRequest = "{'status':'Open'}";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

        TekvLSModifyProjectById modifyProject = new TekvLSModifyProjectById();
        HttpResponseMessage response = modifyProject.run(this.request, projectId, this.context);

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void modifyProjectEmptyBodyTest() {
        String projectId = "069dc3aa-dcb1-45e6-886f-be8f2345080f";
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
        String projectId = "069dc3aa-dcb1-45e6-886f-be8f2345080f";
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
        this.bodyRequest = "{'projectNumber':'1test', 'projectName':'ProjectTest','status':'Closed', 'openDate':'2022-06-26 05:00:00', 'closeDate':'2022-06-29 05:00:00'}";
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
        String projectId = "069dc3aa-dcb1-45e6-886f-be8f2345080f";
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
        String projectId = "069dc3aa-dcb1-45e6-886f-be8f2345080f";
        this.bodyRequest = "{'projectNumber':'1test', 'projectName':'ProjectTest','status':'Closed', 'openDate':'2022-06-26 05:00:00', 'closeDate':'2022-06-29 05:00:00'}";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();
        Mockito.doThrow(new RuntimeException("Generic error")).when(request).createResponseBuilder(HttpStatus.OK);

        TekvLSModifyProjectById modifyProject = new TekvLSModifyProjectById();
        HttpResponseMessage response = modifyProject.run(this.request, projectId, this.context);

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void modifyProjectInvalidRoleTest() {
        String id = "069dc3aa-dcb1-45e6-886f-be8f2345080f";
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("crm"));
        HttpResponseMessage response = new TekvLSModifyProjectById().run(this.request, id, this.context);
        this.context.getLogger().info("HttpResponse: "+response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.FORBIDDEN;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String actualResponse = (String) response.getBody();

        String expectedResponse = "{\"error\":\"" + RoleAuthHandler.MESSAGE_FOR_FORBIDDEN + "\"}";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

}
