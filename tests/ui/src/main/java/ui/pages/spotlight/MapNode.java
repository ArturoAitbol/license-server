package ui.pages.spotlight;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import ui.core.AbstractPageObject;

import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Locale;

import static org.junit.Assert.assertEquals;

public class MapNode extends AbstractPageObject {
    @FindBy(css = "[title='Chicago']")
    WebElement node;
    //Chicago San Antonio
    @FindBy(css = "[id='cancel-button']")
    WebElement cancelButton;
    @FindBy(css = "[id='go-dashboard']")
    WebElement dashboardButton;
    @FindBy(css = "[title='totalCalls']")
    WebElement totalCalls;
    @FindBy(css = "[title='totalPassedCalls']")
    WebElement totalPassedCalls;
    @FindBy(css = "[title='totalFailedCalls']")
    WebElement totalFailedCalls;
    @FindBy(css = "[title='totalSameRegionCalls']")
    WebElement totalSameRegionCalls;
    @FindBy(css = "[title='totalPassedCallsSameRegion']")
    WebElement totalPassedCallsSameRegion;
    @FindBy(css = "[title='totalFailedCallsSameRegion']")
    WebElement totalFailedCallsSameRegion;
    @FindBy(css = "[title='originatedTotalCalls']")
    WebElement originatedTotalCalls;
    @FindBy(css = "[title='originatedPassedCalls']")
    WebElement originatedPassedCalls;
    @FindBy(css = "[title='originatedFailedCalls']")
    WebElement originatedFailedCalls;
    @FindBy(css = "[title='terminatedTotalCalls']")
    WebElement terminatedTotalCalls;
    @FindBy(css = "[title='terminatedPassedCalls']")
    WebElement terminatedPassedCalls;
    @FindBy(css = "[title='terminatedFailedCalls']")
    WebElement terminatedFailedCalls;
    @FindBy(css = "[title='originatedPOLQA']")
    WebElement originatedPOLQA;
    @FindBy(css = "[title='originatedJitter']")
    WebElement originatedJitter;
    @FindBy(css = "[title='originatedRoundTripTime']")
    WebElement originatedRoundTripTime;
    @FindBy(css = "[title='originatedPacketLoss']")
    WebElement originatedPacketLoss;
    @FindBy(css = "[title='originatedBitrate']")
    WebElement originatedBitrate;
    @FindBy(css = "[title='terminatedPOLQA']")
    WebElement terminatedPOLQA;
    @FindBy(css = "[title='terminatedJitter']")
    WebElement terminatedJitter;
    @FindBy(css = "[title='terminatedRoundTripTime']")
    WebElement terminatedRoundTripTime;
    @FindBy(css = "[title='terminatedPacketLoss']")
    WebElement terminatedPacketLoss;
    @FindBy(css = "[title='terminatedBitrate']")
    WebElement terminatedBitrate;
    @FindBy(css = "[title='report-title']")
    WebElement reportTitle;
    @FindBy(css = "[formcontrolname='startDateFilterControl']")
    WebElement datePicker;
    @FindBy(css = "[formcontrolname='date']")
    WebElement dashboardDateLabel;
    @FindBy(css = "[title='mat-chip']")
    WebElement matChipLabel;
    @FindBy(css = "button[aria-label='Open calendar']")
    WebElement calendarButton;
    @FindBy(css = "button[aria-label='Previous month'")
    WebElement previousMonthButton;
    String dateButtonLocatorString = "button[aria-label='%s']";
    String currentDate = "";
    By nodeTitle = By.xpath("//h1[@title='node-title']");
    public Map openNodeAndValidateData() {
        String totalsCalls = "77";
        String passedCalls = "76";
        String failedCalls = "1";
        String totalsOriginatedCalls = "36";
        String totalOriginatedpassedCalls = "35";
        String totalOriginatedfailedCalls = "1";
        String totalsTerminatedCalls = "36";
        String totalTerminatedpassedCalls = "36";
        String totalTerminatedfailedCalls = "0";
        String sameRegionCalls = "5";
        String passedCallsSameRegion = "5";
        String failedCallsSameRegion = "0";
        String oPOLQA = "Min: 1.49, Avg: 3.91";
        String oJitter= "Max: 18.25, Avg: 6.93";
        String oRoundTripTime= "Max: 222, Avg: 97.18";
        String oPacketLoss= "Max: 0.55, Avg: 0";
        String oBitrate= "Avg: 37.26";
        String tPOLQA = "Min: 1.64, Avg: 3.89";
        String tJitter= "Max: 35.53, Avg: 6.58";
        String tRoundTripTime= "Max: 231, Avg: 92.18";
        String tPacketLoss= "Max: 22.07, Avg: 0.06";
        String tBitrate= "Avg: 37.11";
        waitData();
        this.action.click(this.node);
        if(this.action.checkElement(this.nodeTitle) != "ok") {
            this.action.click(this.node);
        }
        assertEquals("originated POLQA isn't the same: ".concat(this.action.getText(originatedPOLQA)),oPOLQA,this.action.getText(originatedPOLQA));
        assertEquals("originated Jitter isn't the same: ".concat(this.action.getText(originatedJitter)),oJitter,this.action.getText(originatedJitter));
        assertEquals("originated Round Trip Time isn't the same: ".concat(this.action.getText(originatedRoundTripTime)),oRoundTripTime,this.action.getText(originatedRoundTripTime));
        assertEquals("originated Packet Loss isn't the same: ".concat(this.action.getText(originatedPacketLoss)),oPacketLoss,this.action.getText(originatedPacketLoss));
        assertEquals("originated Bitrate isn't the same: ".concat(this.action.getText(originatedBitrate)),oBitrate,this.action.getText(originatedBitrate));
        assertEquals("terminated POLQA isn't the same: ".concat(this.action.getText(terminatedPOLQA)),tPOLQA,this.action.getText(terminatedPOLQA));
        assertEquals("terminated Jitter isn't the same: ".concat(this.action.getText(terminatedJitter)),tJitter,this.action.getText(terminatedJitter));
        assertEquals("terminated Round Trip Time isn't the same: ".concat(this.action.getText(terminatedRoundTripTime)),tRoundTripTime,this.action.getText(terminatedRoundTripTime));
        assertEquals("terminated Packet Loss isn't the same: ".concat(this.action.getText(terminatedPacketLoss)),tPacketLoss,this.action.getText(terminatedPacketLoss));
        assertEquals("terminated Bitrate isn't the same: ".concat(this.action.getText(terminatedBitrate)),tBitrate,this.action.getText(terminatedBitrate));

        assertEquals("total originated calls isn't the same: ".concat(this.action.getText(originatedTotalCalls)),totalsOriginatedCalls,this.action.getText(originatedTotalCalls));
        assertEquals("total originated passed calls isn't the same: ".concat(this.action.getText(originatedPassedCalls)),totalOriginatedpassedCalls,this.action.getText(originatedPassedCalls));
        assertEquals("total originated failed calls isn't the same: ".concat(this.action.getText(originatedFailedCalls)),totalOriginatedfailedCalls,this.action.getText(originatedFailedCalls));
        assertEquals("total terminated calls isn't the same: ".concat(this.action.getText(terminatedTotalCalls)),totalsTerminatedCalls,this.action.getText(terminatedTotalCalls));
        assertEquals("total terminated passed calls isn't the same: ".concat(this.action.getText(terminatedPassedCalls)),totalTerminatedpassedCalls,this.action.getText(terminatedPassedCalls));
        assertEquals("total terminated failed calls isn't the same: ".concat(this.action.getText(terminatedFailedCalls)),totalTerminatedfailedCalls,this.action.getText(terminatedFailedCalls));

        assertEquals("total calls isn't the same: ".concat(this.action.getText(totalCalls)),totalsCalls,this.action.getText(totalCalls));
        assertEquals("total passed calls isn't the same: ".concat(this.action.getText(totalPassedCalls)),passedCalls,this.action.getText(totalPassedCalls));
        assertEquals("total failed calls isn't the same: ".concat(this.action.getText(totalFailedCalls)),failedCalls,this.action.getText(totalFailedCalls));
        assertEquals("total calls in the same regions isn't the same: ".concat(this.action.getText(totalSameRegionCalls)),sameRegionCalls,this.action.getText(totalSameRegionCalls));
        assertEquals("total passed calls in the same region isn't the same: ".concat(this.action.getText(totalPassedCallsSameRegion)),passedCallsSameRegion,this.action.getText(totalPassedCallsSameRegion));
        assertEquals("total failed calls in the same region isn't the same: ".concat(this.action.getText(totalFailedCallsSameRegion)),failedCallsSameRegion,this.action.getText(totalFailedCallsSameRegion));
        this.action.click(cancelButton);
        return new Map();
    }

