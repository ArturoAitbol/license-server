package ui.step_definitions;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import static org.junit.Assert.assertEquals;

import org.aeonbits.owner.ConfigFactory;
import ui.core.DriverManager;
import ui.pages.*;
import ui.pages.customer.AdminstratorEmails;
import ui.pages.customer.CustomerForm;
import ui.pages.customer.CustomerRow;
import ui.pages.customer.Customers;
import ui.utils.Environment;

import java.util.Map;

public class CustomerSteps {
    private Customers customers;
    private CustomerForm customerForm;
    private CustomerRow customerRow;
    private ActionMenu actionMenu;
    private String actualMessage = "none";
    private String customerName, type, subaccount;
    private AdminstratorEmails adminEmails;
    Environment environment = ConfigFactory.create(Environment.class);
    private String timeStamp = DriverManager.getInstance().getTimeStamp();

    public CustomerSteps(Customers customers) {
        this.customers = customers;
    }

    @Given("I open the Add Customer form")
    public void iOpenTheAddCustomerForm() {
        this.customerForm = this.customers.openCustomerForm();
    }

    @When("I create a customer with the following data")
    public void iCreateACustomerWithTheFollowingData(DataTable customerTable) {
        Map<String, String> customer = customerTable.asMap(String.class, String.class);
        String customerName = customer.get("name");
        String type = customer.getOrDefault("type", "MSP");
        String adminEmail = customer.getOrDefault("adminEmail", "");
        String subaccount = customer.getOrDefault("subaccount", "Default");
        String subAdminEmail = customer.getOrDefault("subAdminEmail", "");
        String spotlightPermission = customer.getOrDefault("spotlight", "no").toLowerCase();
        String testCustomer = customer.getOrDefault("testCustomer", "yes").toLowerCase();
        this.customers = customerForm.createCustomer(customerName, type, adminEmail, subaccount, subAdminEmail,
                spotlightPermission, testCustomer);
        this.actualMessage = this.customers.getMessage();
        System.out.println("Message: " + this.actualMessage);
        // DriverManager.getInstance().setMessage(this.actualMessage);
    }

/*    @When("I create a spotlight customer with the following data")
    public void iCreateASpotlightCustomerWithTheFollowingData(DataTable customerTable) {
        Map<String, String> customer = customerTable.asMap(String.class, String.class);
        String customerName = customer.get("name");
        String type = customer.getOrDefault("type", "MSP");
        String adminEmail = environment.subaccountAdminUser();
        String subaccount = customer.getOrDefault("subaccount", "Default");
        String subAdminEmail = environment.subaccountAdminUser();
        String spotlightPermission = customer.getOrDefault("spotlight", "no").toLowerCase();
        String testCustomer = customer.getOrDefault("testCustomer", "yes").toLowerCase();
        this.customers = customerForm.createCustomer(customerName, type, adminEmail, subaccount, subAdminEmail,
                spotlightPermission, testCustomer);
        this.actualMessage = this.customers.getMessage();
        System.out.println("Message: " + this.actualMessage);
        // DriverManager.getInstance().setMessage(this.actualMessage);
    }*/

    @Then("I see the customer {string} in the table")
    public void iShouldSeeTheCustomerInTheTable(String customerName) {
        String expectedCustomer = customerName + this.timeStamp;
        this.customerRow = this.customers.getCustomer(customerName);
        String actualCustomerName = this.customerRow.getCustomerColumn("Customer");
        assertEquals("Customers table doesn't have the customer: ".concat(expectedCustomer), expectedCustomer,
                actualCustomerName);
    }

    @When("I delete the customer {string}")
    public void iDeleteTheCustomer(String customerName) {
        this.customerRow = this.customers.getCustomer(customerName);
        this.actionMenu = this.customerRow.openActionMenu();
        this.actualMessage = this.actionMenu.delete("customer");
        DriverManager.getInstance().setMessage(this.actualMessage);
    }

    @Then("I should see the message {string}")
    public void iShouldSeeTheMessage(String message) {
        this.actualMessage = DriverManager.getInstance().getMessage();
        assertEquals("This message was not displayed: ".concat(message), message, this.actualMessage);
    }

    @When("I edit the customer {string} with the following data")
    public void iEditTheCustomerWithTheFollowingData(String customerName, DataTable customerTable) {
        Map<String, String> customer = customerTable.asMap(String.class, String.class);
        this.customerName = customer.get("name");
        this.type = customer.get("type");
        this.subaccount = customer.get("subaccount");
        this.customerRow = this.customers.getCustomer(customerName);
        this.actionMenu = this.customerRow.openActionMenu();
        this.actionMenu.editForm("customer");
        this.customerForm = new CustomerForm();
        this.actualMessage = customerForm.editCustomer(this.customerName, this.type, this.subaccount);
        DriverManager.getInstance().setMessage(this.actualMessage);
    }

