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
    public void openNode(String regionFilter) {
        waitData();
        selectDate("06/26/2023", regionFilter);
        this.action.click(this.node);
        this.action.click(this.node);
        this.action.click(cancelButton);
    }

    public void openLink(String regionFilter) {
        waitData();
        selectDate("06/26/2023", regionFilter);
        this.action.click(this.link);
        this.action.click(this.link);
        this.action.click(cancelButton);
    }


    public void selectDate(String date, String region) {
        this.currentDate = date;
        this.action.click(calendarButton);
        this.action.click(this.previousMonthButton);
        DateTimeFormatter webDateFormat = DateTimeFormatter.ofPattern("M/d/yyyy");
        LocalDate previousDate = LocalDate.parse(this.currentDate, webDateFormat);
        Locale englishLocale = new Locale("en");
        DateTimeFormatter testDateFormat = DateTimeFormatter.ofPattern("MMMM d, uuuu", englishLocale);
        By dateButtonLocator = By.cssSelector(String.format(this.dateButtonLocatorString, testDateFormat.format(previousDate)));
        this.action.click(dateButtonLocator);
        By optionType = By.cssSelector(String.format("mat-option[title='%s']", region));
        this.action.selectOption(this.region, optionType);
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
