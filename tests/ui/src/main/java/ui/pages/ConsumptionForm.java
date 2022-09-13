package ui.pages;

import com.google.common.collect.Sets;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

import java.util.*;

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
    @FindBy(css = "#support-vendor-auto-complete")
    WebElement supportVendorInput;
    @FindBy(css = "#support-device-auto-complete")
    WebElement supportModelInput;
    @FindBy(css = "#submit-button")
    WebElement submitButton;
    private String[] daysArray;

    public Consumptions addConsumption(String startWeek, String endWeek, String project, String deviceVendor,
                        String deviceModel, String supportVendor, String supportModel, String deviceVersion, String deviceGranularity, String tekTokens, String usageDays) {
/*        this.action.sendText(this.startWeekInput, startWeek);
        this.action.sendText(this.endWeekInput, endWeek);*/
        this.action.selectToday(this.calendarButton);
        By projectSelector = By.cssSelector(String.format("mat-option[title='%s']", project));
        this.action.selectOption(this.projectInput, projectSelector);
        if (!deviceVendor.isEmpty()){
            By vendorSelector = By.cssSelector(String.format("mat-option[title='%s']", deviceVendor));
            this.action.selectOption(this.deviceVendorInput, vendorSelector);
            this.waitSpinner();
        }
        if (!supportVendor.isEmpty()){
            By vendorSelector = By.cssSelector(String.format("mat-option[title='%s']", supportVendor));
            this.action.selectOption(this.supportVendorInput, vendorSelector);
            this.waitSpinner();
        }
        String deviceFieldContent = getDeviceFieldContent(deviceModel, supportModel, deviceVersion, deviceGranularity, tekTokens);
        By modelSelector = By.cssSelector(String.format("mat-option[title='%s']", deviceFieldContent));
        if (!deviceModel.isEmpty())
            this.action.selectOption(this.deviceModelInput, modelSelector);
        if (!supportModel.isEmpty())
            this.action.selectOption(this.supportModelInput, modelSelector);
        if (!usageDays.isEmpty()){
            this.daysArray = usageDays.split("[ ,]+");
            By daySelector;
            for (String day: daysArray){
                daySelector = By.cssSelector(String.format("mat-checkbox[title='%s']", day));
                this.action.click(daySelector);
            }
        }
        this.action.click(this.submitButton);
        return new Consumptions();
    }

    public Consumptions editConsumption(String project, String deviceVendor, String deviceModel, 
            String deviceVersion, String deviceGranularity, String tekTokens, String usageDays) {
        if (!usageDays.isEmpty()){
            String[] daysSelected = usageDays.split("[ ,]+");
            By currentDaysSelector = By.xpath("//div[@id='detailed-consumption-table']/descendant::td[@id='Usage Days']");
            String currentDays = this.action.getText(currentDaysSelector);
            String[] currentDaysArrays = currentDays.split("[ ,]+");
            Set<String> set1 = new HashSet<>(Arrays.asList(currentDaysArrays));
            Set<String> set2 = new HashSet<>(Arrays.asList(daysSelected));
            Set<String> diffDays = Sets.symmetricDifference(set1, set2);
            System.out.println(diffDays.toString());
            By daySelector;
            for (String day: diffDays){
                daySelector = By.cssSelector(String.format("mat-checkbox[title='%s']", day));
                this.action.click(daySelector);
            }
        }
        if (!project.isEmpty()) {
            By projectSelector = By.cssSelector(String.format("mat-option[title='%s']", project));
            this.action.replaceOption(this.projectInput, projectSelector);
        }
        if (!deviceVendor.isEmpty()) {
            By deviceVendorSelector = By.cssSelector(String.format("mat-option[title='%s']", deviceVendor));
            this.action.replaceOption(this.deviceVendorInput, deviceVendorSelector);
            this.waitSpinner();
            String deviceFieldContent = getDeviceFieldContent(deviceModel, "", deviceVersion, deviceGranularity, tekTokens);
            By deviceModelSelector = By.cssSelector(String.format("mat-option[title*='%s']", deviceFieldContent));
            this.action.replaceOption(this.deviceModelInput, deviceModelSelector);
        }
        this.action.click(this.submitButton);
        return new Consumptions();
    }

    private String getDeviceFieldContent(String deviceModel, String supportModel, String deviceVersion, String deviceGranularity, String tekTokens) {
        // logic got from add-license-consumption.component.ts in the UI Application
        String deviceFieldContent = "";
        if (!deviceModel.isEmpty())
            deviceFieldContent = deviceModel;
        else if (!supportModel.isEmpty())
            deviceFieldContent = supportModel;
        if (!deviceVersion.isEmpty())
            deviceFieldContent += " - v." + deviceVersion;
        deviceFieldContent += " (" + deviceGranularity + " - " + tekTokens + ")";
        return deviceFieldContent;
    }

    private String[] getUsageDays(String usageDays){
        String[] daysArray = usageDays.split("[ ,]+");
//        List<String> usageDaysList = new ArrayList();
        for (String day: daysArray){
            System.out.println(day);
        }
        return daysArray;
    }

    public void waitSpinner() {
        this.action.waitModal();
    }
}
