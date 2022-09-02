package ui.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import ui.core.AbstractPageObject;

public class ProjectForm extends AbstractPageObject {
    @FindBy(css="[formcontrolname='openDate']")
    WebElement openDate;
    @FindBy(css="[formcontrolname='projectName']")
    WebElement projectName;
    @FindBy(css="[formcontrolname='projectNumber']")
    WebElement projectCode;
    @FindBy(css = "[formcontrolname='licenseId']")
    WebElement projectLicenseId;
    @FindBy(css = "[formcontrolname='status']")
    WebElement projectStatus;
    @FindBy(css = "[formControlName='closeDate']")
    WebElement closeDate;
    @FindBy(css = "#submit-project-button")
    WebElement submitButton;
    @FindBy(css = "[formcontrolname='licenseId']")
    WebElement subscription;

    public Projects createProject(String openDate, String name, String code, String license) {
        this.action.sendText(this.projectName, name);
        this.action.sendText(this.projectCode, code);
        By licenseSelector = By.cssSelector(String.format("[title='%s']",license));
        this.action.selectOption(this.subscription, licenseSelector);
        this.action.sendText(this.openDate, openDate);
        this.action.click(this.submitButton);
        return new Projects();
    }

    public Projects editProject(String openDate, String name, String code, String type, String closeDate, String license){
        if (!openDate.equals("none"))
            this.action.replaceText(this.openDate, openDate);
        if (!name.equals("none"))
            this.action.replaceText(this.projectName, name);
        if (!code.equals("none"))
            this.action.replaceText(this.projectCode, code);
        if (!type.equals("none")) {
            By typeSelector = By.cssSelector(String.format("mat-option[title='%s']", type));
            this.action.selectOption(this.projectStatus, typeSelector);
            if (type.equals("Closed") || !closeDate.equals("N/A"))
                this.action.sendText(this.closeDate, closeDate);
        }
        if (!license.equals("none")) {
            By licenseSelector = By.cssSelector(String.format("[title='%s']",license));
            this.action.selectOption(this.subscription, licenseSelector);
        }
        this.action.click(this.submitButton);
        return new Projects();
    }
}
