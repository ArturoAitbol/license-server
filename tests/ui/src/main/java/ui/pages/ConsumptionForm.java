package ui.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

public class ConsumptionForm extends AbstractPageObject {
    @FindBy(css = "#new-project-button")
    WebElement addProjectButton;
    @FindBy(css = "mat-form-field#consumption-week mat-datepicker-toggle")
    WebElement calendarButton;
    @FindBy(css = "[formcontrolname='startWeek']")
    WebElement startDateInput;
    @FindBy(css = "[formcontrolname='endWeek']")
    WebElement endDateInput;
    @FindBy(css = "[formcontrolname='project']")
    WebElement projectInput;
    @FindBy(css = "#vendor-auto-complete")
    WebElement deviceVendorInput;
    @FindBy(css = "#device-auto-complete")
    WebElement deviceModelInput;
    @FindBy(css = "#submit-button")
    WebElement submitButton;

    public ProjectForm openProjectForm() {
        this.action.click(this.addProjectButton);
        return new ProjectForm();
    }

    public Consumptions addConsumption(String startDate, String endDate, String project, String deviceVendor, String deviceModel) {
        this.action.click(this.calendarButton);
        By todaySelector = By.cssSelector("div.mat-calendar-body-today");
        this.action.click(todaySelector);
/*        this.action.sendText(this.startDateInput, startDate);
        this.action.sendText(this.endDateInput, endDate);*/
        By projectSelector = By.cssSelector(String.format("mat-option[title='%s']", project));
        this.action.selectOption(this.projectInput, projectSelector);
        By deviceVendorSelector = By.cssSelector(String.format("mat-option[title='%s']", deviceVendor));
        this.action.selectOption(this.deviceVendorInput, deviceVendorSelector);
        By deviceModelSelector = By.cssSelector(String.format("mat-option[title='%s']", deviceModel));
        this.action.selectOption(this.deviceModelInput, deviceModelSelector);
        this.action.click(this.submitButton);
        return new Consumptions();
    }

    public Consumptions editConsumption(String project, String deviceVendor, String deviceModel) {
        By modalLocator = By.cssSelector("svg[preserveAspectRatio]");
        this.action.waitModal(modalLocator);
        if (!project.equals("none")){
            By projectSelector = By.cssSelector(String.format("mat-option[title='%s']", project));
            this.action.replaceOption(this.projectInput, projectSelector);
        }
        if (!deviceVendor.equals("none")){
            By deviceVendorSelector = By.cssSelector(String.format("mat-option[title='%s']", deviceVendor));
            this.action.replaceOption(this.deviceVendorInput, deviceVendorSelector);
        }
        if (!deviceVendor.equals("none")){
            By deviceModelSelector = By.cssSelector(String.format("mat-option[title*='%s']", deviceModel));
            this.action.replaceOption(this.deviceModelInput, deviceModelSelector);
        }
        this.action.click(this.submitButton);
        return new Consumptions();
    }
}
