package ui.step_definitions;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import ui.core.DriverManager;
import ui.pages.*;
import ui.pages.consumptions.ConsumptionForm;
import ui.pages.consumptions.ConsumptionRow;
import ui.pages.consumptions.Consumptions;
import ui.pages.customer.CustomerRow;
import ui.pages.customer.Customers;

import static org.junit.Assert.assertEquals;

import java.util.Map;

public class LicenseConsumptionSteps {
    Customers customers;
    Consumptions consumptions;
    ConsumptionForm consumptionForm;
    String startWeek, endWeek, project, deviceVendor, deviceModel, deviceVersion, deviceGranularity, tekTokens,
            supportVendor, supportModel, usageDays;
    ConsumptionRow consumptionRow;
    private final String consumptionSummaryTableId = "tektokens-summary-table";
    private final String projectConsumptionTableId = "project-consumption-table";
    private final String detailedConsumptionTableId = "detailed-consumption-table";

    public LicenseConsumptionSteps(Customers customers) {
        this.customers = customers;
    }

    @And("I go to the tekToken Consumption view of {string}")
    public void iGoToThetekTokenConsumptionViewOf(String customerName) {
        CustomerRow customerRow = this.customers.getCustomer(customerName);
        ActionMenu actionMenu = customerRow.openActionMenu();
        this.consumptions = actionMenu.goToConsumption();
    }

    @And("I open the Add tekToken Consumption form")
    public void iOpenTheAddTekTokenConsumptionForm() throws InterruptedException {
        // Thread.sleep(3000);
        this.consumptionForm = this.consumptions.openConsumptionForm();
    }

    @When("I add a consumption with the following data")
    public void iAddAConsumptionWithTheFollowingData(DataTable dataTable) throws InterruptedException {
        this.consumptionForm.waitSpinner();
        Map<String, String> consumption = dataTable.asMap(String.class, String.class);
        /*
         * this.startWeek = consumption.get("startWeek");
         * this.endWeek = consumption.get("endWeek");
         */
        this.project = consumption.get("project");
        this.deviceVendor = consumption.getOrDefault("deviceVendor", "");
        this.deviceModel = consumption.getOrDefault("deviceModel", "");
        this.supportVendor = consumption.getOrDefault("supportVendor", "");
        this.supportModel = consumption.getOrDefault("supportModel", "");
        this.deviceVersion = consumption.get("deviceVersion");
        this.deviceGranularity = consumption.get("deviceGranularity");
        this.tekTokens = consumption.get("tekTokens");
        this.usageDays = consumption.getOrDefault("usageDays", "");
        this.consumptions = this.consumptionForm.addConsumption(startWeek, endWeek, project, deviceVendor, deviceModel,
                supportVendor, supportModel, deviceVersion, deviceGranularity, tekTokens, usageDays);
    }

    @When("I edit the consumption of the project {string} with the following data")
    public void iEditTheConsumptionOfTheProjectWithTheFollowingData(String currentProject, DataTable dataTable)
            throws InterruptedException {
        this.consumptionRow = new ConsumptionRow(currentProject);
        ActionMenu actionMenu = this.consumptionRow.openActionMenu();
        actionMenu.editForm();
        this.consumptionForm = new ConsumptionForm();
        Map<String, String> consumption = dataTable.asMap(String.class, String.class);
        this.project = consumption.getOrDefault("project", "");
        this.deviceVendor = consumption.getOrDefault("deviceVendor", "");
        this.deviceModel = consumption.getOrDefault("deviceModel", "");
        this.supportModel = consumption.getOrDefault("supportModel", "");
        this.deviceVersion = consumption.getOrDefault("deviceVersion", "");
        this.deviceGranularity = consumption.getOrDefault("deviceGranularity", "");
        this.tekTokens = consumption.getOrDefault("tekTokens", "");
        this.usageDays = consumption.getOrDefault("usageDays", "");
        this.consumptions = this.consumptionForm.editConsumption(currentProject, this.project, deviceVendor,
                deviceModel, deviceVersion, deviceGranularity, tekTokens, usageDays);
        String actualMessage = this.consumptions.getMessage();
        this.consumptions.waitData();
        DriverManager.getInstance().setMessage(actualMessage);
        if (this.project.isEmpty())
            this.project = currentProject;
    }

