package com.function;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

import java.util.Optional;

import com.function.clients.EmailClient;
import com.function.util.FeatureToggleService;
import org.json.JSONObject;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.Constants;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;
import org.mockito.MockedStatic;

public class TekvLSModifyCtaasSetupTest extends TekvLSTest {

    private final TekvLSModifyCtaasSetupById tekvLSModifyCtaasSetupById = new TekvLSModifyCtaasSetupById();
    private final TekvLSCreateCtaasSetup tekvLSCreateCtaasSetup = new TekvLSCreateCtaasSetup();
    private final TekvLSDeleteCtaasSetupById tekvLSDeleteCtaasSetupById = new TekvLSDeleteCtaasSetupById();
    private String ctaasSetupId = "31d82e5c-b911-460d-edbe-6860f8464233";

    @BeforeEach
    void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
        String bodyRequest = "{'subaccountId': 'b5b91753-4c2b-43f5-afa0-feb22cefa901'," +
                "'status': '" + Constants.CTaaSSetupStatus.INPROGRESS.value() + "'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        HttpResponseMessage response = tekvLSCreateCtaasSetup.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());
        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("id"));
        this.ctaasSetupId = jsonBody.getString("id");
        assertEquals(HttpStatus.OK, response.getStatus(),
                "HTTP status doesn't match with: ".concat(HttpStatus.OK.toString()));
    }

    @AfterEach
    void tearDown() {
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
        HttpResponseMessage response = tekvLSDeleteCtaasSetupById.run(this.request, this.ctaasSetupId, this.context);
        this.context.getLogger().info(response.getStatus().toString());
        assertEquals(HttpStatus.OK, response.getStatus(),
                "HTTP status doesn't match with: ".concat(HttpStatus.OK.toString()));
    }

    @Tag("acceptance")
    @Test
    public void modifyCtaasSetupTest() {
        // Given
        String bodyRequest = "{'azureResourceGroup': 'tapResourceGroup'," +
                "'status': '" + Constants.CTaaSSetupStatus.READY.value() + "'," +
                "'subaccountId': 'b5b91753-4c2b-43f5-afa0-feb22cefa901'," +
                "'licenseId': '16f4f014-5bed-4166-b10a-574b2e6655e3'," +
                "'tapUrl': 'https://tekvizion-ap-spotlight-dan-env-01.eastus2.cloudapp.azure.com:8443/onPOINT'," +
                "'onBoardingComplete': true}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        // When
        HttpResponseMessage response = tekvLSModifyCtaasSetupById.run(this.request, this.ctaasSetupId, this.context);
        this.context.getLogger().info(response.getStatus().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        JSONObject jsonBody = new JSONObject(response.getBody().toString());
        assertTrue(jsonBody.has("projectId"));
        assertTrue(jsonBody.has("deviceId"));
    }

    @Tag("acceptance")
    @Test
    public void modifyCtaasSetupStatusInProgressTest() {
        // Given
        String bodyRequest = "{'status': '" + Constants.CTaaSSetupStatus.INPROGRESS.value() + "'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        // When
        HttpResponseMessage response = tekvLSModifyCtaasSetupById.run(this.request, this.ctaasSetupId, this.context);
        this.context.getLogger().info(response.getStatus().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Tag("acceptance")
    @Test
    public void modifyOnBoardingTest() {
        // Given
        String bodyRequest = "{'onBoardingComplete': true}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        // When
        HttpResponseMessage response = tekvLSModifyCtaasSetupById.run(this.request, this.ctaasSetupId, this.context);
        this.context.getLogger().info(response.getStatus().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Tag("acceptance")
    @Test
    public void modifyStatusTest() {
        // Given
        String bodyRequest = "{'status': '" + Constants.CTaaSSetupStatus.READY.value() + "'," +
                "'subaccountId': 'b5b91753-4c2b-43f5-afa0-feb22cefa901'," +
                "'licenseId': '16f4f014-5bed-4166-b10a-574b2e6655e3'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        // When
        HttpResponseMessage response = tekvLSModifyCtaasSetupById.run(this.request, this.ctaasSetupId, this.context);
        this.context.getLogger().info(response.getStatus().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        JSONObject jsonBody = new JSONObject(response.getBody().toString());
        assertTrue(jsonBody.has("projectId"));
        assertTrue(jsonBody.has("deviceId"));
    }

    @Tag("acceptance")
    @Test
    public void modifyStatusTestWithoutLicenseId() {
        // Given
        String bodyRequest = "{'status': '" + Constants.CTaaSSetupStatus.READY.value() + "'," +
                "'subaccountId': 'b5b91753-4c2b-43f5-afa0-feb22cefa901'," +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        // When
        HttpResponseMessage response = tekvLSModifyCtaasSetupById.run(this.request, this.ctaasSetupId, this.context);
        this.context.getLogger().info(response.getStatus().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = "error: licenseId is missing.";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("acceptance")
    @Test
    public void modifyStatusTestWithoutSubaccountId() {
        // Given
        String bodyRequest = "{'status': '" + Constants.CTaaSSetupStatus.READY.value() + "'," +
                "'licenseId': '16f4f014-5bed-4166-b10a-574b2e6655e3'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        // When
        HttpResponseMessage response = tekvLSModifyCtaasSetupById.run(this.request, this.ctaasSetupId, this.context);
        this.context.getLogger().info(response.getStatus().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = "error: subaccountId is missing.";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("acceptance")
    @Test
    public void modifyStatusWithIncorrectSubaccountIdTest() {
        // Given
        String bodyRequest = "{'status': '" + Constants.CTaaSSetupStatus.READY.value() + "'," +
                "'subaccountId': '12341234-1234-1234-1234-123412341234'," +
                "'licenseId': '16f4f014-5bed-4166-b10a-574b2e6655e3'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        // When
        HttpResponseMessage response = tekvLSModifyCtaasSetupById.run(this.request, this.ctaasSetupId, this.context);
        this.context.getLogger().info(response.getStatus().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        JSONObject jsonBody = new JSONObject(response.getBody().toString());
        assertTrue(jsonBody.has("error"));
    }

    @Tag("acceptance")
    @Test
    public void modifyTapDetailsTest() {
        // Given
        String bodyRequest = "{'azureResourceGroup': 'tapResourceGroup'," +
                "'tapUrl': 'https://tekvizion-ap-spotlight-dan-env-01.eastus2.cloudapp.azure.com:8443/onPOINT'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        // When
        HttpResponseMessage response = tekvLSModifyCtaasSetupById.run(this.request, this.ctaasSetupId, this.context);
        this.context.getLogger().info(response.getStatus().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Tag("acceptance")
    @Test
    public void emptyBodyTest() {
        // Given
        String bodyRequest = "{}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        // When
        HttpResponseMessage response = tekvLSModifyCtaasSetupById.run(this.request, this.ctaasSetupId, this.context);
        this.context.getLogger().info(response.getStatus().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void noBodyTest() {
        // Given
        String bodyRequest = "";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        // When
        HttpResponseMessage response = tekvLSModifyCtaasSetupById.run(this.request, this.ctaasSetupId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = "error: request body is empty.";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));

    }

    @Test
    public void invalidBodyTest() {
        // Given - Arrange
        String bodyRequest = "invalid-body";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        // When - Action
        HttpResponseMessage response = tekvLSModifyCtaasSetupById.run(this.request, this.ctaasSetupId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then - Assert
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

    @Tag("Security")
    @Test
    public void noTokenTest() {
        // Given
        this.headers.remove("authorization");

        // When
        HttpResponseMessage response = tekvLSModifyCtaasSetupById.run(this.request, this.ctaasSetupId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.UNAUTHORIZED;
        assertEquals(expectedStatus, actualStatus,
                "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = RoleAuthHandler.MESSAGE_FOR_UNAUTHORIZED;
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("Security")
    @Test
    public void invalidRoleTest() {
        // Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));

        // When
        HttpResponseMessage response = tekvLSModifyCtaasSetupById.run(this.request, this.ctaasSetupId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.FORBIDDEN;
        assertEquals(expectedStatus, actualStatus,
                "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = RoleAuthHandler.MESSAGE_FOR_FORBIDDEN;
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void invalidSQLTest() {
        // Given
        String invalidId = "invalid-id";
        String bodyRequest = "{'azureResourceGroup': 'tapResourceGroup'," +
                "'status': '" + Constants.CTaaSSetupStatus.READY.value() + "'," +
                "'subaccountId': 'b5b91753-4c2b-43f5-afa0-feb22cefa901'," +
                "'licenseId': '16f4f014-5bed-4166-b10a-574b2e6655e3'," +
                "'tapUrl': 'https://tekvizion-ap-spotlight-dan-env-01.eastus2.cloudapp.azure.com:8443/onPOINT'," +
                "'onBoardingComplete': true}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        // When
        HttpResponseMessage response = tekvLSModifyCtaasSetupById.run(this.request, invalidId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void genericExceptionTest() {
        // Given
        String bodyRequest = "{'azureResourceGroup': 'tapResourceGroup'," +
                "'status': '" + Constants.CTaaSSetupStatus.READY.value() + "'," +
                "'subaccountId': 'b5b91753-4c2b-43f5-afa0-feb22cefa901'," +
                "'licenseId': '16f4f014-5bed-4166-b10a-574b2e6655e3'," +
                "'tapUrl': 'https://tekvizion-ap-spotlight-dan-env-01.eastus2.cloudapp.azure.com:8443/onPOINT'," +
                "'onBoardingComplete': true}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        doThrow(new RuntimeException("Error message")).when(this.request).createResponseBuilder(HttpStatus.OK);

        // When
        HttpResponseMessage response = tekvLSModifyCtaasSetupById.run(this.request, this.ctaasSetupId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = "Error message";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));

        this.initTestParameters();
    }

}
