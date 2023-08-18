package ui.pages.subscriptions;

import org.openqa.selenium.By;

import ui.core.AbstractPageObject;
import ui.pages.ActionMenu;

public class SubscriptionRow extends AbstractPageObject {
    private final String LICENSE_TITLE_XPATH;

    public SubscriptionRow(String description){
        this.LICENSE_TITLE_XPATH = String.format("//td[@title='%s']", description);    
    }

    public String getColumnValue(String column){
        By columnSelector;
        if(column.equals("Description"))
            columnSelector = By.xpath(this.LICENSE_TITLE_XPATH);
        else if(column.equals("Start Date") || column.equals("Renewal Date"))
            columnSelector = By.xpath(String.format(this.LICENSE_TITLE_XPATH + "/preceding-sibling::td[@id='%s']", column));
        else
            columnSelector = By.xpath(String.format(this.LICENSE_TITLE_XPATH + "/following-sibling::td[@id='%s']", column));
        return this.action.getText(columnSelector);
    }

    public ActionMenu openActionMenu(){
        return this.action.openActionMenu(this.LICENSE_TITLE_XPATH);
    }
    
}
