package ui.step_definitions;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import ui.pages.ActionMenu;
import ui.pages.customer.CustomerRow;
import ui.pages.customer.Customers;
import ui.pages.spotlight.Dashboard;
import ui.pages.spotlight.Map;
import ui.pages.spotlight.Setup;

public class SpotlightMapSteps {
    Map map;

    Customers customers;
    Dashboard spotlightDashboard;

    public SpotlightMapSteps(Customers customers, Map map){
        this.customers = customers;
        this.map = map;
    }

    @Then("I open the node of the map")
    public void iOpenTheNodeOfTheMap() {
        this.map.waitData();
        this.map.openNodeAndValidateData();
    }

//    @Then("I open a node of the map and validate POLQA")
//    public void iOpenANodeOfTheMapAndValidatePOLQA() {
//        this.map.waitData();
//        this.map.validatePOLQAValues();
//    }

    @Then("I open a link and validate the data")
    public void iOpenALinkAndValidateTheData() {
        this.map.waitData();
        this.map.validateCallsFailedValues();
    }

    @Then("I open a link and validate failed calls")
    public void iOpenALinkAndValidateFailedCalls() {
        this.map.waitData();
        this.map.validateLinkData();
    }

    @Then("I validate node avg POLQA of {string} with {string} and {string}")
    public void iValidateNodeAvgPOLQA(String node, String orginatedAvg, String terminatedAvg) {
        this.map.waitData();
        this.map.validatePOLQA(node, orginatedAvg, terminatedAvg);
    }

    @Given("I go to spotlight for {string}")
    public void iGoToTheSpotlightDashboardViewFor(String customerName) {
        CustomerRow customerRow = this.customers.getCustomerSubaccount(customerName);
        ActionMenu actionMenu = customerRow.openActionMenu();
        this.spotlightDashboard = actionMenu.goToSpotlightDashboard();
    }

}
