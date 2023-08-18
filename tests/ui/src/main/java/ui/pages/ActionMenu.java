package ui.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;
import ui.pages.consumptions.Consumptions;
import ui.pages.customer.AdminstratorEmails;
import ui.pages.projects.Projects;
import ui.pages.spotlight.Dashboard;
import ui.pages.subscriptions.Subscriptions;

import java.util.ArrayList;

public class ActionMenu extends AbstractPageObject {
    By messageSelector = By.cssSelector(".cdk-overlay-container snack-bar-container");
    @FindBy(css = "button#Delete")
    WebElement deleteButton;
    @FindBy(css = "button#Edit")
    WebElement editButton;
    @FindBy(xpath = "//button[@id='View Details']")
    WebElement viewDetailsButton;
    @FindBy(css = "button#Close")
    WebElement closeButton;
    @FindBy(xpath = "//button[@id='View Projects List']")
    WebElement projectsButton;
    @FindBy(xpath = "//button[@id='View TekVizion 360 Subscriptions']")
    WebElement subscriptionsButton;
    @FindBy(xpath = "//button[@id='View tekToken Consumption']")
    WebElement consumptionsButton;
    @FindBy(xpath = "//button[@id='View Customer Admin Emails']")
    WebElement customerAdminButton;
    @FindBy(xpath = "//button[@id='View Subaccount Admin Emails']")
    WebElement subaccountAdminButton;
    @FindBy(xpath = "//button[@id='View UCaaS Continuous Testing']")
    WebElement spotlightDashboardButton;
    @FindBy(xpath = "//button[@id='View Dashboard']")
    WebElement spotlightHistoricalDashboardButton;
    @FindBy(xpath = "//button[@id='Delete Account']")
    WebElement spotlightStakeholderButton;
    @FindBy(xpath = "//button[@id='Update Details']")
    WebElement spotlightUpdateStakeholderButton;
    By spinnerSelector = By.cssSelector("svg[preserveAspectRatio]");

    public String delete(String type) {
        String message;
        JavascriptExecutor executor = (JavascriptExecutor) this.driver;
        if (type.equals("stakeholder")) {
            executor.executeScript("arguments[0].click();", this.spotlightStakeholderButton);
        }
        else{
            executor.executeScript("arguments[0].click();", this.deleteButton);
        }
        Modal confirmModal = new Modal();
        
        if (type.equals("customer")) {
            confirmModal.reconfirmAction();
        } else {
            confirmModal.confirmAction();
        }
        if (!type.equals("licenseConsumption"))
            message = action.getText(this.messageSelector);
        else
            message = "none";
        return message;
    }

    public void editForm(String type) {
        if (!type.equals("stakeholder"))
            this.action.forceClick(this.editButton);
        else
            this.action.forceClick(this.spotlightUpdateStakeholderButton);
        if (!type.equals("customer") && !type.equals("stakeholder"))
            this.action.waitSpinner(this.spinnerSelector);
    }

    public Projects goToProjects() {
        JavascriptExecutor executor = (JavascriptExecutor) this.driver;
        executor.executeScript("arguments[0].click();", this.projectsButton);
        return new Projects();
    }

    public Subscriptions goToSubscriptions() {
        JavascriptExecutor executor = (JavascriptExecutor) this.driver;
        executor.executeScript("arguments[0].click();", this.subscriptionsButton);
        return new Subscriptions();
    }

    public Dashboard goToSpotlightDashboard() {
        JavascriptExecutor executor = (JavascriptExecutor) this.driver;
        executor.executeScript("arguments[0].click();", this.spotlightDashboardButton);
        By messageSelector = By.xpath("//simple-snack-bar");
        this.action.waitSpinner(messageSelector);
        //Switch to new UCaaS Continuous Testing Dashboard tab
        ArrayList<String> tabs = new ArrayList<String>(driver.getWindowHandles());
        driver.switchTo().window(tabs.get(tabs.size()-1));
        return new Dashboard();
    }

    public Dashboard goToSpotlightHistoricalDashboard() {
        JavascriptExecutor executor = (JavascriptExecutor) this.driver;
        executor.executeScript("arguments[0].click();", this.spotlightHistoricalDashboardButton);
        //Switch to new UCaaS Continuous Testing Dashboard tab
        ArrayList<String> tabs = new ArrayList<String>(driver.getWindowHandles());
        driver.switchTo().window(tabs.get(tabs.size()-1));
        return new Dashboard();
    }

    public void viewItem(String item) {
        By id = By.id(item);
        this.action.click(id);
    }

    public String close() {
        JavascriptExecutor executor = (JavascriptExecutor) this.driver;
        executor.executeScript("arguments[0].click();", this.closeButton);
        Modal confirmModal = new Modal();
        confirmModal.confirmAction();
        return this.action.getText(this.messageSelector);
    }

    public Consumptions goToConsumption() {
        JavascriptExecutor executor = (JavascriptExecutor) this.driver;
        executor.executeScript("arguments[0].click();", this.consumptionsButton);
        return new Consumptions();
    }

    public AdminstratorEmails goToCustomerAdmins() {
        JavascriptExecutor executor = (JavascriptExecutor) this.driver;
        executor.executeScript("arguments[0].click();", this.customerAdminButton);
        this.action.waitSpinner(this.spinnerSelector);
        return new AdminstratorEmails();
    }

    public AdminstratorEmails goToSubaccountAdmins() {
        JavascriptExecutor executor = (JavascriptExecutor) this.driver;
        executor.executeScript("arguments[0].click();", this.subaccountAdminButton);
        By spinnerSelector = By.cssSelector("svg[preserveAspectRatio]");
        this.action.waitSpinner(spinnerSelector);
        return new AdminstratorEmails();
    }
}
