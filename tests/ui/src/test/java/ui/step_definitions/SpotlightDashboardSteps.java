package ui.step_definitions;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import ui.pages.ActionMenu;
import ui.pages.SideBar;
import ui.pages.customer.CustomerRow;
import ui.pages.customer.Customers;
import ui.pages.spotlight.Dashboard;
import ui.pages.spotlight.spotlightDashboard.DailyPage;
import ui.pages.spotlight.spotlightDashboard.GaugeChart;
import ui.pages.spotlight.spotlightDashboard.NetworkQualityCharts;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.*;

public class SpotlightDashboardSteps {
    Customers customers;
    Dashboard spotlightDashboard;
    DailyPage dailyPage;
    GaugeChart gaugeChart;
    NetworkQualityCharts networkQualityCharts;
    String customerName, subaccountName;

    public SpotlightDashboardSteps(Customers customers) {
        this.customers = customers;
    }

    @And("I go to the spotlight dashboard for {string}")
    public void iGoToTheSpotlightDashboardViewFor(String customerName) {
        CustomerRow customerRow = this.customers.getCustomer(customerName);
        ActionMenu actionMenu = customerRow.openActionMenu();
        this.spotlightDashboard = actionMenu.goToSpotlightDashboard();
    }

    @Given("I go to the spotlight dashboard of subaccount {string} of customer {string}")
    public void iGoToTheSpotlightDashboardOfSubaccountOfCustomer(String subaccountName, String customerName) {
        this.subaccountName = subaccountName;
        this.customerName = customerName;
        CustomerRow customerRow = this.customers.getCustomerSubaccount(customerName, subaccountName);
        ActionMenu actionMenu = customerRow.openActionMenu();
        this.spotlightDashboard = actionMenu.goToSpotlightDashboard();
        this.spotlightDashboard.waitForDashboardToLoad();
    }


    @And("I go to the spotlight {string} tab")
    public void iGoToTheSpotlightRequiredTab(String tabName) {
        SideBar sideBar = new SideBar();
        sideBar.clickOnOption(tabName);
        if (tabName.equals("Configuration"))
        {
            System.out.println("Wait configuration");
            sideBar.waitSpinner();
        }
    }

    @And("I see the dashboard tab is fully loaded in the {string} report page")
    public void iSeeTheDashboardTabIsFullyLoadedInTheRequiredReportPage(String reportType) {
        String currentReportPage = this.spotlightDashboard.getReportType();
        assertEquals("Dashboard was not loaded correctly in the".concat(reportType).concat(" report page"),reportType,currentReportPage);
        if(reportType.equals("Daily")) this.dailyPage = new DailyPage();
        this.networkQualityCharts = new NetworkQualityCharts();
    }

    @And("I change the selected value to {string} in the Network Quality Section")
    public void iChangeTheSelectedValueInTheNetworkQualitySection(String selectedValue){
        this.networkQualityCharts.changeTheSelectedValue(selectedValue);
    }

    @Then("I should see the {string} chart with the following data")
    public void iShouldSeeTheRequiredChartWithTheFollowingData(String reportTypeId, DataTable dataTable) {
        Map<String, String> expectedValues = dataTable.asMap(String.class, String.class);

        this.gaugeChart = new GaugeChart(reportTypeId);
        String passedCallsPercentage = this.gaugeChart.getPassedCallsPercentage();
        assertEquals(expectedValues.get("percentageValue"),passedCallsPercentage);

        Map<String,Integer> callsSummaryInfo = this.gaugeChart.getCallsSummaryInfo();
        int expectedNumberOfCalls = Integer.parseInt(expectedValues.get("numberOfCalls"));
        int expectedP2P = Integer.parseInt(expectedValues.get("p2p"));
        int expectedOnNet = Integer.parseInt(expectedValues.get("onNet"));
        int expectedOffNet = Integer.parseInt(expectedValues.get("offNet"));

        assertEquals(expectedNumberOfCalls,callsSummaryInfo.get("Number of calls").intValue());
        assertEquals(expectedP2P,callsSummaryInfo.get("P2P").intValue());
        assertEquals(expectedOnNet,callsSummaryInfo.get("On-net").intValue());
        assertEquals(expectedOffNet,callsSummaryInfo.get("Off-net").intValue());

        int numberOfCalls = callsSummaryInfo.get("Number of calls");
        int sumOfCallTypes = expectedP2P + expectedOnNet + expectedOffNet;
        assertEquals(numberOfCalls,sumOfCallTypes);

        String chartLabel = this.gaugeChart.getChartLabel();
        assertEquals(expectedValues.get("dataLabel"), chartLabel);
    }

    @Then("I should see the Failed Calls chart with the following data")
    public void iShouldSeeTheFailedCallsChartWithTheFollowingData(DataTable dataTable){
        Map<String, String> expectedValues = dataTable.asMap(String.class,String.class);

        String failedCallsPercentage = this.dailyPage.getFailedCallsPercentage();
        assertEquals(expectedValues.get("percentageValue"),failedCallsPercentage);

        String totalCalls = this.dailyPage.getTotalCalls();
        assertEquals(expectedValues.get("totalCalls"),totalCalls);

        String failedCalls = this.dailyPage.getFailedCalls();
        assertEquals(expectedValues.get("failedCalls"),failedCalls);
    }

