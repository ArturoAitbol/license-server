package ui.pages.consumptions;

import com.google.common.collect.Sets;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

import java.util.*;
import java.util.stream.Collectors;

public class ConsumptionForm extends AbstractPageObject {
    @FindBy(css = "mat-form-field#consumption-week mat-datepicker-toggle")
//    @FindBy(css = "license-consumption-calendar")
    WebElement calendarButton;
    @FindBy(css = "[formcontrolname='startWeek']")
    WebElement startWeekInput;
    @FindBy(css = "[formcontrolname='endWeek']")
    WebElement endWeekInput;
    @FindBy(css = "[formcontrolname='project']")
    WebElement projectInput;
    @FindBy(css = "#type-auto-complete")
    WebElement deviceTypeInput;
    @FindBy(css = "#vendor-auto-complete")
    WebElement deviceVendorInput;
    @FindBy(css = "#device-auto-complete")
    WebElement deviceModelInput;
    @FindBy(css = "#support-vendor-auto-complete")
    WebElement supportVendorInput;
    @FindBy(css = "#support-device-auto-complete")
    WebElement supportModelInput;
    @FindBy(css = "#dut-auto-complete")
    WebElement dutTypeInput;
    @FindBy(css = "#dut-vendor-auto-complete")
    WebElement dutVendorInput;
    @FindBy(css = "#dut-device-auto-complete")
    WebElement dutDeviceInput;
    @FindBy(css = "#calling-platform-auto-complete")
    WebElement callingTypeInput;
    @FindBy(css = "#calling-platform-vendor-auto-complete")
    WebElement callingVendorInput;
    @FindBy(css = "#calling-platform-device-auto-complete")
    WebElement callingDeviceInput;
    @FindBy(css = "#submit-button")
    WebElement submitButton;
    @FindBy(css = "#close-button")
    WebElement closeButton;
    private String[] daysArray;
    By spinnerSelector = By.cssSelector("svg[preserveAspectRatio]");

    public Consumptions addConsumption(String startWeek, String endWeek, String project, String deviceType, String deviceVendor,
                        String deviceModel, String supportVendor, String supportModel, String deviceVersion, String deviceGranularity, String tekTokens, String usageDays) {
        this.action.selectToday(this.calendarButton);
        String deviceTypeSelector = "";
        By projectSelector = By.cssSelector(String.format("mat-option[title='%s']", project));
        this.action.selectOption(this.projectInput, projectSelector);
        if (!deviceType.isEmpty()){
            By typeSelector = By.cssSelector(String.format("mat-option[title='%s']", deviceType));
            this.action.selectOption(this.deviceTypeInput, typeSelector);
        }
        String deviceFieldContent = getDeviceFieldContent(deviceModel, supportModel, deviceVersion, deviceGranularity, tekTokens);
        By modelSelector = By.cssSelector(String.format("mat-option[title='%s']", deviceFieldContent));
        if (!deviceVendor.isEmpty()){
            By vendorSelector = By.cssSelector(String.format("mat-option[title='%s']", deviceVendor));
            this.action.selectOption(this.deviceVendorInput, vendorSelector);
            this.waitSpinner();
            if (!deviceModel.isEmpty())
                this.action.selectOption(this.deviceModelInput, modelSelector);
            deviceTypeSelector = "#device-usage-days > ";
        }
        if (!supportVendor.isEmpty()){
            By vendorSelector = By.cssSelector(String.format("mat-option[title='%s']", supportVendor));
            this.action.selectOption(this.supportVendorInput, vendorSelector);
            this.waitSpinner();
            if (!supportModel.isEmpty())
                this.action.selectOption(this.supportModelInput, modelSelector);
            deviceTypeSelector = "#support-usage-days > ";
        }
        By daySelector;
        if (!usageDays.isEmpty()){
            this.daysArray = usageDays.split("[ ,]+");
            for (String day: daysArray){
                daySelector = By.cssSelector(deviceTypeSelector + String.format("mat-checkbox[title='%s']", day));
                this.action.click(daySelector);
            }
        }
        this.action.click(this.submitButton);
        return new Consumptions();
    }

