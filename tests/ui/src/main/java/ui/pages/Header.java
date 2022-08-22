package ui.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

public class Header extends AbstractPageObject {
    @FindBy(css="#settings-button")
    WebElement settingsButton;

    public boolean logout(){
        try{
            JavascriptExecutor executor = (JavascriptExecutor)this.driver;
            executor.executeScript("arguments[0].click();", this.settingsButton);
//            this.action.click(this.settingsButton);
            By logoutSelector = By.cssSelector("#logout-button");
            this.action.click(logoutSelector);
            By logoutMessage = By.cssSelector("div[role='heading']");
            this.action.waitVisibilityElement(logoutMessage);
            driver.manage().deleteAllCookies();
            return true;
        }catch (Exception e) {
            System.out.println("Couldn't execute the logout process: Some buttons/messages weren't available");
            System.out.println(e.toString());
            return false;
        }
    }
}
