package ui.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;
import ui.pages.packages.Packages;

public class ActionMenu extends AbstractPageObject {
    By messageSelector = By.cssSelector(".cdk-overlay-container snack-bar-container");
    @FindBy(css = "button#Delete")
    WebElement deleteButton;
    @FindBy(css = "button#Edit")
    WebElement editButton;
    @FindBy(css = "button#Close")
    WebElement closeButton;
    @FindBy(xpath = "//button[@id='View Projects List']")
    WebElement projectsButton;
    @FindBy(xpath = "//button[@id='View tekVizion 360 Packages']")
    WebElement packagesButton;
    @FindBy(xpath = "//button[@id='View tekToken Consumption']")
    WebElement consumptionsButton;

    public String delete(String type) {
/*        By deleteSelector = By.cssSelector("button#Delete");
        this.action.click(deleteSelector);*/
        JavascriptExecutor executor = (JavascriptExecutor)this.driver;
        executor.executeScript("arguments[0].click();", this.deleteButton);
        Modal confirmModal = new Modal();
        if (type.equals("customer")) {
            confirmModal.reconfirmAction();
        } else {
            confirmModal.confirmAction();
        }
        return this.action.getText(this.messageSelector);
    }

    public void edit() {
/*        By editSelector = By.cssSelector("button#Edit");
        this.action.click(editSelector);*/
        JavascriptExecutor executor = (JavascriptExecutor)this.driver;
        executor.executeScript("arguments[0].click();", this.editButton);
    }

    public Projects goToProjects(){
/*        By projectsSelector = By.xpath("//button[@id='View Projects List']");
        this.action.click(projectsSelector);*/
        JavascriptExecutor executor = (JavascriptExecutor)this.driver;
        executor.executeScript("arguments[0].click();", this.projectsButton);
        return new Projects();
    }

    public Packages goToPackages(){
        JavascriptExecutor executor = (JavascriptExecutor)this.driver;
        executor.executeScript("arguments[0].click();", this.packagesButton);
        return new Packages();
    }

    public void viewItem(String item) {
        By id = By.id(item);
        this.action.click(id);
    }

    public String close() {
/*        By deleteSelector = By.cssSelector("button#Close");
        this.action.click(deleteSelector);*/
        JavascriptExecutor executor = (JavascriptExecutor)this.driver;
        executor.executeScript("arguments[0].click();", this.closeButton);
        Modal confirmModal = new Modal();
        confirmModal.confirmAction();
        return this.action.getText(this.messageSelector);
    }

    public Consumptions goToConsumption() {
        JavascriptExecutor executor = (JavascriptExecutor)this.driver;
        executor.executeScript("arguments[0].click();", this.consumptionsButton);
        return new Consumptions();
    }
}
