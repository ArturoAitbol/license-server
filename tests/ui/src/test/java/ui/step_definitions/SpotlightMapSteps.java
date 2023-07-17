package ui.step_definitions;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import ui.pages.ActionMenu;
import ui.pages.customer.CustomerRow;
import ui.pages.customer.Customers;
import ui.pages.spotlight.*;

public class SpotlightMapSteps {
    Map map;
    MapNode mapNode;
    MapLine mapLine;
    Customers customers;
    Dashboard spotlightDashboard;

    public SpotlightMapSteps(Customers customers, Map map){
        this.customers = customers;
        this.map = map;
    }

    @Then("I open the node of the map")
    public void iOpenTheNodeOfTheMap() {
        this.mapNode = new MapNode();
        this.mapNode.openNodeAndValidateData();
    }

    @Then("I open a link and validate the data")
    public void iOpenALinkAndValidateTheData() {
        this.mapLine = new MapLine();
        this.mapLine.validateLinkData();
    }

    @Then("I open a link and validate failed calls")
    public void iOpenALinkAndValidateFailedCalls() {
        this.mapLine = new MapLine();
        this.mapLine.validateCallsFailedValues();
    }

    @Then("I validate node avg POLQA of {string} with {string} and {string}")
    public void iValidateNodeAvgPOLQA(String node, String orginatedAvg, String terminatedAvg) {
        this.mapNode = new MapNode();
        this.mapNode.validatePOLQA(node, orginatedAvg, terminatedAvg);
    }

    @Then("I open the native dashboard of the {string} node")
    public void iOpenNativeDashboard(String node) {
        this.mapNode = new MapNode();
        this.mapNode.openNativeDashboard(node);
    }

    @Then("I filter by date and {string} and open a node")
    public void iFilterByDateAndRegionAndOpenANode(String regionFilter) {
        this.map.openNode(regionFilter);
    }

    @Then("I filter by date and {string} and open a link")
    public void iFilterByDateAndRegionAndOpenALink(String regionFilter) {
        this.map.openLink(regionFilter);
    }

    @Given("I go to spotlight for customer {string} with subaccount {string}")
    public void iGoToTheSpotlightDashboardViewFor(String customerName, String customerSubaccount) {
        CustomerRow customerRow = this.customers.getCustomerSubaccount(customerName, customerSubaccount);
        ActionMenu actionMenu = customerRow.openActionMenu();
        this.spotlightDashboard = actionMenu.goToSpotlightDashboard();
    }

}
