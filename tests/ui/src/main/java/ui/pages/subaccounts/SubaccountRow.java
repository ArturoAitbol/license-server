package ui.pages.subaccounts;

import org.openqa.selenium.By;
import ui.core.AbstractPageObject;

public class SubaccountRow extends AbstractPageObject {
    private final String SUBACCOUNT_NAME_XPATH;
    public SubaccountRow(String subaccountName){
        this.SUBACCOUNT_NAME_XPATH = String.format("//td[@title='%s']", subaccountName);
    }
    public String getColumnValue(String column){
        By columnSelector;
        if(column.equals("Subaccount"))
            columnSelector = By.xpath(this.SUBACCOUNT_NAME_XPATH);
        else if (column.equals("Customer"))
            columnSelector = By.xpath(String.format(this.SUBACCOUNT_NAME_XPATH + "/preceding-sibling::td[@id='%s']", column));
        else
            columnSelector = By.xpath(String.format(this.SUBACCOUNT_NAME_XPATH + "/following-sibling::td[@id='%s']", column));
//        System.out.println(columnSelector);
        return this.action.getText(columnSelector);
    }
}
