package ui.step_defitions;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.junit.Assert;
import ui.pages.*;

import java.util.HashMap;
import java.util.Map;

public class ProjectSteps {

    Customers customers;
    CustomerRow customerRow;
    Projects projects;
    ProjectForm projectForm;
    ProjectRow projectRow;
    String startDate, name, code, type, closeDate;

    public ProjectSteps(Customers customers){
        this.customers = customers;
    }

    @And("I go to the Projects List of {string}")
    public void iGoToTheProjectsListOf(String customerName) {
        this.customerRow = this.customers.getCustomer(customerName);
        ActionMenu actionMenu = this.customerRow.openActionMenu();
        this.projects = actionMenu.goToProjects();
    }

    @When("I open the Add Project form")
    public void iOpenTheAddProjectForm() {
        this.projectForm = this.projects.openProjectForm();
    }

    @When("I create a project with the following data")
    public void iCreateAProjectWithTheFollowingData(DataTable datatable) {
        Map<String, String> projectTable = datatable.asMap(String.class, String.class);
        this.startDate = projectTable.get("startDate");
        this.name = projectTable.get("name");
        this.code = projectTable.get("code");
        this.projects = this.projectForm.createProject(startDate, name, code);
    }


    @Then("I see the project {string} in the table")
    public void iSeeTheProjectInTheTable(String projectName) {
        ProjectRow projectRow = new ProjectRow(projectName);
        String actualName = projectRow.getColumnValue("Project Name");
        Assert.assertEquals("Projects table doesn't have the project: ".concat(projectName), projectName, actualName);
    }


    @When("I edit the project {string} with the following data")
    public void iEditTheProjectWithTheFollowingData(String projectName, DataTable datatable) {
        this.projectRow = new ProjectRow(projectName);
        ActionMenu actionMenu = projectRow.openActionMenu();
        actionMenu.edit();
        this.projectForm = new ProjectForm();
        Map<String, String> projectTable = datatable.asMap(String.class, String.class);
        this.startDate = projectTable.getOrDefault("startDate", "none");
        this.name = projectTable.getOrDefault("name", "none");
        this.code = projectTable.getOrDefault("code", "none");
        this.type = projectTable.getOrDefault("type", "none");
        this.closeDate = projectTable.getOrDefault("closeDate", "N/A");
        this.projectForm.editProject(startDate, name, code, type, closeDate);
    }

    @Then("I should see the modified data in Projects table")
    public void iShouldSeeTheModifiedDataInProjectsTable() {
        String actualName = this.projectRow.getColumnValue("Project Name");
        String actualCode = this.projectRow.getColumnValue("Project Code");
        String actualStatus = this.projectRow.getColumnValue("Status");
        String actualStartDate = this.projectRow.getColumnValue("Start Date");
        String actualCloseDate = this.projectRow.getColumnValue("Close Date");
        Assert.assertEquals("Project doesn't have this code: ".concat(this.code), this.code, actualCode);
        Assert.assertEquals("Project doesn't have this name: ".concat(this.name), this.name, actualName);
        Assert.assertEquals("Project doesn't have this status: ".concat(this.type), this.type, actualStatus);
        Assert.assertEquals("Project doesn't have this start date: ".concat(this.startDate), this.startDate, actualStartDate);
        Assert.assertEquals("Project doesn't have this close date: ".concat(this.closeDate), this.closeDate, actualCloseDate);
    }
}
