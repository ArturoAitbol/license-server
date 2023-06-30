package ui.pages;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.openqa.selenium.By;
import ui.core.AbstractPageObject;
import ui.pages.customer.Customers;

public class LoginForm extends AbstractPageObject {
    String originalWindow;
/*    @FindBy(css = "input[type='email']")
    WebElement emailInput;
    @FindBy(css = ".win-button[type='submit']")
    WebElement acceptButton;
    By passwordInput = By.cssSelector("input[type='password']");
    @FindBy(css = ".win-button#idBtn_Back")
    WebElement stayedSigned;
    @FindBy(css = "div[role='heading']")
    WebElement formTitle;
    @FindBy(css = "[type='submit']")
    WebElement permissionButton;
    By accountSelector = By.cssSelector("div.table");*/

    public LoginForm(String window) {
        this.originalWindow = window;
    }

    public Customers SignIn(String email, String password,String role) {
        By emailInput = By.cssSelector("input[type='email']");
        this.action.sendText(emailInput, email);
        By acceptButton = By.cssSelector(".win-button[type='submit']");
        this.action.click(acceptButton);
/*        String loginHeader = this.action.getText(formTitle);
        if (loginHeader.contains("trouble locating you account"))
            this.action.click(accountSelector);*/
        By passwordInput = By.cssSelector("input[type='password']");
        this.action.sendText(passwordInput, password);
        this.action.click(acceptButton);
/*        String loginHeader = this.action.getText(formTitle);
        if (loginHeader.contains("Permission requested"))
            this.action.forceClick(permissionButton);*/
        By stayedSigned = By.cssSelector(".win-button#idBtn_Back");
        this.action.click(stayedSigned);
        driver.switchTo().window(this.originalWindow);
        By settingsSelector = By.cssSelector("#settings-button");
        assertEquals("Verification of login process has failed", "ok", this.action.checkElement(settingsSelector));
        return new Customers();
    }
}
