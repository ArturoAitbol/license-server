package ui.pages.customer;

import org.openqa.selenium.By;
import ui.core.AbstractPageObject;
import ui.pages.ActionMenu;

public class CustomerRow extends AbstractPageObject {
    private String CUSTOMER_NAME_XPATH;
    public CustomerRow(String customerName){
        this.CUSTOMER_NAME_XPATH = String.format("//td[@title='%s']", customerName);
    }

    public void getSubaccountRow(String customerName, String subaccountName){
        this.CUSTOMER_NAME_XPATH = String.format("//span[text()='%s']/parent::*/preceding-sibling::td[@title='%s']", subaccountName, customerName);
    }

    public String getCustomerColumn(String column){
        By columnSelector;
        if(column.equals("Customer"))
            columnSelector = By.xpath(this.CUSTOMER_NAME_XPATH);
        else
            columnSelector = By.xpath(String.format(this.CUSTOMER_NAME_XPATH + "/following-sibling::td[@id='%s']", column));
        return this.action.getText(columnSelector);
    }

    public ActionMenu openActionMenu(){
        return this.action.openActionMenu(this.CUSTOMER_NAME_XPATH);
    }

    public String getSubaccountColumn(String column, String subaccountName){                       
        By columnSelector;
        if(column.equals("Customer"))
            columnSelector = By.xpath(this.CUSTOMER_NAME_XPATH);
        else if (column.equals("Subaccount"))
            columnSelector = By.xpath(String.format(this.CUSTOMER_NAME_XPATH + "/following-sibling::td[span[text()='%s']]", subaccountName));
        else
            columnSelector = By.xpath(String.format(this.CUSTOMER_NAME_XPATH + "/following-sibling::td[@id='%s']/span", column));
        return this.action.getText(columnSelector);
    }
}
