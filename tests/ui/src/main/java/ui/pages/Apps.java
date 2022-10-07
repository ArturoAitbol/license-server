package ui.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

public class Apps extends AbstractPageObject {
/*    @FindBy(css = "#tokenConsumption-button")
    WebElement tokenConsumptionButton;
    @FindBy(css = "#ctaas-button")
    WebElement ctaasButton;*/
    @FindBy(css = "app-my-apps")
    WebElement myAppsSelector;
    @FindBy(css = "#header-title")
    WebElement headerTitle;

    public boolean checkMyAppsView(){
        boolean response = false;
        try {
            this.action.waitVisibilityElement(this.myAppsSelector);
            response = true;
        } catch (Exception e){
            System.out.println("Apps view wasn't available");
            System.out.println(e.toString());
        }
        return response;
    }

    public boolean click(String button) {
        boolean response = false;
        try {
            By buttonSelector = By.cssSelector(String.format("[title=\"%s\"]",button));
            this.action.click(buttonSelector);
            response = true;
        } catch (Exception e){
            System.out.println("Button wasn't available: " + button);
            System.out.println(e.toString());
        }
        return response;
    }

    public String getTitle(){
        return this.action.getText(this.headerTitle);
    }

    public String checkButton(String button) {
        String response = "none";
        try {
            By buttonSelector = By.cssSelector(String.format("[title='%s']",button));
            response = this.action.getText(buttonSelector);
        } catch (Exception e){
            System.out.println("Button wasn't displayed: " + button);
            System.out.println(e.toString());
        }
        return response;
    }

    public boolean checkWindowTitle() {
        return this.action.checkTitle("Sign out");
    }

    public void logout() {
        driver.manage().deleteAllCookies();
        By accountSelector = By.cssSelector("div[role='heading']");
        this.action.waitVisibilityElement(accountSelector);
//            By accountSelector = By.cssSelector("div.table");
//            this.action.click(accountSelector);
        driver.manage().deleteAllCookies();
    }
}
