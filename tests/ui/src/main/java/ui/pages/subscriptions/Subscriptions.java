package ui.pages.subscriptions;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import ui.core.AbstractPageObject;

public class Subscriptions extends AbstractPageObject {
    @FindBy(id = "#page-title")
    WebElement licensesTitle;
    @FindBy(id = "table-title")
    WebElement tableTitle;
    @FindBy(css = "#add-license-button")
    WebElement addLicenseButton;
    @FindBy(css = "button#back-button")
    WebElement backButton;
    By messageSelector = By.cssSelector(".cdk-overlay-container snack-bar-container");

    public String getTableTitle() {
        String title = "none";
        title = this.action.getText(this.tableTitle);
        return title;
    }

    public SubscriptionForm openSubscriptionForm() {
        this.action.openForm(this.addLicenseButton);
        return new SubscriptionForm();
    }

    public String getMessage() {
        return this.action.getText(this.messageSelector);
    }
}
