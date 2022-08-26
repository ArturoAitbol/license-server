package ui.step_definitions;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.junit.Assert;
import ui.core.DriverManager;
import ui.pages.*;

import java.util.Map;

public class LicenseConsumptionSteps {
    Customers customers;
    Consumptions consumptions;
    ConsumptionForm consumptionForm;
    String startWeek, endWeek, project, deviceVendor, deviceModel, deviceVersion, deviceGranularity, tekTokens;
    ConsumptionRow consumptionRow;
    private final String consumptionSummaryTableId = "tektokens-summary-table";
    private final String projectConsumptionTableId = "project-consumption-table";
    private final String detailedConsumptionTableId = "detailed-consumption-table";

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
    public void iOpenTheAddTekTokenConsumptionForm() throws InterruptedException {
        Thread.sleep(3000);
        this.consumptionForm = this.consumptions.openConsumptionForm();
    }

    @When("I add a consumption with the following data")
    public void iAddAConsumptionWithTheFollowingData(DataTable dataTable) throws InterruptedException {
        Thread.sleep(2000);
        Map<String, String> consumption = dataTable.asMap(String.class, String.class);
        this.startWeek = consumption.get("startWeek");
        this.endWeek = consumption.get("endWeek");
        this.project = consumption.get("project");
        this.deviceVendor = consumption.get("deviceVendor");
        this.deviceModel = consumption.get("deviceModel");
        this.deviceVersion = consumption.get("deviceVersion");
        this.deviceGranularity = consumption.get("deviceGranularity");
        this.tekTokens = consumption.get("tekTokens");
        this.consumptions = this.consumptionForm.addConsumption(startWeek, endWeek, project, deviceVendor, deviceModel, deviceVersion, deviceGranularity, tekTokens);
    }

    @Then("I should see the following data in the tekTokens Consumption Summary table")
    public void iShouldSeeTheFollowingDataInTheTekTokensConsumptionSummaryTable(DataTable dataTable) {
        Map<String, String> consumption = dataTable.asMap(String.class, String.class);
        String totalTekTokens = consumption.get("tekTokens");
        // in case there are more consumptions than just one then get from table
        String consumed = consumption.getOrDefault("consumed", this.tekTokens);
        // in case there are more consumptions than just one then get from table
        int defaultAvailable = Integer.parseInt(totalTekTokens) - Integer.parseInt(this.tekTokens);
        String available = consumption.getOrDefault("available", String.valueOf(defaultAvailable));
        String actualTekTokens = this.consumptions.getValue(consumptionSummaryTableId,"tekTokens");
        String actualConsumed = this.consumptions.getValue(consumptionSummaryTableId,"Consumed");
        String actualAvailable = this.consumptions.getValue(consumptionSummaryTableId,"Available");
        Assert.assertEquals("Consumption doesn't have this amount of total tekTokens: ".concat(totalTekTokens), totalTekTokens, actualTekTokens);
        Assert.assertEquals("Consumption doesn't have consumed this amount of tekTokens: ".concat(consumed), consumed, actualConsumed);
        Assert.assertEquals("Consumption doesn't have this amount of available tekTokens: ".concat(available), available, actualAvailable);
    }

    @Then("I should see the following data in the tekTokens Project Consumption table")
    public void iShouldSeeTheFollowingDataInTheTekTokensProjectConsumptionTable(DataTable dataTable) {
        Map<String, String> consumption = dataTable.asMap(String.class, String.class);
        // in case there are more consumptions than just one then get from table
        String project = consumption.getOrDefault("project", this.project);
        String status = consumption.getOrDefault("status", "Open");
        // in case there are more consumptions than just one then get from table
        String tekTokens = consumption.getOrDefault("tekTokens", this.tekTokens);
        String actualProject = this.consumptions.getValue(projectConsumptionTableId,"Project Name");
        String actualStatus = this.consumptions.getValue(projectConsumptionTableId,"Status");
        String actualTekTokens = this.consumptions.getValue(projectConsumptionTableId,"tekTokens");
        Assert.assertEquals("Consumption doesn't have this project name: ".concat(project), project, actualProject);
        Assert.assertEquals("Consumption doesn't have this project status: ".concat(status), status, actualStatus);
        Assert.assertEquals("Consumption doesn't have this amount of tekTokens: ".concat(tekTokens), actualTekTokens, actualTekTokens);
    }