    @And("I should see the Voice Quality chart with the following data")
    public void iShouldSeeTheVoiceQualityChartWithTheFollowingData(DataTable dataTable){
        Map<String, String> expectedValues = dataTable.asMap(String.class,String.class);

        List<String> dataLabels = this.dailyPage.getVoiceQualityDataLabels();
        assertEquals(expectedValues.get("excellent"),dataLabels.get(0));
        assertEquals(expectedValues.get("good"),dataLabels.get(1));
        assertEquals(expectedValues.get("fair"),dataLabels.get(2));
        assertEquals(expectedValues.get("poor"),dataLabels.get(3));

        Map<String,String> voiceQualityFooterText = this.dailyPage.getVoiceQualityFooterText();
        assertEquals(expectedValues.get("numberOfCallStreams"),voiceQualityFooterText.get("Number of call streams"));
        assertEquals(expectedValues.get("numberOfCalls"),voiceQualityFooterText.get("Number of calls"));
    }

    @And("I should see the Network Quality Summary with the following data")
    public void iShouldSeeTheRequiredNetworkQualitySummaryWithTheFollowingData(DataTable dataTable){
        Map<String, String> expectedValues = dataTable.asMap(String.class,String.class);
        String callsWithNetStats = this.networkQualityCharts.getCallsWithNetworkStats();
        HashMap<String,String> callsAboveThresholds = this.networkQualityCharts.getCallsAboveThresholdMetrics();
        HashMap<String,String> networkMetricsSummary = this.networkQualityCharts.getNetworkMetricsSummary();

        assertEquals(expectedValues.get("callsWithNetworkStats"),callsWithNetStats);

        assertEquals(expectedValues.get("jitterThreshold"),callsAboveThresholds.get("jitter"));
        assertEquals(expectedValues.get("packetLossThreshold"),callsAboveThresholds.get("packetLoss"));
        assertEquals(expectedValues.get("roundTripTimeThreshold"),callsAboveThresholds.get("roundTripTime"));

        assertEquals(expectedValues.get("packetLoss"),networkMetricsSummary.get("packetLoss"));
        assertEquals(expectedValues.get("jitter"),networkMetricsSummary.get("jitter"));
        assertEquals(expectedValues.get("roundTripTime"),networkMetricsSummary.get("roundTripTime"));
        assertEquals(expectedValues.get("polqa"),networkMetricsSummary.get("POLQA"));
        assertEquals(expectedValues.get("sentBitrate"),networkMetricsSummary.get("sentBitrate"));
    }

    @And("I should see the POLQA charts with the following data")
    public void iShouldSeeThePolqaChartWithTheFollowingData(DataTable dataTable){
        List<Map<String, String>> expectedValues = dataTable.asMaps(String.class, String.class);
        Map<String,Map<String, String>> polqaCallsMediaStats = this.networkQualityCharts.getPolqaChartValues();

        List<String> metrics = Arrays.asList("Min. POLQA","Avg. POLQA",
                                            "Max. Jitter","Avg. Jitter",
                                            "Max. Packet Loss","Avg. Packet Loss",
                                            "Max. Round Trip Time","Avg. Round Trip Time");

        for (Map<String, String> expectedValue : expectedValues) {
            for (String metric: metrics) {
                Map<String, String> values = polqaCallsMediaStats.getOrDefault(metric,null);

                String errorMessage = metric.concat(" Error ("+ expectedValue.get("Timelapse") + ")");
                assertNotNull(errorMessage,values);
                assertEquals(errorMessage,expectedValue.get(metric),values.getOrDefault(expectedValue.get("Timelapse"),"null"));
            }
        }
    }

    @And("I should see the Networks Trends Graphs with the following data")
    public void iShouldSeeTheNetworksTrendsWithTheFollowingData(DataTable dataTable){
        List<Map<String, String>> expectedValues = dataTable.asMaps(String.class, String.class);
        Map<String,Map<String, String>> networkTrendsGraphsValues = this.networkQualityCharts.getNetworkTrendsGraphsValues();

        List<String> metrics = Arrays.asList("Max. Packet Loss","Avg. Packet Loss",
                                            "Max. Jitter","Avg. Jitter",
                                            "Sent Bitrate",
                                            "Max. Round Trip Time","Avg. Round Trip Time");

        for (Map<String, String> expectedValue : expectedValues) {
            for (String metric: metrics) {
                Map<String, String> values = networkTrendsGraphsValues.getOrDefault(metric,null);

                String errorMessage = metric.concat(" Error ("+ expectedValue.get("Timelapse") + ")");
                assertNotNull(errorMessage,values);
                assertEquals(errorMessage,expectedValue.get(metric),values.get(expectedValue.get("Timelapse")));
            }
        }
    }

}
