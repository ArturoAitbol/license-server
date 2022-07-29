package com.function;

import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;
import org.json.JSONObject;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doReturn;

class TekvLSDeleteDeviceByIdTest extends TekvLSTest {

    TekvLSDeleteDeviceById deleteDeviceApi = new TekvLSDeleteDeviceById();

    private final TekvLSCreateDevice createDeviceApi = new TekvLSCreateDevice();
    private String deviceId = "EMPTY";

    @BeforeEach
    public void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));
        String bodyRequest = "{\n" +
                "    \"vendor\": \"UnitTest\",\n" +
                "    \"product\": \"UnitTest\",\n" +
                "    \"version\": \"1.0\",\n" +
                "    \"type\": \"OTHER\",\n" +
                "    \"granularity\": \"week\",\n" +
                "    \"tokensToConsume\": \"1\",\n" +
                "    \"supportType\": \"true\",\n" +
                "    \"startDate\": \"" + LocalDateTime.now() + "\"\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        HttpResponseMessage response = this.createDeviceApi.run(this.request, context);
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        this.deviceId = new JSONObject(response.getBody().toString()).getString("id");
    }

    @AfterEach
    void tearDown() {
        if (!this.deviceId.equals("EMPTY")) {
            this.initTestParameters();
            this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));
            HttpResponseMessage response = deleteDeviceApi.run(this.request, this.deviceId, this.context);
            this.context.getLogger().info(response.getStatus().toString());
            this.deviceId = "EMPTY";

            HttpStatusType actualStatus = response.getStatus();
            HttpStatus expected = HttpStatus.OK;
            assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        }
    }

    @Test
    public void deleteDeviceTest() {
        //When - Action
        HttpResponseMessage response = deleteDeviceApi.run(this.request, this.deviceId, this.context);

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

    }

    @Test
    public void invalidIdTest() {
        //When - Action
        HttpResponseMessage response = deleteDeviceApi.run(this.request, "0", this.context);

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "ERROR: invalid input syntax for type uuid: \"0\"";
        String actualResponse = jsonBody.getString("error");
        assertTrue(actualResponse.contains(expectedResponse), "Response doesn't contain: ".concat(expectedResponse));
    }

    @Test
    public void genericExceptionTest() {
        //Given - Arrange
        Mockito.doThrow(new RuntimeException("Generic error")).when(request).createResponseBuilder(HttpStatus.OK);

        //When - Action
        HttpResponseMessage response = deleteDeviceApi.run(this.request, this.deviceId, this.context);

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
    public void unauthorizedTest() {
        //Given - Arrange
        this.headers.remove("authorization");
        //When - Action
        HttpResponseMessage response = deleteDeviceApi.run(this.request, this.deviceId, this.context);

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
    public void forbiddenTest() {
        //Given - Arrange
        this.headers.remove("authorization");
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
        //When - Action
        HttpResponseMessage response = deleteDeviceApi.run(this.request, this.deviceId, this.context);

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