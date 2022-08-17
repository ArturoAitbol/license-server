package ui.pages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

public class Projects extends AbstractPageObject {
    @FindBy(css="#add-new-project-button-button")
    WebElement addProjectButton;

    public ProjectForm openProjectForm(){
        this.action.click(this.addProjectButton);
        return new ProjectForm();
    }
}
