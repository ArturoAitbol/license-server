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

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doReturn;

class TekvLSCtaasDownloadTestReportTest extends TekvLSTest {
    private String bodyRequest = "";
    private String report = "{\n" +
            "    endpoints:[\n" +
            "    {\n" +
            "        \"zipcode\": \"9725980067\",\n" +
            "        \"country\": \"US\",\n" +
            "        \"city\": \"Colombus\",\n" +
            "        \"vendor\": \"Microsoft\",\n" +
            "        \"model\": \"MS-TEAMS\",\n" +
            "        \"state\": \"Washington\",\n" +
            "        \"firmwareVersion\": \"1.6.00.1381\",\n" +
            "        \"did\": \"9725989021\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"zipcode\": \"2142428818\",\n" +
            "        \"country\": \"US\",\n" +
            "        \"city\": \"Plano\",\n" +
            "        \"vendor\": \"Microsoft\",\n" +
            "        \"model\": \"MS-TEAMS\",\n" +
            "        \"state\": \"Texas\",\n" +
            "        \"firmwareVersion\": \"1.6.00.1381\",\n" +
            "        \"did\": \"9725989023\"\n" +
            "    }\n" +
            "   ],\n" +
            "    results:[{\n" +
            "        closeKey: false,\n" +
            "        errorCategory: null,\n" +
            "        errorReason: null,\n" +
            "        startTime: \"02-26-2023 00:20:29 UTC\",\n" +
            "        from: {\n" +
            "            mediaStats: [{\n" +
            "                data: {\n" +
            "                \"Received packet loss\": \"0.00%\",\n" +
            "                \"Sent bitrate\": \"47.2 Kbps\",\n" +
            "                \"Received Jitter\": \"1.22 ms\",\n" +
            "                \"Round trip time\": \"--\",\n" +
            "                \"Sent codec\": \"SATIN\",\n" +
            "                \"Received packets\": \"2308 packets\",\n" +
            "                \"Received codec\": \"SATIN\",\n" +
            "                \"Sent packets\": \"2313 packets\"\n" +
            "            }, \n" +
            "            timeStampIndex: 0, \n" +
            "            timestamp: \"02-27-2023 10:57:34 UTC\"\n" +
            "        }],\n" +
            "            DID: \"9725989021\"\n" +
            "        },\n" +
            "        testCaseName: \"2_Func_tekv-Basic-MSTeams-005\",\n" +
            "        endTime: \"02-26-2023 00:24:44 UTC\",\n" +
            "        to: {\n" +
            "            mediaStats: [{data: {\n" +
            "                \"Received packet loss\": \"0.00%\",\n" +
            "                \"Sent bitrate\": \"47.2 Kbps\",\n" +
            "                \"Received Jitter\": \"1.39 ms\",\n" +
            "                \"Round trip time\": \"--\",\n" +
            "                \"Sent codec\": \"SATIN\",\n" +
            "                \"Received packets\": \"8787 packets\",\n" +
            "                \"Received codec\": \"SATIN\",\n" +
            "                \"Sent packets\": \"8783 packets\"\n" +
            "            },\n" +
            "            timeStampIndex: 0,\n" +
            "            timestamp: \"02-27-2023 10:59:42 UTC\"\n" +
            "        }],\n" +
            "            DID: \"9725989023\"\n" +
            "        },\n" +
            "        otherParties: [{\n" +
            "            DID:\"9725980058\",\n" +
            "            mediaStats:[{\n" +
            "                data:{\n" +
            "                    \"Received packet loss\": \"--\",\n" +
            "                    \"Sent bitrate\": \"36 Kbps\",\n" +
            "                    \"Received Jitter\": \"4.97 ms\",\n" +
            "                    \"Round trip time\": \"--\",\n" +
            "                    \"Sent codec\": \"SATIN\",\n" +
            "                    \"Received codec\": \"SATIN\",\n" +
            "                    \"Received packets\": \"33 packets\",\n" +
            "                    \"Sent packets\": \"1 packets\"\n" +
            "                },\n" +
            "                timeStampIndex: 0,\n" +
            "                timestamp: \"02-26-2023 11:54:39 UTC\"\n" +
            "            }]\n" +
            "        }],\n" +
            "        status: \"PASSED\"\n" +
            "    }],\n" +
            "    summary: {\n" +
            "    \"total\": 118,\n" +
            "    \"startTime\": \"03-29-2023 00:00:00 UTC\",\n" +
            "    \"passed\": 118,\n" +
            "    \"failed\": 0,\n" +
            "    \"endTime\": \"03-29-2023 19:46:24 UTC\"\n" +
            "   },\n" +
            "    type: \"LTS\"\n" +
            "}";

    TekvLSCtaasDownloadTestReport downloadTestReport = new TekvLSCtaasDownloadTestReport();

    @BeforeEach
    public void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @Test
    public void downloadReporTest() {
        this.bodyRequest = "{detailedReport:" + this.report + "}," + "{responseType:'blob'}";
        String expectedSubaccountId = "2c8e386b-d1bd-48b3-b73a-12bfa5d00805";
        this.queryParams.put("subaccountId", expectedSubaccountId);
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();


        HttpResponseMessage response = downloadTestReport.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));
    }

    @Test
    public void downloadReportInvalidTest() {
        this.bodyRequest = "{detailedReport:{}}," + "{responseType:'blob'}";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();


        HttpResponseMessage response = downloadTestReport.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));
    }

    @Test
    public void downloadReportNullDetailedResponse() {
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();


        HttpResponseMessage response = downloadTestReport.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;
        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = "Request body is empty.";
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }

    @Test
    public void downloadReportBadDetailedResponse() {
        this.bodyRequest = "{detailedReport:}";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();


        HttpResponseMessage response = downloadTestReport.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;

        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));
        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = "Missing value at 16 [character 17 line 1]";
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }

    @Test
    public void downloadReportEmptyDetailedResponse() {
        this.bodyRequest = "{}";
        doReturn(Optional.of(this.bodyRequest)).when(request).getBody();


        HttpResponseMessage response = downloadTestReport.run(this.request,this.context);
        this.context.getLogger().info(response.getBody().toString());

        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.BAD_REQUEST;

        assertEquals(expectedStatus, actualStatus, "HTTP status doesn't match with: ".concat(expectedStatus.toString()));
        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String expectedMessage = "Missing mandatory parameter: detailedReport";
        assertEquals(expectedMessage,jsonBody.getString("error"));
    }

    @Tag("Security")
    @Test
    public void invalidRoleTest(){
        //Given
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("devicesAdmin"));

        //When
        HttpResponseMessage response = downloadTestReport.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.FORBIDDEN;
        assertEquals(expectedStatus, actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = RoleAuthHandler.MESSAGE_FOR_FORBIDDEN;
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

    @Tag("Security")
    @Test
    public void noTokenTest(){
        //Given
        this.headers.remove("authorization");

        //When
        HttpResponseMessage response = downloadTestReport.run(this.request, this.context);
        this.context.getLogger().info(response.getBody().toString());

        //Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.UNAUTHORIZED;
        assertEquals(expectedStatus, actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("error"));

        String actualResponse = jsonBody.getString("error");
        String expectedResponse = RoleAuthHandler.MESSAGE_FOR_UNAUTHORIZED;
        assertEquals(expectedResponse, actualResponse, "Response doesn't match with: ".concat(expectedResponse));
    }

}