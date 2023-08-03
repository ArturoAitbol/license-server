package ui.pages.spotlight;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.openqa.selenium.By;
import ui.core.AbstractPageObject;

public class Notes extends AbstractPageObject {

    private final Logger LOGGER = LogManager.getLogger(Notes.class);

    public void waitData(){
        By spinnerSelector = By.cssSelector("#notes-table [src*='spinner']");
        this.action.waitSpinner(spinnerSelector);
    }

}
