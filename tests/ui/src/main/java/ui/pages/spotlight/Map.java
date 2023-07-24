package ui.pages.spotlight;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Locale;

import static org.junit.Assert.assertEquals;

public class Map extends AbstractPageObject {
    @FindBy(css = "[title='Chicago']")
    WebElement node;
    @FindBy(css = "[class*='Chicago San Antonio']")
    WebElement link;
    @FindBy(css = "[id='cancel-button']")
    WebElement cancelButton;
    @FindBy(css = "button[aria-label='Open calendar']")
    WebElement calendarButton;
    @FindBy(css = "button[aria-label='Previous month'")
    WebElement previousMonthButton;
    @FindBy(css = "[formcontrolname='startDateFilterControl']")
    WebElement datePicker;
    @FindBy(css = "[formcontrolname='region']")
    WebElement region;
    String dateButtonLocatorString = "button[aria-label='%s']";
    String currentDate = "";
    By nodeTitle = By.xpath("//h1[@title='node-title']");
    By linkTitle = By.xpath("//h1[@title='link-title']");
    public void openNode(String regionFilter) {
        waitData();
        changeDate(regionFilter);
        this.action.click(this.node);
        if(this.action.checkElement(this.nodeTitle) != "ok") {
            this.action.click(this.node);
        }
        this.action.click(cancelButton);
    }

    public void openLink(String regionFilter) {
        waitData();
        changeDate(regionFilter);
        this.action.click(this.link);
        if(this.action.checkElement(this.linkTitle) != "ok") {
            this.action.click(this.link);
        }
        this.action.click(cancelButton);
    }

    public void changeDate(String region){
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
        LocalDate selectedDate = LocalDate.parse("06/26/2023", webDateFormat);
        Locale englishLocale = new Locale("en");

        DateTimeFormatter testDateFormat = DateTimeFormatter.ofPattern("MMMM d, uuuu", englishLocale);
        By dateButtonLocator = By.cssSelector(String.format(this.dateButtonLocatorString, testDateFormat.format(selectedDate)));
        this.action.click(dateButtonLocator);
        By optionType = By.cssSelector(String.format("mat-option[title='%s']", region));
        this.action.selectOption(this.region, optionType);
        By applyButtonSelector = By.cssSelector("button[id*=filter-button]");
        this.action.click(applyButtonSelector);
        this.action.waitSpinner(spinnerSelector);
        this.action.waitPropertyToBe(this.datePicker, "disabled", "false");
    }

    public void waitData(){
        By spinnerSelector = By.cssSelector("svg[preserveAspectRatio]");
        this.action.waitSpinner(spinnerSelector);
        this.action.waitPropertyToBe(this.datePicker, "disabled", "false");
    }
}
