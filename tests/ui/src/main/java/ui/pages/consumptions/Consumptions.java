package ui.pages.consumptions;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

public class Consumptions extends AbstractPageObject {
    @FindBy(css = "#add-license-consumption-button")
    WebElement addConsumptionButton;

    public ConsumptionForm openConsumptionForm() {
        this.action.click(this.addConsumptionButton);
        this.action.waitModal();
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
}
