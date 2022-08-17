package ui.pages.Licenses;

import org.openqa.selenium.By;

import ui.core.AbstractPageObject;
import ui.pages.ActionMenu;

public class LicenseRow extends AbstractPageObject {
    private final String LICENSE_TITLE_XPATH;

    public LicenseRow(String packageType){
        this.LICENSE_TITLE_XPATH = String.format("//td[@title='%s']", packageType);    
    }

    public String getColumnValue(String column){
        By columnSelector;
        if(column.equals("Package Type"))
            columnSelector = By.xpath(this.LICENSE_TITLE_XPATH);
        else
            columnSelector = By.xpath(String.format(this.LICENSE_TITLE_XPATH + "/following-sibling::td[@id='%s']", column));
        return this.action.getText(columnSelector);
    }

    public ActionMenu openActionMenu(){
        By actionMenuSelector = By.xpath(this.LICENSE_TITLE_XPATH + "/following-sibling::td[@id='more_vert']/button");
        this.action.click(actionMenuSelector);
        return new ActionMenu();
    }
    
}
