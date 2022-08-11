package ui.pages;

import org.aeonbits.owner.ConfigFactory;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;
import ui.utils.Environment;

public class Landing extends AbstractPageObject {

//    private By loginButton = By.cssSelector("button.rsdLoginButton");
    @FindBy(css="button.rsdLoginButton")
    private WebElement loginButton;
    Environment environment = ConfigFactory.create(Environment.class);

    public Landing(){
        driver.get(this.environment.url());
        System.out.println(this.environment.url());
    }

    public LoginForm openLoginForm(){
//        System.out.println(this.driver.getTitle());
        String originalWindow = driver.getWindowHandle();
        this.action.click(this.loginButton);
        for (String winHandle : driver.getWindowHandles()) {
            driver.switchTo().window(winHandle); // switch focus of WebDriver to the next found window handle (that's your newly opened window)
        }
        this.action.checkTitle("Sign in to your account");
//        System.out.println(this.driver.getTitle());
        return new LoginForm(originalWindow);
    }

}
