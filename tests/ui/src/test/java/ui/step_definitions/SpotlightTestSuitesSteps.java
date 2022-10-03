package ui.step_definitions;

import java.util.Map;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.And;
import ui.core.DriverManager;
import ui.pages.spotlight.TestSuiteForm;
import ui.pages.spotlight.TestSuites;

public class SpotlightTestSuitesSteps {
    TestSuiteForm testSuiteForm;
    TestSuites testSuites;
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
        Map<String, String> testSuite = testSuiteTable.asMap(String.class, String.class);
        String name = testSuite.get("suiteName");
        String service = testSuite.getOrDefault("service", "MS Teams");
        String frequency = testSuite.get("frequency");
        this.testSuites = testSuiteForm.addTestSuite(name, service, frequency);
        this.actualMessage = this.testSuites.getMessage();
        System.out.println("Message: " + this.actualMessage);
        DriverManager.getInstance().setMessage(this.actualMessage);
    }
}
