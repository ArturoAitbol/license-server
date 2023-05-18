package ui.pages.spotlight;

import org.openqa.selenium.By;

import ui.core.AbstractPageObject;
import ui.pages.ActionMenu;

public class StakeholderRow extends AbstractPageObject {
    private final String STAKEHOLDER_EMAIL_XPATH;

    public StakeholderRow(String stakeholder) {
        this.STAKEHOLDER_EMAIL_XPATH = String.format("//td[@title='%s']", stakeholder);
    }

    public String getColumnValue(String column) {
        By columnSelector = null;
        if (column.equals("email"))
            columnSelector = By.xpath(this.STAKEHOLDER_EMAIL_XPATH);
        return this.action.getText(columnSelector);
    }

    public ActionMenu openActionMenu() {
        By actionMenuSelector = By.xpath(this.STAKEHOLDER_EMAIL_XPATH + "/following-sibling::td[@id='more_vert']/button");
        this.action.forceClick(actionMenuSelector);
        return new ActionMenu();
    }

}
