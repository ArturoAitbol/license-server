package ui.pages.customer;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

public class CustomerForm extends AbstractPageObject {
    @FindBy(css = "input#customerName")
    WebElement customerName;
    @FindBy(css = "[formcontrolname='customerType']")
    WebElement customerType;
    @FindBy(css = "[formcontrolname='adminEmail']")
    WebElement adminEmail;
    @FindBy(css = "[formcontrolname='subaccountName']")
    WebElement subaccountName;
    @FindBy(css = "[formcontrolname='subaccountAdminEmail']")
    WebElement subaccountAdminEmail;
    @FindBy(id = "spotlight-service")
    WebElement spotlightPermission;
    @FindBy(css = "[formcontrolname='testCustomer']")
    WebElement testCustomer;
    @FindBy(css = "button#submitBtn")
    WebElement submitButton;

    By messageSelector = By.cssSelector(".cdk-overlay-container snack-bar-container");

    public Customers createCustomer(String customerName, String type, String adminEmail, String subaccount, String subAdminEmail, String spotlightPermission, String testCustomer){
        this.action.sendText(this.customerName, customerName);
        By optionType = By.cssSelector(String.format("mat-option[title='%s']", type));
        this.action.selectOption(this.customerType, optionType);
        this.action.sendText(this.adminEmail, adminEmail);
        if (!subaccount.equals("Default"))
            this.action.replaceText(this.subaccountName, subaccount);
        this.action.sendText(this.subaccountAdminEmail, subAdminEmail);
        if (!spotlightPermission.equals("no") && !spotlightPermission.equals("disable"))
            this.action.click(this.spotlightPermission);
        if (!testCustomer.equals("no") && !testCustomer.equals("disable"))
            this.action.click(this.testCustomer);
        this.action.click(this.submitButton);
        return new Customers();
    }

    public String editCustomer(String customerName, String type, String subaccount)
    {
        if (customerName != null)
            this.action.replaceText(this.customerName, customerName);
        if (type != null)
        {
            By optionType = By.cssSelector(String.format("mat-option[title='%s']", type));
            this.action.selectOption(this.customerType, optionType);
        }
        if (subaccount != null)
            this.action.replaceText(this.subaccountName, subaccount);
        this.action.click(this.submitButton);
        return this.action.getText(this.messageSelector);
    }
}
