package ui.pages.spotlight;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;
import ui.core.DriverManager;

public class OnBoardWizard extends AbstractPageObject {
    @FindBy(css="[formcontrolname='name']")
    WebElement name;
    @FindBy(css="[formcontrolname='jobTitle']")
    WebElement jobTitle;
    @FindBy(css="[formcontrolname='email']")
    WebElement email;
    @FindBy(css="[formcontrolname='companyName']")
    WebElement companyName;
    @FindBy(css="[formcontrolname='phoneNumber']")
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


    public void acceptForm(String name, String jobTitle, String email, String companyName, String phoneNumber, String type, String dailyReports, String weeklyReports, String monthlyReports) {
        this.action.replaceText(this.name, name);
        this.action.sendText(this.jobTitle, jobTitle);
        this.action.replaceText(this.email, email);
        this.action.sendText(this.companyName, companyName);
        this.action.sendText(this.phoneNumber, phoneNumber);
        By typeSelector = By.cssSelector(String.format("[value='TYPE:%s']", type));
        this.action.selectOption(this.type, typeSelector);
        if (!dailyReports.isEmpty())
            this.action.click(this.dailyReports);
        if (!weeklyReports.isEmpty())
            this.action.click(this.weeklyReports);
        if (!monthlyReports.isEmpty())
            this.action.click(this.monthlyReports);
        this.action.click(this.submitButton);
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
}
