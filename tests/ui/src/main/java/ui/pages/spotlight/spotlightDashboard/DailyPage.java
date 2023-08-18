package ui.pages.spotlight.spotlightDashboard;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import ui.core.AbstractPageObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DailyPage extends AbstractPageObject {

    String failedCallsChartLabel = "//div[contains(@class,\"%s\")]//p[contains(@class,\"failed-calls-value\")]";
    String apxChart = "//div[@id=\"%s\"]//apx-chart//*[local-name()='svg']//";

    public String getTotalCalls(){
        By totalCallsSelector = By.xpath(String.format(failedCallsChartLabel,"blue-label"));
        return this.action.getText(totalCallsSelector);
    }

    public String getFailedCalls(){
        By failedCallsSelector = By.xpath(String.format(failedCallsChartLabel,"red-label"));
        return this.action.getText(failedCallsSelector);
    }

    public String getFailedCallsPercentage(){
        By textXpath = By.xpath( String.format(apxChart,"daily-failed-calls").concat("*[local-name()='text']"));
        return this.action.getText(textXpath);
    }

    public List<String> getVoiceQualityDataLabels() {
        List<String> dataLabels = new ArrayList<>();
        By voiceQualitySelector = By.xpath(String.format(apxChart,"daily-voice-quality").concat("*[@class=\"apexcharts-datalabels\"]//*[local-name()='text']"));
        List<WebElement> dataLabelsElements  = this.driver.findElements(voiceQualitySelector);
        for (WebElement dataLabelElement: dataLabelsElements) {
            dataLabels.add(dataLabelElement.getText());
        }
        return dataLabels;
    }

    public Map<String,String> getVoiceQualityFooterText(){
        By voiceQualityText = By.xpath("//div[@id=\"daily-voice-quality-footer\"]//label");
        String footerText = this.action.getText(voiceQualityText);
        Map<String,String> callsSummaryInfo= new HashMap<>();
        for (String section : footerText.split("\\|")) {
            String[] item = section.split(":");
            callsSummaryInfo.put(item[0].trim(),item[1].trim());
        }
        return callsSummaryInfo;
    }
}
