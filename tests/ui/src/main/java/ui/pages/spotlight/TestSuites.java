package ui.pages.spotlight;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import ui.core.AbstractPageObject;

public class TestSuites extends AbstractPageObject {
    @FindBy(css = "#add-test-suite-button")
    WebElement addTestSuiteButton;

    public TestSuiteForm openTestSuiteForm() {
        this.action.click(this.addTestSuiteButton);
        this.action.waitModal();
        return new TestSuiteForm();
    }

    public String getMessage() {
        String message;
        By messageSelector = By.cssSelector(".cdk-overlay-container snack-bar-container");
        try {
            message = this.action.getText(messageSelector);
        } catch (Exception e) {
            System.out.println("Message couldn't be retrieved");
            System.out.println(e.toString());
            message = "None";
        }
        return message;
    }

}
