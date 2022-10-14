package ui.step_definitions;

import static org.junit.Assert.assertEquals;

import java.util.Map;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.aeonbits.owner.ConfigFactory;
import ui.core.DriverManager;
import ui.pages.ActionMenu;
import ui.pages.spotlight.StakeholderForm;
import ui.pages.spotlight.StakeholderRow;
import ui.pages.spotlight.Stakeholders;
import ui.utils.Environment;


public class SpotlightStakeholdersSteps {
    Stakeholders stakeholders;
    StakeholderRow stakeholderRow;
    StakeholderForm stakeholderForm;
    private String actualMessage = "none";
    Environment environment = ConfigFactory.create(Environment.class);

    public SpotlightStakeholdersSteps(Stakeholders stakeholders) {
        this.stakeholders = stakeholders;
    }

    @And("I open the Add Stakeholder form")
    public void iOpenTheAddStakeholderForm() throws InterruptedException {
        this.stakeholderForm = this.stakeholders.openStakeholderForm();
    }

    @And("I create a stakeholder with the following data")
    public void iCreateAStakeholderWithTheFollowingData(DataTable stakeholdersTable) {
        this.stakeholderForm.waitSpinner();
        Map<String, String> stakeholder = stakeholdersTable.asMap(String.class, String.class);
        String name = stakeholder.get("name");
        String jobTitle = stakeholder.get("jobTitle");
        String companyName = stakeholder.get("companyName");
//        String subaccountAdminEmail = stakeholder.get("subaccountAdminEmail");
        String subaccountAdminEmail = environment.stakeholderUser();
        String phoneNumber = stakeholder.get("phoneNumber");
        String type = stakeholder.get("type");
        this.stakeholders = stakeholderForm.addStakeholder(name, jobTitle, companyName, subaccountAdminEmail, phoneNumber, type);
        this.actualMessage = this.stakeholders.getMessage();
        System.out.println("Message: " + this.actualMessage);
        DriverManager.getInstance().setMessage(this.actualMessage);
    }

    @When("I edit the stakeholder {string} with the following data")
    public void iEditTheStakeholderWithTheFollowingData(String currentStakeholder, DataTable dataTable)
            throws InterruptedException {
        this.stakeholderRow = new StakeholderRow(currentStakeholder);
        ActionMenu actionMenu = this.stakeholderRow.openActionMenu();
        actionMenu.editStakeholderForm();
        this.stakeholderForm = new StakeholderForm();
        Map<String, String> stakeholder = dataTable.asMap(String.class, String.class);
        String name = stakeholder.get("name");
        String jobTitle = stakeholder.get("jobTitle");
        String companyName = stakeholder.get("companyName");
        String phoneNumber = stakeholder.get("phoneNumber");
        String type = stakeholder.get("type");
        this.stakeholders = stakeholderForm.editStakeholder(name, jobTitle, companyName, phoneNumber, type);
        this.actualMessage = this.stakeholders.getMessage();
        this.stakeholders.waitData();
        DriverManager.getInstance().setMessage(actualMessage);
    }

    @Then("I see the {string} stakeholder in the table")
    public void iShouldSeeTheStakeholderInTheTable(String name) {
        this.stakeholderRow = new StakeholderRow(name);
        String actualStakeHolder = this.stakeholderRow.getColumnValue("Name");
        assertEquals("Stakeholders table doesn't have the stakeholder: ".concat(name), name, actualStakeHolder);
    }

    @Then("I delete the {string} stakeholder")
    public void iDeleteAStakeholder(String name) throws InterruptedException {
        this.stakeholderRow = new StakeholderRow(name);
        Thread.sleep(2500);
        ActionMenu actionMenu = this.stakeholderRow.openActionMenu();
        this.actualMessage = actionMenu.delete("stakeholder");
        DriverManager.getInstance().setMessage(this.actualMessage);
    }
}
