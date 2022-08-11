package ui.pages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

public class Customers extends AbstractPageObject {
    @FindBy(css="#page-title")
    WebElement customersTitle;
    @FindBy(css="#add-customer-button")
    WebElement addCustomerButton;

    public CustomerForm openCustomerForm(){
        this.action.click(this.addCustomerButton);
        return new CustomerForm();
    }
    public String getTitle(){
        String title = "none";
        title = this.action.getText(customersTitle);
        return title;
    }
    public CustomerRow getCustomer(String customerName){
        return new CustomerRow(customerName);
    }
}
