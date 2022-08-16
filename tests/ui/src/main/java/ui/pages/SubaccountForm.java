package ui.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

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
        By customerSelector = By.cssSelector(String.format("mat-option[title='%s']", customer));
        this.action.selectOption(this.customerName, customerSelector);
        this.action.sendText(this.subaccountName, subAccountName);
        this.action.sendText(this.subAdminEmail, subAdminEmail);
        this.action.click(this.submitButton);
        return new Customers();
    }
}
