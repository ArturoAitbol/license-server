package ui.pages.spotlight;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

import static org.junit.Assert.assertEquals;

public class MapLine extends AbstractPageObject {
    @FindBy(css = "[class*='Chicago San Antonio']")
    WebElement link;
    @FindBy(css = "[class*='Tampa Chicago']")
    WebElement tampaChicago;
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
    @FindBy(css = "button[aria-label='Open calendar']")
    WebElement calendarButton;
    @FindBy(css = "button[aria-label='Previous month'")
    WebElement previousMonthButton;
    @FindBy(css = "[formcontrolname='startDateFilterControl']")
    WebElement datePicker;
    @FindBy(css = "[id='cancel-button']")
    WebElement cancelButton;
    String dateButtonLocatorString = "button[aria-label='%s']";
    String currentDate = "";
    By linkTitle = By.xpath("//h1[@title='link-title']");
    public Map validateLinkData() {
        String POLQA = "Min: 1.49, Avg: 4.04";
        String Jitter= "Max: 13.18, Avg: 6.17";
        String RoundTripTime= "Max: 141, Avg: 66.87";
        String PacketLoss= "Max: 22.07, Avg: 0.21";
        String Bitrate= "Avg: 37.92";
        String totalCalls = "13";
        String callsPassed = "12";
        String callsFailed = "1";
        waitData();
        this.action.click(this.link);
        if(this.action.checkElement(this.linkTitle) != "ok") {
            this.action.click(this.link);
        }
        assertEquals("link POLQA isn't the same: ".concat(this.action.getText(linkPOLQA)),POLQA,this.action.getText(linkPOLQA));
        assertEquals("link Jitter isn't the same: ".concat(this.action.getText(linkJitter)),Jitter,this.action.getText(linkJitter));
        assertEquals("link Round Trip Time isn't the same: ".concat(this.action.getText(linkRoundTripTime)),RoundTripTime,this.action.getText(linkRoundTripTime));
        assertEquals("link Packet Loss isn't the same: ".concat(this.action.getText(linkPacketLoss)),PacketLoss,this.action.getText(linkPacketLoss));
        assertEquals("link Bitrate isn't the same: ".concat(this.action.getText(linkBitrate)),Bitrate,this.action.getText(linkBitrate));
        assertEquals("link Total Calls isn't the same: ".concat(this.action.getText(linkTotalCalls)),totalCalls,this.action.getText(linkTotalCalls));
        assertEquals("link Passed Calls isn't the same: ".concat(this.action.getText(linkPassedCalls)),callsPassed,this.action.getText(linkPassedCalls));
        assertEquals("link Failed Calls isn't the same: ".concat(this.action.getText(linkFailedCalls)),callsFailed,this.action.getText(linkFailedCalls));
        this.action.click(cancelButton);
        return new Map();
    }

    public Map validateCallsFailedValues() {
        String callsFailed = "0";
        waitData();
        this.action.click(this.tampaChicago);
        if(this.action.checkElement(this.linkTitle) != "ok") {
            this.action.click(this.tampaChicago);
        }
        assertEquals("link Passed Calls isn't the same: ".concat(this.action.getText(linkFailedCalls)),callsFailed,this.action.getText(linkFailedCalls));
        this.action.click(cancelButton);
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
}
