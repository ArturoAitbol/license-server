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
            this.action.forceClick(this.settingsButton);
//            driver.manage().deleteAllCookies();
            By logoutSelector = By.cssSelector("#logout-button");
            this.action.forceClick(logoutSelector);
            return logoutWindow();

        } catch (Exception e) {
            System.out.println("Couldn't execute the logout process: Some buttons/messages weren't available");
            System.out.println(e.toString());
            return false;
        }
    }

    public Boolean logoutWindow(){
        try{
            By logoutHeader = By.cssSelector("div[role='heading']");
            this.action.waitVisibilityElement(logoutHeader);
            driver.manage().deleteAllCookies();
            By accountSelector = By.cssSelector("div.table");
            this.action.click(accountSelector);
            driver.manage().deleteAllCookies();
            this.action.checkText(logoutHeader, "You signed out of your account");
            return true;
        } catch (Exception e) {
            System.out.println("Couldn't execute the logout process from window: Some buttons/messages weren't available");
            System.out.println(e.toString());
            return false;
        }
    }
}
