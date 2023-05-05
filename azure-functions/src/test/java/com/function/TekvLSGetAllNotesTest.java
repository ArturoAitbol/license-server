package com.function;


import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;
import org.json.JSONArray;
import org.json.JSONObject;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class TekvLSGetAllNotesTest extends TekvLSTest {
    private final TekvLSGetAllNotes getAllNotes = new TekvLSGetAllNotes();

    @BeforeEach
    public void setup(){
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
        this.queryParams.put("subaccountId", "f5a609c0-8b70-4a10-9dc8-9536bdb5652c");
    }

    @Tag("acceptance")
    @Test
    public void getAllNoteBySubaccountIdTest() {
        HttpResponseMessage response = getAllNotes.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);

        assertTrue(jsonBody.has("notes"));

        Object notes = jsonBody.get("notes");
        assertTrue(notes instanceof JSONArray);

        JSONArray notesArray = (JSONArray) notes;
        assertTrue(notesArray.length() > 0);

        JSONObject firstFound = notesArray.getJSONObject(0);
        assertTrue(firstFound.has("id"));
        assertTrue(firstFound.has("subaccountId"));
        assertTrue(firstFound.has("content"));
        assertTrue(firstFound.has("status"));
        assertTrue(firstFound.has("openDate"));
        assertTrue(firstFound.has("openedBy"));
        assertTrue(firstFound.has("closeDate"));
        assertTrue(firstFound.has("closedBy"));
    }

    @Test
    public void getNoteIncompleteSubaccountIdTest() {
        this.queryParams.put("subaccountId", "f5");

        HttpResponseMessage response = new TekvLSGetAllNotes().run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void getAllNoteMissingSubaccountIdTest() {
        this.queryParams.remove("subaccountId");

        HttpResponseMessage response = getAllNotes.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));
    }

    @Tag("security")
    @Test
    public void getNotesNoTokenTest(){
        this.headers.remove("authorization");
        HttpResponseMessage response = new TekvLSGetAllNotes().run(this.request, this.context);
        this.context.getLogger().info("HttpResponse: "+response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.UNAUTHORIZED;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String actualResponse = (String) response.getBody();

        String expectedResponse = "{\"error\":\"" + RoleAuthHandler.MESSAGE_FOR_UNAUTHORIZED + "\"}";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("security")
    @Test
    public void getNotesInvalidRoleTest(){
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("crm"));
        HttpResponseMessage response = new TekvLSGetAllNotes().run(this.request, this.context);
        this.context.getLogger().info("HttpResponse: "+response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.FORBIDDEN;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String actualResponse = (String) response.getBody();

        String expectedResponse = "{\"error\":\"" + RoleAuthHandler.MESSAGE_FOR_FORBIDDEN + "\"}";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Test
    public void getAllNotesExceptionTest() {
        Mockito.doThrow(new RuntimeException("Generic error")).when(request).createResponseBuilder(HttpStatus.OK);

        HttpResponseMessage response = getAllNotes.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));
    }

    @Tag("acceptance")
    @Test
    public void getAllNotesBySubaccountIdAndStatusTest() {
        String status = "Open";
        this.queryParams.put("status", status);

        HttpResponseMessage response = getAllNotes.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));
    }

    @Tag("acceptance")
    @Test
    public void getForCustomerAdminRoleTest() {
        //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));
        //When
        HttpResponseMessage response = getAllNotes.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());
        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("notes"));

        JSONArray notes = jsonBody.getJSONArray("notes");
        assertTrue(notes.length() > 0);

        String expectedSubaccountId = "f5a609c0-8b70-4a10-9dc8-9536bdb5652c";
        for (int i = 0; i < notes.length(); i++) {
            JSONObject note = notes.getJSONObject(i);
            String actualSubaccount = note.getString("subaccountId");
            assertEquals(expectedSubaccountId, actualSubaccount, "Note with subaccountId:" + actualSubaccount + " not expected in response (id:" + note.getString("id") + ")");
        }
    }

    @Tag("acceptance")
    @Test
    public void getForCustomerAdminRoleIncorrectSubaccountIdTest() {
        //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("customerAdmin"));
        String subaccountId = "cebe6542-2032-4398-882e-ffb44ade169d";
        this.queryParams.put("subaccountId", subaccountId);
        //When
        HttpResponseMessage response = getAllNotes.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());
        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_FOR_INVALID_ID;
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }

    @Tag("acceptance")
    @Test
    public void getForSubaccountAdminRoleTest() {
        //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));
        String subaccountId = "2c8e386b-d1bd-48b3-b73a-12bfa5d00805";
        this.queryParams.put("subaccountId", subaccountId);
        //When
        HttpResponseMessage response = getAllNotes.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());
        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("notes"));

        JSONArray notes = jsonBody.getJSONArray("notes");
        assertTrue(notes.length() > 0);

        JSONObject note = notes.getJSONObject(0);
        assertEquals(subaccountId,note.getString("subaccountId"));
    }

    @Tag("security")
    @Test
    public void getForSubaccountAdminRoleIncorrectSubaccountIdTest() {
        //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("subaccountAdmin"));
        //When
        HttpResponseMessage response = getAllNotes.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());
        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.BAD_REQUEST;
        assertEquals(expected, actualStatus, "HTTP request doesn't match with: ".concat(expected.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = RoleAuthHandler.MESSAGE_FOR_INVALID_ID;
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }

}