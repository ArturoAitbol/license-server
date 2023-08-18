package ui.pages.spotlight;

import org.openqa.selenium.By;

import ui.core.AbstractPageObject;
import ui.pages.ActionMenu;

public class TestSuiteRow extends AbstractPageObject {
    private final String TEST_SUITE_NAME_XPATH;

    public TestSuiteRow(String testSuite) {
        this.TEST_SUITE_NAME_XPATH = String.format("//td[@title='%s']", testSuite);
    }

    public String getColumnValue(String column) {
        By columnSelector = null;
        if (column.equals("Name"))
            columnSelector = By.xpath(this.TEST_SUITE_NAME_XPATH);
        return this.action.getText(columnSelector);
    }

    public ActionMenu openActionMenu() {
        return this.action.openActionMenu(this.TEST_SUITE_NAME_XPATH);
    }

}
