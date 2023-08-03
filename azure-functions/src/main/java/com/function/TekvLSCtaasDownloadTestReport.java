package com.function;

import com.function.auth.Resource;
import com.function.util.GenerateExcelReport;
import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import io.jsonwebtoken.Claims;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.util.Optional;

import static com.function.auth.RoleAuthHandler.*;

/**
 * Azure Functions with HTTP Trigger.
 */
public class TekvLSCtaasDownloadTestReport {
    /**
     * This function listens at endpoint "/api/TekvLSCtaasDownloadTestReport". Two
     * ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/api/TekvLSCtaasDownloadTestReport
     * 2. curl {your host}/api/TekvLSCtaasDownloadTestReport?name=HTTP%20Query
     */
    @FunctionName("TekvLSCtaasDownloadTestReport")
    public HttpResponseMessage run(@HttpTrigger(name = "req", methods = {
            HttpMethod.POST}, authLevel = AuthorizationLevel.ANONYMOUS, route = "ctaasDashboard/downloadReport") HttpRequestMessage<Optional<String>> request,
                                   final ExecutionContext context) {

        Claims tokenClaims = getTokenClaimsFromHeader(request, context);
        JSONArray roles = getRolesFromToken(tokenClaims, context);
        if (roles.isEmpty()) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_UNAUTHORIZED);
            json.put("error", MESSAGE_FOR_UNAUTHORIZED);
            return request.createResponseBuilder(HttpStatus.UNAUTHORIZED).body(json.toString()).build();
        }
        if (!hasPermission(roles, Resource.GET_CTAAS_DASHBOARD)) {
            JSONObject json = new JSONObject();
            context.getLogger().info(LOG_MESSAGE_FOR_FORBIDDEN + roles);
            json.put("error", MESSAGE_FOR_FORBIDDEN);
            return request.createResponseBuilder(HttpStatus.FORBIDDEN).body(json.toString()).build();
        }

        String userId = getUserIdFromToken(tokenClaims, context);
        context.getLogger().info("User " + userId + " is Entering TekvLSCtaasDownloadTestReport Azure function");
        // Parse request body and extract parameters needed
        String requestBody = request.getBody().orElse("");
        if (requestBody.isEmpty()) {
            context.getLogger().info("Error: Request body is empty.");
            JSONObject json = new JSONObject();
            json.put("error", "Request body is empty.");
            context.getLogger().info("User " + userId + " is leaving TekvLSCtaasDownloadTestReport Azure function with error");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        JSONObject jobj;
        try {
            jobj = new JSONObject(requestBody);
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSCtaasDownloadTestReport Azure function with error");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
        }
        // Check mandatory params to be present
        for (MANDATORY_PARAMS mandatoryParam : MANDATORY_PARAMS.values()) {
            if (!jobj.has(mandatoryParam.value)) {
                // Parameter not found
                context.getLogger().info("Missing mandatory parameter: " + mandatoryParam.value);
                JSONObject json = new JSONObject();
                json.put("error", "Missing mandatory parameter: " + mandatoryParam.value);
                context.getLogger().info("User " + userId + " is leaving TekvLSCtaasDownloadTestReport Azure function with error");
                return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
            }
        }
        try {
            JSONObject json = new JSONObject();
            JSONObject jsonObject = jobj.getJSONObject(MANDATORY_PARAMS.DETAILED_REPORT.value);
            if (jsonObject == null) {
                json.put("error", "Detailed report response cannot be empty");
                context.getLogger().info("User " + userId + " is leaving TekvLSCtaasDownloadTestReport Azure function with error");
                return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
            }
            byte[] bytes = null;
            final String REPORT_NOT_FOUND = "Detailed report data is missing";
            XSSFWorkbook workbook = new GenerateExcelReport().generateDetailedTestReport(context, jsonObject);
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            try {
                workbook.write(bos);
                bytes = bos.toByteArray();
            } finally {
                bos.close();
            }
            if (bytes == null) {
                context.getLogger().info(REPORT_NOT_FOUND);
                json.put("error", REPORT_NOT_FOUND);
                context.getLogger().info("User " + userId + " is leaving TekvLSCtaasDownloadTestReport Azure function with error");
                return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(json.toString()).build();
            }
            context.getLogger().info("User " + userId + " is successfully leaving TekvLSCtaasDownloadTestReport Azure function");
            return request.createResponseBuilder(HttpStatus.OK).header("Content-Type", "application/vnd.ms-excel")
                    .body(bytes).build();
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            JSONObject json = new JSONObject();
            json.put("error", e.getMessage());
            context.getLogger().info("User " + userId + " is leaving TekvLSCtaasDownloadTestReport Azure function with error");
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR).body(json.toString()).build();
        }
    }

    private enum MANDATORY_PARAMS {
        DETAILED_REPORT("detailedReport");

        private final String value;

        MANDATORY_PARAMS(String value) {
            this.value = value;
        }
    }
}
