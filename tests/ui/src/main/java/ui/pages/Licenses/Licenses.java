package ui.pages.Licenses;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import ui.core.AbstractPageObject;

public class Licenses extends AbstractPageObject {
    @FindBy(id = "#page-title")
    WebElement licensesTitle;
    @FindBy(id = "table-title")
    WebElement tableTitle;
    @FindBy(css = "#add-license-button")
    WebElement addLicenseButton;
    @FindBy(css = "button#back-button")
    WebElement backButton;

    public String getTitle() {
        String title = "none";
        title = this.action.getText(this.licensesTitle);
        return title;
    }

    public String getTableTitle() {
        String title = "none";
        title = this.action.getText(this.tableTitle);
        return title;
    }

    public LicenseForm openLicenseForm() {
        this.action.click(this.addLicenseButton);
        return new LicenseForm();
    }

    public void clickBackButton() {
        this.action.click(this.backButton);
    }

    public LicenseRow getLicense(String packageType) {
        return new LicenseRow(packageType);
    }
}
