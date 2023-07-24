package ui.step_definitions;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import ui.pages.consumptions.Consumptions;
import ui.pages.customer.Customers;
import ui.pages.spotlight.Dashboard;
import ui.pages.spotlight.spotlightDashboard.DailyPage;
import ui.pages.spotlight.spotlightDashboard.GaugeChart;
import ui.pages.spotlight.spotlightDashboard.NetworkQualityCharts;
import java.util.List;
import java.util.Map;
import org.junit.Assert;
import ui.pages.Apps;
public class SpotlightDetailedReportsSteps {
    Customers customers;
    Dashboard spotlightDashboard;
    DailyPage dailyPage;
    GaugeChart gaugeChart;
    NetworkQualityCharts networkQualityCharts;
    String customerName, subaccountName;
    Apps apps;
    Consumptions consumptions;
    
    public SpotlightDetailedReportsSteps(Apps apps, Consumptions consumptions) {
        this.apps = apps;
        this.consumptions = consumptions;
    }

    @Then("I should see the {string} subtitle")
    public void iShouldSeeTheSubTitle(String appTitle) {
        this.apps.changeWindowToDetailedReport();
        String actualTitle = this.apps.getSubTitle();
        Assert.assertEquals("View doesn't have this title: " + appTitle, appTitle, actualTitle);
    } 

    @Then ("I should see the summary table with the following data")
    public void iShouldSeeTheFollowingDataInTheSummaryTable(DataTable dataTable){
        Map<String, String> data = dataTable.asMap(String.class, String.class);
        String expectedTestCases = data.get("Test Cases Executed");
        String expectedPassed = data.get("Passed");
        String expectedFailed = data.get("Failed");
        String expectedStartTime = data.get("Start Time");
        String expectedEndTime = data.get("End Time");
        String testCases = this.consumptions.getTableValue("summary-table", "Test Cases Executed", 1);
        String passed = this.consumptions.getTableValue("summary-table", "Passed", 2);
        String failed = this.consumptions.getTableValue("summary-table", "Failed", 3);
        String startTime = this.consumptions.getTableValue("summary-table", "Start Time", 4);
        String endTime = this.consumptions.getTableValue("summary-table", "End Time", 5);
        Assert.assertEquals(expectedTestCases, testCases);
        Assert.assertEquals(expectedPassed, passed);
        Assert.assertEquals(expectedFailed, failed);
        Assert.assertEquals(expectedStartTime, startTime);
        Assert.assertEquals(expectedEndTime, endTime);
    }

    @Then ("I should see the Endpoint Resources table with the following regions")
    public void iShouldSeeTheFollowingDataInTheResourcesTable(DataTable dataTable){
        List<String> data = dataTable.asList(String.class);
        String value;
        int index = 0;
        for (String expectedValue : data) {
            expectedValue = data.get(index);
            value = this.consumptions.getTableValueByTitle("endpoint-resources-table", expectedValue);
            index++;
            Assert.assertEquals(expectedValue, value);
        }
    }

    @Then ("I should see the Details table with the following columns")
    public void iShouldSeeTheFollowingColumnsInTheDetailsTable(DataTable dataTable){
        String actualTitle = this.apps.getSubTitle();
        List<String> data = dataTable.asList(String.class);
        String value;
        int index = 0;
        for (String expectedValue : data) {
            expectedValue = data.get(index);
            value = this.consumptions.getColumnValue(actualTitle + " Details", expectedValue + " Column");
            index++;
            Assert.assertEquals(expectedValue, value);
        }
    }

