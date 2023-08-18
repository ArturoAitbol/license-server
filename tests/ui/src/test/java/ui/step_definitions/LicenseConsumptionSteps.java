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
import static org.junit.Assert.assertTrue;

import java.util.Map;

public class LicenseConsumptionSteps {
    Customers customers;
    Consumptions consumptions;
    ConsumptionForm consumptionForm;
    String startWeek, endWeek, project, device = "", deviceType = "", deviceVendor, deviceModel, deviceVersion, deviceGranularity, tekTokens = "",
            supportDevice = "", supportVendor, supportModel, usageDays = "", callingPlatform = "";
    String dutType, dutVendor, dutDevice, callingType, callingVendor, callingDevice;
    ConsumptionRow consumptionRow;
    private final String consumptionSummaryTableId = "tektokens-summary-table";

    public LicenseConsumptionSteps(Customers customers) {
        this.customers = customers;
    }

    @And("I go to the tekToken Consumption view of {string}")
    public void iGoToThetekTokenConsumptionViewOf(String customerName) {
        CustomerRow customerRow = this.customers.getCustomer(customerName);
        ActionMenu actionMenu = customerRow.openActionMenu();
        this.consumptions = actionMenu.goToConsumption();
        this.consumptions.waitData();
    }

    @And("I open the Add tekToken Consumption form")
    public void iOpenTheAddTekTokenConsumptionForm() throws InterruptedException {
        this.consumptionForm = this.consumptions.openConsumptionForm();
    }

    @And("I open the Add Other Consumption form")
    public void iOpenTheAddOtherConsumptionForm() throws InterruptedException {
        this.consumptionForm = this.consumptions.openOtherConsumptionForm();
    }

    @And("I open the Add Labs Consumption form")
    public void iOpenTheAddLabdsConsumptionForm() throws InterruptedException {
        this.consumptionForm = this.consumptions.openLabsConsumptionForm();
    }

    @And("I select subscription {string}")
    public void iSelectSubscription(String license) {
        this.consumptions = this.consumptions.selectSubscription(license);
    }

    @When("I add a consumption with the following data")
    public void iAddAConsumptionWithTheFollowingData(DataTable dataTable) throws InterruptedException {
        this.consumptionForm.waitSpinner();
        Map<String, String> consumption = dataTable.asMap(String.class, String.class);
        this.project = consumption.get("project");
        this.deviceType = consumption.getOrDefault("deviceType", "");
        this.deviceVendor = consumption.getOrDefault("deviceVendor", "");
        this.deviceModel = consumption.getOrDefault("deviceModel", "");
        this.deviceVersion = consumption.get("deviceVersion");
        this.deviceGranularity = consumption.get("deviceGranularity");
        if (!this.deviceVendor.isEmpty())
            this.device = this.deviceVendor + " - " + this.deviceModel + " " + this.deviceVersion;
        this.supportVendor = consumption.getOrDefault("supportVendor", "");
        this.supportModel = consumption.getOrDefault("supportModel", "");
        if (!this.supportVendor.isEmpty())
            this.supportDevice =this.supportVendor + " - " + this.supportModel+ " " + this.deviceVersion;
        this.tekTokens = consumption.get("tekTokens");
        this.usageDays = consumption.getOrDefault("usageDays", "");
        this.consumptions = this.consumptionForm.addConsumption(startWeek, endWeek, project, deviceType, deviceVendor, deviceModel,
                supportVendor, supportModel, deviceVersion, deviceGranularity, tekTokens, usageDays);
    }

    @When("I add a labs consumption with the following data")
    public void iAddALabsConsumptionWithTheFollowingData(DataTable dataTable) {
        this.consumptionForm.waitSpinner();
        Map<String, String> consumption = dataTable.asMap(String.class, String.class);
        this.project = consumption.get("project");
        this.dutType = consumption.getOrDefault("dutType", "");
        this.dutVendor = consumption.getOrDefault("dutVendor", "");
        this.dutDevice = consumption.getOrDefault("dutDevice","");
        if (!this.dutType.isEmpty())
            this.device = this.dutType + ": " + this.dutVendor + " - " + this.dutDevice;
        this.callingType = consumption.getOrDefault("callingType","");
        this.callingVendor = consumption.getOrDefault("callingVendor","");
        this.callingDevice = consumption.getOrDefault("callingDevice","");
        if (!this.callingType.isEmpty())
            this.callingPlatform = this.callingType + ": " + this.callingVendor + " - " + this.callingDevice;
        this.usageDays = consumption.getOrDefault("usageDays", "");
        this.consumptions = this.consumptionForm.addLabsConsumption(startWeek, endWeek, project, dutType, dutVendor,
                dutDevice, callingType, callingVendor, callingDevice, usageDays);
    }

