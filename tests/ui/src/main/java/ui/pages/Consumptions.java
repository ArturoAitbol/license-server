package ui.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

public class Consumptions extends AbstractPageObject {
    @FindBy(css = "#add-license-consumption-button")
    WebElement addConsumptionButton;

    public ConsumptionForm openConsumptionForm() {
        this.action.click(this.addConsumptionButton);
        By modalLocator = By.cssSelector("svg[preserveAspectRatio]");
        this.action.waitModal(modalLocator);
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
        By messageSelector = By.cssSelector(".cdk-overlay-container snack-bar-container");
        return this.action.getText(messageSelector);
    }
}