    @Then("I should see the following data in the tekToken Consumption Summary table")
    public void iShouldSeeTheFollowingDataInTheTekTokenConsumptionSummaryTable(DataTable dataTable)
            throws InterruptedException {
        Thread.sleep(3000);
        Map<String, String> consumption = dataTable.asMap(String.class, String.class);
        String totalTekTokens = consumption.get("tekTokens");
        // in case there are more consumptions than just one then get from table
        // we always need to provide either consumed in the datatable or tekTokens in
        // the edit form
        String consumed = consumption.getOrDefault("consumed", this.tekTokens);
        // in case there are more consumptions than just one then get from table
        int defaultAvailable = Integer.parseInt(totalTekTokens) - Integer.parseInt(consumed);
        String estimatedAvailable = String.valueOf(defaultAvailable);
        String available = consumption.getOrDefault("available", estimatedAvailable);
        String actualTekTokens = this.consumptions.getValue(consumptionSummaryTableId, "tekTokens");
        String actualConsumed = this.consumptions.getValue(consumptionSummaryTableId, "Consumed");
        String actualAvailable = this.consumptions.getValue(consumptionSummaryTableId, "Available");
        assertEquals("Consumption doesn't have this amount of total tekTokens: ".concat(totalTekTokens), totalTekTokens,
                actualTekTokens);
        assertEquals("Consumption doesn't have consumed this amount of tekTokens: ".concat(consumed), consumed,
                actualConsumed);
        assertEquals("Consumption doesn't have this amount of available tekTokens: ".concat(available), available,
                actualAvailable);
    }

    @Then("I should see the following data in the tekTokens Project Consumption table")
    public void iShouldSeeTheFollowingDataInTheTekTokensProjectConsumptionTable(DataTable dataTable) {
        Map<String, String> consumption = dataTable.asMap(String.class, String.class);
        // in case there are more consumptions than just one then get from table
        String project = consumption.getOrDefault("project", this.project);
        String status = consumption.getOrDefault("status", "Open");
        // in case there are more consumptions than just one then get from table
        String tekTokens = consumption.getOrDefault("tekTokens", this.tekTokens);
        this.consumptionRow = new ConsumptionRow(project);

        String actualProject = this.consumptionRow.getColumnValue("Project Name");
        String actualStatus = this.consumptionRow.getColumnValue("Status");
        String actualTekTokens = this.consumptionRow.getColumnValue("tekTokens");
        if (!project.isEmpty())
            assertEquals("Consumption doesn't have this project name: ".concat(project), project, actualProject);
        if (!status.isEmpty())
            assertEquals("Consumption doesn't have this project status: ".concat(status), status, actualStatus);
        if (!tekTokens.isEmpty())
            assertEquals("Consumption doesn't have this amount of tekTokens: ".concat(tekTokens), tekTokens,
                    actualTekTokens);
    }

    @And("I should see the same data in the tekToken Consumption Events table")
    public void iShouldSeeTheSameDataInTheTekTokenConsumptionEventsTable() {
        String defaultType = "Configuration";
        this.consumptionRow = new ConsumptionRow(this.project);
        String actualProject = this.consumptionRow.getColumnValue("Project");
        String actualType = this.consumptionRow.getColumnValue("Type");
        String actualVendor = this.consumptionRow.getColumnValue("Vendor");
        String actualModel = this.consumptionRow.getColumnValue("Model");
        String actualVersion = this.consumptionRow.getColumnValue("Version");
        String actualTekTokens = this.consumptionRow.getColumnValue("tekTokens Used");
        String actualUsageDays = this.consumptionRow.getColumnValue("Usage Days");
        // if (this.startWeek.isEmpty()) assertEquals("Consumption doesn't have
        // consumptionDate: ".concat(startWeek), startWeek, actualConsumptionDate);
        if (!this.project.isEmpty())
            assertEquals("Consumption doesn't have this project name: ".concat(project), this.project, actualProject);
        assertEquals("Consumption doesn't have this type: ".concat(defaultType), defaultType, actualType);
        if (!this.deviceVendor.isEmpty())
            assertEquals("Consumption doesn't have this deviceVendor: ".concat(deviceVendor), this.deviceVendor,
                    actualVendor);
        if (!this.deviceModel.isEmpty())
            assertEquals("Consumption doesn't have this deviceModel: ".concat(deviceModel), this.deviceModel,
                    actualModel);
        if (!this.deviceVersion.isEmpty())
            assertEquals("Consumption doesn't have this deviceVersion: ".concat(deviceVersion), this.deviceVersion,
                    actualVersion);
        if (!this.tekTokens.isEmpty())
            assertEquals("Consumption doesn't have this amount of tekTokens used: ".concat(tekTokens), actualTekTokens,
                    actualTekTokens);
        if (!this.usageDays.isEmpty()) {
            if (actualTekTokens.equals("0"))
                assertEquals("Consumption doesn't have this UsageDays: ".concat("..."), "...", actualUsageDays);
            else
                assertEquals("Consumption doesn't have this UsageDays: ".concat(usageDays), this.usageDays,
                        actualUsageDays);
        }
    }

    @When("I delete the consumption of the project {string}")
    public void iDeleteTheConsumptionOfTheProject(String project) {
        this.consumptionRow = new ConsumptionRow(project);
        ActionMenu actionMenu = this.consumptionRow.openActionMenu();
        actionMenu.delete("licenseConsumption");
    }

}