    public Consumptions addLabsConsumption(String startWeek, String endWeek, String project, String dutType, String dutVendor, String
                                           dutDevice, String callingType, String callingVendor, String callingDevice, String usageDays) {
        this.action.selectToday(this.calendarButton);
        By projectSelector = By.cssSelector(String.format("mat-option[title='%s']", project));
        this.action.selectOption(this.projectInput, projectSelector);
        String deviceType = "#consumption-usage-days >";
        if (!dutType.isEmpty()){
            By typeSelector = By.cssSelector(String.format("mat-option[title='%s']", dutType));
            this.action.selectOption(this.dutTypeInput, typeSelector);
            this.waitSpinner();
            By vendorSelector = By.cssSelector(String.format("mat-option[title='%s']", dutVendor));
            this.action.selectOption(this.dutVendorInput, vendorSelector);
            this.waitSpinner();
            By deviceSelector = By.cssSelector(String.format("mat-option[title*='%s']", dutDevice));
            this.action.selectOption(this.dutDeviceInput, deviceSelector);
        }
        if (!callingType.isEmpty()){
            By typeSelector = By.cssSelector(String.format("mat-option[title='%s']", callingType));
            this.action.selectOption(this.callingTypeInput, typeSelector);
            this.waitSpinner();
            By vendorSelector = By.cssSelector(String.format("mat-option[title='%s']", callingVendor));
            this.action.selectOption(this.callingVendorInput, vendorSelector);
            this.waitSpinner();
            By deviceSelector = By.cssSelector(String.format("mat-option[title*='%s']", callingDevice));
            this.action.selectOption(this.callingDeviceInput, deviceSelector);
        }
        By daySelector;
        if (!usageDays.isEmpty()){
            this.daysArray = usageDays.split("[ ,]+");
            for (String day: daysArray){
                daySelector = By.cssSelector(deviceType + String.format("mat-checkbox[title='%s']", day));
                this.action.click(daySelector);
            }
        }
        this.action.click(this.submitButton);
        return new Consumptions();
    }

    public Consumptions editConsumption(String currentProject, String newProject, String deviceVendor, String deviceModel,
            String deviceVersion, String deviceGranularity, String tekTokens, String usageDays) {
        By currentDaysSelector = By.xpath(String.format("//td[@title='%s']/following-sibling::td[@id='Usage Days']", currentProject));
        String currentDays = this.action.getText(currentDaysSelector);
        if (!usageDays.isEmpty()){
            Set<String> currentDaysSet;
            if (currentDays.equals("...")){
                List<WebElement> elements = this.action.waitVisibilityElements(By.cssSelector("#usage-detail"));
                List<String> daysList = elements.stream().map(element -> element.getAttribute("title")).collect(Collectors.toList());
//                System.out.println(daysList.toString());
                currentDaysSet = new HashSet<>(daysList);
            } else {
                String[] currentDaysArrays = currentDays.split("[,]+");
                currentDaysSet = new HashSet<>(Arrays.asList(currentDaysArrays));
            }
            String[] daysSelected = usageDays.split("[ ,]+");
            Set<String> daysSelectedSet = new HashSet<>(Arrays.asList(daysSelected));
            Set<String> diffDays = Sets.symmetricDifference(currentDaysSet, daysSelectedSet);
//            System.out.println(diffDays.toString());
            By daySelector;
            for (String day: diffDays){
                if (currentDays.equals("...")) {
                    daySelector = By.cssSelector(String.format("[title='%s'] button[title='Delete Usage']", day));
                    this.action.click(daySelector);
                    this.waitSpinner();
                } else {
                    daySelector = By.cssSelector(String.format("mat-checkbox[title='%s']", day));
                    this.action.click(daySelector);
                }
            }
        }
        if (!newProject.isEmpty()) {
            By projectSelector = By.cssSelector(String.format("mat-option[title='%s']", newProject));
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
        if (currentDays.equals("..."))
            this.action.click(this.closeButton);
        else
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

    public void waitSpinner() {
        this.action.waitSpinner(this.spinnerSelector);
    }
}
