package ui.pages.spotlight;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

public class OnBoardWizard extends AbstractPageObject {
    @FindBy(css="[formcontrolname='name']")
    WebElement name;
    @FindBy(css="[formcontrolname='jobTitle']")
    WebElement jobTitle;
    @FindBy(css="[formcontrolname='email']")
    WebElement email;
    @FindBy(css="[formcontrolname='companyName']")
    WebElement companyName;
    @FindBy(css = "[dropdown]")
    WebElement countryDropDown;
    @FindBy(css="[id='phone-number']")
    WebElement phoneNumber;
    @FindBy(css="[formcontrolname='type']")
    WebElement type;
    @FindBy(css="#DAILY_REPORTS")
    WebElement dailyReports;
    @FindBy(css="#WEEKLY_REPORTS")
    WebElement weeklyReports;
    @FindBy(css="#MONTHLY_REPORTS")
    WebElement monthlyReports;
    @FindBy(css="button[type='submit']")
    WebElement submitButton;


    public void acceptForm(String name, String jobTitle, String email, String companyName, String countryPhoneNumber, String phoneNumber) {
        this.action.replaceText(this.name, name);
        this.action.replaceText(this.companyName, companyName);
        By countrySelector = By.xpath(String.format("//span[contains(text(), '%s')]/parent::li", countryPhoneNumber));
        this.action.selectOption(countryDropDown, countrySelector);
        this.action.replaceText(this.phoneNumber, phoneNumber);
        this.action.replaceText(this.jobTitle, jobTitle);
        this.action.replaceText(this.email, email);
        this.action.click(this.submitButton);
        String message = getMessage();
        System.out.println("Complete On Board : " + message);
    }

    public String getMessage(){
        String message;
        By messageSelector = By.xpath("//simple-snack-bar");
        try{
            message = this.action.getText(messageSelector);
            this.action.waitSpinner(messageSelector);
        } catch (Exception e){
            System.out.println("Message couldn't be retrieved");
            System.out.println(e.toString());
            message = "None";
        }
        return message;
    }
}
