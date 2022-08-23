package ui.step_defitions;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.junit.Assert;
import ui.core.DriverManager;
import ui.pages.*;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

public class ProjectSteps {
    Customers customers;
    CustomerRow customerRow;
    Projects projects;
    ProjectForm projectForm;
    ProjectRow projectRow;
    String startDate, name, code, type, closeDate;
    String actualMessage;
    SimpleDateFormat formatter = new SimpleDateFormat("M/d/yyyy");

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
        this.actualMessage = this.projects.getMessage();
        DriverManager.getInstance().setMessage(this.actualMessage);
    }


    @Then("I see the project {string} in the table")
    public void iSeeTheProjectInTheTable(String projectName) {
        this.projectRow = new ProjectRow(projectName);
        String actualName = projectRow.getColumnValue("Project Name");
        Assert.assertEquals("Projects table doesn't have the project: ".concat(projectName), projectName, actualName);
    }


    @When("I edit the project {string} with the following data")
    public void iEditTheProjectWithTheFollowingData(String projectName, DataTable datatable) {
        this.projectRow = new ProjectRow(projectName);
        ActionMenu actionMenu = this.projectRow.openActionMenu();
        actionMenu.edit();
        this.projectForm = new ProjectForm();
        Map<String, String> projectTable = datatable.asMap(String.class, String.class);
        this.startDate = projectTable.getOrDefault("startDate", "none");
        this.name = projectTable.getOrDefault("name", "none");
        this.code = projectTable.getOrDefault("code", "none");
        this.type = projectTable.getOrDefault("type", "none");
        this.closeDate = projectTable.getOrDefault("closeDate", "N/A");
        this.projects = this.projectForm.editProject(startDate, name, code, type, closeDate);
        this.actualMessage = this.projects.getMessage();
        DriverManager.getInstance().setMessage(this.actualMessage);
    }

    @Then("I should see the modified data in Projects table")
    public void iShouldSeeTheModifiedDataInProjectsTable() throws ParseException {
        if (!this.name.equals("none")){
            this.projectRow = new ProjectRow(this.name);
            String actualName = this.projectRow.getColumnValue("Project Name");
            Assert.assertEquals("Project doesn't have this name: ".concat(this.name), this.name, actualName);
        }
        if (!this.startDate.equals("none")){
            Date startDate = formatter.parse(this.startDate);
            formatter = new SimpleDateFormat("yyyy-MM-dd");
            String expectedDate = formatter.format(startDate);
            String actualStartDate = this.projectRow.getColumnValue("Start Date");
            Assert.assertEquals("Project doesn't have this start date: ".concat(expectedDate), expectedDate, actualStartDate);
        }
        if (!this.code.equals("none")){
            String actualCode = this.projectRow.getColumnValue("Project Code");
            Assert.assertEquals("Project doesn't have this code: ".concat(this.code), this.code, actualCode);
        }
        if (!this.type.equals("none")){
            String actualStatus = this.projectRow.getColumnValue("Status");
            Assert.assertEquals("Project doesn't have this status: ".concat(this.type), this.type, actualStatus);
            if (!this.closeDate.equals("none")){
                Date startDate = formatter.parse(this.closeDate);
                formatter = new SimpleDateFormat("yyyy-MM-dd");
                String expectedDate = formatter.format(startDate);
                String actualCloseDate = this.projectRow.getColumnValue("Close Date");
                Assert.assertEquals("Project doesn't have this close date: ".concat(expectedDate), expectedDate, actualCloseDate);
            }
        }
    }

    @When("I delete the project {string}")
    public void iDeleteTheProject(String projectName) {
        this.projectRow = new ProjectRow(projectName);
        ActionMenu actionMenu = projectRow.openActionMenu();
        this.actualMessage = actionMenu.delete("project");
        DriverManager.getInstance().setMessage(this.actualMessage);
    }

    @When("I close the project {string}")
    public void iCloseTheProject(String projectName) {
        this.projectRow = new ProjectRow(projectName);
        ActionMenu actionMenu = projectRow.openActionMenu();
        this.actualMessage = actionMenu.close();
        DriverManager.getInstance().setMessage(this.actualMessage);
    }

    @And("I should see the project {string} in the table with a status {string}")
    public void iShouldSeeTheProjectInTheTableWithAStatus(String projectName, String status) {
        this.projectRow = new ProjectRow(projectName);
        String actualStatus = this.projectRow.getColumnValue("Status");
        Assert.assertEquals("Project doesn't have this status: ".concat(status), status, actualStatus);
    }
}
