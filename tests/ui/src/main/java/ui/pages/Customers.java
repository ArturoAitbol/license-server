package ui.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

public class Customers extends AbstractPageObject {
    @FindBy(css = "#page-title")
    WebElement customersTitle;
    @FindBy(css = "#add-customer-button")
    WebElement addCustomerButton;
    @FindBy(css = "#add-subaccount-button")
    WebElement addSubaccountButton;

    public CustomerForm openCustomerForm() {
        this.action.click(this.addCustomerButton);
        return new CustomerForm();
    }

    public String getTitle() {
        String title = "none";
        title = this.action.getText(this.customersTitle);
        return title;
    }

    public CustomerRow getCustomer(String customerName) {
        return new CustomerRow(customerName);
    }

    public SubaccountRow getSubaccount(String subaccountName) {
        return new SubaccountRow(subaccountName);
    }

    public SubaccountForm openSubaccountForm() {
        this.action.click(this.addSubaccountButton);
        By modalLocator = By.cssSelector("div.loading-shade");
        this.action.waitModal(modalLocator);
        return new SubaccountForm();
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
}
