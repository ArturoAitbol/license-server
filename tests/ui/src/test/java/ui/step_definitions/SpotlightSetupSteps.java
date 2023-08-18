package ui.step_definitions;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import ui.pages.spotlight.Setup;

import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class SpotlightSetupSteps {
    Setup setup;
    String azureResourceGroup,tapUrl,status;

    public SpotlightSetupSteps(Setup setup){
        this.setup = setup;
    }

    @When("I edit the setup details with the following data")
    public void iEditTheSetupDetailsWithTheFollowingData(DataTable dataTable) {
        Map<String,String> setupDetails = dataTable.asMap(String.class,String.class);
        this.azureResourceGroup = setupDetails.get("azureResourceGroup");
        this.tapUrl = setupDetails.get("tapUrl");
        this.status = setupDetails.get("status");
//        this.setup.enableFieldsToEdit();
        this.setup.editSetupDetails(azureResourceGroup, tapUrl, status);
    }

    @And("I add the following support emails")
    public void iAddTheFollowingSupportEmails(DataTable dataTable){
        List<String> newSupportEmails = dataTable.asList();
        this.setup.addSupportEmails(newSupportEmails);
    }

    @Then("I should see the modified data in spotlight configuration view")
    public void iShouldSeeTheModifiedDataInSpotlightConfigurationView(){
        if (!this.azureResourceGroup.equals("none")){
            String actualAzureResourceGroup = this.setup.getInputValue("azure-resource-group");
            assertEquals("UCaaS Continuous Testing doesn't have this azureResourceGroup: ".concat(this.azureResourceGroup), this.azureResourceGroup, actualAzureResourceGroup);
        }
        if (!this.tapUrl.equals("none")){
            String actualTapUrl = this.setup.getInputValue("tap-url");
            assertEquals("UCaaS Continuous Testing doesn't have this tap url: ".concat(this.tapUrl),this.tapUrl,actualTapUrl);
        }
        if (!this.status.equals("none")){
            String actualStatus = this.setup.getSelectedOption("status");
            assertEquals("UCaaS Continuous Testing doesn't have this status: ".concat(this.status),this.status,actualStatus);
        }
    }

    @And("I should see the following emails in the support emails section")
    public void iShouldSeeTheFollowingEmailsInTheSupportEmailsSection(DataTable dataTable){
        List<String> expectedEmails = dataTable.asList();
        List<String> actualEmails = this.setup.getSupportEmails();
        for (String expectedEmail: expectedEmails) {
            assertTrue("Expected email not found: " + expectedEmail,actualEmails.contains(expectedEmail));
        }
    }
}
