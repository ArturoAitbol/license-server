package ui.pages.spotlight.spotlightDashboard;

import org.openqa.selenium.By;
import ui.core.AbstractPageObject;
import java.util.HashMap;
import java.util.Map;

public class GaugeChart extends AbstractPageObject {

    String gaugeChartXPath;

    public GaugeChart(String reportType) {
        this.gaugeChartXPath = String.format("//div[@id=\"%s\"]/app-gauge-chart//",reportType);
    }

    public String getPassedCallsPercentage(){
        By textXpath = By.xpath(gaugeChartXPath.concat("*[local-name()='svg']//*[local-name()='text']"));
        return this.action.getText(textXpath);
    }

    public Map<String,Integer> getCallsSummaryInfo(){
        By textXpath = By.xpath(gaugeChartXPath.concat("div[@class=\"footer-text\"]/label"));
        String footerText = this.action.getText(textXpath);
        Map<String,Integer> callsSummaryInfo= new HashMap<>();
        for (String section : footerText.split("\\|")) {
            String[] item = section.split(":");
            callsSummaryInfo.put(item[0].trim(),Integer.parseInt(item[1].trim()));
        }
        return callsSummaryInfo;
    }

    public String getChartLabel(){
        By textXpath = By.xpath(gaugeChartXPath.concat("label[contains(@class,\"chart-label\")]"));
        return this.action.getText(textXpath);
    }
}
