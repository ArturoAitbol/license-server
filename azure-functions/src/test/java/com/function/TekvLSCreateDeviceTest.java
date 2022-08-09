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
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.doReturn;

class TekvLSCreateDeviceTest extends TekvLSTest {

    TekvLSCreateDevice createDeviceApi = new TekvLSCreateDevice();

    private TekvLSDeleteDeviceById deleteDeviceApi = new TekvLSDeleteDeviceById();
    private String deviceId = "EMPTY";


    @BeforeEach
    public void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));
    }

    @AfterEach
    void tearDown() {
        if (!this.deviceId.equals("EMPTY")) {
            HttpResponseMessage response = deleteDeviceApi.run(this.request, this.deviceId, this.context);
            this.context.getLogger().info(response.getStatus().toString());
            this.deviceId = "EMPTY";

            HttpStatusType actualStatus = response.getStatus();
            HttpStatus expected = HttpStatus.OK;
            assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        }
    }

    @Test
    public void createDeviceTest() {
        //Given - Arrange
        String bodyRequest = "{\n" +
                "    \"vendor\": \"UnitTest\",\n" +
                "    \"product\": \"UnitTest\",\n" +
                "    \"version\": \"1.0\",\n" +
                "    \"type\": \"OTHER\",\n" +
                "    \"granularity\": \"week\",\n" +
                "    \"tokensToConsume\": \"1\",\n" +
                "    \"supportType\": \"true\",\n" +
                "    \"startDate\": \"2022-07-18\"\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createDeviceApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("id"));
        this.deviceId = jsonBody.getString("id");
        assertNotNull(this.deviceId);
    }

    @Test
    public void createWithOptionalParams() {
        //Given - Arrange
        String bodyRequest = "{\n" +
                "    \"vendor\": \"UnitTest\",\n" +
                "    \"product\": \"UnitTest\",\n" +
                "    \"version\": \"1.0\",\n" +
                "    \"type\": \"OTHER\",\n" +
                "    \"granularity\": \"week\",\n" +
                "    \"tokensToConsume\": \"1\",\n" +
                "    \"supportType\": \"true\",\n" +
                "    \"startDate\": \"2022-07-18\",\n" +
                "    \"subaccountId\": \"00000000-0000-0000-0000-000000000000\",\n" +
                "    \"deprecatedDate\": \"2022-08-18\"\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createDeviceApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "ERROR: insert or update on table \"device\" violates foreign key constraint \"fk_subaccount\"\n" + "  Detail: Key (subaccount_id)=(00000000-0000-0000-0000-000000000000) is not present in table \"subaccount\".";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void incompleteBodyTest() {
        //Given - Arrange
        String bodyRequest = "{\n" +
                "    \"vendor\": \"UnitTest\",\n" +
                "    \"product\": \"UnitTest\",\n" +
                "    \"type\": \"OTHER\",\n" +
                "    \"granularity\": \"week\",\n" +
                "    \"tokensToConsume\": \"1\",\n" +
                "    \"supportType\": \"true\",\n" +
                "    \"startDate\": \"2022-07-18\"\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createDeviceApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Missing mandatory parameter: version";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void invalidBodyTest() {
        //Given - Arrange
        String bodyRequest = "Something";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createDeviceApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "A JSONObject text must begin with '{' at 1 [character 2 line 1]";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void NoBodyTest() {
        //Given - Arrange
        String bodyRequest = "";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createDeviceApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
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
    public void SqlExceptionTest() {
        //Given - Arrange
        String bodyRequest = "{\n" +
                "    \"vendor\": \"UnitTest\",\n" +
                "    \"product\": \"UnitTest\",\n" +
                "    \"version\": \"1.0\",\n" +
                "    \"type\": \"OTHER\",\n" +
                "    \"granularity\": \"week\",\n" +
                "    \"tokensToConsume\": \"1\",\n" +
                "    \"supportType\": \"true\",\n" +
                "    \"startDate\": \"Test\"\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createDeviceApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "ERROR: invalid input syntax for type timestamp: \"Test\"";
        String actualResponse = jsonBody.getString("error");
        assertTrue(actualResponse.contains(expectedResponse), "Response doesn't contain: ".concat(expectedResponse));
    }

    @Test
    public void GenericExceptionTest() {
        //Given - Arrange
        String bodyRequest = "{\n" +
                "    \"vendor\": \"UnitTest\",\n" +
                "    \"product\": \"UnitTest\",\n" +
                "    \"version\": \"1.1\",\n" +
                "    \"type\": \"OTHER\",\n" +
                "    \"granularity\": \"week\",\n" +
                "    \"tokensToConsume\": \"1\",\n" +
                "    \"supportType\": \"true\",\n" +
                "    \"startDate\": \"" + LocalDateTime.now().toString() + "\"\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        Mockito.doThrow(new RuntimeException("Generic error")).when(request).createResponseBuilder(HttpStatus.OK);

        //When - Action
        HttpResponseMessage response = createDeviceApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Generic error";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void UnauthorizedTest() {
        this.headers.remove("authorization");
        //Given - Arrange
        String bodyRequest = "";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createDeviceApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
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
        this.headers.remove("authorization");
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
        //Given - Arrange
        String bodyRequest = "";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createDeviceApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
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