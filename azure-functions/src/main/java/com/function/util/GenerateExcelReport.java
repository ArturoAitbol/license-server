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

public class GenerateExcelReport {
    private static final GenerateExcelReport instance = new GenerateExcelReport();

    public static GenerateExcelReport getInstance() {
        return instance;
    }


    private static List<String> iterationTestResultHeaders = new ArrayList<String>();

    static {
        iterationTestResultHeaders.add("Test Case");
        iterationTestResultHeaders.add("Start Time");
        iterationTestResultHeaders.add("End Time");
        iterationTestResultHeaders.add("From");
        iterationTestResultHeaders.add("To");
        iterationTestResultHeaders.add("Other parties");
        iterationTestResultHeaders.add("Status");
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
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("A1:D1"));
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("A2:D2"));

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

        summarySheet.addMergedRegion(CellRangeAddress.valueOf("B3:D3"));
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("B4:D4"));
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("B5:D5"));
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("B6:D6"));
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("B7:D7"));
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("B8:D8"));

        XSSFCellStyle redLabel = this.getRedHeaderStyle(workbook);

        XSSFCellStyle whiteUnboldLabel = this.getStyle(workbook, false);
        XSSFCellStyle whiteLabel = this.getStyle(workbook, true);
        XSSFCellStyle blackLabel = this.getStyle(workbook, false);
        Font blackFontHeader = workbook.createFont();
        blackFontHeader.setBold(true);
        blackLabel.setFont(blackFontHeader);
        JSONObject summaryResponse = (JSONObject) jsonObject.get("summary");
        final String total = summaryResponse.get("total") == null ? "" : summaryResponse.get("total").toString();
        final String passed = summaryResponse.get("passed") == null ? "" : summaryResponse.get("passed").toString();
        final String failed = summaryResponse.get("failed") == null ? "" : summaryResponse.get("failed").toString();
        final String startTime = summaryResponse.get("startTime") == null ? "" : summaryResponse.get("startTime").toString();
        final String endTime = summaryResponse.get("endTime") == null ? "" : summaryResponse.get("endTime").toString();

        createSpotlightSummaryRow(index++, summarySheet, whiteLabel, blackLabel, "Test Cases Executed", total);
        createSpotlightSummaryRow(index++, summarySheet, whiteLabel, blackLabel, "Passed", passed);
        createSpotlightSummaryRow(index++, summarySheet, whiteLabel, blackLabel, "Failed", failed);
        createSpotlightSummaryRow(index++, summarySheet, whiteLabel, blackLabel, "Start Time", startTime);
        createSpotlightSummaryRow(index++, summarySheet, whiteLabel, blackLabel, "End Time", endTime);

        getEndpointResources(context, summarySheet, row, cell, blackLabel, whiteLabel, redLabel, whiteUnboldLabel, index, jsonObject);

    }

    private void createSpotlightSummaryRow(int index, XSSFSheet workSheet, XSSFCellStyle whiteLabel, XSSFCellStyle blackLabel, String key, String value) {
        Row row = workSheet.createRow(index);
        addCell(row, null, whiteLabel, 0, key);
        addCell(row, null, blackLabel, 1, value);
        addCell(row, null, blackLabel, 2, null);
        addCell(row, null, blackLabel, 3, null);
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
    private void getEndpointResources(ExecutionContext context, XSSFSheet summarySheet, Row row, Cell cell, XSSFCellStyle blackLabel, XSSFCellStyle whiteLabel, XSSFCellStyle redLabel, XSSFCellStyle whiteUnboldStyle, int index, JSONObject jsonObject) {
        context.getLogger().info("Generating Endpoint Resources for Run Report");
        int count = 0;
        index++;

        row = summarySheet.createRow(index++);
        int num = row.getRowNum() + 1;
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("A" + num + ":" + "D" + num));
        whiteLabel.setAlignment(HorizontalAlignment.CENTER);
        addCell(row, cell, whiteLabel, count++, "EndPoint Resources");

        row = summarySheet.createRow(index++);
        int num1 = row.getRowNum() + 1;
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("C" + num1 + ":" + "D" + num1));
        blackLabel.setAlignment(HorizontalAlignment.CENTER);
        count = 0;
        addCell(row, cell, blackLabel, count++, "Vendor / Model");
        addCell(row, cell, blackLabel, count++, "DID");
        addCell(row, cell, blackLabel, count++, "Firmware Version");
        addCell(row, cell, blackLabel, count++, null);
        //addCell(row, cell, blackLabel,count++, null);

        JSONArray endpointsResponse = (JSONArray) jsonObject.get("endpoints");
        for (int i = 0; i < endpointsResponse.length(); i++) {
            JSONObject endPointResource = (JSONObject) endpointsResponse.get(i);
            generateEndpointsReport(context, index++, summarySheet, blackLabel, whiteUnboldStyle, endPointResource);
        }

        //To Create Test Result Table in Report
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
     * @param jsonObject
     */
    private void generateTestReportByType(ExecutionContext context, XSSFSheet summarySheet, Row row, Cell cell, XSSFCellStyle blackLabel, XSSFCellStyle whiteLabel, XSSFCellStyle redLabel, int index, JSONObject jsonObject) {
        context.getLogger().info("Generating Test Cases Details Report");
        index++;
        int count = 0;
        row = summarySheet.createRow(index++);
        int columnnum = row.getRowNum() + 1;
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("A" + columnnum + ":" + "I" + columnnum));
        whiteLabel.setAlignment(HorizontalAlignment.CENTER);
        if ((JSONArray) jsonObject.get("featureFunctionality") != null)
            addCell(row, null, whiteLabel, count++, "Feature Functionality");
        else if ((JSONArray) jsonObject.get("callReliability") != null)
            addCell(row, null, whiteLabel, count++, "callReliability");

        count = 0;
        row = summarySheet.createRow(index++);
        for (String header : iterationTestResultHeaders) {
            cell = addCell(row, cell, whiteLabel, count++, header);
        }
        JSONArray testResult = (JSONArray) jsonObject.get("featureFunctionality") == null ? (JSONArray) jsonObject.get("callReliability") : (JSONArray) jsonObject.get("featureFunctionality");
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

    private void generateEndpointsReport(ExecutionContext context, int index, XSSFSheet workSheet, XSSFCellStyle blackLabel, XSSFCellStyle whiteUnboldStyle, JSONObject endPointResource) {
        context.getLogger().info("inside method of createEndPointDataRow. ");
        int count = 0;
        Row row = workSheet.createRow(index);
        int num = row.getRowNum() + 1;
        workSheet.addMergedRegion(CellRangeAddress.valueOf("C" + num + ":" + "D" + num));
        whiteUnboldStyle.setAlignment(HorizontalAlignment.CENTER);
        final String vendorName = endPointResource.get("vendor") == null ? "" : endPointResource.get("vendor").toString();
        final String modelName = endPointResource.get("model") == null ? "" : endPointResource.get("model").toString();
        final String did = endPointResource.get("did") == null ? "" : endPointResource.get("did").toString();
        final String firmwareVersion = endPointResource.get("firmwareVersion") == null ? "" : endPointResource.get("firmwareVersion").toString();

        addCell(row, null, blackLabel, count++, vendorName + " / " + modelName);
        addCell(row, null, whiteUnboldStyle, count++, did);
        addCell(row, null, whiteUnboldStyle, count++, firmwareVersion);
        addCell(row, null, whiteUnboldStyle, count++, null);
    }


    private void getIterationWiseTestResultsDetails(ExecutionContext context, int i, Cell cell, Row row, int index, int count, XSSFCellStyle cellStyle, JSONObject testResultResponse) {
        context.getLogger().info("Generating iteration wise run count details ");
        final String tcName = testResultResponse.get("testCaseName") == null ? "" : testResultResponse.get("testCaseName").toString();
        final String tcStartTime = testResultResponse.get("startTime") == null ? "" : testResultResponse.get("startTime").toString();
        final String tcEndTime = testResultResponse.get("endTime") == null ? "" : testResultResponse.get("endTime").toString();
        final String fromParticipant = testResultResponse.get("from") == null ? "" : testResultResponse.get("from").toString();
        final String toParticipant = testResultResponse.get("to") == null ? "" : testResultResponse.get("to").toString();
        final String otherParticipants = testResultResponse.get("otherParties") == null ? "" : testResultResponse.get("otherParties").toString();
        final String tcStatus = testResultResponse.get("status") == null ? "" : testResultResponse.get("status").toString();
        final String errorCategory = testResultResponse.get("errorCategory") == null ? "" : testResultResponse.get("errorCategory").toString();
        final String errorReason = testResultResponse.get("errorReason") == null ? "" : testResultResponse.get("errorReason").toString();

        addCell(row, cell, cellStyle, count++, tcName);
        addCell(row, cell, cellStyle, count++, tcStartTime);
        addCell(row, cell, cellStyle, count++, tcEndTime);
        addCell(row, cell, cellStyle, count++, fromParticipant);
        addCell(row, cell, cellStyle, count++, toParticipant);
        addCell(row, cell, cellStyle, count++, otherParticipants);
        addCell(row, cell, cellStyle, count++, tcStatus);
        addCell(row, cell, cellStyle, count++, errorCategory);
        addCell(row, cell, cellStyle, count++, errorReason);
        index++;
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
            newstyle.setFillForegroundColor(new XSSFColor(new java.awt.Color(0, 0, 102), new DefaultIndexedColorMap()));
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
            newstyle.setFillForegroundColor(new XSSFColor(new java.awt.Color(242, 245, 243), new DefaultIndexedColorMap()));
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
        newstyle.setAlignment(HorizontalAlignment.LEFT);
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
        //Get file from resources folder
        ClassLoader classLoader = (new GenerateExcelReport()).getClass().getClassLoader();
        inputStream = classLoader.getResourceAsStream("headerLogo.png");
        if (inputStream == null) {
            try {
                throw new Exception("Cannot find header logo.png");
            } catch (Exception e) {
                context.getLogger().severe("Caught Exception: " + e.getMessage());
            }
        }
        //Get the contents of an InputStream as a byte[].
        byte[] bytes = null;
        try {
            bytes = IOUtils.toByteArray(inputStream);
        } catch (IOException e) {
            context.getLogger().severe("Failed parse image path: " + e.getMessage());
        }
        //Adds a picture to the workbook
        int pictureIdx = workbook.addPicture(bytes, Workbook.PICTURE_TYPE_PNG);
        //close the input stream
        try {
            inputStream.close();
        } catch (IOException e) {
            context.getLogger().severe("Failed parse image path: " + e.getMessage());
        }
        //Returns an object that handles instantiating concrete classes
        CreationHelper helper = workbook.getCreationHelper();
        //Creates the top-level drawing patriarch.
        Drawing drawing = summarySheet.createDrawingPatriarch();
        //Create an anchor that is attached to the worksheet
        ClientAnchor anchor = helper.createClientAnchor();
        anchor.setCol1(0); //Column A
        anchor.setRow1(0); //Row 1
        anchor.setCol2(1);
        anchor.setRow2(1);
        //Creates a picture
        Picture pict = drawing.createPicture(anchor, pictureIdx);
        //Reset the image to the original size
        pict.resize(1.0, 0.8);
        return pict.toString();

    }
}