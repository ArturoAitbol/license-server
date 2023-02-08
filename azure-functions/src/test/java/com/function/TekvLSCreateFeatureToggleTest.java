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
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.doReturn;


class TekvLSCreateFeatureToggleTest extends TekvLSTest {

    private String featureToggleId = "EMPTY";
    TekvLSCreateFeatureToggle createFeatureToggle = new TekvLSCreateFeatureToggle();
    private final TekvLSDeleteFeatureToggleById deleteFeatureToggle = new TekvLSDeleteFeatureToggleById();

    @BeforeEach
    void setUp() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));
    }

    @AfterEach
    void tearDown() {
        if (!this.featureToggleId.equals("EMPTY")) {
            HttpResponseMessage response = this.deleteFeatureToggle.run(this.request, this.featureToggleId, this.context);
            this.context.getLogger().info(response.getStatus().toString());
            this.featureToggleId = "EMPTY";

            HttpStatusType actualStatus = response.getStatus();
            HttpStatus expected = HttpStatus.OK;
            assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        }
    }

    @Test
    public void createFeatureToggleTest() {
        // Given - Arrange
        String name = "NewfeatureToggleTest" + LocalDateTime.now();
        String bodyRequest = "{ 'status' : true, 'name' : '" + name + "' }";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        // When - Action
        HttpResponseMessage response = createFeatureToggle.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("id"));
        this.featureToggleId = jsonBody.getString("id");
        assertNotNull(this.featureToggleId);
    }

    @Test
    public void createFeatureToggleWithOptionalParamsTest() {
        String name = "NewfeatureToggleTest" + LocalDateTime.now();
        String bodyRequest = "{" +
                "    'status' : true," +
                "    'name' : '" + name + "'," +
                "    'customerName' : '(optional)'," +
                "    'author' : '(optional)Test User'," +
                "    'description' : '(optional)This is test data for the FT api'" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        // When - Action
        HttpResponseMessage response = createFeatureToggle.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("id"));
        this.featureToggleId = jsonBody.getString("id");
        assertNotNull(this.featureToggleId);
    }

    @Test
    public void createFeatureToggleIncomplete() {
        String bodyRequest = "{ 'status' : true }";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        TekvLSCreateFeatureToggle createFeatureToggle = new TekvLSCreateFeatureToggle();
        HttpResponseMessage response = createFeatureToggle.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Missing mandatory parameter: name";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void createFeatureToggleIncompleteWithoutStatus() {
        String name = "NewfeatureToggleTest" + LocalDateTime.now();
        String bodyRequest = "{ 'name' : '" + name + "' }";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        TekvLSCreateFeatureToggle createFeatureToggle = new TekvLSCreateFeatureToggle();
        HttpResponseMessage response = createFeatureToggle.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Missing mandatory parameter: status";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void createEmptyBodyTest() {
        String bodyRequest = "";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        TekvLSCreateFeatureToggle createFeatureToggle = new TekvLSCreateFeatureToggle();
        HttpResponseMessage response = createFeatureToggle.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "error: request body is empty.";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void createFeatureToggleWithoutJsonTest() {
        String bodyRequest = "test";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        TekvLSCreateFeatureToggle createFeatureToggle = new TekvLSCreateFeatureToggle();
        HttpResponseMessage response = createFeatureToggle.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void createFeatureToggleGenericExceptionTest() {
        String name = "NewfeatureToggleTest" + LocalDateTime.now();
        String bodyRequest = "{ 'status' : false, 'name' : '" + name + "' }";
        String expectedResponse = "Generic error";

        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        Mockito.doThrow(new RuntimeException(expectedResponse)).when(request).createResponseBuilder(HttpStatus.OK);

        TekvLSCreateFeatureToggle createFeatureToggle = new TekvLSCreateFeatureToggle();
        HttpResponseMessage response = createFeatureToggle.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        String actualResponse = jsonBody.getString("error");
        assertTrue(actualResponse.contains(expectedResponse), "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void duplicatedFeatureToggleNameTest() {
        // Given - Arrange
        String name = "NewfeatureToggleTest" + LocalDateTime.now();
        String bodyRequest = "{ 'status' : true, 'name' : '" + name + "' }";

        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        // When - Action
        HttpResponseMessage response = createFeatureToggle.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("id"));
        this.featureToggleId = jsonBody.getString("id");
        assertNotNull(this.featureToggleId);

        // Given - Arrange
        String newBodyRequest = "{ 'status' : true, 'name' : '" + name + "' }";

        doReturn(Optional.of(newBodyRequest)).when(request).getBody();

        // When - Action
        response = createFeatureToggle.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then - Assert
        actualStatus = response.getStatus();
        expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        body = (String) response.getBody();
        jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Feature Toggle with that name already exists";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("security")
    @Test
    public void createFeatureToggleWithoutTokenTest() {
        this.headers.remove("authorization");
        HttpResponseMessage response = new TekvLSCreateFeatureToggle().run(this.request, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.UNAUTHORIZED;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String actualResponse = (String) response.getBody();

        String expectedResponse = "{\"error\":\"" + RoleAuthHandler.MESSAGE_FOR_UNAUTHORIZED + "\"}";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("security")
    @Test
    public void createFeatureToggleWithForbiddenRoleTokenTest() {
        // Given - Arrange
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("distributorAdmin"));
        String name = "NewfeatureToggleTest" + LocalDateTime.now();
        String bodyRequest = "{ 'status' : true, 'name' : '" + name + "' }";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        // When - Action
        HttpResponseMessage response = createFeatureToggle.run(this.request, this.context);
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
}
