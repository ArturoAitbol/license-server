package ui.step_definitions;

import java.util.Map;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.And;
import io.cucumber.java.en.When;
import ui.core.DriverManager;
import ui.pages.ActionMenu;
import ui.pages.spotlight.TestSuiteForm;
import ui.pages.spotlight.TestSuiteRow;
import ui.pages.spotlight.TestSuites;

public class SpotlightTestSuitesSteps {
    TestSuites testSuites;
    TestSuiteRow testSuiteRow;
    TestSuiteForm testSuiteForm;
    private String actualMessage = "none";

    public SpotlightTestSuitesSteps(TestSuites testSuites) {
        this.testSuites = testSuites;
    }

    @And("I open the Add Test Suite form")
    public void iOpenTheAddTestSuiteForm() throws InterruptedException {
        this.testSuiteForm = this.testSuites.openTestSuiteForm();
    }

    @And("I create a test suite with the following data")
    public void iCreateATestSuiteWithTheFollowingData(DataTable testSuiteTable) {
        this.testSuiteForm.waitSpinner();
        Map<String, String> testSuite = testSuiteTable.asMap(String.class, String.class);
        String name = testSuite.get("suiteName");
        String service = testSuite.getOrDefault("service", "MS Teams");
        String frequency = testSuite.get("frequency");
        this.testSuites = testSuiteForm.addTestSuite(name, service, frequency);
        this.actualMessage = this.testSuites.getMessage();
        System.out.println("Message: " + this.actualMessage);
        DriverManager.getInstance().setMessage(this.actualMessage);
    }

    @When("I edit the test suite {string} with the following data")
    public void iEditTheTestSuiteWithTheFollowingData(String currentTestSuite, DataTable dataTable)
            throws InterruptedException {
        this.testSuiteRow = new TestSuiteRow(currentTestSuite);
        ActionMenu actionMenu = this.testSuiteRow.openActionMenu();
        actionMenu.editForm();
        this.testSuiteForm = new TestSuiteForm();
        Map<String, String> testSuite = dataTable.asMap(String.class, String.class);
        String name = testSuite.get("suiteName");
        String service = testSuite.getOrDefault("service", "MS Teams");
        String executions = testSuite.get("executions");
        String nextExecution = testSuite.get("nextExecution");
        String frequency = testSuite.get("frequency");
        this.testSuites = this.testSuiteForm.editTestSuite(name, service, executions, nextExecution,frequency);        
        String actualMessage = this.testSuites.getMessage();
        this.testSuites.waitData();
        DriverManager.getInstance().setMessage(actualMessage);
    }
}
