package com.function;

import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.HttpResponseMessageMock;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.mockito.stubbing.Answer;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class TekvLSCreateAdminEmailTest extends TekvLSTest {
    TekvLSCreateAdminEmail createAdminEmailApi;
    private String customerId = "7d133fd2-8228-44ff-9636-1881f58f2dbb";
    private String adminEmail = "EMPTY";
    private String name = "EMPTY";

    @BeforeEach
    public void setup() {
        this.initTestParameters();
        this.createAdminEmailApi = new TekvLSCreateAdminEmail();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
        name = "unitTest" + LocalDateTime.now();
    }

    @AfterEach
    void tearDown() {
        if (!this.adminEmail.equals("EMPTY")) {
            TekvLSDeleteAdminEmail deleteBundleById = new TekvLSDeleteAdminEmail();
            HttpResponseMessage response = deleteBundleById.run(this.request, this.adminEmail, this.context);
            this.context.getLogger().info(response.getStatus().toString());
            this.adminEmail = "EMPTY";

            HttpStatusType actualStatus = response.getStatus();
            HttpStatus expected = HttpStatus.OK;
            assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        }
    }

    @Test
    public void createAdminEmailTest() {
        // Given - Arrange
        this.adminEmail = name + "@test.com";
        TekvLSCreateAdminEmail.CreateAdminRequest bodyRequest = new TekvLSCreateAdminEmail.CreateAdminRequest(
                this.adminEmail, this.customerId);
        @SuppressWarnings("unchecked")
        HttpRequestMessage<Optional<TekvLSCreateAdminEmail.CreateAdminRequest>> request = mock(
                HttpRequestMessage.class);
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        doReturn(this.headers).when(request).getHeaders();
        doAnswer((Answer<HttpResponseMessage.Builder>) invocation -> {
            HttpStatus status = (HttpStatus) invocation.getArguments()[0];
            return new HttpResponseMessageMock.HttpResponseMessageBuilderMock().status(status);
        }).when(request).createResponseBuilder(any(HttpStatus.class));

        // When - Action
        HttpResponseMessage response = createAdminEmailApi.run(request, this.context);

        // Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void incompleteBodyTest() {
        TekvLSCreateAdminEmail.CreateAdminRequest bodyRequest = new TekvLSCreateAdminEmail.CreateAdminRequest(
                name + "@test.com", null);
        @SuppressWarnings("unchecked")
        HttpRequestMessage<Optional<TekvLSCreateAdminEmail.CreateAdminRequest>> request = mock(
                HttpRequestMessage.class);
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        doReturn(this.headers).when(request).getHeaders();
        doAnswer((Answer<HttpResponseMessage.Builder>) invocation -> {
            HttpStatus status = (HttpStatus) invocation.getArguments()[0];
            return new HttpResponseMessageMock.HttpResponseMessageBuilderMock().status(status);
        }).when(request).createResponseBuilder(any(HttpStatus.class));

        // When - Action
        HttpResponseMessage response = createAdminEmailApi.run(request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        JSONObject jsonBody = (JSONObject) response.getBody();

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Missing mandatory parameter customerId.";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void incompleteBodyTest2() {
        // Given - Arrange
        TekvLSCreateAdminEmail.CreateAdminRequest bodyRequest = new TekvLSCreateAdminEmail.CreateAdminRequest(null,
                this.customerId);
        @SuppressWarnings("unchecked")
        HttpRequestMessage<Optional<TekvLSCreateAdminEmail.CreateAdminRequest>> request = mock(
                HttpRequestMessage.class);
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        doReturn(this.headers).when(request).getHeaders();
        doAnswer((Answer<HttpResponseMessage.Builder>) invocation -> {
            HttpStatus status = (HttpStatus) invocation.getArguments()[0];
            return new HttpResponseMessageMock.HttpResponseMessageBuilderMock().status(status);
        }).when(request).createResponseBuilder(any(HttpStatus.class));

        // When - Action
        HttpResponseMessage response = createAdminEmailApi.run(request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        JSONObject jsonBody = (JSONObject) response.getBody();

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Missing mandatory parameter customerAdminEmail.";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void NoBodyTest() {
        // Given - Arrange
        @SuppressWarnings("unchecked")
        HttpRequestMessage<Optional<TekvLSCreateAdminEmail.CreateAdminRequest>> request = mock(
                HttpRequestMessage.class);
        doReturn(Optional.empty()).when(request).getBody();
        doReturn(this.headers).when(request).getHeaders();
        doAnswer((Answer<HttpResponseMessage.Builder>) invocation -> {
            HttpStatus status = (HttpStatus) invocation.getArguments()[0];
            return new HttpResponseMessageMock.HttpResponseMessageBuilderMock().status(status);
        }).when(request).createResponseBuilder(any(HttpStatus.class));
        // When - Action
        HttpResponseMessage response = createAdminEmailApi.run(request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        JSONObject jsonBody = (JSONObject) response.getBody();

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "error: request body is empty.";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void SqlExceptionTest() {
        // Given - Arrange
        String name = "unitTest" + LocalDateTime.now();
        TekvLSCreateAdminEmail.CreateAdminRequest bodyRequest = new TekvLSCreateAdminEmail.CreateAdminRequest(
                name + "@test.com", "0000");
        @SuppressWarnings("unchecked")
        HttpRequestMessage<Optional<TekvLSCreateAdminEmail.CreateAdminRequest>> request = mock(
                HttpRequestMessage.class);
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        doReturn(this.headers).when(request).getHeaders();
        doAnswer((Answer<HttpResponseMessage.Builder>) invocation -> {
            HttpStatus status = (HttpStatus) invocation.getArguments()[0];
            return new HttpResponseMessageMock.HttpResponseMessageBuilderMock().status(status);
        }).when(request).createResponseBuilder(any(HttpStatus.class));

        // When - Action
        HttpResponseMessage response = createAdminEmailApi.run(request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "ERROR: invalid input syntax for type uuid: \"0000\"";
        String actualResponse = jsonBody.getString("error");
        assertTrue(actualResponse.contains(expectedResponse), "Response doesn't contain: ".concat(expectedResponse));
    }

    @Test
    public void GenericExceptionTest() {
        // Given - Arrange
        String name = "unitTest" + LocalDateTime.now();
        TekvLSCreateAdminEmail.CreateAdminRequest bodyRequest = new TekvLSCreateAdminEmail.CreateAdminRequest(
                name + "@test.com", this.customerId);
        @SuppressWarnings("unchecked")
        HttpRequestMessage<Optional<TekvLSCreateAdminEmail.CreateAdminRequest>> request = mock(
                HttpRequestMessage.class);
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        doReturn(this.headers).when(request).getHeaders();
        doAnswer((Answer<HttpResponseMessage.Builder>) invocation -> {
            HttpStatus status = (HttpStatus) invocation.getArguments()[0];
            return new HttpResponseMessageMock.HttpResponseMessageBuilderMock().status(status);
        }).when(request).createResponseBuilder(any(HttpStatus.class));
        Mockito.doThrow(new RuntimeException("Generic error")).when(request).createResponseBuilder(HttpStatus.OK);

        // When - Action
        HttpResponseMessage response = createAdminEmailApi.run(request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Generic error";
        String actualResponse = jsonBody.getString("error");
        assertTrue(actualResponse.contains(expectedResponse), "Response doesn't contain: ".concat(expectedResponse));
    }

    @Test
    public void UnauthorizedTest() {
        // Given - Arrange
        this.headers.remove("authorization");
        @SuppressWarnings("unchecked")
        HttpRequestMessage<Optional<TekvLSCreateAdminEmail.CreateAdminRequest>> request = mock(
                HttpRequestMessage.class);
        doReturn(Optional.of(new TekvLSCreateAdminEmail.CreateAdminRequest(null, null))).when(request).getBody();
        doReturn(this.headers).when(request).getHeaders();
        doAnswer((Answer<HttpResponseMessage.Builder>) invocation -> {
            HttpStatus status = (HttpStatus) invocation.getArguments()[0];
            return new HttpResponseMessageMock.HttpResponseMessageBuilderMock().status(status);
        }).when(request).createResponseBuilder(any(HttpStatus.class));

        // When - Action
        HttpResponseMessage response = createAdminEmailApi.run(request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.UNAUTHORIZED;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = RoleAuthHandler.MESSAGE_FOR_UNAUTHORIZED;
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void ForbiddenTest() {
        // Given - Arrange
        this.headers.remove("authorization");
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));
        @SuppressWarnings("unchecked")
        HttpRequestMessage<Optional<TekvLSCreateAdminEmail.CreateAdminRequest>> request = mock(
                HttpRequestMessage.class);
        doReturn(Optional.of(new TekvLSCreateAdminEmail.CreateAdminRequest(null, null))).when(request).getBody();
        doReturn(this.headers).when(request).getHeaders();
        doAnswer((Answer<HttpResponseMessage.Builder>) invocation -> {
            HttpStatus status = (HttpStatus) invocation.getArguments()[0];
            return new HttpResponseMessageMock.HttpResponseMessageBuilderMock().status(status);
        }).when(request).createResponseBuilder(any(HttpStatus.class));

        // When - Action
        HttpResponseMessage response = createAdminEmailApi.run(request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.FORBIDDEN;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = RoleAuthHandler.MESSAGE_FOR_FORBIDDEN;
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void createAdminRequestToStringTest() {
        TekvLSCreateAdminEmail.CreateAdminRequest request = new TekvLSCreateAdminEmail.CreateAdminRequest(
                "test@test.com", "00000000-0000-0000-0000-000000000000");
        String expectedResponse = "CreateAdminRequest{customerAdminEmail='test@test.com', customerId='00000000-0000-0000-0000-000000000000'}";
        assertEquals(expectedResponse, request.toString());
    }
}