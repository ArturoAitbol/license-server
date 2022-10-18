package ui.pages.spotlight;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import ui.core.AbstractPageObject;

public class Stakeholders extends AbstractPageObject {
    @FindBy(css = "#add-customer-button")
    WebElement addStakeholderButton;

    public StakeholderForm openStakeholderForm() {
        this.action.click(this.addStakeholderButton);
        return new StakeholderForm();
    }

    public String getMessage() {
        String message;
        By messageSelector = By.cssSelector(".cdk-overlay-container snack-bar-container");
        try {
            message = this.action.getText(messageSelector);
        } catch (Exception e) {
            System.out.println("Message couldn't be retrieved");
            System.out.println(e.toString());
            message = "None";
        }
        return message;
    }

    public void waitData(){
        By spinnerSelector = By.cssSelector("#stakeholders-table [src*='spinner']");
        this.action.waitSpinner(spinnerSelector);
    }

}
