package ui.pages.consumptions;

import org.openqa.selenium.By;
import ui.core.AbstractPageObject;
import ui.pages.ActionMenu;

public class ConsumptionRow extends AbstractPageObject {
    private final String PROJECT_NAME_XPATH;
    public ConsumptionRow(String project){
        this.PROJECT_NAME_XPATH = String.format("//td[@title='%s']", project);
    }

    public String getColumnValue(String column){
        By columnSelector;
        if(column.equals("Project") || column.equals("Project Name"))
            columnSelector = By.xpath(this.PROJECT_NAME_XPATH);
        else if(column.equals("Consumption Date"))
            columnSelector = By.xpath(String.format(this.PROJECT_NAME_XPATH + "/preceding-sibling::td[@id='%s']", column));
        else if(column.equals("Usage Days")){
            columnSelector = By.xpath(String.format(this.PROJECT_NAME_XPATH + "/following-sibling::td[@id='%s']", column));
            String usageDays = this.action.getText(columnSelector);
            return usageDays.replace(",", ", ");
        }
        else
            columnSelector = By.xpath(String.format(this.PROJECT_NAME_XPATH + "/following-sibling::td[@id='%s']", column));
        return this.action.getText(columnSelector);
    }

    public ActionMenu openActionMenu(){
        return this.action.openActionMenu(this.PROJECT_NAME_XPATH);
    }
}
