package ui.pages.customer;

import org.aeonbits.owner.ConfigFactory;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;
import ui.core.DriverManager;
import ui.pages.Modal;
import ui.utils.Environment;

public class AdminstratorEmails extends AbstractPageObject {
    @FindBy(css = "button#addButton")
    WebElement addButton;
    @FindBy(css = "input#email")
    WebElement emailInput;
    @FindBy(css = "button#submit-button")
    WebElement submitButton;
    By messageSelector = By.cssSelector(".cdk-overlay-container snack-bar-container");
    By spinnerSelector = By.cssSelector("svg[preserveAspectRatio]");
    Environment environment = ConfigFactory.create(Environment.class);

    public String addAdministrator(String adminEmail){
        this.action.click(this.addButton);
        this.action.sendText(this.emailInput, DriverManager.getInstance().addTimeStampToEmail(adminEmail));
        this.action.click(this.submitButton);
        String text = this.action.getText(this.messageSelector);
        this.action.waitSpinner(this.spinnerSelector);
        return text;
    }

    public String deleteAdministrator(String adminEmail, String type){
        By deleteButton = By.xpath(String.format("//div[@title='%s']/descendant::button[@id='clearButton']", DriverManager.getInstance().addTimeStampToEmail(adminEmail)));
        this.action.click(deleteButton);
        if (type.equals("subaccount")){
            Modal confirmModal = new Modal();
            confirmModal.confirmAction();
        }
        return this.action.getText(this.messageSelector);
    }
}
