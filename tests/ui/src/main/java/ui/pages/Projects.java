package ui.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

public class Projects extends AbstractPageObject {
    @FindBy(css="#add-new-project-button-button")
    WebElement addProjectButton;
    By messageSelector = By.cssSelector(".cdk-overlay-container snack-bar-container");

    public ProjectForm openProjectForm(){
        this.action.click(this.addProjectButton);
        return new ProjectForm();
    }

    public String getMessage(){
        return this.action.getText(this.messageSelector);
    }
}
