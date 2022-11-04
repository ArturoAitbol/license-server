package com.function;

import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.Constants;
import com.function.util.FeatureToggles;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doReturn;

class TekvLSModifySubaccountByIdTest extends TekvLSTest {

    TekvLSModifySubaccountById modifySubaccountApi = new TekvLSModifySubaccountById();

    private final TekvLSCreateSubaccount createSubaccountApi = new TekvLSCreateSubaccount();
    private final TekvLSDeleteSubaccountById deleteSubaccountApi = new TekvLSDeleteSubaccountById();
    private String subaccountId = "EMPTY";

    @BeforeEach
    public void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
        String name = "unitTest" + LocalDateTime.now();
        String bodyRequest = "{\n" +
                "    \"subaccountName\": \"" + name + "\",\n" +
                "    \"customerId\": 7d133fd2-8228-44ff-9636-1881f58f2dbb,\n" +
                "    \"subaccountAdminEmail\": \"" + name + "@test.com\"\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        HttpResponseMessage response = this.createSubaccountApi.run(this.request, context);
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        this.subaccountId = new JSONObject(response.getBody().toString()).getString("id");
    }

    @AfterEach
    void tearDown() {
        if (!this.subaccountId.equals("EMPTY")) {
            this.initTestParameters();
            this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
            HttpResponseMessage response = deleteSubaccountApi.run(this.request, this.subaccountId, this.context);
            this.context.getLogger().info(response.getStatus().toString());
            this.subaccountId = "EMPTY";

            HttpStatusType actualStatus = response.getStatus();
            HttpStatus expected = HttpStatus.OK;
            assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        }
    }

    @Test
    public void modifySubaccountTest() {
        //Given - Arrange
        String name = "unitTestModified" + LocalDateTime.now();
        String bodyRequest = "{\n" +
                "    \"subaccountName\": \"" + name + "\"\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = modifySubaccountApi.run(this.request, this.subaccountId, this.context);

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void modifySubaccountServicesTest() {
        if (FeatureToggles.INSTANCE.isFeatureActive("services-feature")) {
            //Given - Arrange
            String services = Constants.SubaccountServices.SPOTLIGHT.value() + "," + Constants.SubaccountServices.TOKEN_CONSUMPTION.value();
            String bodyRequest = "{\n" +
                    "    \"services\": \"" + services + "\"\n" +
                    "}";
            doReturn(Optional.of(bodyRequest)).when(request).getBody();

            //When - Action
            HttpResponseMessage response = modifySubaccountApi.run(this.request, this.subaccountId, this.context);

            //Then - Assert
            HttpStatusType actualStatus = response.getStatus();
            HttpStatus expected = HttpStatus.OK;
            assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
            
            //Given - Arrange
            doReturn(Optional.of(bodyRequest)).when(request).getBody();

            //When - Action
            response = modifySubaccountApi.run(this.request, this.subaccountId, this.context);

            //Then - Assert
            actualStatus = response.getStatus();
            expected = HttpStatus.OK;
            assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        }
    }

    @Test
    public void modifySubaccountServicesTest2() {
        if (FeatureToggles.INSTANCE.isFeatureActive("services-feature")) {
            //Given - Arrange
            String services = Constants.SubaccountServices.TOKEN_CONSUMPTION.value();
            String bodyRequest = "{\n" +
                    "    \"services\": \"" + services + "\"\n" +
                    "}";
            doReturn(Optional.of(bodyRequest)).when(request).getBody();

            //When - Action
            HttpResponseMessage response = modifySubaccountApi.run(this.request, this.subaccountId, this.context);

            //Then - Assert
            HttpStatusType actualStatus = response.getStatus();
            HttpStatus expected = HttpStatus.OK;
            assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

            //Given - Arrange
            doReturn(Optional.of(bodyRequest)).when(request).getBody();

            //When - Action
            response = modifySubaccountApi.run(this.request, this.subaccountId, this.context);

            //Then - Assert
            actualStatus = response.getStatus();
            expected = HttpStatus.OK;
            assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        }
    }

    @Test
    public void noParamsTest() {
        //Given - Arrange
        String bodyRequest = "{}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = modifySubaccountApi.run(this.request, this.subaccountId, this.context);

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void emptyBodyTest() {
        //Given - Arrange
        String bodyRequest = "";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = modifySubaccountApi.run(this.request, this.subaccountId, this.context);

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
    public void invalidBodyTest() {
        //Given - Arrange
        String bodyRequest = "Something";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = modifySubaccountApi.run(this.request, this.subaccountId, this.context);

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
    public void sqlExceptionTest() {
        //Given - Arrange
        String name = "unitTestModified" + LocalDateTime.now();
        String bodyRequest = "{\n" +
                "    \"subaccountName\": \"" + name + "\",\n" +
                "    \"customerId\": 00000\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        //When - Action
        HttpResponseMessage response = modifySubaccountApi.run(this.request, this.subaccountId, this.context);

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void genericExceptionTest() {
        //Given - Arrange
        String name = "unitTestModified" + LocalDateTime.now();
        String bodyRequest = "{\n" +
                "    \"subaccountName\": \"" + name + "\",\n" +
                "    \"customerId\": 7d133fd2-8228-44ff-9636-1881f58f2dbb\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        Mockito.doThrow(new RuntimeException("Generic error")).when(request).createResponseBuilder(HttpStatus.OK);

        //When - Action
        HttpResponseMessage response = modifySubaccountApi.run(this.request, this.subaccountId, this.context);

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
    public void unauthorizedTest() {
        //Given - Arrange
        String name = "unitTestModified" + LocalDateTime.now();
        String bodyRequest = "{\n" +
                "    \"subaccountName\": \"" + name + "\",\n" +
                "    \"customerId\": 7d133fd2-8228-44ff-9636-1881f58f2dbb\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        this.headers.remove("authorization");
        //When - Action
        HttpResponseMessage response = modifySubaccountApi.run(this.request, this.subaccountId, this.context);

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
        String name = "unitTestModified" + LocalDateTime.now();
        String bodyRequest = "{\n" +
                "    \"subaccountName\": \"" + name + "\",\n" +
                "    \"customerId\": 7d133fd2-8228-44ff-9636-1881f58f2dbb\n" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        this.headers.remove("authorization");
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));
        //When - Action
        HttpResponseMessage response = modifySubaccountApi.run(this.request, this.subaccountId, this.context);

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