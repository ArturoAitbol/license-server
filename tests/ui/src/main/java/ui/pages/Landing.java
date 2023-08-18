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
//        driver.get(this.environment.url());
//        driver.navigate().to(this.environment.url());
        System.out.println("Navigate to:" + this.environment.url());
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

    public String checkIfLoggedIn() {
        driver.navigate().to(this.environment.url());
        By settingsSelector = By.cssSelector("#settings-button");
        String res = this.action.checkElement(settingsSelector);
        return res;
    }
}