    @And("I should see the same data in the tekTokens Consumption Events table")
    public void iShouldSeeTheSameDataInTheTekTokensConsumptionEventsTable() {
        String defaultType = "Configuration";
        String defaultUsageDays = "Sun";
        String actualConsumptionDate = this.consumptions.getValue(detailedConsumptionTableId,"Consumption Date");
        String actualProject = this.consumptions.getValue(projectConsumptionTableId,"Project Name");
        String actualType = this.consumptions.getValue(detailedConsumptionTableId,"Type");
        String actualVendor = this.consumptions.getValue(detailedConsumptionTableId,"Vendor");
        String actualModel = this.consumptions.getValue(detailedConsumptionTableId,"Model");
        String actualVersion = this.consumptions.getValue(detailedConsumptionTableId,"Version");
        String actualTekTokens = this.consumptions.getValue(detailedConsumptionTableId,"tekTokens Used");
        Assert.assertEquals("Consumption doesn't have consumptionDate: ".concat(startWeek), startWeek, actualConsumptionDate);
        Assert.assertEquals("Consumption doesn't have this project name: ".concat(project), project, actualProject);
        Assert.assertEquals("Consumption doesn't have this type: ".concat(defaultType), defaultType, actualType);
        Assert.assertEquals("Consumption doesn't have this deviceVendor: ".concat(deviceVendor), deviceVendor, actualVendor);
        Assert.assertEquals("Consumption doesn't have this deviceModel: ".concat(deviceModel), deviceModel, actualModel);
        Assert.assertEquals("Consumption doesn't have this deviceVersion: ".concat(deviceVersion), deviceVersion, actualVersion);
        Assert.assertEquals("Consumption doesn't have this UsageDays: ".concat(defaultUsageDays), defaultUsageDays, actualType);
        Assert.assertEquals("Consumption doesn't have this amount of tekTokens used: ".concat(tekTokens), actualTekTokens, actualTekTokens);
    }

    @When("I edit the consumption of the project {string} with the following data")
    public void iEditTheConsumptionOfTheProjectWithTheFollowingData(String project, DataTable dataTable) throws InterruptedException {
        this.consumptionRow = new ConsumptionRow(project);
        ActionMenu actionMenu = this.consumptionRow.openActionMenu();
        actionMenu.edit();
        Thread.sleep(2000);
        this.consumptionForm = new ConsumptionForm();
        Map<String, String> consumption = dataTable.asMap(String.class, String.class);
        this.project = consumption.getOrDefault("project", "");
        this.deviceVendor = consumption.getOrDefault("deviceVendor", "");
        this.deviceModel = consumption.getOrDefault("deviceModel", "");
        this.deviceVersion = consumption.getOrDefault("deviceVersion", "");
        this.deviceGranularity = consumption.getOrDefault("deviceGranularity", "");
        this.tekTokens = consumption.getOrDefault("tekTokens", "");
        this.consumptions = this.consumptionForm.editConsumption(project, deviceVendor, deviceModel, deviceVersion, deviceGranularity, tekTokens);
        String actualMessage = this.consumptions.getMessage();
        DriverManager.getInstance().setMessage(actualMessage);
    }

    @When("I delete the consumption of the project {string}")
    public void iDeleteTheConsumptionOfTheProject(String project) {
        this.consumptionRow = new ConsumptionRow(project);
        ActionMenu actionMenu = this.consumptionRow.openActionMenu();
        actionMenu.delete("licenseConsumption");
    }

}
