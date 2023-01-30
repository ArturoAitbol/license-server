package com.function;

import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.FeatureToggleService;
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
import static org.mockito.Mockito.*;


class TekvLSCreateFeatureToggleExceptionTest extends TekvLSTest {

    private String featureToggleId = "EMPTY";
    private String subaccountId = "EMPTY";
    private final TekvLSCreateFeatureToggleException createFeatureToggleExceptionApi = new TekvLSCreateFeatureToggleException();
    private final TekvLSDeleteFeatureToggleException deleteFeatureToggleExceptionApi = new TekvLSDeleteFeatureToggleException();
    private final TekvLSCreateFeatureToggle createFeatureToggleApi = new TekvLSCreateFeatureToggle();
    private final TekvLSCreateSubaccount createSubaccountApi = new TekvLSCreateSubaccount();

    @BeforeEach
    void setUp() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));
        // create FT
        String name = "featureToggleTest" + LocalDateTime.now();
        String bodyRequest = "{ 'status' : 'On', 'name' : '" + name + "' }";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        HttpResponseMessage response = this.createFeatureToggleApi.run(this.request, this.context);
        this.featureToggleId = new JSONObject(response.getBody().toString()).getString("id");
        // create subaccount
        this.headers.remove("authorization");
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
        name = "unitTest" + LocalDateTime.now();
        bodyRequest = "{" +
                "    'subaccountName': '" + name + "'," +
                "    'customerId': 7d133fd2-8228-44ff-9636-1881f58f2dbb," +
                "    'subaccountAdminEmail': '" + name + "@test.com'" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        response = this.createSubaccountApi.run(this.request, context);
        this.subaccountId = new JSONObject(response.getBody().toString()).getString("id");
        this.headers.remove("authorization");
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));
    }

    @AfterEach
    void tearDown() {
        if (!this.featureToggleId.equals("EMPTY") && !this.subaccountId.equals("EMPTY")) {
            String bodyRequest = "{ 'featureToggleId' : '" + this.featureToggleId + "', 'subaccountId' : '" + this.subaccountId + "'}";
            doReturn(Optional.of(bodyRequest)).when(this.request).getBody();
            HttpResponseMessage response = this.deleteFeatureToggleExceptionApi.run(this.request, this.context);
            this.context.getLogger().info(response.getStatus().toString());
            this.featureToggleId = "EMPTY";
            this.subaccountId = "EMPTY";
        }
    }

    @Test
    public void createFeatureToggleExceptionTest() {
        // Given - Arrange
        String bodyRequest = "{ 'featureToggleId' : '" + this.featureToggleId + "', 'subaccountId' : '" + this.subaccountId + "', 'status' : 'On'}";
        doReturn(Optional.of(bodyRequest)).when(this.request).getBody();

        // When - Action
        HttpResponseMessage response = createFeatureToggleExceptionApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("id"));
        String id = jsonBody.getString("id");
        assertNotNull(id);
    }

    @Test
    public void createRepeatedFeatureToggleExceptionTest() {
        // Given - Arrange
        String bodyRequest = "{ 'featureToggleId' : '" + this.featureToggleId + "', 'subaccountId' : '" + this.subaccountId + "', 'status' : 'On'}";
        doReturn(Optional.of(bodyRequest)).when(this.request).getBody();
        HttpResponseMessage response = createFeatureToggleExceptionApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        // When - Action
        response = createFeatureToggleExceptionApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then - Assert
        actualStatus = response.getStatus();
        expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Feature Toggle Exception already exists";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void createFeatureToggleExceptionIncomplete() {
        String incompleteRequest = "{ 'featureToggleId' : '" + this.featureToggleId + "', 'status' : 'On' }";
        doReturn(Optional.of(incompleteRequest)).when(request).getBody();

        TekvLSCreateFeatureToggleException createFeatureToggleException = new TekvLSCreateFeatureToggleException();
        HttpResponseMessage response = createFeatureToggleException.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Missing mandatory parameter: subaccountId";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void createFeatureToggleExceptionIncompleteWithoutStatus() {
        String bodyRequest = "{ 'featureToggleId' : '" + this.featureToggleId + "', 'subaccountId' : '" + this.subaccountId + "'}";
        doReturn(Optional.of(bodyRequest)).when(this.request).getBody();

        TekvLSCreateFeatureToggleException createFeatureToggleException = new TekvLSCreateFeatureToggleException();
        HttpResponseMessage response = createFeatureToggleException.run(this.request, this.context);
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

        TekvLSCreateFeatureToggleException createFeatureToggleException = new TekvLSCreateFeatureToggleException();
        HttpResponseMessage response = createFeatureToggleException.run(this.request, this.context);
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
    public void createFeatureToggleExceptionWithoutJsonTest() {
        String bodyRequest = "test";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        TekvLSCreateFeatureToggleException createFeatureToggleException = new TekvLSCreateFeatureToggleException();
        HttpResponseMessage response = createFeatureToggleException.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void createFeatureToggleExceptionSQLExceptionTest() {
        String bodyRequest = "{ 'featureToggleId' : '" + this.featureToggleId + "', 'subaccountId' : '" + this.subaccountId + "', 'status' : 'XXXX'}";
        doReturn(Optional.of(bodyRequest)).when(this.request).getBody();

        TekvLSCreateFeatureToggleException createFeatureToggleException = new TekvLSCreateFeatureToggleException();
        HttpResponseMessage response = createFeatureToggleException.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String expectedResponse = "SQL";
        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        String actualResponse = jsonBody.getString("error");
        assertTrue(actualResponse.contains(expectedResponse), "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void createFeatureToggleExceptionGenericExceptionTest() {
        String bodyRequest = "{ 'featureToggleId' : '" + this.featureToggleId + "', 'subaccountId' : '" + this.subaccountId + "', 'status' : 'On'}";
        doReturn(Optional.of(bodyRequest)).when(this.request).getBody();
        String expectedResponse = "Generic error unit test";

        Mockito.doThrow(new RuntimeException(expectedResponse)).when(request).createResponseBuilder(HttpStatus.OK);

        TekvLSCreateFeatureToggleException createFeatureToggleException = new TekvLSCreateFeatureToggleException();
        HttpResponseMessage response = createFeatureToggleException.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        String actualResponse = jsonBody.getString("error");
        assertTrue(actualResponse.contains(expectedResponse), "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("security")
    @Test
    public void createFeatureToggleExceptionWithoutTokenTest() {
        this.headers.remove("authorization");
        HttpResponseMessage response = new TekvLSCreateFeatureToggleException().run(this.request, this.context);
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
    public void createFeatureToggleExceptionWithForbiddenRoleTokenTest() {
        // Given - Arrange
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("distributorAdmin"));
        String name = "NewFeatureToggleExceptionTest" + LocalDateTime.now();
        String bodyRequest = "{ 'status' : 'On', 'name' : '" + name + "' }";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        // When - Action
        HttpResponseMessage response = createFeatureToggleExceptionApi.run(this.request, this.context);
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
    public void noBodyTest(){
        //Given
        String bodyRequest = "";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = createFeatureToggleExceptionApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedResponse = "error: request body is empty.";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void invalidBodyTest(){
        //Given
        String bodyRequest = "invalid-body";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = createFeatureToggleExceptionApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedResponse = "A JSONObject text must begin with '{' at 1 [character 2 line 1]";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }
}
