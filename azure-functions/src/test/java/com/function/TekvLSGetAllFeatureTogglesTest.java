package com.function;

import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import uk.org.webcompere.systemstubs.environment.EnvironmentVariables;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doReturn;

public class TekvLSGetAllFeatureTogglesTest extends TekvLSTest {
    TekvLSGetAllFeatureToggles getAllFeatureToggles = new TekvLSGetAllFeatureToggles();

    private final TekvLSCreateFeatureToggle createFeatureToggleApi = new TekvLSCreateFeatureToggle();
    private final TekvLSDeleteFeatureToggleById deleteFeatureToggleApi = new TekvLSDeleteFeatureToggleById();
    private String featureToggleId = "EMPTY";

    @BeforeEach
    public void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));
        String name = "1featureToggleTest" + LocalDateTime.now();
        String bodyRequest = "{" +
                    " 'status' : true," +
                    " 'name' : '" + name + "'," +
                    " 'customerName' : '(optional)Customer Name'," +
                    " 'author' : '(optional)Test User'," +
                    " 'description' : '(optional)This is test data for the FT api'" +
                "}";
        doReturn(Optional.of(bodyRequest)).when(request).getBody();
        HttpResponseMessage response = this.createFeatureToggleApi.run(this.request, this.context);
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        this.featureToggleId = new JSONObject(response.getBody().toString()).getString("id");
    }

    @AfterEach
    void tearDown() {
        if (!this.featureToggleId.equals("EMPTY")) {
            this.initTestParameters();
            this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));
            HttpResponseMessage response = deleteFeatureToggleApi.run(this.request, this.featureToggleId, this.context);
            this.context.getLogger().info(response.getStatus().toString());
            this.featureToggleId = "EMPTY";

            HttpStatusType actualStatus = response.getStatus();
            HttpStatus expected = HttpStatus.OK;
            assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        }
    }

    @Tag("acceptance")
    @Test
    public void getAllFeatureTogglesTest() {
        //When - Action
        HttpResponseMessage response = getAllFeatureToggles.run(this.request, "EMPTY", this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("featureToggles"));

        JSONArray featureToggles = jsonBody.getJSONArray("featureToggles");
        assertTrue(featureToggles.length() > 0);

        JSONObject featureToggle = featureToggles.getJSONObject(0);
        assertTrue(featureToggle.has("id"));
        assertTrue(featureToggle.has("author"));
        assertTrue(featureToggle.has("status"));
        assertTrue(featureToggle.has("name"));
        assertTrue(featureToggle.has("description"));
    }

    @Tag("acceptance")
    @Test
    public void getSingleFeatureToggleTest() {
        //When - Action
        HttpResponseMessage response = getAllFeatureToggles.run(this.request, this.featureToggleId, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("featureToggles"));

        JSONArray featureToggles = jsonBody.getJSONArray("featureToggles");
        assertEquals(1, featureToggles.length());

        JSONObject featureToggle = featureToggles.getJSONObject(0);
        assertTrue(featureToggle.has("id"));
        assertTrue(featureToggle.has("author"));
        assertTrue(featureToggle.has("status"));
        assertTrue(featureToggle.has("name"));
        assertTrue(featureToggle.has("description"));
        assertEquals(this.featureToggleId, featureToggle.getString("id"), "Response doesn't match with: ".concat(this.featureToggleId));
    }

    @Tag("security")
    @Test
    public void unauthorizedTest() {
        //Given - Arrange
        this.headers.remove("authorization");

        //When - Action
        HttpResponseMessage response = getAllFeatureToggles.run(this.request, "", this.context);
        this.context.getLogger().info("HttpResponse: " + response.getBody().toString());

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
    public void genericExceptionTest() {
        //Given - Arrange
        Mockito.when(this.request.createResponseBuilder(HttpStatus.OK)).thenThrow(new RuntimeException("Generic error"));

        //When - Action
        HttpResponseMessage response = getAllFeatureToggles.run(this.request, "EMPTY", this.context);
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
    public void sqlExceptionTest() {
        //When - Action
        HttpResponseMessage response;
        try {
            response = new EnvironmentVariables("POSTGRESQL_SERVER", "test").execute(() -> getAllFeatureToggles.run(this.request, "EMPTY", this.context));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        //Then - Assert
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("error"));

        String expectedResponse = "SQL Exception: The connection attempt failed.";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }
}