    @Then ("I should see the Details table with the following data")
    public void iShouldSeeTheFollowingDataInTheDetailsTable(DataTable dataTable){
        String tableNane = this.apps.getSubTitle() + " Details";
        Map<String, String> data = dataTable.asMap(String.class, String.class);
        String expectedTestCases = data.get("Test Case");
        String expectedStartDate = data.get("Start Date");
        String expectedFrom = data.get("From");
        String expectedFromPOLQA = data.get("From POLQA");
        String expectedTo = data.get("To");
        String expectedToPOLQA = data.get("To POLQA");
        String expectedStatus = data.get("Status");
        String expectedCallType = data.get("Call Type");
        String testCases = this.consumptions.getMatSpanValue(tableNane, expectedTestCases);
        String startDate = this.consumptions.getMatPanelValue(tableNane, expectedStartDate);
        String from = this.consumptions.getMatPanelValue(tableNane, expectedFrom);
        String fromPOLQA = this.consumptions.getMatPanelValue(tableNane, "AVGFrom");
        String to = this.consumptions.getMatPanelValue(tableNane, expectedTo);
        String toPOLQA = this.consumptions.getMatPanelValue(tableNane, "AVGTo");
        String status = this.consumptions.getMatPanelValue(tableNane, expectedStatus);
        String callType = this.consumptions.getMatPanelValue(tableNane, expectedCallType);
        Assert.assertEquals(expectedTestCases, testCases);
        Assert.assertEquals(expectedStartDate, startDate);
        Assert.assertEquals(expectedFrom, from);
        Assert.assertEquals(expectedFromPOLQA, fromPOLQA);
        Assert.assertEquals(expectedTo, to);
        Assert.assertEquals(expectedToPOLQA, toPOLQA);
        Assert.assertEquals(expectedStatus, status);
        Assert.assertEquals(expectedCallType, callType);
    }

    @And("I click on a dot for the {string} metric")
    public void iClickOnADot(String metric){
        this.networkQualityCharts = new NetworkQualityCharts();
        this.networkQualityCharts.clickOnPolqaChartValue(metric);
    }
    @And("I close all tabs but the current one")
    public void iCloseAllTabsButOne(){
        this.apps.closeAllTabsButOne();
    }

    @Then ("I should see the detailed row table with the following data")
    public void iShouldSeeTheFollowingDataInTheDetailedRow(DataTable dataTable){
        Map<String, String> data = dataTable.asMap(String.class, String.class);
        String expectedStartDate = data.get("Start Date");
        String expectedEndDate = data.get("End Date");
        String expectedStatus = data.get("Status");
        String expectedCallType = data.get("Call Type");
        String expectedErrorCategory = data.get("Error Category");
        String expectedReason = data.get("Reason");
        String expectedFromJitter = data.get("From Jitter (ms)");
        String expectedToJitter = data.get("To Jitter (ms)");
        String expectedFromRoundTrip = data.get("From Round trip time (ms)");
        String expectedToRoundTrip = data.get("To Round trip time (ms)");
        String expectedFromPacketLoss = data.get("From Packet Loss (%)");
        String expectedToPacketLoss = data.get("To Packet Loss (%)");
        String expectedFromBitrate = data.get("From Bitrate (kbps)");
        String expectedToBitrate = data.get("To Bitrate (kbps)");
        String startDate = this.consumptions.getTableValueByTitle("detailed-row", "Start Date");
        String endDate = this.consumptions.getTableValueByTitle("detailed-row", "End Date");
        String status = this.consumptions.getTableValueByTitle("detailed-row", "Status");
        String callType = this.consumptions.getTableValueByTitle("detailed-row", "Call Type");
        String errorCategory = this.consumptions.getTableValueByTitle("detailed-row", "Error Category");
        String reason = this.consumptions.getTableValueByTitle("detailed-row", "Reason");
        String fromJitter = this.consumptions.getTableValueByTitle("detailed-row", "From Jitter (ms)");
        String toJitter = this.consumptions.getTableValueByTitle("detailed-row", "To Jitter (ms)");
        String fromRoundTrip = this.consumptions.getTableValueByTitle("detailed-row", "From Round trip time (ms)");
        String toRoundTrip = this.consumptions.getTableValueByTitle("detailed-row", "To Round trip time (ms)");
        String fromPacketLoss = this.consumptions.getTableValueByTitle("detailed-row", "From Packet Loss (%)");
        String toPacketLoss = this.consumptions.getTableValueByTitle("detailed-row", "To Packet Loss (%)");
        String fromBitrate = this.consumptions.getTableValueByTitle("detailed-row", "From Bitrate (kbps)");
        String toBitrate = this.consumptions.getTableValueByTitle("detailed-row", "To Bitrate (kbps)");
        Assert.assertEquals(expectedStartDate, startDate);
        Assert.assertEquals(expectedEndDate, endDate);
        Assert.assertEquals(expectedStatus, status);
        Assert.assertEquals(expectedCallType, callType);
        Assert.assertEquals(expectedErrorCategory, errorCategory);
        Assert.assertEquals(expectedReason, reason);
        Assert.assertEquals(expectedFromJitter, fromJitter);
        Assert.assertEquals(expectedToJitter, toJitter);
        Assert.assertEquals(expectedFromRoundTrip, fromRoundTrip);
        Assert.assertEquals(expectedToRoundTrip, toRoundTrip);
        Assert.assertEquals(expectedFromPacketLoss, fromPacketLoss);
        Assert.assertEquals(expectedToPacketLoss, toPacketLoss);
        Assert.assertEquals(expectedFromBitrate, fromBitrate);
        Assert.assertEquals(expectedToBitrate, toBitrate);
    }

