package ui.pages;

import org.openqa.selenium.By;
import ui.core.AbstractPageObject;

public class CustomerRow extends AbstractPageObject {
    private final String CUSTOMER_NAME_XPATH;
    public CustomerRow(String customerName){
        this.CUSTOMER_NAME_XPATH = String.format("//td[@title='%s']", customerName);
    }

    public String getColumnValue(String column){
        By columnSelector;
        if(column.equals("Customer"))
            columnSelector = By.xpath(this.CUSTOMER_NAME_XPATH);
        else
            columnSelector = By.xpath(String.format(this.CUSTOMER_NAME_XPATH + "/following-sibling::td[@id='%s']", column));
//        System.out.println(columnSelector);
        return this.action.getText(columnSelector);
    }

    public ActionMenu openActionMenu(){
        By actionMenuSelector = By.xpath(this.CUSTOMER_NAME_XPATH + "/following-sibling::td[@id='more_vert']/button");
        this.action.click(actionMenuSelector);
        return new ActionMenu();
    }

}
