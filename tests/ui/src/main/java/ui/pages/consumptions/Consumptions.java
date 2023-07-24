package ui.pages.consumptions;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

public class Consumptions extends AbstractPageObject {
    @FindBy(css = "[title='add-tek-token-consumption']")
    WebElement addConsumptionButton;
    @FindBy(css = "[title='add-other-consumption']")
    WebElement addOtherConsumptionButton;
    @FindBy(css = "[title='add-labs-consumption']")
    WebElement addLabsConsumptionButton;
    @FindBy(css = "[formcontrolname='selectedLicense']")
    WebElement subscriptionSelectBox;

    By cancelSelector = By.cssSelector("#cancel-button");
    By spinnerSelector = By.cssSelector("svg[preserveAspectRatio]");

    public ConsumptionForm openConsumptionForm() {
        this.action.click(this.addConsumptionButton);
        this.action.waitSpinner(this.spinnerSelector);
        return new ConsumptionForm();
    }

    public ConsumptionForm openOtherConsumptionForm() {
        this.action.click(this.addOtherConsumptionButton);
        this.action.waitSpinner(this.spinnerSelector);
        this.action.clickable(this.cancelSelector);
        this.action.checkText(this.cancelSelector, "Cancel");
        return new ConsumptionForm();
    }

    public ConsumptionForm openLabsConsumptionForm() {
        this.action.click(this.addLabsConsumptionButton);
        this.action.waitSpinner(this.spinnerSelector);
        return new ConsumptionForm();
    }

    public String getValue(String table, String field) {
        By fieldSelector = By.cssSelector(String.format("#%s #%s", table, field));
        return this.action.getText(fieldSelector);
    }

    public String getValueXpath(String table, String field){
        By fieldSelector = By.xpath(String.format("//div[@id='%s']/descendant::td[@id='%s']", table, field));
        return this.action.getText(fieldSelector);
    }

    public String getMessage() {
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

    public void waitData(){
        By spinnerSelector = By.cssSelector("#tektokens-summary-table [src*='spinner']");
        this.action.waitSpinner(spinnerSelector);
    }

    public Consumptions selectSubscription(String license) {
        By subscriptionSelector = By.cssSelector(String.format("[title=%s]", license));
        this.action.selectOption(subscriptionSelectBox, subscriptionSelector);
        return new Consumptions();
    }

    public String getTableValue(String table, String field, int fieldNumber){
        WebElement dataTable = driver.findElement(By.id(table));
        WebElement row = dataTable.findElement(By.xpath("//tr["+fieldNumber+"]"));
        WebElement element = row.findElement(By.id(field));
        String value = element.getText();
        return value;
    }

    public String getTableValueByTitle(String table, String fieldTitle){
        By fieldSelector = By.xpath(String.format("//div[@id='%s']/descendant::td[@title='%s']", table, fieldTitle));
        return this.action.getText(fieldSelector);
    }

    public String getColumnValue(String table, String column){
        WebElement matCardContent = driver.findElement(By.id(table));
        WebElement matPanelTitle = matCardContent.findElement(By.xpath(".//mat-panel-title[@id='" + column + "']"));
        String value = matPanelTitle.getText();
        return value;
    }

    public String getMatSpanValue(String table, String field){
        WebElement matCardContent = driver.findElement(By.id(table));
        WebElement matPanelTitle = matCardContent.findElement(By.xpath(".//span[@title='" + field + "']"));
        String value = matPanelTitle.getText();
        return value;
    }

    public String getMatPanelValue(String table, String field){
        WebElement matCardContent = driver.findElement(By.id(table));
        WebElement matPanelTitle = matCardContent.findElement(By.xpath(".//mat-panel-title[@title='" + field + "']"));
        String value = matPanelTitle.getText();
        return value;
    }

    public String getDIDValue(String table, String did, String param){
        By fieldSelector = By.xpath(String.format("//div[@id='%s']/descendant::mat-panel-title[@id='%s']/descendant::li[@title='%s']", table, did, param));
        return this.action.getText(fieldSelector);
    }

    public String getDIDTableData(String table, String title){
        By fieldSelector = By.xpath(String.format("//div[@id='DIDdetail']/descendant::table[@id='%s']/descendant::td[@title='%s']", table, title));
        return this.action.getText(fieldSelector);
    }
}
