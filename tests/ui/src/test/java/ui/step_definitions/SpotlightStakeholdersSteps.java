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
        Map<String, String> stakeholder = stakeholdersTable.asMap(String.class, String.class);
        String name = stakeholder.get("name");
        String jobTitle = stakeholder.get("jobTitle");
        String companyName = stakeholder.get("companyName");
        String subaccountAdminEmail = environment.stakeholderUser();
        String phoneNumber = stakeholder.get("phoneNumber");
        String type = stakeholder.get("type");
        this.stakeholders = stakeholderForm.addStakeholder(name, jobTitle, companyName, subaccountAdminEmail, phoneNumber, type);
        this.actualMessage = this.stakeholders.getMessage();
        System.out.println("Message: " + this.actualMessage);
        DriverManager.getInstance().setMessage(this.actualMessage);
    }

    @When("I edit the stakeholder {string} with the following data")
    public void iEditTheStakeholderWithTheFollowingData(String currentStakeholder, DataTable dataTable) {
        String expectedName = "";
        if (DriverManager.getInstance().getActiveDirectoryStatus())
            expectedName = currentStakeholder;
        else if (!DriverManager.getInstance().getActiveDirectoryStatus())
            expectedName = environment.stakeholderUser();
        this.stakeholderRow = new StakeholderRow(expectedName);

        ActionMenu actionMenu = this.stakeholderRow.openActionMenu();
        actionMenu.editForm("stakeholder");
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
        DriverManager.getInstance().setMessage(this.actualMessage);
    }

    @Then("I see the {string} stakeholder in the table")
    public void iSeeTheStakeholderInTheTable(String currentStakeholder) {
        String expectedName = "";
        if (DriverManager.getInstance().getActiveDirectoryStatus()){
            System.out.println("Active Directory enabled");
            expectedName = currentStakeholder;
        }
        else if (!DriverManager.getInstance().getActiveDirectoryStatus()){
            System.out.println("Active Directory disabled");
            expectedName = environment.stakeholderUser();
        }
        this.stakeholderRow = new StakeholderRow(expectedName);
        String actualStakeHolder = this.stakeholderRow.getColumnValue("Name");
        assertEquals("Stakeholders table doesn't have the stakeholder: ".concat(expectedName), expectedName, actualStakeHolder);
    }

    @Then("I delete the {string} stakeholder")
    public void iDeleteAStakeholder(String currentStakeholder) throws InterruptedException {
        String expectedName = "";
        if (DriverManager.getInstance().getActiveDirectoryStatus())
            expectedName = currentStakeholder;
        else if (!DriverManager.getInstance().getActiveDirectoryStatus())
            expectedName = environment.stakeholderUser();
        this.stakeholderRow = new StakeholderRow(expectedName);

        ActionMenu actionMenu = this.stakeholderRow.openActionMenu();
        this.actualMessage = actionMenu.delete("stakeholder");
        DriverManager.getInstance().setMessage(this.actualMessage);
    }
}