    public Map validatePOLQA(String node, String orginatedAvg, String terminatedAvg) {
        By selectedNode = By.xpath("//img[@title='" + node + "']");
        waitData();
        this.action.click(selectedNode);
        if(this.action.checkElement(this.nodeTitle) != "ok") {
            this.action.click(selectedNode);
        }
        String[] avgOriginatedPOLQA = this.action.getText(originatedPOLQA).split(", ");
        String[] avgTerminatedPOLQA = this.action.getText(terminatedPOLQA).split(", ");
        assertEquals("originated POLQA isn't the same: ".concat(avgOriginatedPOLQA[1]),orginatedAvg,avgOriginatedPOLQA[1]);
        assertEquals("terminated POLQA isn't the same: ".concat(avgTerminatedPOLQA[1]),terminatedAvg,avgTerminatedPOLQA[1]);
        this.action.click(cancelButton);
        return new Map();
    }

    public Map openNativeDashboard(String node) {
        By selectedNode = By.xpath("//img[@title='" + node + "']");
        String dateSelected = "6/24/2023";
        String report = "Daily Report | 06/24/2023 (UTC)";
        String selectedRegion = "Las Vegas, Nevada, United States";
        waitData();
        this.action.click(selectedNode);
        if(this.action.checkElement(this.nodeTitle) != "ok") {
            this.action.click(selectedNode);
        }
        this.action.click(dashboardButton);
        ArrayList<String> tabs = new ArrayList<String>(driver.getWindowHandles());
        driver.switchTo().window(tabs.get(tabs.size() - 1));
        waitSpinner();
        String[] region = action.getText(matChipLabel).split("\n");
        String parsedRegion = region[0];
        this.action.waitPropertyToBe(this.dashboardDateLabel, "disabled", "false");
        String dateLabel = this.dashboardDateLabel.getDomProperty("value");
        assertEquals("the date selected is not the same: ".concat(dateLabel),dateSelected,dateLabel);
        assertEquals("the region selected is not the same: ".concat(parsedRegion),selectedRegion,parsedRegion);
        assertEquals("the title is not the same: ".concat(action.getText(reportTitle)),report,action.getText(reportTitle));
        return new Map();
    }

