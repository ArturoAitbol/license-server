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

    public Map<String,Map<String, String>> getPolqaChartValues(String metric){
        final String polqaChartXPath = "//div[@id=\"polqa-chart\"]/apx-chart";
        this.action.scrollToElement(polqaChartTitles);
        By metricButtonSelector = By.xpath(String.format("//mat-button-toggle/button/span[text()='%s']",metric));
        this.action.click(metricButtonSelector);

        By xpathSelector = By.xpath(polqaChartXPath.concat("//*[@seriesName=\"POLQA\"]//*[name()='g' and @class='apexcharts-series-markers']//*[@class!=\"apexcharts-nullpoint\"]"));
        List<WebElement> dotsList = this.action.waitVisibilityElements(xpathSelector);

        Map<String,Map<String, String>> chartsValues = new HashMap<>();
        Actions act = new Actions(this.driver);
        for (WebElement e : dotsList){
            act.moveToElement(e).perform();

            By tooltipTitleSelector = By.xpath(polqaChartXPath.concat("//div[@class='apexcharts-tooltip-title']"));
            this.action.waitVisibilityElement(tooltipTitleSelector);
            String timelapse = this.action.getText(tooltipTitleSelector);

            By labelsSelector = By.xpath(polqaChartXPath.concat("//span[@class='apexcharts-tooltip-text-y-label']"));
            List<WebElement> labels = this.action.waitVisibilityElements(labelsSelector);
            By valuesSelector = By.xpath(polqaChartXPath.concat("//span[@class='apexcharts-tooltip-text-y-value']"));
            List<WebElement> values = this.action.waitVisibilityElements(valuesSelector);
            String label,value;
            HashMap<String,String> networkMetricsValues = new HashMap<>();
            for (int i = 0; i < labels.size(); i++) {
                label = labels.get(i).getText();
                value = values.get(i).getText();
                networkMetricsValues.put(label,value);
            }
            chartsValues.put(timelapse,networkMetricsValues);
        }
        return chartsValues;
    }

    public Map<String,Map<String, String>> getNetworkTrendsGraphsValues(){
        String packetLossXpath = "//div[@id=\"packetLossTrends\"]/apx-chart";
        this.action.scrollToElement(networkTrendsTitle);
        By packetLossGraphSelector = By.xpath(packetLossXpath.concat("//*[name()='g' and @class='apexcharts-series-markers']//*[@class!=\"apexcharts-nullpoint\"]"));
        List<WebElement> dotsList = this.action.waitVisibilityElements(packetLossGraphSelector);
        Actions act = new Actions(this.driver);
        Map<String,Map<String, String>> graphsValues = new HashMap<>();
        for (WebElement e : dotsList){
            act.moveToElement(e).perform();

            By tooltipTitlesSelector = By.xpath("//div[@class=\"network-quality\"]//div[@class='apexcharts-tooltip-title']");
            List<WebElement> tooltipTitles = this.action.waitVisibilityElements(tooltipTitlesSelector);
            By labelsSelector = By.xpath("//div[@class=\"network-quality\"]//span[@class='apexcharts-tooltip-text-y-label']");
            List<WebElement> labels = this.action.waitVisibilityElements(labelsSelector);
            By valueSelector = By.xpath("//div[@class=\"network-quality\"]//span[@class='apexcharts-tooltip-text-y-value']");
            List<WebElement> values = this.action.waitVisibilityElements(valueSelector);

            String timelapse,label,value;
            Map<String,String> metric;
            for (int i = 0; i < tooltipTitles.size(); i++) {
                label = labels.get(i).getText().split(":")[0];
                if (graphsValues.getOrDefault(label,null) == null){
                    graphsValues.put(label,new HashMap<>());
                }
                metric = graphsValues.get(label);
                timelapse = tooltipTitles.get(i).getText();
                value = values.get(i).getText();

                metric.put(timelapse,value);
            }
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
