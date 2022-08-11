package ui.pages;

import org.openqa.selenium.By;
import ui.core.AbstractPageObject;

public class ActionMenu extends AbstractPageObject {
    AbstractPageObject pageObject;
    By messageSelector = By.cssSelector(".cdk-overlay-container snack-bar-container");
    public ActionMenu(AbstractPageObject pageObject){
        this.pageObject = pageObject;
    }

    public String delete(){
        By deleteSelector = By.cssSelector("button#Delete");
        this.action.click(deleteSelector);
        Modal confirmModal = new Modal();
        if (this.pageObject instanceof CustomerRow)
            confirmModal.reconfirmAction();
        else
            confirmModal.confirmAction();
        return this.action.getText(this.messageSelector);
    }

    public void edit(){
        By editSelector = By.cssSelector("button#Edit");
        this.action.click(editSelector);
    }
}
