package com.function;

import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class TekvLSGetReportableSubaccountsTest extends TekvLSTest {

    TekvLSGetReportableSubaccounts getReportableSubaccountsApi;

    @BeforeEach
    public void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("IGESAdmin"));
        this.getReportableSubaccountsApi = new TekvLSGetReportableSubaccounts();
    }

    @Tag("acceptance")
    @Test
    public void getAllSubaccountsTest() {
        // When - Action
        HttpResponseMessage response = getReportableSubaccountsApi.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("subaccounts"));

        Object subaccounts = jsonBody.get("subaccounts");
        assertTrue(subaccounts instanceof JSONArray);

        JSONArray subaccountsArray = (JSONArray) subaccounts;
        assertTrue(subaccountsArray.length() > 0);

        JSONObject subaccount = subaccountsArray.getJSONObject(0);
        assertTrue(subaccount.has("subAccountId"));
        assertTrue(subaccount.has("subAccountName"));
        assertTrue(subaccount.has("customerName"));
        assertTrue(subaccount.has("customerId"));
        assertTrue(subaccount.has("maintenance"));
    }

    @Tag("security")
    @Test
    public void unauthorizedTest() {
        this.headers.remove("authorization");

        // When - Action
        HttpResponseMessage response = getReportableSubaccountsApi.run(this.request, this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

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
    public void genericExceptionTest() {
        // Given - Arrange
        Mockito.when(this.request.createResponseBuilder(HttpStatus.OK))
                .thenThrow(new RuntimeException("Generic error"));

        // When - Action
        HttpResponseMessage response = getReportableSubaccountsApi.run(this.request, this.context);
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
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }
}