    @Then("I should see the modified data in Customers table")
    public void iShouldSeeTheModifiedDataInCustomersTable() {
        String expectedCustomer = this.customerName + this.timeStamp;
        String expectedSubaccount = this.subaccount + this.timeStamp;
        this.customerRow = new CustomerRow(expectedCustomer);
        String actualCustomerName = this.customerRow.getCustomerColumn("Customer");
        String actualSubaccountName = this.customerRow.getCustomerColumn("Subaccount");
        String actualType = this.customerRow.getCustomerColumn("Type");
        assertEquals("Customer doesn't have this name: ".concat(this.customerName), expectedCustomer,
                actualCustomerName);
        assertEquals("Customer doesn't have this subaccount: ".concat(this.subaccount), expectedSubaccount,
                actualSubaccountName);
        assertEquals("Customer isn't this type: ".concat(this.type), this.type, actualType);
    }

    @And("I open the Customer Administrator Emails of {string}")
    public void iOpenTheCustomerAdministratorEmailsOf(String customerName) {
        this.customerRow = this.customers.getCustomer(customerName);
        this.actionMenu = this.customerRow.openActionMenu();
        this.adminEmails = this.actionMenu.goToCustomerAdmins();
    }

    @When("I add an administrator with email {string}")
    public void iAddAnAdministratorWithEmail(String adminEmail) {
        this.actualMessage = this.adminEmails.addAdministrator(adminEmail);
        DriverManager.getInstance().setMessage(this.actualMessage);
    }

    @When("I delete the administrator with email {string}")
    public void iDeleteTheAdministratorWithEmail(String adminEmail) {
        this.actualMessage = this.adminEmails.deleteAdministrator(adminEmail);
        DriverManager.getInstance().setMessage(this.actualMessage);
    }

    @And("I open the Subaccount Administrator Emails of {string}")
    public void iOpenTheSubaccountAdministratorEmailsOf(String customerName) {
        this.customerRow = this.customers.getCustomer(customerName);
        this.actionMenu = this.customerRow.openActionMenu();
        this.adminEmails = this.actionMenu.goToSubaccountAdmins();
    }

    @Then("I see in the table the customer {string} and its subaccount {string}")
    public void iSeeInTheTableTheTheCustomerAndItsSubaccount(String customerName, String subaccountName) {
        String expectedCustomer = customerName + this.timeStamp;
        String expectedSubaccount = subaccountName + this.timeStamp;
        this.customerRow = this.customers.getCustomer(customerName);
        String actualCustomerName = this.customerRow.getSubaccountColumn("Customer", null);
        String actualSubaccountName = this.customerRow.getSubaccountColumn("Subaccount", expectedSubaccount);
        assertEquals(
                String.format("Customer '%s' doesn't have the subaccount '%s'", expectedCustomer, expectedSubaccount),
                expectedSubaccount, actualSubaccountName);
        assertEquals(
                String.format("Subaccount '%s' doesn't belong to the customer '%s'", expectedSubaccount, expectedCustomer),
                expectedCustomer, actualCustomerName);
    }

    @Then("I should see the modified data in Subaccounts table")
    public void iShouldSeeTheModifiedDataInSubaccountsTable() {
        String expectedCustomer = this.customerName + this.timeStamp;
        String expectedSubaccount = this.subaccount + this.timeStamp;
        this.customerRow = new CustomerRow(expectedCustomer);
        String actualCustomerName = this.customerRow.getSubaccountColumn("Customer", null);
        String actualSubaccountName = this.customerRow.getSubaccountColumn("Subaccount", expectedSubaccount);
        String actualType = this.customerRow.getSubaccountColumn("Type", null);
        assertEquals("Customer doesn't have this name: ".concat(this.customerName), expectedCustomer,
                actualCustomerName);
        assertEquals("Customer doesn't have this subaccount: ".concat(this.subaccount), expectedSubaccount,
                actualSubaccountName);
        assertEquals("Customer isn't this type: ".concat(this.type), this.type, actualType);
    }

    @When("I delete the subaccount {string} of the customer {string}")
    public void iDeleteTheSubaccount(String subaccountName, String customerName) {
        this.customerRow = this.customers.getCustomer(customerName);
        this.actionMenu = this.customerRow.openActionMenu();
        this.actualMessage = this.actionMenu.delete("subaccount");
        DriverManager.getInstance().setMessage(this.actualMessage);
    }

}
