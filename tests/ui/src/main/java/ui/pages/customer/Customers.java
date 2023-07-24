package ui.pages.customer;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;
import ui.core.DriverManager;
import ui.pages.subaccounts.SubaccountForm;

public class Customers extends AbstractPageObject {
    @FindBy(css = "#page-title")
    WebElement customersTitle;
    @FindBy(css = "#add-customer-button")
    WebElement addCustomerButton;
    @FindBy(css = "#add-subaccount-button")
    WebElement addSubaccountButton;
    By spinnerSelector = By.cssSelector("svg[preserveAspectRatio]");

    public CustomerForm openCustomerForm() {
        this.action.click(this.addCustomerButton);
        return new CustomerForm();
    }

    public String getTitle() {
        String title = "none";
        title = this.action.getText(this.customersTitle);
        return title;
    }

    public boolean isPlaceholderPresent(String option) {
        try{
            By placeholder = By.xpath("//mat-label[@id='" + option + "']");
            this.action.forceClick(placeholder);
            return true;
        } catch (Exception e) {
            System.out.println("Couldn't find the placeholder with id: " + option);
            System.out.println(e.toString());
            return false;
        }
    }
    public CustomerRow getCustomer(String customerName) {
        String customer = customerName + DriverManager.getInstance().getTimeStamp();
        return new CustomerRow(customer);
    }

    public CustomerRow getSubaccount(String customerName, String subaccountName) {
        String customer = customerName + DriverManager.getInstance().getTimeStamp();
        String subaccount = subaccountName + DriverManager.getInstance().getTimeStamp();
        CustomerRow customerRow = new CustomerRow(customer);
        customerRow.getSubaccountRow(customer, subaccount);
        return customerRow;
    }
    
    public CustomerRow getCustomerSubaccount(String customerName, String subaccountName){
        CustomerRow customerRow = new CustomerRow(customerName);
        customerRow.getSubaccountRow(customerName, subaccountName);
        return customerRow;
    }

    public SubaccountForm openSubaccountForm() {
        this.action.click(this.addSubaccountButton);
        this.action.waitSpinner(this.spinnerSelector);
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
