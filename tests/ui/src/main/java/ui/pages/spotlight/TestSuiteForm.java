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
    @FindBy(css = "[formcontrolname='totalExecutions']")
    WebElement totalExecutions;
    @FindBy(css = "[formcontrolname='nextExecution']")
    WebElement nextExecution;
    @FindBy(css = "[formcontrolname='frequency']")
    WebElement frequencyInput;
    @FindBy(css = "#submitBtn")
    WebElement submitButton;
    By spinnerSelector = By.cssSelector("svg[preserveAspectRatio]");

    public TestSuites addTestSuite(String name, String service, String frequency) {
        this.action.sendText(this.nameInput, name);
        this.action.replaceText(this.serviceInput, service);
        By frequencySelector = By.cssSelector(String.format("mat-option[title='%s']", frequency));
        this.action.selectOption(this.frequencyInput, frequencySelector);
        this.action.click(this.submitButton);
        return new TestSuites();
    }

    public TestSuites editTestSuite(String name, String service, String executions, String nextExecution,
            String frequency) {
        if (!name.equals("none"))
            this.action.replaceText(this.nameInput, name);
        if (!service.equals("none"))
            this.action.replaceText(this.serviceInput, service);
        if (!executions.equals("none"))
            this.action.replaceText(this.totalExecutions, executions);
        if (!nextExecution.equals("none"))
            this.action.replaceText(this.nextExecution, nextExecution);
        if (!frequency.equals("none")) {
            By frequencySelector = By.cssSelector(String.format("mat-option[title='%s']", frequency));
            this.action.selectOption(this.frequencyInput, frequencySelector);
        }
        this.action.click(this.submitButton);
        return new TestSuites();
    }

    public void waitSpinner() {
        this.action.waitSpinner(this.spinnerSelector);
    }
}
