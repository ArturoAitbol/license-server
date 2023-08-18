package ui.pages.spotlight.spotlightDashboard;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.FindBy;

import ui.core.AbstractPageObject;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class NetworkQualityCharts extends AbstractPageObject {

    @FindBy(css = "[id='callsWithNetStats']")
    WebElement callsWithNetStats;
    @FindBy(css = "#thresholds")
    WebElement thresholdsSection;
    @FindBy(css = "[id='jitterAboveThreshold']")
    WebElement jitterAboveThreshold;
    @FindBy(css = "[id='packetLossAboveThreshold']")
    WebElement packetLossAboveThreshold;
    @FindBy(css = "[id='roundTripTimeAboveThreshold']")
    WebElement roundTripTimeAboveThreshold;
    @FindBy(css = "#network-summary")
    WebElement networkSummarySection;
    @FindBy(css = "[id='packetLossValue']")
    WebElement packetLossValue;
    @FindBy(css = "[id='jitterValue']")
    WebElement jitterValue;
    @FindBy(css = "[id='roundTripTimeValue']")
    WebElement roundTripTimeValue;
    @FindBy(css = "[id='polqaValue']")
    WebElement polqaValue;
    @FindBy(css = "[id='sentBitrateValue']")
    WebElement sentBitrateValue;
    @FindBy(css = "#network-quality-title")
    WebElement networkQualityTitle;
    @FindBy(css = "#polqa-chart-titles")
    WebElement polqaChartTitles;
    @FindBy(css = "#networkTrendsTitle")
    WebElement networkTrendsTitle;
    @FindBy(css = "[formControlName='selectedValue']")
    WebElement selectedValuePicker;
    @FindBy(css = "#apply-network-filters-button")
    WebElement applyButton;

    By loadingSelector = By.cssSelector("figcaption.loadingMessage");

    public void changeTheSelectedValue(String selectedValue){
        this.action.scrollToElement(this.networkQualityTitle);
        By optionType = By.cssSelector(String.format("mat-option[title='%s']", selectedValue));
        this.action.selectOption(this.selectedValuePicker, optionType);
        this.action.click(applyButton);
        this.action.waitSpinner(this.loadingSelector);
    }

    public String getCallsWithNetworkStats(){
        this.action.waitVisibilityElement(this.callsWithNetStats);
        this.action.scrollToElement(this.callsWithNetStats);
        return this.callsWithNetStats.getText();
    }

    public HashMap<String,String> getCallsAboveThresholdMetrics(){
        this.action.scrollToElement(this.thresholdsSection);
        HashMap<String,String> callsAboveThresholds = new HashMap<>();
        callsAboveThresholds.put("jitter",jitterAboveThreshold.getText());
        callsAboveThresholds.put("packetLoss",packetLossAboveThreshold.getText());
        callsAboveThresholds.put("roundTripTime",roundTripTimeAboveThreshold.getText());
        return callsAboveThresholds;
    }

    public HashMap<String,String> getNetworkMetricsSummary(){
        this.action.scrollToElement(this.networkSummarySection);
        HashMap<String,String> networkMetricsSummary = new HashMap<>();
        networkMetricsSummary.put("packetLoss",packetLossValue.getText());
        networkMetricsSummary.put("jitter",jitterValue.getText());
        networkMetricsSummary.put("roundTripTime",roundTripTimeValue.getText());
        networkMetricsSummary.put("POLQA",polqaValue.getText());
        networkMetricsSummary.put("sentBitrate",sentBitrateValue.getText());
        return networkMetricsSummary;
    }

    public Map<String,Map<String, String>> getPolqaChartValues(){
        final String polqaChartXPath = "//div[@id=\"polqa-chart\"]/apx-chart";
        final String metricsChartsXPath = "//div[contains(@class,\"polqa-charts\")]";
        this.action.scrollToElement(polqaChartTitles);

        By xpathSelector = By.xpath(polqaChartXPath.concat("//*[@seriesName=\"AvgxxPOLQA\"]//*[name()='g' and @class='apexcharts-series-markers']//*[@class!=\"apexcharts-nullpoint\"]"));
        List<WebElement> dotsList = this.action.waitVisibilityElements(xpathSelector);

        Map<String,Map<String, String>> graphsValues = new HashMap<>();
        Actions act = new Actions(this.driver);
        for (WebElement e : dotsList){
            act.moveToElement(e).perform();

            By tooltipTitleSelector = By.xpath(metricsChartsXPath.concat("//div[@class='apexcharts-tooltip-title']"));
            List<WebElement> tooltipTitles = this.action.waitVisibilityElements(tooltipTitleSelector);

            By labelsSelector = By.xpath(metricsChartsXPath.concat("//span[@class='apexcharts-tooltip-text-y-label']"));
            List<WebElement> labels = this.action.waitVisibilityElements(labelsSelector);
            By valuesSelector = By.xpath(metricsChartsXPath.concat("//span[@class='apexcharts-tooltip-text-y-value']"));
            List<WebElement> values = this.action.waitVisibilityElements(valuesSelector);

            String timelapse,label,value;
            Map<String,String> metric;
            int j = 0;
            for (WebElement tooltipTitle : tooltipTitles) {
                timelapse = tooltipTitle.getText();
                int aux = j + 2;
                for (int i=j; i < aux; i++) {
                    label = labels.get(i).getText().split(":")[0];
                    if (graphsValues.getOrDefault(label, null) == null) {
                        graphsValues.put(label, new HashMap<>());
                    }
                    metric = graphsValues.get(label);
                    value = values.get(i).getText();
                    metric.put(timelapse, value);
                }
                j = aux;
            }
        }
        return graphsValues;
    }

    public Map<String,Map<String, String>> getNetworkTrendsGraphsValues(){
        String packetLossXpath = "//div[@id=\"packetLossTrends\"]/apx-chart";
        String networkTrendsGraphsXpath = "//div[contains(@class,\"network-trends\")]";
        this.action.scrollToElement(networkTrendsTitle);
        By packetLossGraphSelector = By.xpath(packetLossXpath.concat("//*[@seriesName=\"AvgxxPacketxLoss\"]//*[name()='g' and @class='apexcharts-series-markers']//*[@class!=\"apexcharts-nullpoint\"]"));
        List<WebElement> dotsList = this.action.waitVisibilityElements(packetLossGraphSelector);
        Actions act = new Actions(this.driver);
        Map<String,Map<String, String>> graphsValues = new HashMap<>();
        for (WebElement e : dotsList){
            act.moveToElement(e).perform();

            By tooltipTitlesSelector = By.xpath(networkTrendsGraphsXpath.concat("//div[@id!=\"sentBitrateTrends\"]//apx-chart//div[@class='apexcharts-tooltip-title']"));
            List<WebElement> tooltipTitles = this.action.waitVisibilityElements(tooltipTitlesSelector);
            By labelsSelector = By.xpath(networkTrendsGraphsXpath.concat("//div[@id!=\"sentBitrateTrends\"]//apx-chart//span[@class='apexcharts-tooltip-text-y-label']"));
            List<WebElement> labels = this.action.waitVisibilityElements(labelsSelector);
            By valueSelector = By.xpath(networkTrendsGraphsXpath.concat("//div[@id!=\"sentBitrateTrends\"]//apx-chart//span[@class='apexcharts-tooltip-text-y-value']"));
            List<WebElement> values = this.action.waitVisibilityElements(valueSelector);

            By sentBitrateTitleSelector = By.xpath(networkTrendsGraphsXpath.concat("//div[@id=\"sentBitrateTrends\"]//apx-chart//div[@class='apexcharts-tooltip-title']"));
            WebElement sentBitrateTitle = this.action.waitVisibilityElement(sentBitrateTitleSelector);
            By sentBitrateLabelSelector = By.xpath(networkTrendsGraphsXpath.concat("//div[@id=\"sentBitrateTrends\"]//apx-chart//span[@class='apexcharts-tooltip-text-y-label']"));
            WebElement sentBitrateLabel = this.action.waitVisibilityElement(sentBitrateLabelSelector);
            By sentBitrateValueSelector = By.xpath(networkTrendsGraphsXpath.concat("//div[@id=\"sentBitrateTrends\"]//apx-chart//span[@class='apexcharts-tooltip-text-y-value']"));
            WebElement sentBitrateValue = this.action.waitVisibilityElement(sentBitrateValueSelector);

            String timelapse,label,value;
            Map<String,String> metric;
            int j = 0;
            for (WebElement tooltipTitle : tooltipTitles) {
                timelapse = tooltipTitle.getText();
                int aux = j + 2;
                for (int i=j; i < aux; i++) {
                    label = labels.get(i).getText().split(":")[0];
                    value = values.get(i).getText();

                    if (graphsValues.getOrDefault(label, null) == null) {
                        graphsValues.put(label, new HashMap<>());
                    }

                    metric = graphsValues.get(label);
                    metric.put(timelapse, value);
                }
                j = aux;
            }

            timelapse = sentBitrateTitle.getText();
            label = sentBitrateLabel.getText().split(":")[0];
            value = sentBitrateValue.getText();

            if (graphsValues.getOrDefault(label, null) == null) {
                graphsValues.put(label, new HashMap<>());
            }
            metric = graphsValues.get(label);
            metric.put(timelapse, value);
        }
        return graphsValues;
    }

    public void clickOnPolqaChartValue(String metric){
        WebElement chartElement;
        final String polqaChartXPath = "//div[@id=\"polqa-chart\"]/apx-chart";
        this.action.scrollToElement(polqaChartTitles);
        By metricButtonSelector = By.xpath(String.format("//mat-button-toggle/button/span[text()='%s']",metric));
        this.action.click(metricButtonSelector);

        By xpathSelector = By.xpath(polqaChartXPath.concat("//*[@seriesName=\"POLQA\"]//*[name()='g' and @class='apexcharts-series-markers']//*[@class!=\"apexcharts-nullpoint\"]"));
        List<WebElement> dotsList = this.action.waitVisibilityElements(xpathSelector);
        chartElement = dotsList.get(0);
        chartElement.click();
    }
}
