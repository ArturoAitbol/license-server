package ui.pages.packages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

public class PackageForm extends AbstractPageObject {
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

    public Packages createPackage(String startDate, String renewalDate, String type, String deviceLimit,
                                  String tokensPurchased) {
        this.action.sendText(this.startDate, startDate);
        this.action.sendText(this.renewalDate, renewalDate);
        By optionType = By.cssSelector(String.format("mat-option[title='%s']", type));
        this.action.selectOption(this.packageType, optionType);
        if (type.equalsIgnoreCase("AddOn") || type.equalsIgnoreCase("Custom")) {
            this.action.sendText(this.deviceLimit, deviceLimit);
            this.action.sendText(this.tokensPurchased, tokensPurchased);
        }
        this.action.click(this.submitButton);
        return new Packages();
    }

    public Packages editPackage(String startDate, String renewalDate, String packageType, String deviceLimit, String tokensPurchased) {
        if (!startDate.equals("none"))
            this.action.replaceText(this.startDate, startDate);
        if (!renewalDate.equals("none"))
            this.action.replaceText(this.renewalDate, renewalDate);
        if (!packageType.equals("none"))
        {
            By typeSelector = By.cssSelector(String.format("mat-option[title='%s']", packageType));
            this.action.selectOption(this.packageType, typeSelector);
            if (packageType.equals("AddOn") || packageType.equals("Custom"))
            {
                this.action.replaceText(this.deviceLimit, deviceLimit);
                this.action.replaceText(this.tokensPurchased, tokensPurchased);
            }
        }
        this.action.click(this.submitButton);
        return new Packages();
    }
}
