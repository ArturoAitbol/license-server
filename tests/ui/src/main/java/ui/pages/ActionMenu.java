package ui.pages;

import org.openqa.selenium.By;
import ui.core.AbstractPageObject;

public class ActionMenu extends AbstractPageObject {
    By messageSelector = By.cssSelector(".cdk-overlay-container snack-bar-container");

    public String delete(String type){
        By deleteSelector = By.cssSelector("button#Delete");
        this.action.click(deleteSelector);
        Modal confirmModal = new Modal();
        if (type.equals("customer")){
            confirmModal.reconfirmAction();
        }
        else{
            confirmModal.confirmAction();
        }
        return this.action.getText(this.messageSelector);
    }

    public void edit(){
        By editSelector = By.cssSelector("button#Edit");
        this.action.click(editSelector);
    }
}
