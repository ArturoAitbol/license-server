package ui.pages.spotlight;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class Dashboard extends AbstractPageObject {

    private final Logger LOGGER = LogManager.getLogger(Dashboard.class);

    @FindBy(css = "button[aria-label='Previous month'")
    WebElement previousMonthButton;
    @FindBy(css = "[formcontrolname='date']")
    WebElement datePicker;
    @FindBy(css = "button[aria-label='Open calendar']")
    WebElement calendarButton;

    By loadingSelector = By.cssSelector("figcaption.loadingMessage");

    String dateButtonLocatorString = "button[aria-label='%s']";

    public void waitForDashboardToLoad(){
        this.action.waitSpinner(this.loadingSelector);
        this.action.waitPropertyToBe(this.datePicker, "disabled", "false");
    }

    public void changeDate(){
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
        LOGGER.info("Date to select: " + testDateFormat.format(selectedDate));
        By dateButtonLocator = By.cssSelector(String.format(this.dateButtonLocatorString, testDateFormat.format(selectedDate)));
        this.action.click(dateButtonLocator);
        By applyButtonSelector = By.cssSelector("button[id*=reload-btn]");
        this.action.click(applyButtonSelector);
        this.action.waitSpinner(this.loadingSelector);
        this.action.waitPropertyToBe(this.datePicker, "disabled", "false");
    }

    public String getReportType(){
        By columnSelector = By.xpath("//mat-button-toggle-group[@name=\"periodSelector\"]/descendant::button[@aria-pressed=\"true\"]/descendant::span");
        return this.action.getText(columnSelector);
    }

    public String getNoteContent(){
        By noteContentSelector = By.xpath("//div[@id='note-info']//*[contains(@class,'note-content')]");
        return this.action.getText(noteContentSelector);
    }

    public String getNoteOpenDate(){
        By noteContentSelector = By.xpath("//div[@id='note-info']//*[@id='note-open-date']");
        String noteOpenDate = this.action.getText(noteContentSelector);
        DateTimeFormatter noteOpenDateFormat = DateTimeFormatter.ofPattern("MMM d, uuuu, K:mm:ss a");
        LocalDate selectedDate = LocalDate.parse(noteOpenDate, noteOpenDateFormat);
        DateTimeFormatter dateFormat = DateTimeFormatter.ofPattern("M/d/yyyy");
        return dateFormat.format(selectedDate);
    }

    public String getDate(){
        By dateSelector = By.xpath("//div[@class='date-field']//input");
        return this.action.getAttribute(dateSelector,"value");
    }
}
