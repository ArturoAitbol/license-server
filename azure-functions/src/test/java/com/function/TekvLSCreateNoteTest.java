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

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.doReturn;

class TekvLSCreateNoteTest extends TekvLSTest {

    TekvLSCreateNote createNote = new TekvLSCreateNote();
    private String noteId = "EMPTY";
    private String bodyRequest = "";

    @BeforeEach
    void setUp() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @AfterEach
    void tearDown() {
        if(!this.noteId.equals("EMPTY")) {
            TekvLSDeleteNoteById deleteNoteById = new TekvLSDeleteNoteById();
            HttpResponseMessage response = deleteNoteById.run(this.request, this.noteId, this.context);
            this.context.getLogger().info(response.getStatus().toString());
            this.noteId = "EMPTY";

            HttpStatusType actualStatus = response.getStatus();
            HttpStatus expected = HttpStatus.OK;
            assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
        }
    }

    @Test
    public void createNoteTest() {
        //Given
        this.bodyRequest = "{'subaccountId':'f5a609c0-8b70-4a10-9dc8-9536bdb5652c', 'content':'note content', 'reports':[{ 'imageBase64': 'data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD', 'reportType': 'Daily-FeatureFunctionality', 'startDateStr': '230411154558', endDateStr: '230411154558' }]}";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = this.createNote.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("id"));

        this.noteId = jsonBody.getString("id");
        assertNotNull(this.noteId);
    }

    @Test
    public void createNoteWithDeviceTokenEmptyExceptionTest() {
        //Given
        this.bodyRequest = "{'subaccountId':'2c8e386b-d1bd-48b3-b73a-12bfa5d00805', 'content':'note content', 'reports':[{ 'imageBase64': 'data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD', 'reportType': 'Daily-FeatureFunctionality', 'startDateStr': '230411154558', endDateStr: '230411154558' }]}";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = this.createNote.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("id"));

        this.noteId = jsonBody.getString("id");
        assertNotNull(this.noteId);
    }
     @Test
     public void createNoteWithDeviceTokenTest() {
         //Given
         this.bodyRequest = "{'subaccountId':'2c8e386b-d1bd-48b3-b73a-12bfa5d00805', 'content':'note content', 'reports':[{ 'imageBase64': 'data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD', 'reportType': 'Daily-FeatureFunctionality', 'startDateStr': '230411154558', endDateStr: '230411154558' }]}";
         doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

         //When
         HttpResponseMessage response = this.createNote.run(this.request, this.context);
         this.context.getLogger().info(response.getBody().toString());

         //Then
         HttpStatusType actualStatus = response.getStatus();
         HttpStatus expected = HttpStatus.OK;
         assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

         String body = (String) response.getBody();
         JSONObject jsonBody = new JSONObject(body);
         assertTrue(jsonBody.has("id"));

         this.noteId = jsonBody.getString("id");
         assertNotNull(this.noteId);
     }

    @Test
    public void missingMandatoryParameterTest() {
        //Given
        this.bodyRequest = "{'subaccountId':'f5a609c0-8b70-4a10-9dc8-9536bdb5652c'}";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = this.createNote.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected , actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedResponse = "Missing mandatory parameter: content";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void invalidBodyTest() {
        //Given
        this.bodyRequest = "test";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();
        //When
        HttpResponseMessage response = this.createNote.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());
        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void emptyBodyTest() {
        //Given
        this.bodyRequest = "";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = this.createNote.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected , actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedResponse = "error: request body is empty.";
        String actualResponse = jsonBody.getString("error");
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("security")
    @Test
    public void noTokenTest() {
        //Given
        this.headers.remove("authorization");

        //When
        HttpResponseMessage response = this.createNote.run(this.request, this.context);
        this.context.getLogger().info("HttpResponse: "+response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.UNAUTHORIZED;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String actualResponse = (String) response.getBody();
        String expectedResponse = "{\"error\":\"" + RoleAuthHandler.MESSAGE_FOR_UNAUTHORIZED + "\"}";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("security")
    @Test
    public void invalidRoleTest() {
        //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("crm"));

        //When
        HttpResponseMessage response = this.createNote.run(this.request, this.context);
        this.context.getLogger().info("HttpResponse: "+response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.FORBIDDEN;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String actualResponse = (String) response.getBody();
        String expectedResponse = "{\"error\":\"" + RoleAuthHandler.MESSAGE_FOR_FORBIDDEN + "\"}";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void invalidSubaccountIdTest() {
        //Given
        this.bodyRequest = "{'subaccountId':'1', 'content':'note content','reports':[{},{}]}";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();

        //When
        HttpResponseMessage response = createNote.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected , actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedResponse = "ERROR: invalid input syntax for type uuid: \"1\"";
        String actualResponse = jsonBody.getString("error");
        assertTrue(actualResponse.contains(expectedResponse), "Response doesn't contain: ".concat(expectedResponse));
    }

    @Test
    public void genericExceptionTest() {
        //Given
        this.bodyRequest = "{'subaccountId':'f5a609c0-8b70-4a10-9dc8-9536bdb5652c', 'content':'note content','reports':[{},{}]}'";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();
        Mockito.doThrow(new RuntimeException("Generic error")).when(request).createResponseBuilder(HttpStatus.OK);
        //When
        HttpResponseMessage response = this.createNote.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());
        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected , actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

}