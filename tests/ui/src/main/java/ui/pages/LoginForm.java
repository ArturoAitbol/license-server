package ui.pages;

import static org.junit.Assert.assertTrue;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;
import ui.pages.customer.Customers;

public class LoginForm extends AbstractPageObject {
    @FindBy(css = "input[type='email']")
    WebElement emailInput;
    @FindBy(css = ".win-button[type='submit']")
    WebElement acceptButton;
    By passwordInput = By.cssSelector("input[type='password']");
    String originalWindow;
    @FindBy(css = ".win-button#idBtn_Back")
    WebElement stayedSigned;
    @FindBy(css = "div[role='heading']")
    WebElement formTitle;
    @FindBy(css = "[type='submit']")
    WebElement permissionButton;

    public LoginForm(String window) {
        this.originalWindow = window;
    }

    public Customers SignIn(String email, String password,String role) {
        this.action.sendText(this.emailInput, email);
        this.action.click(acceptButton);
        this.action.sendText(this.passwordInput, password);
        this.action.click(acceptButton);
        if (role.equals("Stakeholder") || role.equals("SubaccountAdministrator"))
            this.action.forceClick(permissionButton);
        this.action.click(stayedSigned);
        driver.switchTo().window(this.originalWindow);
        assertTrue(this.action.checkTitle("tekVizion 360 Portal"));
        return new Customers();
    }

    public String getTitle() {

        String sample = formTitle.getAttribute("innerHTML");
        return sample;

    }

    public Customers signedIn() {
        driver.switchTo().window(this.originalWindow);
        assertTrue(this.action.checkTitle("tekVizion 360 Portal"));
        return new Customers();
    }
}
