package ui.pages.spotlight;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.openqa.selenium.By;
import ui.core.AbstractPageObject;
import ui.pages.ActionMenu;

public class NoteRow extends AbstractPageObject {

    private String NOTE_CONTENT_XPATH;

    private final Logger LOGGER = LogManager.getLogger(NoteRow.class);

    public NoteRow(String noteContent){
        this.NOTE_CONTENT_XPATH = String.format("//td[@title='%s']", noteContent);
    }

    public ActionMenu openActionMenu(){
        return this.action.openActionMenu(this.NOTE_CONTENT_XPATH);
    }

}
