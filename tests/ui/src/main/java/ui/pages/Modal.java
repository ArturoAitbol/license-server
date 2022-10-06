package ui.pages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

public class Modal extends AbstractPageObject {
    @FindBy(css = "button#cancel")
    WebElement cancelButton;
    @FindBy(css = "button#confirm")
    WebElement confirmButton;
    @FindBy(css = "button#reconfirm")
    WebElement reconfirmButton;

    public void reconfirmAction(){
        String button = this.action.getText(reconfirmButton);
        System.out.println(button);
        this.action.click(reconfirmButton);
    }
    public void confirmAction(){
        String button = this.action.getText(confirmButton);
        System.out.println(button);
        this.action.click(confirmButton);
    }
}
