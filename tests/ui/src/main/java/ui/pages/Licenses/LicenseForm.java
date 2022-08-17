package ui.pages.Licenses;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

public class LicenseForm extends AbstractPageObject {
    @FindBy(css = "[formcontrolname='startDate']")
    WebElement startDate;
    @FindBy(css = "[formcontrolname='renewalDate']")
    WebElement renewalDate;
    @FindBy(css = "[formcontrolname='packageType']")
    WebElement packageType;
    @FindBy(css = "[formcontrolname='deviceLimit']")
    WebElement deviceLimit;
    @FindBy(css = "[formcontrolname='tokensPurchased']")
    WebElement tokensPurchased;
    @FindBy(css = "button#submit-button")
    WebElement submitButton;

    public Licenses createLicense(String startDate, String renewalDate, String type, String deviceLimit,
            String tokensPurchased) {
        this.action.sendText(this.startDate, startDate);
        this.action.sendText(this.renewalDate, renewalDate);
        By optionType = By.cssSelector(String.format("[ng-reflect-value='%s']", type));
        this.action.selectOption(this.packageType, optionType);
        if (type.equalsIgnoreCase("AddOn") || type.equalsIgnoreCase("Custom")) {
            this.action.sendText(this.deviceLimit, deviceLimit);
            this.action.sendText(this.tokensPurchased, tokensPurchased);
        }
        this.action.click(this.submitButton);
        return new Licenses();
    }
}
