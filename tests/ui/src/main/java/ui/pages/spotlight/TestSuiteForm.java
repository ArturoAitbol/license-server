package ui.pages.spotlight;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import ui.core.AbstractPageObject;

public class TestSuiteForm extends AbstractPageObject {
    @FindBy(css = "[formcontrolname='name']")
    WebElement nameInput;
    @FindBy(css = "[formcontrolname='deviceType']")
    WebElement serviceInput;
    @FindBy(css = "[formcontrolname='frequency']")
    WebElement frequencyInput;
    @FindBy(css = "#submitBtn")
    WebElement submitButton;

    public void waitSpinner() {
        this.action.waitModal();
    }

    public TestSuites addTestSuite(String name, String service, String frequency) {
        this.action.sendText(this.nameInput, name);
        this.action.replaceText(this.serviceInput, service);
        By frequencySelector = By.cssSelector(String.format("mat-option[title='%s']", frequency));
        this.action.selectOption(this.frequencyInput, frequencySelector);
        this.action.click(this.submitButton);
        return new TestSuites();
    }
}
