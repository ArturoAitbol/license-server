package ui.step_definitions;

import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import ui.pages.ActionMenu;
import ui.pages.spotlight.Dashboard;
import ui.pages.spotlight.NoteRow;
import ui.pages.spotlight.Notes;

import static org.junit.Assert.assertEquals;

public class SpotlightNoteSteps {

    private Notes notes;
    private NoteRow noteRow;
    private ActionMenu actionMenu;
    private Dashboard historicalDashboard;

    public SpotlightNoteSteps(Notes notes){
        this.notes = notes;
    }

    @When("I go to the historical dashboard of the note {string}")
    public void iGoToTheHistoricalDashboardOfTheNote(String noteContent){
        this.notes.waitData();
        this.noteRow = new NoteRow(noteContent);
        this.actionMenu = this.noteRow.openActionMenu();
        this.historicalDashboard = this.actionMenu.goToSpotlightHistoricalDashboard();
        this.historicalDashboard.waitForDashboardToLoad();
    }

    @Then("I should see the dashboard for the date when the note {string} was created")
    public void iShouldSeeTheDashboardForTheDateWhenTheNoteWasCreated(String noteContent){
        String actualNoteContent = this.historicalDashboard.getNoteContent();
        assertEquals("Dashboard is not displaying the note: " + noteContent,actualNoteContent,noteContent);
        String date = this.historicalDashboard.getDate();
        String noteOpenDate = this.historicalDashboard.getNoteOpenDate();
        assertEquals("The dashboard date is not equal to the note's open date",date,noteOpenDate);

    }
}
