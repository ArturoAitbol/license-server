package ui.pages;

import org.aeonbits.owner.ConfigFactory;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;
import ui.utils.Environment;

public class Landing extends AbstractPageObject {

    @FindBy(css="button.rsdLoginButton")
    WebElement loginButton;
    Environment environment = ConfigFactory.create(Environment.class);

    public Landing(){
        driver.get(this.environment.url());
    }

    public LoginForm openLoginForm(){
        String originalWindow = driver.getWindowHandle();
        this.action.click(this.loginButton);
        for (String winHandle : driver.getWindowHandles()) {
            driver.switchTo().window(winHandle); // switch focus of WebDriver to the next found window handle (that's your newly opened window)
        }
        this.action.checkTitle("Sign in to your account");
        return new LoginForm(originalWindow);
    }

    public String checkLogin() {
        try {
            this.action.waitVisibilityElement(this.loginButton);
            return "ok";
        } catch (Exception e){
            System.out.println("Couldn't find the login button");
            return "error";
        }
    }
}
