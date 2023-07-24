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
    By spinnerSelector = By.cssSelector("svg[preserveAspectRatio]");

    public String getTableTitle() {
        String title = "none";
        title = this.action.getText(this.tableTitle);
        return title;
    }

    public SubscriptionForm openSubscriptionForm() {
        this.action.click(this.addLicenseButton);
        this.action.waitSpinner(this.spinnerSelector);
        return new SubscriptionForm();
    }

    public String getMessage() {
        String message;
        By messageSelector = By.cssSelector(".cdk-overlay-container snack-bar-container");
        try{
            message = this.action.getText(messageSelector);
        } catch (Exception e){
            System.out.println("Message couldn't be retrieved");
            System.out.println(e.toString());
            message = "None";
        }
        return message;
    }

    public String getPageTitle(){
        String message;
        By messageSelector = By.id("title");
        try{
            message = this.action.getText(messageSelector);
        } catch (Exception e){
            System.out.println("Title couldn't be retrieved");
            System.out.println(e.toString());
            message = "None";
        }
        return message;
    }
}
