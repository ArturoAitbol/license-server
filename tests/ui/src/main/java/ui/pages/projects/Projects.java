package ui.pages.projects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

public class Projects extends AbstractPageObject {
    @FindBy(css="#add-new-project-button")
    WebElement addProjectButton;
    By spinnerSelector = By.cssSelector("svg[preserveAspectRatio]");

    public ProjectForm openProjectForm(){
        this.action.click(this.addProjectButton);
        this.action.waitSpinner(this.spinnerSelector);
        return new ProjectForm();
    }

    public String getMessage(){
        String message;
        By messageSelector = By.cssSelector(".cdk-overlay-container snack-bar-container");
        try{
            message = this.action.getText(messageSelector);
        } catch (Exception e){
            System.out.println("Message couldn't be retrieved");
            System.out.println(e.toString());
            message = "None";
        }
        return message;
    }
    public void waitSpinner() {
        this.action.waitSpinner(this.spinnerSelector);
    }
}
