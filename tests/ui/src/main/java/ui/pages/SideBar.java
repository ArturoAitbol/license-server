package ui.pages;

import org.openqa.selenium.By;

import ui.core.AbstractPageObject;

public class SideBar extends AbstractPageObject {

    public boolean clickOnOption(String option) {
        try {
            By optionButton = By.xpath("//span[@title='" + option + "']");
            this.action.forceClick(optionButton);
            return true;
        } catch (Exception e) {
            System.out.println("Couldn't execute the logout process: Some buttons/messages weren't available");
            System.out.println(e.toString());
            return false;
        }
    }
    public void waitSpinner(){
        By spinnerSelector = By.cssSelector("svg[preserveAspectRatio]");
        this.action.waitSpinner(spinnerSelector);
    }
}
