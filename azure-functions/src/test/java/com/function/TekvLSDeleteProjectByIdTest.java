package com.function;

import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class TekvLSDeleteProjectByIdTest extends TekvLSTest {

    private String projectId = "EMPTY";

    @BeforeEach
    public void setup(){
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
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
        HttpStatus expected = HttpStatus.BAD_REQUEST;
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

        String expectedResponse = "{\"error\":\"NOT AUTHORIZED. Access denied as role is missing.\"}";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("security")
    @Test
    public void deleteProjectInvalidRoleTest() {
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("test"));
        HttpResponseMessage response = new TekvLSDeleteProjectById().run(this.request, this.projectId, this.context);
        this.context.getLogger().info("HttpResponse: "+response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.FORBIDDEN;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String actualResponse = (String) response.getBody();

        String expectedResponse = "{\"error\":\"UNAUTHORIZED ACCESS. You do not have access as expected role is missing\"}";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }
}
