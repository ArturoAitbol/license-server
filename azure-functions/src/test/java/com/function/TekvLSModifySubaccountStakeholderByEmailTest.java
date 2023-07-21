package com.function;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;

import java.util.Optional;
import org.json.JSONObject;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;
import uk.org.webcompere.systemstubs.environment.EnvironmentVariables;

public class TekvLSModifySubaccountStakeholderByEmailTest extends TekvLSTest {

    private final TekvLSModifySubaccountStakeholderByEmail tekvLSModifySubaccountStakeholderByEmail = new TekvLSModifySubaccountStakeholderByEmail();
    private final TekvLSCreateSubaccountStakeHolder tekvLSCreateSubaccountStakeHolder = new TekvLSCreateSubaccountStakeHolder();
    private final TekvLSDeleteSubaccountStakeHolderByEmail tekvLSDeleteSubaccountStakeHolderByEmail = new TekvLSDeleteSubaccountStakeHolderByEmail();
    private String stakeHolderEmail = "test-customer-subaccount-stakeholder1@tekvizion.com";

    @BeforeEach
    void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
        String bodyRequest = "{'subaccountId': 'f5a609c0-8b70-4a10-9dc8-9536bdb5652c'," +
                "'subaccountAdminEmail': '" + this.stakeHolderEmail + "'," +
                "'notifications': 'email,text'," +
                "'name': 'test-customer-subaccount-stakeholder'," +
                "'jobTitle': 'Software Engineer'," +
                "'companyName': 'TekVizion'," +
                "'emailNotifications': true," +
                "'phoneNumber': '+12142425968'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        // When
        HttpResponseMessage response = tekvLSCreateSubaccountStakeHolder.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @AfterEach
    void tearDown() {
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
        HttpResponseMessage response = tekvLSDeleteSubaccountStakeHolderByEmail.run(this.request, this.stakeHolderEmail,
                this.context);
        this.context.getLogger().info(response.getStatus().toString());
        assertEquals(HttpStatus.OK, response.getStatus(),
                "HTTP status doesn't match with: ".concat(HttpStatus.OK.toString()));
    }

    @Tag("acceptance")
    @Test
    public void modifyStakeHolderTest() {
        // Given
        String bodyRequest = "{'notifications': 'email,text'," +
                "'name': 'test-customer-subaccount-stakeholder'," +
                "'jobTitle': 'Software Engineer'," +
                "'companyName': 'TekVizion'," +
                "'emailNotifications': true," +
                "'phoneNumber': '+12142425968'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        // When
        HttpResponseMessage response = tekvLSModifySubaccountStakeholderByEmail.run(this.request, this.stakeHolderEmail,
                this.context);
        this.context.getLogger().info(response.getStatus().toString());
        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Tag("acceptance")
    @Test
    public void modifyNotificationTest() {
        // Given
        String bodyRequest = "{'notifications': 'email,text'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        // When
        HttpResponseMessage response = tekvLSModifySubaccountStakeholderByEmail.run(this.request, this.stakeHolderEmail,
                this.context);
        this.context.getLogger().info(response.getStatus().toString());
        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Tag("acceptance")
    @Test
    public void modifyUserProfileTest() {
        // Given
        String bodyRequest = "{'name': 'test-customer-subaccount-stakeholder'," +
                "'jobTitle': 'Software Engineer'," +
                "'companyName': 'TekVizion'," +
                "'emailNotifications': true," +
                "'phoneNumber': '+12142425968'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        // When
        HttpResponseMessage response = tekvLSModifySubaccountStakeholderByEmail.run(this.request, this.stakeHolderEmail,
                this.context);
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
        HttpResponseMessage response = tekvLSModifySubaccountStakeholderByEmail.run(this.request, this.stakeHolderEmail,
                this.context);
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
        HttpResponseMessage response = tekvLSModifySubaccountStakeholderByEmail.run(this.request, this.stakeHolderEmail,
                this.context);
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
        HttpResponseMessage response = tekvLSModifySubaccountStakeholderByEmail.run(this.request, this.stakeHolderEmail,
                this.context);
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
        HttpResponseMessage response = tekvLSModifySubaccountStakeholderByEmail.run(this.request, this.stakeHolderEmail,
                this.context);
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
        HttpResponseMessage response = tekvLSModifySubaccountStakeholderByEmail.run(this.request, this.stakeHolderEmail,
                this.context);
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
    public void genericExceptionTest() {
        // Given
        String bodyRequest = "{'notifications': 'email,text'," +
                "'name': 'test-customer-subaccount-stakeholder'," +
                "'jobTitle': 'Software Engineer'," +
                "'companyName': 'TekVizion'," +
                "'emailNotifications': true," +
                "'phoneNumber': '+12142425968'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        doThrow(new RuntimeException("Error message")).when(this.request).createResponseBuilder(HttpStatus.OK);

        // When
        HttpResponseMessage response = tekvLSModifySubaccountStakeholderByEmail.run(this.request, this.stakeHolderEmail,
                this.context);
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

    @Test
    public void sqlExceptionTest() {
        // Given
        String bodyRequest = "{'notifications': 'email,text'," +
                "'name': 'test-customer-subaccount-stakeholder'," +
                "'jobTitle': 'Software Engineer'," +
                "'companyName': 'TekVizion'," +
                "'emailNotifications': true," +
                "'phoneNumber': '+12142425968'}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();

        // When - Action
        HttpResponseMessage response;
        try {
            response = new EnvironmentVariables("POSTGRESQL_SERVER", "test").execute(
                    () -> tekvLSModifySubaccountStakeholderByEmail.run(this.request, this.stakeHolderEmail,
                            this.context));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        // Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "The connection attempt failed.";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse);
    }
}
