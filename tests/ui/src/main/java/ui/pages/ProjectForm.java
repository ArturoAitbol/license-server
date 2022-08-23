package ui.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

public class ProjectForm extends AbstractPageObject {
    @FindBy(css="[formcontrolname='openDate']")
    WebElement startDate;
    @FindBy(css="[formcontrolname='projectName']")
    WebElement projectName;
    @FindBy(css="[formcontrolname='projectNumber']")
    WebElement projectCode;
    @FindBy(css = "[formcontrolname='status']")
    WebElement projectStatus;
    @FindBy(css = "[formControlName='closeDate']")
    WebElement closeDate;
    @FindBy(css = "#submit-button")
    WebElement submitButton;


    public Projects createProject(String startDate, String name, String code) {
        this.action.sendText(this.startDate, startDate);
        this.action.sendText(this.projectName, name);
        this.action.sendText(this.projectCode, code);
        this.action.click(this.submitButton);
        return new Projects();
    }

    public Projects editProject(String startDate, String name, String code, String type, String closeDate){
        if (!startDate.equals("none"))
            this.action.replaceText(this.startDate, startDate);
        if (!name.equals("none"))
            this.action.replaceText(this.projectName, name);
        if (!code.equals("none"))
            this.action.replaceText(this.projectCode, code);
        if (!type.equals("none"))
        {
            By typeSelector = By.cssSelector(String.format("[ng-reflect-value='%s']", type));
            this.action.selectOption(this.projectStatus, typeSelector);
            if (type.equals("Closed") || !closeDate.equals("N/A"))
                this.action.sendText(this.closeDate, closeDate);
        }
        this.action.click(this.submitButton);
        return new Projects();
    }
}
