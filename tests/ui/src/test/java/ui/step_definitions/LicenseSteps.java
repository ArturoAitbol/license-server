package ui.step_definitions;

import static org.junit.Assert.assertEquals;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

import io.cucumber.datatable.DataTable;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import ui.core.DriverManager;
import ui.pages.ActionMenu;
import ui.pages.customer.CustomerRow;
import ui.pages.customer.Customers;
import ui.pages.subscriptions.SubscriptionForm;
import ui.pages.subscriptions.SubscriptionRow;
import ui.pages.subscriptions.Subscriptions;

public class LicenseSteps {
    private Customers customers;
    private CustomerRow customerRow;
    private SubscriptionRow subscriptionRow;
    private Subscriptions subscriptions;
    private SubscriptionForm subscriptionForm;
    private String actualMessage = "none";
    String startDate, renewalDate, subscriptionType, description, deviceLimit, tokensPurchased;
    SimpleDateFormat formatter = new SimpleDateFormat("M/d/yyyy");

    public LicenseSteps(Customers customers) {
        this.customers = customers;
    }

    @And("I go to the Subscriptions view of {string}")
    public void iGoToTheSubscriptionsViewOf(String customerName) {
        this.customerRow = this.customers.getCustomer(customerName);
        ActionMenu actionMenu = this.customerRow.openActionMenu();
        this.subscriptions = actionMenu.goToSubscriptions();
    }

    @Then("I should see the {string} table")
    public void iShouldSeeTableTitle(String expectedTitle) {
        String actualTitle = this.subscriptions.getTableTitle();
        assertEquals("Page doesn't have the title: ".concat(expectedTitle), expectedTitle, actualTitle);
    }

    @Given("I open the Add Subscription form")
    public void iOpenTheAddSubscriptionForm() {
        this.subscriptionForm = this.subscriptions.openSubscriptionForm();
    }

    @Given("I open the Add Subscription form from Consumption View")
    public void iOpenTheAddSubscriptionFormFromConsumptionView() throws InterruptedException {
        this.subscriptions = new Subscriptions();
        this.subscriptionForm = this.subscriptions.openSubscriptionForm();
    }

    @When("I create a subscription with the following data")
    public void iCreateASubscriptionWithTheFollowingData(DataTable subscriptionTable) throws InterruptedException {
        Map<String, String> license = subscriptionTable.asMap(String.class, String.class);
        this.startDate = license.get("startDate");
        this.renewalDate = license.get("renewalDate");
        this.description = license.get("description");
        this.subscriptionType = license.get("subscriptionType");
        this.deviceLimit = license.getOrDefault("deviceAccessTekTokens", null);
        this.tokensPurchased = license.getOrDefault("tekTokens", null);
        this.subscriptions = this.subscriptionForm.createSubscription(this.startDate, this.renewalDate, this.subscriptionType, this.description, this.deviceLimit, this.tokensPurchased);
        this.actualMessage = this.subscriptions.getMessage();
        DriverManager.getInstance().setMessage(this.actualMessage);
    }

    @Then("I see the {string} subscription in the table")
    public void iShouldSeeTheSubscriptionInTheTable(String description) {
        this.subscriptionRow = new SubscriptionRow(description);
        String actualSubscription = this.subscriptionRow.getColumnValue("Description");
        assertEquals("Licenses table doesn't have the license: ".concat(description), description,
                actualSubscription);
    }

    @Then("I delete the {string} subscription")
    public void iDeleteASubscription(String subscriptionType) {
        this.subscriptionRow = new SubscriptionRow(subscriptionType);
        ActionMenu actionMenu = this.subscriptionRow.openActionMenu();
        this.actualMessage = actionMenu.delete("license");
        DriverManager.getInstance().setMessage(this.actualMessage);
    }

    @And("I edit the subscription {string} with the following data")
    public void iEditTheSubscriptionWithTheFollowingData(String subscriptionDescription, DataTable dataTable) throws InterruptedException {
        this.subscriptionRow = new SubscriptionRow(subscriptionDescription);
        ActionMenu actionMenu = this.subscriptionRow.openActionMenu();
        actionMenu.editForm();
        this.subscriptionForm = new SubscriptionForm();
        Map<String, String> license = dataTable.asMap(String.class, String.class);
        this.startDate = license.getOrDefault("startDate", "none");
        this.renewalDate = license.getOrDefault("renewalDate", "none");
        this.description = license.getOrDefault("description", "none");
        this.subscriptionType = license.getOrDefault("subscriptionType", "none");
        this.deviceLimit = license.getOrDefault("deviceAccessTekTokens", null);
        this.tokensPurchased = license.getOrDefault("tekTokens", null);
        this.subscriptions = this.subscriptionForm.editSubscription(this.startDate, this.renewalDate, this.subscriptionType, this.description, this.deviceLimit, this.tokensPurchased);
        this.actualMessage = this.subscriptions.getMessage();
        DriverManager.getInstance().setMessage(this.actualMessage);
    }

    @And("I should see the modified data in Subscriptions table")
    public void iShouldSeeTheModifiedDataInSubscriptionsTable() throws ParseException {
        this.subscriptionRow = new SubscriptionRow(this.description);
        if (!this.description.equals("none")){
            String actualName = this.subscriptionRow.getColumnValue("Description");
            assertEquals("License doesn't have this description: ".concat(this.description), this.description, actualName);
        }
        if (!this.subscriptionType.equals("none")){
            String actualType = this.subscriptionRow.getColumnValue("Subscription Type");
            assertEquals("License doesn't have this type: ".concat(this.subscriptionType), this.subscriptionType, actualType);
            if (!this.deviceLimit.equals("none")){
                String actualDeviceLimit = this.subscriptionRow.getColumnValue("Device Limit");
                assertEquals("License doesn't have this device limit: ".concat(this.deviceLimit), this.deviceLimit, actualDeviceLimit);
            }
            if (!this.tokensPurchased.equals("none")){
                String actualTokens = this.subscriptionRow.getColumnValue("tekTokens");
                assertEquals("License doesn't have this tekTokens: ".concat(this.tokensPurchased), this.tokensPurchased, actualTokens);
            }
        }
        if (!this.startDate.equals("none")){
            Date startDate = formatter.parse(this.startDate);
            formatter = new SimpleDateFormat("yyyy-MM-dd");
            String expectedDate = formatter.format(startDate);
            String actualStartDate = this.subscriptionRow.getColumnValue("Start Date");
            assertEquals("License doesn't have this start date: ".concat(expectedDate), expectedDate, actualStartDate);
        }
        if (!this.renewalDate.equals("none")){
            Date renewalDate = formatter.parse(this.renewalDate);
            formatter = new SimpleDateFormat("yyyy-MM-dd");
            String expectedDate = formatter.format(renewalDate);
            String actualRenewalDate = this.subscriptionRow.getColumnValue("Renewal Date");
            assertEquals("License doesn't have this renewal date: ".concat(expectedDate), expectedDate, actualRenewalDate);
        }
    }
}