    @When("I edit the consumption of the project {string} with the following data")
    public void iEditTheConsumptionOfTheProjectWithTheFollowingData(String currentProject, DataTable dataTable)
            throws InterruptedException {
        this.consumptionRow = new ConsumptionRow(currentProject);
        ActionMenu actionMenu = this.consumptionRow.openActionMenu();
        actionMenu.editForm("licenseConsumption");
        this.consumptionForm = new ConsumptionForm();
        Map<String, String> consumption = dataTable.asMap(String.class, String.class);
        this.project = consumption.getOrDefault("project", "");
        this.deviceVendor = consumption.getOrDefault("deviceVendor", "");
        this.deviceModel = consumption.getOrDefault("deviceModel", "");
        this.deviceVersion = consumption.getOrDefault("deviceVersion", "");
        this.deviceGranularity = consumption.getOrDefault("deviceGranularity", "");
        if (!this.deviceModel.isEmpty())
            this.device = this.deviceVendor + " - " + this.deviceModel + " " + this.deviceVersion;
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
        String actualTekTokens = this.consumptionRow.getColumnValue("tekTokens Used");
        String actualUsageDays = this.consumptionRow.getColumnValue("Usage Days");
        String actualDevice = this.consumptionRow.getColumnValue("Device");
        String actualCallingPlatform = this.consumptionRow.getColumnValue("Calling Platform");
        if (!this.project.isEmpty())
            assertEquals("Consumption doesn't have this project name: ".concat(project), this.project, actualProject);
        assertEquals("Consumption doesn't have this type: ".concat(defaultType), defaultType, actualType);
        if (!this.tekTokens.isEmpty())
            assertEquals("Consumption doesn't have this amount of tekTokens used: ".concat(tekTokens), this.tekTokens,
                    actualTekTokens);
        if (!this.usageDays.isEmpty()) {
            if (actualTekTokens.equals("0"))
                assertEquals("Consumption doesn't have this UsageDays: ".concat("..."), "...", actualUsageDays);
            else
                assertEquals("Consumption doesn't have this UsageDays: ".concat(usageDays), this.usageDays,
                        actualUsageDays);
        }
        if (!this.device.isEmpty())
            assertTrue("Consumption doesn't have this device: ".concat(this.device), actualDevice.contains(this.device));
        if (!this.supportDevice.isEmpty())
            assertTrue("Consumption doesn't have this support device: ".concat(this.supportDevice), actualDevice.contains(this.supportDevice));
        if (!this.callingPlatform.isEmpty())
            assertTrue("Consumption doesn't have this calling platform: ".concat(callingPlatform), actualCallingPlatform.contains(this.callingPlatform));
    }

    @And("I should see the following data in the tekToken Consumption Events table")
    public void iShouldSeeTheFollowingDataInTheTekTokenConsumptionEventsTable(DataTable dataTable) {
        Map<String,String> consumption = dataTable.asMap(String.class,String.class);
        String project = consumption.getOrDefault("project", "");
        String type = consumption.getOrDefault("type", "Configuration");
        String device = consumption.getOrDefault("device", "");
        String callingPlatform = consumption.getOrDefault("callingPlatform", "");
        String tekTokens = consumption.getOrDefault("tekTokensUsed", "");
        String usageDays = consumption.getOrDefault("usageDays", "");
        this.consumptionRow = new ConsumptionRow(project);
        String actualProject = this.consumptionRow.getColumnValue("Project");
        String actualType = this.consumptionRow.getColumnValue("Type");
        String actualDevice = this.consumptionRow.getColumnValue("Device");
        String actualCallingPlatform = this.consumptionRow.getColumnValue("Calling Platform");
        String actualTekTokens = this.consumptionRow.getColumnValue("tekTokens Used");
        String actualUsageDays = this.consumptionRow.getColumnValue("Usage Days");
        if (!project.isEmpty())
            assertEquals("Consumption doesn't have this project name: ".concat(project), project, actualProject);
        assertEquals("Consumption doesn't have this type: ".concat(type), type, actualType);
        if (!device.isEmpty())
            assertTrue("Consumption doesn't have this device: ".concat(device), actualDevice.contains(device));
        if (!callingPlatform.isEmpty())
            assertTrue("Consumption doesn't have this callingPLatform: ".concat(callingPlatform), actualCallingPlatform.contains(callingPlatform));
        if (!tekTokens.isEmpty())
            assertEquals("Consumption doesn't have this amount of tekTokens used: ".concat(tekTokens), tekTokens,
                    actualTekTokens);
        if (actualTekTokens.equals("0"))
            assertEquals("Consumption doesn't have this UsageDays: ".concat("..."), "...", actualUsageDays);
        else {
            if (!usageDays.isEmpty())
                assertEquals("Consumption doesn't have this UsageDays: ".concat(usageDays), usageDays, actualUsageDays);
        }
    }

    @When("I delete the consumption of the project {string}")
    public void iDeleteTheConsumptionOfTheProject(String project) {
        this.consumptionRow = new ConsumptionRow(project);
        ActionMenu actionMenu = this.consumptionRow.openActionMenu();
        actionMenu.delete("licenseConsumption");
        this.consumptions = new Consumptions();
        this.consumptions.waitData();
    }


}
