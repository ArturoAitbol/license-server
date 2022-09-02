package ui.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

public class ConsumptionForm extends AbstractPageObject {
    @FindBy(css = "#new-project-button")
    WebElement addProjectButton;
    @FindBy(css = "mat-form-field#consumption-week mat-datepicker-toggle")
//    @FindBy(css = "license-consumption-calendar")
    WebElement calendarButton;
    @FindBy(css = "[formcontrolname='startWeek']")
    WebElement startWeekInput;
    @FindBy(css = "[formcontrolname='endWeek']")
    WebElement endWeekInput;
    @FindBy(css = "[formcontrolname='project']")
    WebElement projectInput;
    @FindBy(css = "#vendor-auto-complete")
    WebElement deviceVendorInput;
    @FindBy(css = "#device-auto-complete")
    WebElement deviceModelInput;
    @FindBy(css = "#submit-button")
    WebElement submitButton;

    public Consumptions addConsumption(String startWeek, String endWeek, String project, String deviceVendor,
                        String deviceModel, String deviceVersion, String deviceGranularity, String tekTokens) {
/*        this.action.sendText(this.startWeekInput, startWeek);
        this.action.sendText(this.endWeekInput, endWeek);*/
        this.action.selectToday(this.calendarButton);
        By projectSelector = By.cssSelector(String.format("mat-option[title='%s']", project));
        this.action.selectOption(this.projectInput, projectSelector);
        By deviceVendorSelector = By.cssSelector(String.format("mat-option[title='%s']", deviceVendor));
        this.action.selectOption(this.deviceVendorInput, deviceVendorSelector);
        String deviceFieldContent = getDeviceFieldContent(deviceModel, deviceVersion, deviceGranularity, tekTokens);
        By deviceModelSelector = By.cssSelector(String.format("mat-option[title='%s']", deviceFieldContent));
        this.action.selectOption(this.deviceModelInput, deviceModelSelector);
        this.action.click(this.submitButton);
        return new Consumptions();
    }

    public Consumptions editConsumption(String project, String deviceVendor, String deviceModel, 
            String deviceVersion, String deviceGranularity, String tekTokens) {
        By modalLocator = By.cssSelector("svg[preserveAspectRatio]");
        this.action.waitModal(modalLocator);
        if (!project.isEmpty()) {
            By projectSelector = By.cssSelector(String.format("mat-option[title='%s']", project));
            this.action.replaceOption(this.projectInput, projectSelector);
        }
        if (!deviceVendor.isEmpty()) {
            By deviceVendorSelector = By.cssSelector(String.format("mat-option[title='%s']", deviceVendor));
            this.action.replaceOption(this.deviceVendorInput, deviceVendorSelector);
        }
        if (!deviceVendor.isEmpty()) {
            String deviceFieldContent = getDeviceFieldContent(deviceModel, deviceVersion, deviceGranularity, tekTokens);
            By deviceModelSelector = By.cssSelector(String.format("mat-option[title*='%s']", deviceFieldContent));
            this.action.replaceOption(this.deviceModelInput, deviceModelSelector);
        }
        this.action.openForm(this.submitButton);
        return new Consumptions();
    }

    private String getDeviceFieldContent(String deviceModel, String deviceVersion, String deviceGranularity, String tekTokens) {
        // logic got from add-license-consumption.component.ts in the UI Application
        String deviceFieldContent = deviceModel;
        if (!deviceVersion.isEmpty())
            deviceFieldContent += " - v." + deviceVersion;
        deviceFieldContent += " (" + deviceGranularity + " - " + tekTokens + ")";
        return deviceFieldContent;
    }
}
