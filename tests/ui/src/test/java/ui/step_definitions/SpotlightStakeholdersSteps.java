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
    private String stakeholderEmail = "";

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
        String countryPhoneNumber = stakeholder.get("countryPhoneNumber");
        String phoneNumber = stakeholder.get("phoneNumber");
        this.stakeholderEmail = getStakeholder();
        this.stakeholders = stakeholderForm.addStakeholder(name, jobTitle, companyName, this.stakeholderEmail, countryPhoneNumber, phoneNumber);
        this.actualMessage = this.stakeholders.getMessage();
        System.out.println("Message: " + this.actualMessage);
        DriverManager.getInstance().setMessage(this.actualMessage);
    }

    @When("I edit the stakeholder using the following data")
    public void iEditTheStakeholderWithTheFollowingData(DataTable dataTable) {
        String expectedEmail = getStakeholder();
        this.stakeholderRow = new StakeholderRow(expectedEmail);
        ActionMenu actionMenu = this.stakeholderRow.openActionMenu();
        actionMenu.editForm("stakeholder");
        this.stakeholderForm = new StakeholderForm();
        Map<String, String> stakeholder = dataTable.asMap(String.class, String.class);
        String name = stakeholder.getOrDefault("name","none");
        String jobTitle = stakeholder.getOrDefault("jobTitle","none");
        String companyName = stakeholder.getOrDefault("companyName","none");
        String countryPhoneNumber = stakeholder.getOrDefault("countryPhoneNumber","none");
        String phoneNumber = stakeholder.getOrDefault("phoneNumber","none");
        this.stakeholders = stakeholderForm.editStakeholder(name, jobTitle, companyName, countryPhoneNumber, phoneNumber);
        this.actualMessage = this.stakeholders.getMessage();
        this.stakeholders.waitData();
        DriverManager.getInstance().setMessage(this.actualMessage);
    }

    @Then("I see the stakeholder in the table")
    public void iSeeTheStakeholderInTheTable() {
        String expectedEmail = getStakeholder();
        this.stakeholderRow = new StakeholderRow(expectedEmail);
        String actualStakeHolder = this.stakeholderRow.getColumnValue("email");
        assertEquals("Stakeholders table doesn't have the stakeholder: ".concat(expectedEmail), expectedEmail, actualStakeHolder);
    }

    @When("I delete the stakeholder")
    public void iDeleteAStakeholder() {
        this.stakeholderRow = new StakeholderRow(getStakeholder());
        ActionMenu actionMenu = this.stakeholderRow.openActionMenu();
        this.actualMessage = actionMenu.delete("stakeholder");
        DriverManager.getInstance().setMessage(this.actualMessage);
    }

    public String getStakeholder(){
        String stakeholder;
        stakeholder = this.environment.stakeholderUser();
        if (!DriverManager.getInstance().getActiveDirectoryStatus())
            stakeholder = DriverManager.getInstance().addTimeStampToEmail(stakeholder);
        return stakeholder;
    }
}