    @And ("I should see the following data in the DID section")
    public void iShouldSeeTheFollowingDataInTheDID(DataTable dataTable){
        Map<String, String> data = dataTable.asMap(String.class, String.class);
        String expectedTestCases = data.get("From");
        String expectedPassed = data.get("To");
        String testCases = this.consumptions.getDIDValue("DIDdetail","DIDFrom", "from");
        String passed = this.consumptions.getDIDValue("DIDdetail","DIDTo", "to");
        Assert.assertEquals(expectedTestCases, testCases);
        Assert.assertEquals(expectedPassed, passed);

    }

    
    @And ("I should see the DID {string} table with the following data")
    public void iShouldSeeTheFollowingDID(String location, DataTable dataTable){
        Map<String, String> data = dataTable.asMap(String.class, String.class);
        String expectedSentPackets = data.get("Sent packets");
        String expectedReceivedCodec = data.get("Received codec");
        String expectedSetBitrate = data.get("Sent bitrate");
        String expectedReceivedPacketsLoss = data.get("Received packet loss");
        String expectedReceivedJitter = data.get("Received Jitter");
        String expectedSetCodec = data.get("Sent codec");
        String expectedRoundTripTime = data.get("Round trip time");
        String expectedReceivedPackets = data.get("Received packets");
        String expectedPOLQA = data.get("POLQA");
        String startDate = this.consumptions.getDIDTableData(location+"DIDTable", "Sent packets");
        String endDate = this.consumptions.getDIDTableData(location+"DIDTable", "Received codec");
        String status = this.consumptions.getDIDTableData(location+"DIDTable", "Sent bitrate");
        String callType = this.consumptions.getDIDTableData(location+"DIDTable", "Received packet loss");
        String errorCategory = this.consumptions.getDIDTableData(location+"DIDTable", "Received Jitter");
        String reason = this.consumptions.getDIDTableData(location+"DIDTable", "Sent codec");
        String fromJitter = this.consumptions.getDIDTableData(location+"DIDTable", "Round trip time");
        String toJitter = this.consumptions.getDIDTableData(location+"DIDTable", "Received packets");
        String fromRoundTrip = this.consumptions.getDIDTableData(location+"DIDTable", "POLQA");
        Assert.assertEquals(expectedSentPackets, startDate);
        Assert.assertEquals(expectedReceivedCodec, endDate);
        Assert.assertEquals(expectedSetBitrate, status);
        Assert.assertEquals(expectedReceivedPacketsLoss, callType);
        Assert.assertEquals(expectedReceivedJitter, errorCategory);
        Assert.assertEquals(expectedSetCodec, reason);
        Assert.assertEquals(expectedRoundTripTime, fromJitter);
        Assert.assertEquals(expectedReceivedPackets, toJitter);
        Assert.assertEquals(expectedPOLQA, fromRoundTrip);
    }
}
   