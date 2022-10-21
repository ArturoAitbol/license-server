package ui.step_definitions;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import ui.pages.spotlight.Setup;

import java.util.Map;

import static org.junit.Assert.assertEquals;

public class SpotlightSetupSteps {
    Setup setup;
    String azureResourceGroup,tapUrl,status,powerBiWorkspaceId,powerBiReportId;

    public SpotlightSetupSteps(Setup setup){
        this.setup = setup;
    }

    @When("I edit the setup details with the following data")
    public void iEditTheSetupDetailsWithTheFollowingData(DataTable dataTable) {
        this.setup.enableFieldsToEdit();
        Map<String,String> setupDetails = dataTable.asMap(String.class,String.class);
        this.azureResourceGroup = setupDetails.get("azureResourceGroup");
        this.tapUrl = setupDetails.get("tapUrl");
        this.status = setupDetails.get("status");
        this.powerBiWorkspaceId = setupDetails.get("powerBiWorkspaceId");
        this.powerBiReportId = setupDetails.get("powerBiReportId");
        this.setup.editSetupDetails(azureResourceGroup,tapUrl,status,powerBiWorkspaceId,powerBiReportId);
    }

    @Then("I should see the modified data in spotlight configuration view")
    public void iShouldSeeTheModifiedDataInSpotlightConfigurationView(){
        if (!this.azureResourceGroup.equals("none")){
            String actualAzureResourceGroup = this.setup.getInputValue("azure-resource-group");
            assertEquals("Spotlight doesn't have this azureResourceGroup: ".concat(this.azureResourceGroup), this.azureResourceGroup, actualAzureResourceGroup);
        }
        if (!this.tapUrl.equals("none")){
            String actualTapUrl = this.setup.getInputValue("tap-url");
            assertEquals("Spotlight doesn't have this tap url: ".concat(this.tapUrl),this.tapUrl,actualTapUrl);
        }
        if (!this.status.equals("none")){
            String actualStatus = this.setup.getSelectedOption("status");
            assertEquals("Spotlight doesn't have this status: ".concat(this.status),this.status,actualStatus);
        }
        if (!this.powerBiWorkspaceId.equals("none")) {
            String actualPowerBiWorkspaceId = this.setup.getInputValue("powerbi-workspace");
            assertEquals("Spotlight doesn't have this powerBiWorkspaceId: ".concat(this.powerBiWorkspaceId),this.powerBiWorkspaceId,actualPowerBiWorkspaceId);
        }
        if (!this.powerBiReportId.equals("none")){
            String actualPowerBiReportId = this.setup.getInputValue("powerbi-report");
            assertEquals("Spotlight doesn't have this powerBiReportId: ".concat(this.powerBiReportId),this.powerBiReportId,actualPowerBiReportId);
        }
    }
}
