package com.function;

import com.function.auth.RoleAuthHandler;
import com.function.util.Config;
import com.function.util.TekvLSTest;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.HttpStatusType;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class TekvLSDeleteNoteByIdTest extends TekvLSTest {

    TekvLSDeleteNoteById deleteNoteById = new TekvLSDeleteNoteById();
    private String noteId = "EMPTY";

    @BeforeEach
    public void setup(){
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @Tag("acceptance")
    @Test
    public void deleteNoteByIdTest() {
        //Given
        String bodyRequest = "{'subaccountId':'f5a609c0-8b70-4a10-9dc8-9536bdb5652c', 'content':'note content','reports':[{ 'imageBase64': 'data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD', 'reportType': 'Daily-FeatureFunctionality', 'startDateStr': '230411154558', endDateStr: '230411154558' }]}";
        Mockito.doReturn(Optional.of(bodyRequest)).when(request).getBody();
        TekvLSCreateNote createNote = new TekvLSCreateNote();
        HttpResponseMessage response = createNote.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));

        this.noteId = new JSONObject(response.getBody().toString()).getString("id");

        //When
        response = this.deleteNoteById.run(this.request, this.noteId, this.context);
        this.context.getLogger().info(response.getStatus().toString());

        //Then
        actualStatus = response.getStatus();
        expected = HttpStatus.OK;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void invalidIdTest() {
        //Given
        this.noteId = "2";
        //When
        HttpResponseMessage response = this.deleteNoteById.run(this.request, noteId, this.context);
        this.context.getLogger().info(response.getStatus().toString());
        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Test
    public void genericExceptionTest() {
        //Given
        this.noteId = "00000000-aaaa-0000-bbbb-000000000000";
        Mockito.doThrow(new RuntimeException("Generic error")).when(request).createResponseBuilder(HttpStatus.OK);

        //When
        HttpResponseMessage response = this.deleteNoteById.run(this.request, this.noteId, this.context);
        this.context.getLogger().info(response.getStatus().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expected, actualStatus, "HTTP status doesn't match with: ".concat(expected.toString()));
    }

    @Tag("security")
    @Test
    public void noTokenTest() {
        //Given
        this.headers.remove("authorization");
        //When
        HttpResponseMessage response = this.deleteNoteById.run(this.request, this.noteId, this.context);
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
        HttpResponseMessage response = this.deleteNoteById.run(this.request, this.noteId, this.context);
        this.context.getLogger().info("HttpResponse: "+response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.FORBIDDEN;
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));

        String actualResponse = (String) response.getBody();

        String expectedResponse = "{\"error\":\"" + RoleAuthHandler.MESSAGE_FOR_FORBIDDEN + "\"}";
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

}