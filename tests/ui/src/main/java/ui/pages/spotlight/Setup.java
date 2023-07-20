package ui.pages.spotlight;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;
import ui.pages.Modal;

import java.util.ArrayList;
import java.util.List;

public class Setup extends AbstractPageObject {
    @FindBy(css="#edit-details-button")
    WebElement editDetailsButton;
    @FindBy(css="#update-button")
    WebElement updateButton;
    @FindBy(css="#add-email-button")
    WebElement addEmailButton;
    @FindBy(css="#save-email-button")
    WebElement saveEmailButton;

    @FindBy(css="[formcontrolname='azureResourceGroup']")
    WebElement azureResourceGroup;
    @FindBy(css = "[formControlName='tapUrl']")
    WebElement tapUrl;
    @FindBy(css="[formcontrolname='status']")
    WebElement status;

    By spinnerSelector = By.cssSelector("svg[preserveAspectRatio]");

    public void enableFieldsToEdit(){
        this.action.click(editDetailsButton);
    }

    public void editSetupDetails(String azureResourceGroup,String tapUrl,String status){
        if(!azureResourceGroup.equals("none"))
            this.action.replaceText(this.azureResourceGroup,azureResourceGroup);
        if(!tapUrl.equals("none"))
            this.action.replaceText(this.tapUrl,tapUrl);
        if(!status.equals("none")){
            By statusSelector = By.cssSelector(String.format("#%s",status));
            this.action.selectOption(this.status,statusSelector);
        }

        this.action.click(this.updateButton);
        Modal confirmModal = new Modal();
        confirmModal.confirmAction();
        this.action.waitSpinner(spinnerSelector);
    }

    public void addSupportEmails(List<String> emails){
        String emailInputXpath = "//input[@id='email-%s']";
        for (int i = 0; i < emails.size(); i++) {
            this.addEmailButton.click();
            By emailInputLocator = By.xpath(String.format(emailInputXpath,i));
            this.action.sendText(emailInputLocator,emails.get(i));
        }
        this.saveEmailButton.click();
        this.action.waitSpinner(spinnerSelector);
    }

    public List<String> getSupportEmails(){
        By supportEmailsLocator = By.xpath("//div[@class='email-info']//label");
        List<WebElement> supportEmailElements = this.driver.findElements(supportEmailsLocator);
        List<String> supportEmails = new ArrayList<>();
        for (WebElement supportEmailElement :supportEmailElements) {
            supportEmails.add(supportEmailElement.getText().split(":")[1].trim());
        }
        return supportEmails;
    }

    public String getInputValue(String id){
        By columnSelector = By.cssSelector(String.format("#%s",id));
        return this.action.getAttribute(columnSelector,"value");
    }
    public String getSelectedOption(String id){
        By columnSelector = By.xpath(String.format("//mat-select[@id=\"%s\"]/descendant::span",id));
        return this.action.getText(columnSelector);
    }
}
