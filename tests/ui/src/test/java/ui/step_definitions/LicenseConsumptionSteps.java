package ui.step_definitions;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.junit.Assert;
import ui.core.DriverManager;
import ui.pages.*;
import ui.pages.packages.PackageForm;
import ui.pages.packages.Packages;

import java.util.Map;

public class LicenseConsumptionSteps {
    Customers customers;
    Consumptions consumptions;
    ConsumptionForm consumptionForm;
    String startDate, endDate, project, deviceVendor, deviceModel;
    ProjectRow projectRow;

    public LicenseConsumptionSteps(Customers customers){
        this.customers = customers;
    }

    @And("I go to the Package Consumption view of {string}")
    public void iGoToThePackageConsumptionViewOf(String customerName) {
        CustomerRow customerRow = this.customers.getCustomer(customerName);
        ActionMenu actionMenu = customerRow.openActionMenu();
        this.consumptions = actionMenu.goToConsumption();
    }

    @And("I open the Add tekToken Consumption form")
    public void iOpenTheAddTekTokenConsumptionForm() {
        this.consumptionForm = this.consumptions.openConsumptionForm();
    }

    @When("I add a consumption with the following data")
    public void iAddAConsumptionWithTheFollowingData(DataTable dataTable) {
        Map<String, String> consumption = dataTable.asMap(String.class, String.class);
        this.startDate = consumption.get("startDate");
        this.endDate = consumption.get("endDate");
        this.project = consumption.get("project");
        this.deviceVendor = consumption.get("deviceVendor");
        this.deviceModel = consumption.get("deviceModel");
        this.consumptions = this.consumptionForm.addConsumption(startDate, endDate, project, deviceVendor, deviceModel);
    }

    @Then("I should see the following data in the tekTokens Consumption view")
    public void iShouldSeeTheFollowingDataInTheTekTokensConsumptionView(DataTable dataTable) {
        Map<String, String> consumption = dataTable.asMap(String.class, String.class);
        String tekTokens = consumption.get("tekTokens");
        String consumed = consumption.get("consumed");
        String available = consumption.get("available");
        String actualTekTokens = this.consumptions.getValue("tektokens-summary-table","tekTokens");
        String actualConsumed = this.consumptions.getValue("tektokens-summary-table","Consumed");
        String actualAvailable = this.consumptions.getValue("tektokens-summary-table","Available");
        Assert.assertEquals("Consumption doesn't have this amount of tekTokens: ".concat(tekTokens), actualTekTokens, actualTekTokens);
        Assert.assertEquals("Consumption doesn't have consumed this amount of tekTokens: ".concat(consumed), actualConsumed, actualConsumed);
        Assert.assertEquals("Consumption doesn't have this amount of available tekTokens: ".concat(available), actualAvailable, actualAvailable);
    }

    @When("I edit the consumption of the project {string} with the following data")
    public void iEditTheConsumptionOfTheProjectWithTheFollowingData(String project, DataTable dataTable) {
        this.projectRow = new ProjectRow(project);
        ActionMenu actionMenu = this.projectRow.openActionMenu();
        actionMenu.edit();
        this.consumptionForm = new ConsumptionForm();
        Map<String, String> consumption = dataTable.asMap(String.class, String.class);
        this.project = consumption.getOrDefault("project", "none");
        this.deviceVendor = consumption.getOrDefault("deviceVendor", "none");
        this.deviceModel = consumption.getOrDefault("deviceModel", "none");
        this.consumptions = this.consumptionForm.editConsumption(this.project, this.deviceVendor, this.deviceModel);
        String actualMessage = this.consumptions.getMessage();
        DriverManager.getInstance().setMessage(actualMessage);
    }

    @When("I delete the consumption of the project {string}")
    public void iDeleteTheConsumptionOfTheProject(String project) {
        this.projectRow = new ProjectRow(project);
        ActionMenu actionMenu = this.projectRow.openActionMenu();
        actionMenu.delete("licenseConsumption");
    }


/*    @And("I open the Add Project form from Consumption form")
    public void iOpenTheAddProjectFormFromConsumptionForm() {
        this.projectForm = this.consumptionForm.openProjectForm();
    }*/

}
