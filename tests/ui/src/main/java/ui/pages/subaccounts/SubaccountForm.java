package ui.pages.subaccounts;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;
import ui.core.DriverManager;
import ui.pages.customer.Customers;

public class SubaccountForm extends AbstractPageObject {
    @FindBy(css="[formcontrolname='customer']")
    WebElement customerName;
    @FindBy(css="[formcontrolname='subaccountName']")
    WebElement subaccountName;
    @FindBy(css="[formcontrolname='subaccountAdminEmail']")
    WebElement subAdminEmail;
    @FindBy(css="button#submitBtn")
    WebElement submitButton;

    public Customers createSubaccount(String customer, String subAccountName, String subAdminEmail){
        String timeStamp = DriverManager.getInstance().getTimeStamp();
        By customerSelector = By.cssSelector(String.format("mat-option[title='%s']", customer + timeStamp));
        this.action.selectOption(this.customerName, customerSelector);
        this.action.sendText(this.subaccountName, subAccountName + timeStamp);
        if (!DriverManager.getInstance().getActiveDirectoryStatus())
            subAdminEmail = DriverManager.getInstance().addTimeStampToEmail(subAdminEmail);
        this.action.sendText(this.subAdminEmail, subAdminEmail);
        this.action.click(this.submitButton);
        return new Customers();
    }
}
