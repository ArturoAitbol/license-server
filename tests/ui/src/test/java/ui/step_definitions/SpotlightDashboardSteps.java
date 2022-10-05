package ui.step_definitions;

import io.cucumber.java.en.And;
import ui.pages.ActionMenu;
import ui.pages.SideBar;
import ui.pages.customer.CustomerRow;
import ui.pages.customer.Customers;
import ui.pages.spotlight.Dashboard;

public class SpotlightDashboardSteps {
    Customers customers;
    Dashboard spotlightDashboard;

    public SpotlightDashboardSteps(Customers customers) {
        this.customers = customers;
    }

    @And("I go to the spotlight dashboard for {string}")
    public void iGoToTheSpotlightDashboardViewFor(String customerName) {
        CustomerRow customerRow = this.customers.getCustomer(customerName);
        ActionMenu actionMenu = customerRow.openActionMenu();
        this.spotlightDashboard = actionMenu.goToSpotlightDashboard();
    }

    @And("I go to the spotlight {string} tab")
    public void iGoToTheSpotlightRequiredTab(String tabName) {
        SideBar sideBar = new SideBar();
        sideBar.clickOnOption(tabName);
    }

}
