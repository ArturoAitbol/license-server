package ui.pages;

import java.util.ArrayList;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
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
    @FindBy(css = "#title")
    WebElement subTitle;

    By loadingSelector = By.cssSelector("figcaption.loadingMessage");

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
            this.action.forceClick(buttonSelector);
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

    public String getSubTitle(){
        return this.action.getText(this.subTitle);
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

    public void changeWindowToDetailedReport(){
        ArrayList<String> tabs = new ArrayList<String>(driver.getWindowHandles());
        driver.switchTo().window(tabs.get(2));
        this.action.waitSpinner(this.loadingSelector);
    }

    public void closeAllTabsButOne(){
         String currentTab = driver.getWindowHandle();
         for (String window : driver.getWindowHandles()) {
             if (!window.equals(currentTab)) {
                 driver.switchTo().window(window);
                 driver.close();
             }
         }
        driver.switchTo().window(currentTab);
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
