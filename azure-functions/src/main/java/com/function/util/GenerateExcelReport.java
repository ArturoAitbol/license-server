package com.function.util;

import com.microsoft.azure.functions.ExecutionContext;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.util.IOUtils;
import org.apache.poi.xssf.usermodel.*;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.StringJoiner;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class GenerateExcelReport {
    private static final GenerateExcelReport instance = new GenerateExcelReport();

    public static GenerateExcelReport getInstance() {
        return instance;
    }

    private static final List<String> iterationTestResultHeaders = new ArrayList<String>();

    static {
        iterationTestResultHeaders.add("Test Case");
        iterationTestResultHeaders.add("Start Time");
        iterationTestResultHeaders.add("End Time");
        iterationTestResultHeaders.add("From");
        iterationTestResultHeaders.add("To");
        iterationTestResultHeaders.add("Other parties");
        iterationTestResultHeaders.add("Status");
        iterationTestResultHeaders.add("Call Type");
        iterationTestResultHeaders.add("Error Category");
        iterationTestResultHeaders.add("Reason");
    }

    /**
     * parse the JSONObject and generate Spreadsheet with the data
     *
     * @param context:    ExecutionContext
     * @param jsonObject: JSONObject
     * @return: XSSFWorkbook
     */
    public XSSFWorkbook generateDetailedTestReport(ExecutionContext context, JSONObject jsonObject) {
        try {
            context.getLogger().info("Creating Xss Workbook");
            XSSFWorkbook workbook = new XSSFWorkbook();
            context.getLogger().info("Before Creating Summary Sheet");
            if (jsonObject != null) {
                this.createSpotlightSummarySheet(context, workbook, jsonObject);
                context.getLogger().info("Writing report into OutputStream");
                return workbook;
            }
            return null;
        } catch (Exception e) {
            context.getLogger().severe("Caught Exception: " + e);
        }
        return null;
    }

    /**
     * create a sheet in a spreadsheet and add Test Summary details
     *
     * @param context:    ExecutionContext
     * @param workbook:   XSSFWorkbook
     * @param jsonObject: JSONObject
     */
    private void createSpotlightSummarySheet(ExecutionContext context, XSSFWorkbook workbook, JSONObject jsonObject) {
        context.getLogger().info("Creating Sheet and adding Summary details");

        Row row = null;
        Cell cell = null;
        int index = 0;
        int count = 0;
        XSSFSheet summarySheet = workbook.createSheet("Summary");
        summarySheet.setDefaultColumnWidth(16);
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("A1:E1"));
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("A2:E2"));

        XSSFCellStyle titleStyle = this.getStyle(workbook, true);
        titleStyle.setAlignment(HorizontalAlignment.CENTER);
        XSSFCellStyle imageStyle = this.getImageStyle(workbook);
        imageStyle.setAlignment(HorizontalAlignment.CENTER);
        row = summarySheet.createRow(index++);
        row.setHeightInPoints((float) 50.0);
        drawImage(context, workbook, summarySheet);
        addCell(row, cell, imageStyle, count++, "");

        count = 0;
        index = 1;
        row = summarySheet.createRow(index++);
        row.setHeightInPoints((float) 20.0);
        addCell(row, cell, titleStyle, count++, "Summary of Test Execution");

        summarySheet.addMergedRegion(CellRangeAddress.valueOf("B3:E3"));
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("B4:E4"));
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("B5:E5"));
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("B6:E6"));
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("B7:E7"));
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("B8:E8"));

        XSSFCellStyle redLabel = this.getRedHeaderStyle(workbook);

        XSSFCellStyle whiteUnboldLabel = this.getStyle(workbook, false);
        XSSFCellStyle whiteLabel = this.getStyle(workbook, true);
        XSSFCellStyle blackLabel = this.getStyle(workbook, false);
        Font blackFontHeader = workbook.createFont();
        blackFontHeader.setBold(true);
        blackLabel.setFont(blackFontHeader);
        JSONObject summaryResponse = jsonObject.has("summary") ? (JSONObject) jsonObject.get("summary")
                : new JSONObject();
        StringJoiner stringJoiner = new StringJoiner(" | ");
        for (SUMMARY_REPORT_PARAMS summaryParams : SUMMARY_REPORT_PARAMS.values()) {
            String val = "";
            if (summaryResponse.has(summaryParams.value)) {
                final String tmp = summaryResponse.get(summaryParams.value).toString();
                val = tmp.equalsIgnoreCase("null") ? "" : tmp;
            }
            createSpotlightSummaryRow(index++, summarySheet, whiteLabel, blackLabel, summaryParams.key, val);
            stringJoiner.add(String.format("%s:%s", summaryParams.key, val));
        }
        context.getLogger().info("Summary Results: " + stringJoiner);
        getEndpointResources(context, summarySheet, row, cell, blackLabel, whiteLabel, redLabel, whiteUnboldLabel,
                index, jsonObject);

    }

    private void createSpotlightSummaryRow(int index, XSSFSheet workSheet, XSSFCellStyle whiteLabel,
                                           XSSFCellStyle blackLabel, String key, String value) {
        Row row = workSheet.createRow(index);
        addCell(row, null, whiteLabel, 0, key);
        addCell(row, null, blackLabel, 1, value);
        addCell(row, null, blackLabel, 2, null);
        addCell(row, null, blackLabel, 3, null);
        addCell(row, null, blackLabel, 4, null);
    }

    /**
     * create a table for Endpoint resources
     *
     * @param context
     * @param summarySheet
     * @param row
     * @param cell
     * @param blackLabel
     * @param whiteLabel
     * @param redLabel
     * @param whiteUnboldStyle
     * @param index
     * @param jsonObject
     */
    private void getEndpointResources(ExecutionContext context, XSSFSheet summarySheet, Row row, Cell cell,
                                      XSSFCellStyle blackLabel, XSSFCellStyle whiteLabel, XSSFCellStyle redLabel, XSSFCellStyle whiteUnboldStyle,
                                      int index, JSONObject jsonObject) {
        context.getLogger().info("Generating Endpoint Resources for Run Report");
        int count = 0;
        index++;

        row = summarySheet.createRow(index++);
        int num = row.getRowNum() + 1;
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("A" + num + ":" + "J" + num));
        whiteLabel.setAlignment(HorizontalAlignment.CENTER);
        addCell(row, cell, whiteLabel, count++, "EndPoint Resources");

        row = summarySheet.createRow(index++);
        int num1 = row.getRowNum() + 1;
        // Merging two cells for Firmware column
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("C" + num1 + ":" + "D" + num1));
        blackLabel.setAlignment(HorizontalAlignment.CENTER);
        // Merging two cells for Service Provider column
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("E" + num1 + ":" + "F" + num1));
        blackLabel.setAlignment(HorizontalAlignment.CENTER);
        // Merging two cells for Domain column
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("G" + num1 + ":" + "H" + num1));
        blackLabel.setAlignment(HorizontalAlignment.CENTER);
        // Merging two cells for Region column
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("I" + num1 + ":" + "J" + num1));
        blackLabel.setAlignment(HorizontalAlignment.CENTER);

        count = 0;
        addCell(row, cell, blackLabel, count++, "Vendor / Model");
        addCell(row, cell, blackLabel, count++, "DID");
        addCell(row, cell, blackLabel, count++, "Firmware Version");
        addCell(row, cell, blackLabel, count++, null);
        addCell(row, cell, blackLabel, count++, "Service Provider");
        addCell(row, cell, blackLabel, count++, null);
        addCell(row, cell, blackLabel, count++, "Domain");
        addCell(row, cell, blackLabel, count++, null);
        addCell(row, cell, blackLabel, count++, "Region");
        addCell(row, cell, blackLabel, count++, null);

        JSONArray endpointsResponse = (JSONArray) jsonObject.get("endpoints");
        for (int i = 0; i < endpointsResponse.length(); i++) {
            JSONObject endPointResource = (JSONObject) endpointsResponse.get(i);
            generateEndpointsReport(context, index++, summarySheet, blackLabel, whiteUnboldStyle, endPointResource);
        }

        // To Create Test Result Table in Report
        generateTestReportByType(context, summarySheet, row, cell, blackLabel, whiteLabel, redLabel, index, jsonObject);
    }

    /**
     * @param context
     * @param summarySheet
     * @param row
     * @param cell
     * @param blackLabel
     * @param whiteLabel
     * @param redLabel
     * @param index
     * @param jsonObject:  {summary:{},endpoints:{},results:[],type:""}
     */
    private void generateTestReportByType(ExecutionContext context, XSSFSheet summarySheet, Row row, Cell cell,
                                          XSSFCellStyle blackLabel, XSSFCellStyle whiteLabel, XSSFCellStyle redLabel, int index,
                                          JSONObject jsonObject) {
        context.getLogger().info("Generating Test Cases Details Report");
        index++;
        int count = 0;
        row = summarySheet.createRow(index++);
        int columnnum = row.getRowNum() + 1;
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("A" + columnnum + ":" + "J" + columnnum));
        whiteLabel.setAlignment(HorizontalAlignment.CENTER);
        String reportTypeParam = jsonObject.get("type").toString();
        String reportTypesHeader;
        if (reportTypeParam.isEmpty()){
            reportTypesHeader = Constants.DEFAULT_REPORT_NAME;
        } else {
            String[] reportTypes = reportTypeParam.split(",");
            reportTypesHeader = "";
            for (int i = 0; i < reportTypes.length; i++) {
                reportTypesHeader += Utils.getReportNameByTestPlan(reportTypes[i]);
                if (i + 1 < reportTypes.length)
                    reportTypesHeader += " + ";
            }
        }
        if (jsonObject.get("results") != null)
            addCell(row, null, whiteLabel, count++, reportTypesHeader);
        count = 0;
        row = summarySheet.createRow(index++);
        for (String header : iterationTestResultHeaders) {
            cell = addCell(row, cell, whiteLabel, count++, header);
        }
        JSONArray testResult = jsonObject.get("results") == null ? new JSONArray()
                : (JSONArray) jsonObject.get("results");
        for (int i = 0; i < testResult.length(); i++) {
            count = 0;
            row = summarySheet.createRow(index++);
            JSONObject testResultResponse = (JSONObject) testResult.get(i);
            final String status = testResultResponse.get("status").toString();
            if ((status.equalsIgnoreCase("FAILED")) || (status.equalsIgnoreCase("INTERRUPTED"))) {
                getIterationWiseTestResultsDetails(context, i, cell, row, index, count, redLabel, testResultResponse);
            } else {
                getIterationWiseTestResultsDetails(context, i, cell, row, index, count, blackLabel, testResultResponse);
            }
        }
    }

    private void generateEndpointsReport(ExecutionContext context, int index, XSSFSheet workSheet,
                                         XSSFCellStyle blackLabel, XSSFCellStyle whiteUnboldStyle, JSONObject endPointResource) {
        context.getLogger().info("Generating end points report");
        int count = 0;
        Row row = workSheet.createRow(index);
        int num = row.getRowNum() + 1;
// Firmware Column
        workSheet.addMergedRegion(CellRangeAddress.valueOf("C" + num + ":" + "D" + num));
        whiteUnboldStyle.setAlignment(HorizontalAlignment.CENTER);
// Service Provider Column
        workSheet.addMergedRegion(CellRangeAddress.valueOf("E" + num + ":" + "F" + num));
        whiteUnboldStyle.setAlignment(HorizontalAlignment.CENTER);
// Domain Column
        workSheet.addMergedRegion(CellRangeAddress.valueOf("G" + num + ":" + "H" + num));
        whiteUnboldStyle.setAlignment(HorizontalAlignment.CENTER);
// Region Column
        workSheet.addMergedRegion(CellRangeAddress.valueOf("I" + num + ":" + "J" + num));
        whiteUnboldStyle.setAlignment(HorizontalAlignment.CENTER);
        List<String> valuesList = new ArrayList<>();
        StringJoiner stringJoiner = new StringJoiner(" | ");
        for (ENDPOINT_REPORT_PARAMS endpointReportParams : ENDPOINT_REPORT_PARAMS.values()) {
            String val = "";
            if (endPointResource.has(endpointReportParams.value)) {
                final String tmp = endPointResource.get(endpointReportParams.value).toString();
                val = tmp.equalsIgnoreCase("null") ? "" : tmp;
            }
            stringJoiner.add(String.format("%s:%s", endpointReportParams.key, val));
            valuesList.add(val);
        }
        String city = valuesList.get(6);
        String state = valuesList.get(7);
        String country = valuesList.get(8);
        String zipcode = valuesList.get(9);

        context.getLogger().info("End point results: " + stringJoiner);
        final String region = (city.isEmpty() || state.isEmpty() || country.isEmpty() || zipcode.isEmpty()) ? ""
                : String.format("%s, %s, %s, %s", city, state, country, zipcode);
        // Vendor and Model cell
        addCell(row, null, blackLabel, count++, valuesList.get(0) + " / " + valuesList.get(1));
        // DID
        addCell(row, null, whiteUnboldStyle, count++, valuesList.get(2));
        // Firmware
        addCell(row, null, whiteUnboldStyle, count++, valuesList.get(3));
        addCell(row, null, whiteUnboldStyle, count++, null);
        // Service Provider
        addCell(row, null, whiteUnboldStyle, count++, valuesList.get(4));
        addCell(row, null, whiteUnboldStyle, count++, null);
        // Domain
        addCell(row, null, whiteUnboldStyle, count++, valuesList.get(5));
        addCell(row, null, whiteUnboldStyle, count++, null);
        // Region
        addCell(row, null, whiteUnboldStyle, count++, region);
        addCell(row, null, whiteUnboldStyle, count++, null);
    }

    private void getIterationWiseTestResultsDetails(ExecutionContext context, int i, Cell cell, Row row, int index,
                                                    int count, XSSFCellStyle cellStyle, JSONObject testResultResponse) {
        context.getLogger().info("Generating iteration wise run count details ");
        StringJoiner stringJoiner = new StringJoiner(" | ");
        for (TEST_RESULTS_REPORT_PARAMS resultsParams : TEST_RESULTS_REPORT_PARAMS.values()) {
            if (testResultResponse.has(resultsParams.value)) {
                String val = "";
                switch (resultsParams.value) {
                    case "testCaseName":
                    case "status":
                    case "callType":
                    case "errorReason":
                    case "errorCategory":
                    case "startTime":
                    case "endTime": {
                        final String tmp = testResultResponse.get(resultsParams.value).toString();
                        val = tmp.equalsIgnoreCase("null") ? "" : tmp;
                        break;
                    }
                    case "from":
                    case "to": {
                        JSONObject jsonObject = (JSONObject) testResultResponse.get(resultsParams.value);
                        val = jsonObject.isEmpty() || jsonObject.toString().equalsIgnoreCase("null")
                                || !jsonObject.has("DID") ? "" : jsonObject.getString("DID");
                        break;
                    }
                    case "otherParties":
                        JSONArray jsonArray = testResultResponse.has(resultsParams.value)
                                ? (JSONArray) testResultResponse.get(resultsParams.value)
                                : new JSONArray();
                        List<JSONObject> jsonObjects = IntStream.range(0, jsonArray.length())
                                .mapToObj(k -> (JSONObject) jsonArray.get(k))
                                .collect(Collectors.toList());
                        String otherDidParticipant = jsonObjects.stream()
                                .filter(e -> !e.isEmpty())
                                .map(x -> x.has("DID") ? x.getString("DID") : "")
                                .filter(e -> !e.isEmpty())
                                .collect(Collectors.joining(","));
                        val = otherDidParticipant.equalsIgnoreCase("null") ? "" : otherDidParticipant;
                        break;
                }
                stringJoiner.add(String.format("%s:%s", resultsParams.name(), val));
                addCell(row, cell, cellStyle, count++, val);
                index++;
            }
        }
        context.getLogger().info("Test ResultDetails: " + stringJoiner);
    }

    private XSSFCellStyle getImageStyle(XSSFWorkbook workbook) {
        XSSFCellStyle newstyle = workbook.createCellStyle(); // style for normal lines of Summary
        newstyle.setFillForegroundColor(new XSSFColor(new java.awt.Color(255, 255, 255), new DefaultIndexedColorMap()));
        newstyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        newstyle.setBorderRight(BorderStyle.THICK);
        return newstyle;
    }

    private XSSFCellStyle getStyle(XSSFWorkbook workbook, boolean isHeader) {
        XSSFCellStyle newstyle = workbook.createCellStyle(); // style for normal lines of Summary
        if (isHeader) {
            newstyle.setBorderTop(BorderStyle.THIN);
            newstyle.setBorderRight(BorderStyle.THIN);
            newstyle.setTopBorderColor(IndexedColors.BLACK.getIndex());
            newstyle.setRightBorderColor(IndexedColors.BLACK.getIndex());
            newstyle.setWrapText(true);
            newstyle.setVerticalAlignment(VerticalAlignment.TOP);
            newstyle.setAlignment(HorizontalAlignment.LEFT);
            newstyle.setFillForegroundColor(new XSSFColor(new java.awt.Color(39, 49, 118), new DefaultIndexedColorMap()));
            newstyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font newFont = workbook.createFont();
            newFont.setBold(true);
            newFont.setColor(IndexedColors.WHITE.getIndex());
            newstyle.setFont(newFont);
        } else {
            newstyle.setBorderTop(BorderStyle.THIN);
            newstyle.setBorderLeft(BorderStyle.THIN);
            newstyle.setBorderRight(BorderStyle.THIN);
            newstyle.setBorderBottom(BorderStyle.THIN);
            newstyle.setTopBorderColor(IndexedColors.BLACK.getIndex());
            newstyle.setLeftBorderColor(IndexedColors.BLACK.getIndex());
            newstyle.setRightBorderColor(IndexedColors.BLACK.getIndex());
            newstyle.setBottomBorderColor(IndexedColors.BLACK.getIndex());
            newstyle.setWrapText(true);
            newstyle.setVerticalAlignment(VerticalAlignment.TOP);
            newstyle.setAlignment(HorizontalAlignment.LEFT);
            newstyle.setFillForegroundColor(
                    new XSSFColor(new java.awt.Color(242, 245, 243), new DefaultIndexedColorMap()));
            newstyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        }
        return newstyle;
    }

    private XSSFCellStyle getRedHeaderStyle(XSSFWorkbook workbook) {
        XSSFCellStyle newstyle = workbook.createCellStyle();
        newstyle.setBorderTop(BorderStyle.THIN);
        newstyle.setBorderLeft(BorderStyle.THIN);
        newstyle.setBorderRight(BorderStyle.THIN);
        newstyle.setBorderBottom(BorderStyle.THIN);
        newstyle.setTopBorderColor(IndexedColors.BLACK.getIndex());
        newstyle.setLeftBorderColor(IndexedColors.BLACK.getIndex());
        newstyle.setRightBorderColor(IndexedColors.BLACK.getIndex());
        newstyle.setBottomBorderColor(IndexedColors.BLACK.getIndex());
        newstyle.setWrapText(true);
        newstyle.setVerticalAlignment(VerticalAlignment.TOP);
        newstyle.setAlignment(HorizontalAlignment.CENTER);
        newstyle.setFillForegroundColor(new XSSFColor(new java.awt.Color(242, 245, 243), new DefaultIndexedColorMap()));
        newstyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Font newFont = workbook.createFont();
        newFont.setBold(true);
        newFont.setColor(IndexedColors.RED.getIndex());
        newstyle.setFont(newFont);
        return newstyle;
    }

    private static Cell addCell(Row row, Cell cell, XSSFCellStyle style, int count, String value) {
        cell = row.createCell(count);
        cell.setCellValue(value);
        cell.setCellStyle(style);
        return cell;
    }

    public String drawImage(ExecutionContext context, XSSFWorkbook workbook, XSSFSheet summarySheet) {
        InputStream inputStream = null;
        // Get file from resources folder
        ClassLoader classLoader = (new GenerateExcelReport()).getClass().getClassLoader();
        inputStream = classLoader.getResourceAsStream("headerLogo.png");
        if (inputStream == null) {
            try {
                throw new Exception("Cannot find header logo.png");
            } catch (Exception e) {
                context.getLogger().severe("Caught Exception: " + e.getMessage());
            }
        }
        // Get the contents of an InputStream as a byte[].
        byte[] bytes = null;
        try {
            bytes = IOUtils.toByteArray(inputStream);
        } catch (IOException e) {
            context.getLogger().severe("Failed parse image path: " + e.getMessage());
        }
        // Adds a picture to the workbook
        int pictureIdx = workbook.addPicture(bytes, Workbook.PICTURE_TYPE_PNG);
        // close the input stream
        try {
            inputStream.close();
        } catch (IOException e) {
            context.getLogger().severe("Failed parse image path: " + e.getMessage());
        }
        // Returns an object that handles instantiating concrete classes
        CreationHelper helper = workbook.getCreationHelper();
        // Creates the top-level drawing patriarch.
        Drawing drawing = summarySheet.createDrawingPatriarch();
        // Create an anchor that is attached to the worksheet
        ClientAnchor anchor = helper.createClientAnchor();
        anchor.setCol1(1); // Column A
        anchor.setRow1(0); // Row 1
        anchor.setCol2(3);
        anchor.setRow2(1);
        // Creates a picture
        Picture pict = drawing.createPicture(anchor, pictureIdx);
        // Reset the image to the original size
        pict.resize(1.0, 0.8);
        return pict.toString();

    }

    // Changing this order will impact the report

    private enum SUMMARY_REPORT_PARAMS {
        TOTAL("Test Cases Executed", "total"),
        PASSED("Passed", "passed"),
        FAILED("Failed", "failed"),
        START_DATE("Start Time", "startTime"),
        END_DATE("End Time", "endTime");

        private final String key;
        private final String value;

        SUMMARY_REPORT_PARAMS(String key, String value) {
            this.key = key;
            this.value = value;
        }
    }

    private enum ENDPOINT_REPORT_PARAMS {
        VENDOR("VENDOR", "vendor"),
        MODEL("MODEL", "model"),
        DID("DID", "did"),
        FIRMWARE_VERSION("FIRMWARE_VERSION", "firmwareVersion"),
        SERVICE_PROVIDER("SERVICE_PROVIDER", "serviceProvider"),
        DOMAIN("DOMAIN", "domain"),
        CITY("CITY", "city"),
        STATE("STATE", "state"),
        COUNTRY("COUNTRY", "country"),
        ZIPCODE("ZIPCODE", "zipcode");

        private final String key;
        private final String value;

        ENDPOINT_REPORT_PARAMS(String key, String value) {
            this.key = key;
            this.value = value;
        }
    }

    private enum TEST_RESULTS_REPORT_PARAMS {
        TEST_CASE_NAME("testCaseName"),
        START_DATE("startTime"),
        END_DATE("endTime"),
        FROM_RESOURCE("from"),
        TO_RESOURCE("to"),
        OTHER_PARTIES("otherParties"),
        STATUS("status"),
        CALL_TYPE("callType"),
        ERROR_CATEGORY("errorCategory"),
        ERROR_REASON("errorReason");

        private final String value;

        TEST_RESULTS_REPORT_PARAMS(String value) {
            this.value = value;
        }
    }

}
