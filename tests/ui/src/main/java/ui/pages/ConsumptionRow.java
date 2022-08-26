package ui.pages;

import org.openqa.selenium.By;
import ui.core.AbstractPageObject;

public class ConsumptionRow extends AbstractPageObject {
    private final String PROJECT_NAME_XPATH;
    public ConsumptionRow(String projectName){
        this.PROJECT_NAME_XPATH = String.format("//div[@id='detailed-consumption-table' and td[@title='%s']]", projectName);
    }

    public String getColumnValue(String column){
        By columnSelector;
        if(column.equals("Project"))
            columnSelector = By.xpath(this.PROJECT_NAME_XPATH);
        else if(column.equals("Consumption Date"))
            columnSelector = By.xpath(String.format(this.PROJECT_NAME_XPATH + "/preceding-sibling::td[@id='%s']", column));
        else
            columnSelector = By.xpath(String.format(this.PROJECT_NAME_XPATH + "/following-sibling::td[@id='%s']", column));
        return this.action.getText(columnSelector);
    }

    public ActionMenu openActionMenu(){
        By actionMenuSelector = By.xpath(this.PROJECT_NAME_XPATH + "/following-sibling::td[@id='more_vert']/button");
        this.action.click(actionMenuSelector);
        return new ActionMenu();
    }
}
