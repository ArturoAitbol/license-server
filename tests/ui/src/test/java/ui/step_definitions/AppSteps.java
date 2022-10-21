package ui.step_definitions;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.junit.Assert;
import ui.pages.Apps;

import java.util.List;

public class AppSteps {
    Apps apps;

    public AppSteps(Apps apps) {
        this.apps = apps;
    }

    @Given("I am on the apps view")
    public void iAmOnTheAppsView() {
        boolean available = this.apps.checkMyAppsView();
        Assert.assertTrue("Apps view wasn't displayed", available);
    }

    @When("I click on {string} button")
    public void iClickOnButton(String button) {
        boolean available = this.apps.click(button);
        Assert.assertTrue(button + "button wasn't available", available);
    }

    @Then("I should see the {string} view")
    public void iShouldSeeTheView(String appTitle) {
        String actualTitle = this.apps.getTitle();
        Assert.assertEquals("View doesn't have this title: " + appTitle, appTitle, actualTitle);
    }

    @Then("I should see the following buttons")
    public void iShouldSeeTheFollowingButtons(DataTable tableData) {
        List<String> buttonsList = tableData.asList();
        for (String button : buttonsList){
            String actualButton = this.apps.checkButton(button);
            Assert.assertEquals("View doesn't have this button: " + button, button, actualButton);
        }
    }
}
