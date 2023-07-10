package ui.pages.spotlight;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

import static org.junit.Assert.assertEquals;

public class Map extends AbstractPageObject {
    @FindBy(css = "[title='Chicago']")
    WebElement node;
    @FindBy(css = "[title='Tampa']")
    WebElement tampa;
    //Chicago San Antonio
    @FindBy(css = "[class*='Chicago San Antonio']")
    WebElement link;

    @FindBy(css = "[class*='Tampa Chicago']")
    WebElement tampaChicago;
    @FindBy(css = "[id='cancel-button']")
    WebElement cancelButton;
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
    @FindBy(css = "button[aria-label='Open calendar']")
    WebElement calendarButton;
    @FindBy(css = "button[aria-label='Previous month'")
    WebElement previousMonthButton;
    @FindBy(css = "[formcontrolname='startDateFilterControl']")
    WebElement datePicker;
    @FindBy(css = "[title='linkPOLQA']")
    WebElement linkPOLQA;
    @FindBy(css = "[title='linkJitter']")
    WebElement linkJitter;
    @FindBy(css = "[title='linkRoundTripTime']")
    WebElement linkRoundTripTime;
    @FindBy(css = "[title='linkPacketLoss']")
    WebElement linkPacketLoss;
    @FindBy(css = "[title='linkBitrate']")
    WebElement linkBitrate;
    @FindBy(css = "[title='linkTotalCalls']")
    WebElement linkTotalCalls;
    @FindBy(css = "[title='linkPassedCalls']")
    WebElement linkPassedCalls;
    @FindBy(css = "[title='linkFailedCalls']")
    WebElement linkFailedCalls;
    String dateButtonLocatorString = "button[aria-label='%s']";
    String currentDate = "";
    public void openNodeAndValidateData() {
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
        selectDate("06/24/2023");
        this.action.click(this.node);
        this.action.click(this.node);
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
        this.action.click(cancelButton);
    }

//    public void validatePOLQAValues() {
//        String oPOLQA = "Avg: 3.83";
//        String tPOLQA = "Avg: 3.8";
//        waitData();
//        selectDate("06/24/2023");
//        this.action.click(this.tampa);
//        this.action.click(this.tampa);
//        String[] avgOriginatedPOLQA = this.action.getText(originatedPOLQA).split(", ");
//        String[] avgTerminatedPOLQA = this.action.getText(terminatedPOLQA).split(", ");
//        assertEquals("originated POLQA isn't the same: ".concat(avgOriginatedPOLQA[1]),oPOLQA,avgOriginatedPOLQA[1]);
//        assertEquals("terminated POLQA isn't the same: ".concat(avgTerminatedPOLQA[1]),tPOLQA,avgTerminatedPOLQA[1]);
//        this.action.click(cancelButton);
//    }

    public void validatePOLQA(String node, String orginatedAvg, String terminatedAvg) {
         By selectedNode = By.xpath("//img[@title='" + node + "']");
        String oPOLQA = "Avg: 3.76";
        String tPOLQA = "Avg: 3.81";
        waitData();
        selectDate("06/24/2023");
        this.action.click(selectedNode);
        this.action.click(selectedNode);
        String[] avgOriginatedPOLQA = this.action.getText(originatedPOLQA).split(", ");
        String[] avgTerminatedPOLQA = this.action.getText(terminatedPOLQA).split(", ");
        assertEquals("originated POLQA isn't the same: ".concat(avgOriginatedPOLQA[1]),orginatedAvg,avgOriginatedPOLQA[1]);
        assertEquals("terminated POLQA isn't the same: ".concat(avgTerminatedPOLQA[1]),terminatedAvg,avgTerminatedPOLQA[1]);
        this.action.click(cancelButton);
    }

    public void validateCallsFailedValues() {
        String callsFailed = "0";
        waitData();
        selectDate("06/24/2023");
        this.action.click(this.tampaChicago);
        this.action.click(this.tampaChicago);
        assertEquals("link Passed Calls isn't the same: ".concat(this.action.getText(linkFailedCalls)),callsFailed,this.action.getText(linkFailedCalls));
        this.action.click(cancelButton);
    }

    public void validateLinkData() {
        String POLQA = "Min: 1.49, Avg: 4.04";
        String Jitter= "Max: 13.18, Avg: 6.17";
        String RoundTripTime= "Max: 141, Avg: 66.87";
        String PacketLoss= "Max: 22.07, Avg: 0.21";
        String Bitrate= "Avg: 37.92";
        String totalCalls = "13";
        String callsPassed = "12";
        String callsFailed = "1";
        waitData();
        selectDate("06/24/2023");
        this.action.click(this.link);
        this.action.click(this.link);
        assertEquals("link POLQA isn't the same: ".concat(this.action.getText(linkPOLQA)),POLQA,this.action.getText(linkPOLQA));
        assertEquals("link Jitter isn't the same: ".concat(this.action.getText(linkJitter)),Jitter,this.action.getText(linkJitter));
        assertEquals("link Round Trip Time isn't the same: ".concat(this.action.getText(linkRoundTripTime)),RoundTripTime,this.action.getText(linkRoundTripTime));
        assertEquals("link Packet Loss isn't the same: ".concat(this.action.getText(linkPacketLoss)),PacketLoss,this.action.getText(linkPacketLoss));
        assertEquals("link Bitrate isn't the same: ".concat(this.action.getText(linkBitrate)),Bitrate,this.action.getText(linkBitrate));
        assertEquals("link Total Calls isn't the same: ".concat(this.action.getText(linkTotalCalls)),totalCalls,this.action.getText(linkTotalCalls));
        assertEquals("link Passed Calls isn't the same: ".concat(this.action.getText(linkPassedCalls)),callsPassed,this.action.getText(linkPassedCalls));
        assertEquals("link Failed Calls isn't the same: ".concat(this.action.getText(linkFailedCalls)),callsFailed,this.action.getText(linkFailedCalls));
        this.action.click(cancelButton);
    }


    public void selectDate(String date) {
        this.currentDate = date;
        this.action.click(calendarButton);
        this.action.click(this.previousMonthButton);
        DateTimeFormatter webDateFormat = DateTimeFormatter.ofPattern("M/d/yyyy");
        LocalDate previousDate = LocalDate.parse(this.currentDate, webDateFormat);
        Locale englishLocale = new Locale("en");
        DateTimeFormatter testDateFormat = DateTimeFormatter.ofPattern("MMMM d, uuuu", englishLocale);
        By dateButtonLocator = By.cssSelector(String.format(this.dateButtonLocatorString, testDateFormat.format(previousDate)));
        this.action.click(dateButtonLocator);
        By applyButtonSelector = By.cssSelector("button[id*=filter-button]");
        this.action.click(applyButtonSelector);
        waitData();
    }

    public void waitData(){
        By spinnerSelector = By.cssSelector("svg[preserveAspectRatio]");
        this.action.waitSpinner(spinnerSelector);
        this.action.waitPropertyToBe(this.datePicker, "disabled", "false");
    }
}
