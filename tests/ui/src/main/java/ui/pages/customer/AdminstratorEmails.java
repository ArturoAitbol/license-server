package ui.pages.customer;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

public class AdminstratorEmails extends AbstractPageObject {
    @FindBy(css = "button#addButton")
    WebElement addButton;
    @FindBy(css = "input#email")
    WebElement emailInput;
    @FindBy(css = "button#submit-button")
    WebElement submitButton;
    By messageSelector = By.cssSelector(".cdk-overlay-container snack-bar-container");

    public String addAdministrator(String adminEmail){
        this.action.click(this.addButton);
        this.action.sendText(this.emailInput, adminEmail);
        this.action.click(this.submitButton);
        this.action.waitModal();
        return this.action.getText(this.messageSelector);
    }

    public String deleteAdministrator(String adminEmail){
//        By deleteButton = By.cssSelector(String.format("//label[@title='%s']/parent::*/following-sibling::*/child::button[@id='clearButton']",adminEmail));
        By deleteButton = By.xpath(String.format("//div[@title='%s']/descendant::button[@id='clearButton']", adminEmail));
        this.action.click(deleteButton);
        return this.action.getText(this.messageSelector);
    }
}
