package ui.pages.spotlight;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

public class Setup extends AbstractPageObject {
    @FindBy(css="#edit-details-button")
    WebElement editDetailsButton;
    @FindBy(css="#update-button")
    WebElement updateButton;

    @FindBy(css="[formcontrolname='azureResourceGroup']")
    WebElement azureResourceGroup;
    @FindBy(css = "[formControlName='tapUrl']")
    WebElement tapUrl;
    @FindBy(css="[formcontrolname='status']")
    WebElement status;
    @FindBy(css="[formcontrolname='powerBiWorkspaceId']")
    WebElement powerBiWorkspaceId;
    @FindBy(css = "[formcontrolname='powerBiReportId']")
    WebElement powerBiReportId;

    public void enableFieldsToEdit(){
        this.action.click(editDetailsButton);
    }

    public void editSetupDetails(String azureResourceGroup,String tapUrl,String status,String powerBiWorkspaceId,String powerBiReportId){
        if(!azureResourceGroup.equals("none"))
            this.action.replaceText(this.azureResourceGroup,azureResourceGroup);
        if(!tapUrl.equals("none"))
            this.action.replaceText(this.tapUrl,tapUrl);
        if(!status.equals("none")){
            By statusSelector = By.cssSelector(String.format("#%s",status));
            this.action.selectOption(this.status,statusSelector);
        }
        if(!powerBiWorkspaceId.equals("none"))
            this.action.replaceText(this.powerBiWorkspaceId,powerBiWorkspaceId);
        if(!powerBiReportId.equals("none"))
            this.action.replaceText(this.powerBiReportId,powerBiReportId);

        this.action.click(this.updateButton);
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
