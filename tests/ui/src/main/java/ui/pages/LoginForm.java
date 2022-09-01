package ui.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;
import ui.core.AbstractPageObject;

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

    public LoginForm(String window) {
        this.originalWindow = window;
    }

    public Customers SignIn(String email, String password) {
        this.action.sendText(this.emailInput, email);
        this.action.click(acceptButton);
        this.action.sendText(this.passwordInput, password);
        this.action.click(acceptButton);
        this.action.click(stayedSigned);
        driver.switchTo().window(this.originalWindow);
        this.wait.until(ExpectedConditions.titleIs("tekVizion 360 Portal"));
        return new Customers();
    }

    public String getTitle() {

        String sample = formTitle.getAttribute("innerHTML");
        return sample;

    }

    public Customers signedIn() {
        driver.switchTo().window(this.originalWindow);
        this.wait.until(ExpectedConditions.titleIs("tekToken Consumption Portal"));
        return new Customers();
    }
}
