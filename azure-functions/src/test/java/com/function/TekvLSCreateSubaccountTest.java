package com.function;

import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.Constants;
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

class TekvLSCreateSubaccountTest extends TekvLSTest {

    TekvLSCreateSubaccount createSubaccountApi = new TekvLSCreateSubaccount();

    private final TekvLSDeleteSubaccountById deleteSubaccountApi = new TekvLSDeleteSubaccountById();
    private String subaccountId = "EMPTY";


    @BeforeEach
    public void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @AfterEach
    void tearDown() {
        if (!this.subaccountId.equals("EMPTY")) {
            HttpResponseMessage response = deleteSubaccountApi.run(this.request, this.subaccountId, this.context);
            this.context.getLogger().info(response.getStatus().toString());
            this.subaccountId = "EMPTY";

            HttpStatusType actualStatus = response.getStatus();
            HttpStatus expected = HttpStatus.OK;
            assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        }
    }

    @Test
    public void createSubaccountTest() {
        //Given - Arrange
        String name = "unitTest" + LocalDateTime.now();
        String parsedName = name.replace("-", "_").replace(":", "_");
        String bodyRequest = "{\n" +
                "    \"subaccountName\": \"" + name + "\",\n" +
                "    \"customerId\": 7d133fd2-8228-44ff-9636-1881f58f2dbb,\n" +
                "    \"subaccountAdminEmail\": \"" + parsedName + "@tekvizion.com\"\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createSubaccountApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("id"));
        this.subaccountId = jsonBody.getString("id");
        assertNotNull(this.subaccountId);
    }

    @Test
    public void createSubaccountWithCtaasTest() {
        //Given - Arrange
        String name = "unitTest" + LocalDateTime.now();
        String parsedName = name.replace("-", "_").replace(":", "_");
        String services = Constants.SubaccountServices.SPOTLIGHT.value()+","+ Constants.SubaccountServices.TOKEN_CONSUMPTION.value();
        String bodyRequest = "{\n" +
                "    \"subaccountName\": \"" + name + "\",\n" +
                "    \"customerId\": 7d133fd2-8228-44ff-9636-1881f58f2dbb,\n" +
                "    \"subaccountAdminEmail\": \"" + parsedName + "@tekvizion.com\",\n" +
                "    \"services\": \""+services+"\"\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createSubaccountApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("id"));
        this.subaccountId = jsonBody.getString("id");
        assertNotNull(this.subaccountId);
    }

    @Test
    public void duplicatedEmailTest() {
        //Given - Arrange
        String name = "unitTest" + LocalDateTime.now();
        String parsedName = name.replace("-", "_").replace(":", "_");
        String bodyRequest = "{\n" +
                "    \"subaccountName\": \"" + name + "\",\n" +
                "    \"customerId\": 7d133fd2-8228-44ff-9636-1881f58f2dbb,\n" +
                "    \"subaccountAdminEmail\": \"" + parsedName + "@tekvizion.com\"\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createSubaccountApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("id"));

        this.subaccountId = jsonBody.getString("id");
        assertNotNull(this.subaccountId);

        response = createSubaccountApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        actualStatus = response.getStatus();
        expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        body = (String) response.getBody();
        jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Subaccount email already exists";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void duplicatedSubaccountTest() {
        //Given - Arrange
        String name = "unitTest" + LocalDateTime.now();
        String parsedName = name.replace("-", "_").replace(":", "_");
        String bodyRequest = "{\n" +
                "    \"subaccountName\": \"" + name + "\",\n" +
                "    \"customerId\": 7d133fd2-8228-44ff-9636-1881f58f2dbb,\n" +
                "    \"subaccountAdminEmail\": \"" + parsedName + "@tekvizion.com\"\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createSubaccountApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("id"));

        this.subaccountId = jsonBody.getString("id");
        assertNotNull(this.subaccountId);

        //Given - Arrange
        bodyRequest = "{\n" +
                "    \"subaccountName\": \"" + name + "\",\n" +
                "    \"customerId\": 7d133fd2-8228-44ff-9636-1881f58f2dbb,\n" +
                "    \"subaccountAdminEmail\": \"" + parsedName + "2@tekvizion.com\"\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        response = createSubaccountApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        actualStatus = response.getStatus();
        expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        body = (String) response.getBody();
        jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Subaccount already exists";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void incompleteBodyTest() {
        //Given - Arrange
        String name = "unitTest" + LocalDateTime.now();
        String bodyRequest = "{\n" +
                "    \"subaccountName\": \"" + name + "\",\n" +
                "    \"customerId\": 7d133fd2-8228-44ff-9636-1881f58f2dbb\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createSubaccountApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Missing mandatory parameter: subaccountAdminEmail";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void incompleteBodyTest2() {
        //Given - Arrange
        String name = "unitTest" + LocalDateTime.now();
        String parsedName = name.replace("-", "_").replace(":", "_");
        String bodyRequest = "{\n" +
                "    \"subaccountName\": \"" + name + "\",\n" +
                "    \"subaccountAdminEmail\": \"" + parsedName + "@tekvizion.com\"\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createSubaccountApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Missing mandatory parameter: customerId";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void invalidBodyTest() {
        //Given - Arrange
        String bodyRequest = "Something";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createSubaccountApi.run(this.request, this.context);
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
        HttpResponseMessage response = createSubaccountApi.run(this.request, this.context);
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
        String name = "unitTest" + LocalDateTime.now();
        String bodyRequest = "{\n" +
                "    \"subaccountName\": \"" + name + "\",\n" +
                "    \"customerId\": \"TEST\",\n" +
                "    \"subaccountAdminEmail\": \"" + name + "@test.com\"\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createSubaccountApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "ERROR: invalid input syntax for type uuid: \"TEST\"";
        String actualResponse = jsonBody.getString("error");
        assertTrue(actualResponse.contains(expectedResponse), "Response doesn't contain: ".concat(expectedResponse));
    }

    @Test
    public void GenericExceptionTest() {
        //Given - Arrange
        String name = "unitTest" + LocalDateTime.now();
        String parsedName = name.replace("-", "_").replace(":", "_");
        String bodyRequest = "{\n" +
                "    \"subaccountName\": \"" + name + "\",\n" +
                "    \"customerId\": 7d133fd2-8228-44ff-9636-1881f58f2dbb,\n" +
                "    \"subaccountAdminEmail\": \"" + parsedName + "@tekvizion.com\"\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        Mockito.doThrow(new RuntimeException("Generic error")).when(request).createResponseBuilder(HttpStatus.OK);

        //When - Action
        HttpResponseMessage response = createSubaccountApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
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
        HttpResponseMessage response = createSubaccountApi.run(this.request, this.context);
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
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));
        //Given - Arrange
        String bodyRequest = "";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = createSubaccountApi.run(this.request, this.context);
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