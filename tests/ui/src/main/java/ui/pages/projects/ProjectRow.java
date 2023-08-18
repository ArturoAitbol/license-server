package ui.pages.projects;

import org.openqa.selenium.By;
import ui.core.AbstractPageObject;
import ui.pages.ActionMenu;

public class ProjectRow extends AbstractPageObject {
    private final String PROJECT_NAME_XPATH;
    public ProjectRow(String projectName){
        this.PROJECT_NAME_XPATH = String.format("//td[@title='%s']", projectName);
    }

    public String getColumnValue(String column){
        By columnSelector;
        if(column.equals("Project Name"))
            columnSelector = By.xpath(this.PROJECT_NAME_XPATH);
        // this has been temporarily disabled
        // else if(column.equals("Project Code"))
        //     columnSelector = By.xpath(String.format(this.PROJECT_NAME_XPATH + "/preceding-sibling::td[@id='%s']", column));
        else
            columnSelector = By.xpath(String.format(this.PROJECT_NAME_XPATH + "/following-sibling::td[@id='%s']", column));
        return this.action.getText(columnSelector);
    }

    public ActionMenu openActionMenu(){
        return this.action.openActionMenu(this.PROJECT_NAME_XPATH);
    }
}
