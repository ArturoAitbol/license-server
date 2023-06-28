package ui.pages.spotlight;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import ui.core.AbstractPageObject;

public class StakeholderForm extends AbstractPageObject {
    @FindBy(css = "[formcontrolname='name']")
    WebElement nameInput;
    @FindBy(css = "[dropdown]")
    WebElement countryDropDown;
    @FindBy(css = "[id='phoneNumber']")
    WebElement phoneNumberInput;
    @FindBy(css = "[formcontrolname='jobTitle']")
    WebElement jobTitleInput;
    @FindBy(css = "[formcontrolname='companyName']")
    WebElement companyNameInput;
    @FindBy(css = "[formcontrolname='subaccountAdminEmail']")
    WebElement subaccountAdminEmailInput;

    @FindBy(css = "#submit-stakeholder-button")
    WebElement submitButton;
    By spinnerSelector = By.cssSelector("svg[preserveAspectRatio]");

    public Stakeholders addStakeholder(String name, String jobTitle, String companyName, String subaccountAdminEmail, String countryPhoneNumber, String phoneNumber) {
        this.action.sendText(this.nameInput, name);
        By countrySelector = By.xpath(String.format("//span[contains(text(), '%s')]/parent::li", countryPhoneNumber));
        this.action.selectOption(countryDropDown, countrySelector);
        this.action.sendText(this.phoneNumberInput, phoneNumber);
        this.action.sendText(this.subaccountAdminEmailInput, subaccountAdminEmail);
        this.action.sendText(this.companyNameInput, companyName);
        this.action.sendText(this.jobTitleInput, jobTitle);
        this.action.click(this.submitButton);
        return new Stakeholders();
    }

    public Stakeholders editStakeholder(String name, String jobTitle, String companyName, String countryPhoneNumber, String phoneNumber) {
        if (!name.equals("none"))
            this.action.replaceText(this.nameInput, name);
        if (!jobTitle.equals("none"))
            this.action.replaceText(this.jobTitleInput, jobTitle);
        if (!companyName.equals("none"))
            this.action.replaceText(this.companyNameInput, companyName);
        By countrySelector = By.xpath(String.format("//span[contains(text(), '%s')]/parent::li", countryPhoneNumber));
        if (!countryPhoneNumber.equals("none"))
            this.action.selectOption(countryDropDown, countrySelector);
        if (!phoneNumber.equals("none"))
            this.action.replaceText(this.phoneNumberInput, phoneNumber);
        this.action.click(this.submitButton);
        waitSpinner();
        return new Stakeholders();
    }

    public void waitSpinner() {
        this.action.waitSpinner(this.spinnerSelector);
    }
}