    public void changeDate(){
        By spinnerSelector = By.cssSelector("svg[preserveAspectRatio]");
        this.action.click(calendarButton);
        boolean monthFound = false;
        while (!monthFound){
            this.action.click(this.previousMonthButton);
            By monthButtonLocator = By.xpath("//button[@aria-label='Choose month and year']/span/span");
            String month = this.action.getText(monthButtonLocator);
            monthFound = month.equals("JUN 2023");
        }

        DateTimeFormatter webDateFormat = DateTimeFormatter.ofPattern("M/d/yyyy");
        LocalDate selectedDate = LocalDate.parse("06/24/2023", webDateFormat);
        Locale englishLocale = new Locale("en");

        DateTimeFormatter testDateFormat = DateTimeFormatter.ofPattern("MMMM d, uuuu", englishLocale);
        By dateButtonLocator = By.cssSelector(String.format(this.dateButtonLocatorString, testDateFormat.format(selectedDate)));
        this.action.click(dateButtonLocator);
        By applyButtonSelector = By.cssSelector("button[id*=filter-button]");
        this.action.click(applyButtonSelector);
        this.action.waitSpinner(spinnerSelector);
        this.action.waitPropertyToBe(this.datePicker, "disabled", "false");
    }

    public void waitData(){
        this.action.waitPropertyToBe(this.datePicker, "disabled", "false");
        this.changeDate();
    }

    public void waitSpinner() {
        By spinnerSelector = By.cssSelector("svg[preserveAspectRatio]");
        this.action.waitSpinner(spinnerSelector);
    }
}
