package ui.pages.subscriptions;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

public class SubscriptionForm extends AbstractPageObject {
    @FindBy(css = "[formcontrolname='startDate']")
    WebElement startDate;
    @FindBy(css = "[formcontrolname='renewalDate']")
    WebElement renewalDate;
    @FindBy(css = "[formcontrolname='description']")
    WebElement description;
    @FindBy(css = "[formcontrolname='subscriptionType']")
    WebElement subscriptionType;
    @FindBy(css = "[formcontrolname='deviceLimit']")
    WebElement deviceLimit;
    @FindBy(css = "[formcontrolname='tokensPurchased']")
    WebElement tokensPurchased;
    @FindBy(css = "button#submit-button")
    WebElement submitButton;

    public Subscriptions createSubscription(String startDate, String renewalDate, String type, String description, String deviceLimit,
                                  String tokensPurchased) {
        this.action.sendText(this.startDate, startDate);
        this.action.sendText(this.renewalDate, renewalDate);
        this.action.sendText(this.description, description);
        By optionType = By.cssSelector(String.format("mat-option[title='%s']", type));
        this.action.selectOption(this.subscriptionType, optionType);
        if (type.equalsIgnoreCase("AddOn") || type.equalsIgnoreCase("Custom")) {
            this.action.sendText(this.deviceLimit, deviceLimit);
            this.action.sendText(this.tokensPurchased, tokensPurchased);
        }
        this.action.click(this.submitButton);
        return new Subscriptions();
    }

    public Subscriptions editSubscription(String startDate, String renewalDate, String subscriptionType, String description, String deviceLimit, String tokensPurchased) {
        if (!startDate.equals("none"))
            this.action.replaceText(this.startDate, startDate);
        if (!renewalDate.equals("none"))
            this.action.replaceText(this.renewalDate, renewalDate);
        if (!description.equals("none"))
            this.action.replaceText(this.description, description);
        if (!subscriptionType.equals("none")) {
            By typeSelector = By.cssSelector(String.format("mat-option[title='%s']", subscriptionType));
            this.action.selectOption(this.subscriptionType, typeSelector);
            if (subscriptionType.equals("AddOn") || subscriptionType.equals("Custom")) {
                this.action.replaceText(this.deviceLimit, deviceLimit);
                this.action.replaceText(this.tokensPurchased, tokensPurchased);
            }
        }
        this.action.click(this.submitButton);
        return new Subscriptions();
    }
}
