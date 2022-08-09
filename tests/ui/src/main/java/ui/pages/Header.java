package ui.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

public class Header extends AbstractPageObject {
    @FindBy(css="#settings-button")
    WebElement settingsButton;

    public void logout(){
        this.action.click(this.settingsButton);
        By logoutSelector = By.cssSelector("#logout-button");
        this.action.click(logoutSelector);
        By logoutMessage = By.cssSelector("div[role='heading']");
        this.action.waitVisibilityElement(logoutMessage);
    }
}
