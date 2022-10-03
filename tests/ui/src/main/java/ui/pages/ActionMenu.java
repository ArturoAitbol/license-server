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
    @FindBy(xpath = "//button[@id='View tekVizion 360 Subscriptions']")
    WebElement subscriptionsButton;
    @FindBy(xpath = "//button[@id='View tekToken Consumption']")
    WebElement consumptionsButton;
    @FindBy(xpath = "//button[@id='View Customer Admin Emails']")
    WebElement customerAdminButton;
    @FindBy(xpath = "//button[@id='View Subaccount Admin Emails']")
    WebElement subaccountAdminButton;
    @FindBy(xpath = "//button[@id='View SpotLight Dashboard']")
    WebElement spotlightDashboardButton;
    By spinnerSelector = By.cssSelector("svg[preserveAspectRatio]");

    public String delete(String type) {
        /*
         * By deleteSelector = By.cssSelector("button#Delete");
         * this.action.click(deleteSelector);
         */
        String message;
        JavascriptExecutor executor = (JavascriptExecutor) this.driver;
        executor.executeScript("arguments[0].click();", this.deleteButton);
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

    public void edit() {
        /*
         * By editSelector = By.cssSelector("button#Edit");
         * this.action.click(editSelector);
         */
        JavascriptExecutor executor = (JavascriptExecutor) this.driver;
        executor.executeScript("arguments[0].click();", this.editButton);
    }

    public void editForm() {
        this.action.forceClick(this.editButton);
        this.action.waitSpinner(this.spinnerSelector);
    }

    public Projects goToProjects() {
        /*
         * By projectsSelector = By.xpath("//button[@id='View Projects List']");
         * this.action.click(projectsSelector);
         */
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
        return new Dashboard();
    }

    public void viewItem(String item) {
        By id = By.id(item);
        this.action.click(id);
    }

    public String close() {
        /*
         * By deleteSelector = By.cssSelector("button#Close");
         * this.action.click(deleteSelector);
         */
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
