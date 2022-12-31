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
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class GenerateExcelReport {
    private static final GenerateExcelReport instance = new GenerateExcelReport();

    public static GenerateExcelReport getInstance() {
        return instance;
    }


    public XSSFWorkbook generateRunReport(ExecutionContext context, JSONObject jsonObject) {
        context.getLogger().info("Creating Xss Workbook");
        XSSFWorkbook workbook = new XSSFWorkbook();

//        response.setContentType("application/vnd.openxml");
//
//        response.setHeader("Cache-Control", "public");
//        response.setContentType("application/vnd.ms-excel");
//        response.setHeader("Content-disposition", "attachment; filename=\"" + fileName + ".xlsx" + "\"");
        try {
            context.getLogger().info("Before Creating Summary Sheet");
            if (jsonObject != null) {
                this.createRunSummarySheet(context, workbook, jsonObject);
                context.getLogger().info("Writing report into OutputStream");
                return workbook;
            }
            return null;
        } catch (Exception e) {
            context.getLogger().severe("Caught Exception: " + e);
        }
        return null;
    }

    //Summary Sheet
    public void createRunSummarySheet(ExecutionContext context, XSSFWorkbook workbook, JSONObject jsonObject) {

        Row row = null;
        Cell cell = null;
        int index = 0;
        int count = 0;
        context.getLogger().info("Creating Summary sheet");
        XSSFSheet summarySheet = workbook.createSheet("Summary");
        summarySheet.setDefaultColumnWidth(16);
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("A1:F1"));
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("A2:F2"));
        context.getLogger().info("Setting title styles");
        XSSFCellStyle titleStyle = this.getStyle(context, workbook, true);
        titleStyle.setAlignment(HorizontalAlignment.CENTER);
        XSSFCellStyle imageStyle = this.getImageStyle(workbook, false);

        row = summarySheet.createRow(index++);
        row.setHeightInPoints((float) 50.0);
        drawImage(workbook, summarySheet);
        addCell(row, cell, imageStyle, count++, "");

        count = 0;
        index = 1;
        row = summarySheet.createRow(index++);
        row.setHeightInPoints((float) 20.0);
        addCell(row, cell, titleStyle, count++, "Summary of Test Execution");

        summarySheet.addMergedRegion(CellRangeAddress.valueOf("B3:F3"));
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("B4:F4"));
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("B5:F5"));
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("B6:F6"));
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("B7:F7"));
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("B8:F8"));
        // summarySheet.addMergedRegion(CellRangeAddress.valueOf("B9:F9"));
        // summarySheet.addMergedRegion(CellRangeAddress.valueOf("B10:F10"));
        // summarySheet.addMergedRegion(CellRangeAddress.valueOf("B11:F11"));
        // summarySheet.addMergedRegion(CellRangeAddress.valueOf("B12:F12"));
        XSSFCellStyle whiteUnboldLabel = this.getStyle(context, workbook, false);
        XSSFCellStyle whiteLabel = this.getStyle(context, workbook, true);
        XSSFCellStyle blackLabel = this.getStyle(context, workbook, false);
        Font blackFontHeader = workbook.createFont();
        blackFontHeader.setBold(true);
        blackLabel.setFont(blackFontHeader);
        context.getLogger().info("Adding Summary response to the rows");
        JSONObject summaryResponse = (JSONObject) jsonObject.get("summary");
        createRunSummaryRow(index++, summarySheet, whiteLabel, blackLabel, "Test Cases Executed", summaryResponse.get("total").toString());
        createRunSummaryRow(index++, summarySheet, whiteLabel, blackLabel, "Passed", summaryResponse.get("passed").toString());
        createRunSummaryRow(index++, summarySheet, whiteLabel, blackLabel, "Failed", summaryResponse.get("failed").toString());
        createRunSummaryRow(index++, summarySheet, whiteLabel, blackLabel, "Start Time", summaryResponse.get("startTime").toString());
        createRunSummaryRow(index++, summarySheet, whiteLabel, blackLabel, "End Time", summaryResponse.get("endTime").toString());
        context.getLogger().info("Creating Endpoint Resources Table in Report");
        //To Create Endpoint Resources Table in Report
        getEndpointResourcesForRunReport(context, summarySheet, row, cell, blackLabel, whiteLabel, whiteUnboldLabel, index, jsonObject);
    }

    private void createRunSummaryRow(int index, XSSFSheet workSheet, XSSFCellStyle whiteLabel, XSSFCellStyle blackLabel, String key, String value) {
        Row row = workSheet.createRow(index);
        addCell(row, null, whiteLabel, 0, key);
        addCell(row, null, blackLabel, 1, value);
        addCell(row, null, blackLabel, 2, null);
        addCell(row, null, blackLabel, 3, null);
        addCell(row, null, blackLabel, 4, null);
        addCell(row, null, blackLabel, 5, null);
    }

    private void getEndpointResourcesForRunReport(ExecutionContext context, XSSFSheet summarySheet, Row row, Cell cell, XSSFCellStyle blackLabel, XSSFCellStyle whiteLabel, XSSFCellStyle whiteUnboldStyle, int index, JSONObject jsonObject) {
        context.getLogger().info("Before Creating Endpoint Resources Table in Report");
        int count = 0;
        index++;

        row = summarySheet.createRow(index++);
        int num = row.getRowNum() + 1;
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("A" + num + ":" + "F" + num));
        whiteLabel.setAlignment(HorizontalAlignment.CENTER);
        addCell(row, cell, whiteLabel, count++, "EndPoint Resources");

        row = summarySheet.createRow(index++);
        int num1 = row.getRowNum() + 1;
        summarySheet.addMergedRegion(CellRangeAddress.valueOf("D" + num1 + ":" + "F" + num1));
        blackLabel.setAlignment(HorizontalAlignment.CENTER);
        count = 0;
        addCell(row, cell, blackLabel, count++, "End Point\nVendor / Model");
        addCell(row, cell, blackLabel, count++, "DID");
        addCell(row, cell, blackLabel, count++, "Firmware Version");
        addCell(row, cell, blackLabel, count++, null);
        addCell(row, cell, blackLabel, count++, null);
        //addCell(row, cell, blackLabel, count++, null);
        context.getLogger().info("Creating Endpoint Resources Table in Report");
        JSONArray endpointsResponse = (JSONArray) jsonObject.get("endpoints");
        for (int i = 0; i < endpointsResponse.length(); i++) {
            JSONObject endPointResource = (JSONObject) endpointsResponse.get(i);
            createEndPointDataRow(index++, summarySheet, blackLabel, whiteUnboldStyle, endPointResource);
        }

    }

    private void createEndPointDataRow(int index, XSSFSheet workSheet, XSSFCellStyle blackLabel, XSSFCellStyle whiteUnboldStyle, JSONObject endPointResource) {
        int count = 0;
        Row row = workSheet.createRow(index);
        int num = row.getRowNum() + 1;
        workSheet.addMergedRegion(CellRangeAddress.valueOf("D" + num + ":" + "F" + num));
        whiteUnboldStyle.setAlignment(HorizontalAlignment.CENTER);

        addCell(row, null, blackLabel, count++, (String) endPointResource.get("vendor") + " / " + (String) endPointResource.get("model"));
        addCell(row, null, whiteUnboldStyle, count++, (String) endPointResource.get("did"));
        addCell(row, null, whiteUnboldStyle, count++, (String) endPointResource.get("firmwareVersion"));
        addCell(row, null, whiteUnboldStyle, count++, null);
        addCell(row, null, whiteUnboldStyle, count++, null);
        //addCell(row, null, whiteUnboldStyle, count++, null);
    }

    public void createRunIterationSheets(ExecutionContext context, XSSFWorkbook workbook, JSONObject jsonObject, org.apache.logging.log4j.Logger applicationLogger, String fileName) {
        applicationLogger.info("Creating Test result sheet. ");
        XSSFSheet testCaseIterationSheet = null;
        int count = 0;
        int index = 0;
        Row row = null;
        Cell cell = null;
        XSSFCellStyle whiteLabel = this.getStyle(context, workbook, true);
        XSSFCellStyle blackLabel = this.getStyle(context, workbook, false);
        XSSFCellStyle redLabel = this.getRedHeaderStyle(workbook);
        XSSFCellStyle imageStyle = this.getImageStyle(workbook, false);
        Font newFont = workbook.createFont();
        newFont.setBold(true);
        JSONArray testResult = (JSONArray) jsonObject.get("featureFunctionality") == null ? (JSONArray) jsonObject.get("callReliability") : (JSONArray) jsonObject.get("featureFunctionality");
        for (int i = 1; i <= testResult.length(); i++) {
            count = 0;
            index = 0;
            row = null;
            cell = null;
            testCaseIterationSheet.addMergedRegion(CellRangeAddress.valueOf("A1:F1"));
            row = testCaseIterationSheet.createRow(index++);
            row.setHeightInPoints((float) 65.0);
            drawImage(workbook, testCaseIterationSheet);
            addCell(row, cell, imageStyle, count++, "");
            count = 0;
            row = testCaseIterationSheet.createRow(index++);
            for (String header : iterationTestResultHeaders) {
                cell = addCell(row, cell, whiteLabel, count++, header);
            }
            JSONObject testResultResponse = (JSONObject) testResult.get(i);
            createTestResultDataRow(index++, testCaseIterationSheet, redLabel, testResultResponse);

        }
    }

    private void createTestResultDataRow(int index, XSSFSheet workSheet, XSSFCellStyle cellStyle, JSONObject testResultResponse) {
        int count = 0;
        Row row = workSheet.createRow(index);
        addCell(row, null, cellStyle, count++, (String) testResultResponse.get("testCaseName"));

        addCell(row, null, cellStyle, count++, (String) testResultResponse.get("startTime"));
        addCell(row, null, cellStyle, count++, (String) testResultResponse.get("endTime"));
        addCell(row, null, cellStyle, count++, (String) testResultResponse.get("Status"));
        addCell(row, null, cellStyle, count++, (String) testResultResponse.get("From"));
        addCell(row, null, cellStyle, count++, (String) testResultResponse.get("To"));
        addCell(row, null, cellStyle, count++, (String) testResultResponse.get("otherParties"));
        addCell(row, null, cellStyle, count++, (String) testResultResponse.get("errorCategory"));
        addCell(row, null, cellStyle, count++, (String) testResultResponse.get("errorReason"));
    }


    private XSSFCellStyle getImageStyle(XSSFWorkbook workbook, boolean isHeader) {
        XSSFCellStyle newstyle = workbook.createCellStyle(); // style for normal lines of Summary
//        newstyle.setFillForegroundColor(new XSSFColor(new java.awt.Color(255, 255, 255)));
        newstyle.setFillForegroundColor(new XSSFColor(new java.awt.Color(255, 255, 255), new DefaultIndexedColorMap()));

        newstyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        newstyle.setBorderRight(BorderStyle.THICK);
        return newstyle;
    }

    private XSSFCellStyle getStyle(ExecutionContext context, XSSFWorkbook workbook, boolean isHeader) {
        context.getLogger().info("Creating Cell styles");
        XSSFCellStyle newstyle = workbook.createCellStyle(); // style for normal lines of Summary
        if (isHeader) {
            context.getLogger().info("Set Header styles");
            newstyle.setBorderTop(BorderStyle.THIN);
            newstyle.setBorderRight(BorderStyle.THIN);
            newstyle.setTopBorderColor(IndexedColors.BLACK.getIndex());
            newstyle.setRightBorderColor(IndexedColors.BLACK.getIndex());
            newstyle.setWrapText(true);
            newstyle.setVerticalAlignment(VerticalAlignment.TOP);
            newstyle.setAlignment(HorizontalAlignment.LEFT);
//            newstyle.setFillForegroundColor(new XSSFColor(new java.awt.Color(0, 0, 102)));
            newstyle.setFillForegroundColor(new XSSFColor(new java.awt.Color(0, 0, 102), new DefaultIndexedColorMap()));

            newstyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font newFont = workbook.createFont();
            newFont.setBold(true);
            newFont.setColor(IndexedColors.WHITE.getIndex());
            newstyle.setFont(newFont);
        } else {
            context.getLogger().info("Set Body styles");
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
//            newstyle.setFillForegroundColor(new XSSFColor(new java.awt.Color(242, 245, 243)));
            newstyle.setFillForegroundColor(new XSSFColor(new java.awt.Color(242, 245, 243), new DefaultIndexedColorMap()));
            newstyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            //newstyle.setBorderRight(BorderStyle.NONE);
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
//        newstyle.setFillForegroundColor(new XSSFColor(new java.awt.Color(242, 245, 243)));
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

    private static Cell addCell(Row row, Cell cell, XSSFCellStyle style, int count, long value) {
        cell = row.createCell(count);
        cell.setCellValue(value);
        cell.setCellStyle(style);
        return cell;
    }

    public String drawImage(XSSFWorkbook workbook, XSSFSheet summarySheet) {
        InputStream inputStream = null;
        //Get file from resources folder
        ClassLoader classLoader = (new GenerateExcelReport()).getClass().getClassLoader();
        inputStream = classLoader.getResourceAsStream("headerLogo.png");
        if (inputStream == null) {
            try {
               throw new Exception("Cannot find file ");
            } catch (Exception e) {
//                applicationLogger.error(" Failed to get the image path - " + e.getMessage());
            }
        }
        //Get the contents of an InputStream as a byte[].
        byte[] bytes = null;
        try {
            bytes = IOUtils.toByteArray(inputStream);
        } catch (IOException e) {
//            applicationLogger.error(" Failed parse input streem of image path  - " + e.getMessage());
        }
        //Adds a picture to the workbook
        int pictureIdx = workbook.addPicture(bytes, Workbook.PICTURE_TYPE_PNG);
        //close the input stream
        try {
            inputStream.close();
        } catch (IOException e) {
//            applicationLogger.error(" Failed parse input streem of image path  - " + e.getMessage());
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
        //pict.resize(0.8, 0.5);
        pict.resize(1.0, 0.8);
        return pict.toString();

    }

    private String getDurationOfProjectRun(Date endDate, Date startDate) {

        String timeDuration = "";
        SimpleDateFormat format = new SimpleDateFormat("yyyy-mm-dd HH:mm:ss");
        Date d1 = null;
        Date d2 = null;
        if (endDate == null)
            return "0";
        try {
            d1 = format.parse(startDate.toString());
            d2 = format.parse(endDate.toString());

            //in milliseconds
            long diff = d2.getTime() - d1.getTime();

            long diffSeconds = diff / 1000 % 60;
            long diffMinutes = diff / (60 * 1000) % 60;
            long diffHours = diff / (60 * 60 * 1000) % 24;
            //long diffDays = diff / (24 * 60 * 60 * 1000);
            if (diffHours > 0)
                timeDuration = diffHours + " hours " + diffMinutes + " minutes " + diffSeconds + " seconds";
            else
                timeDuration = diffMinutes + " minutes " + diffSeconds + " seconds";

            return timeDuration;
        } catch (ParseException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return null;
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

    public static void main(String[] args) {

    }
}
