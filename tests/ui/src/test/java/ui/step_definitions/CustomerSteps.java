package ui.step_definitions;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.junit.Assert;
import ui.core.DriverManager;
import ui.pages.ActionMenu;
import ui.pages.CustomerForm;
import ui.pages.CustomerRow;
import ui.pages.Customers;

import java.util.Map;

public class CustomerSteps {
    private Customers customers;
    private CustomerForm customerForm;
    private CustomerRow customerRow;
    private ActionMenu actionMenu;
    private String actualMessage = "none";
    private String customerName, type, subaccount;

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
        String adminEmail = customer.get("adminEmail");
        String subaccount = customer.getOrDefault("subaccount", "Default");
        String subAdminEmail = customer.getOrDefault("subAdminEmail", "noSubAdminEmail@test.com");
        String testCustomer = customer.getOrDefault("testCustomer", "yes").toLowerCase();
        this.customers = customerForm.createCustomer(customerName, type, adminEmail, subaccount, subAdminEmail,
                testCustomer);
        this.actualMessage = this.customers.getMessage();
        System.out.println(this.actualMessage);
//        DriverManager.getInstance().setMessage(this.actualMessage);
    }

    @Then("I see the customer {string} in the table")
    public void iShouldSeeTheCustomerInTheTable(String customerName) {
        this.customerRow = this.customers.getCustomer(customerName);
        String actualCustomerName = this.customerRow.getCostumerColumn("Customer");
        Assert.assertEquals("Customers table doesn't have the customer: ".concat(customerName), customerName,
                actualCustomerName);
    }

    @When("I delete the customer {string}")
    public void iDeleteTheCustomer(String customerName) {
        this.actionMenu = this.customerRow.openActionMenu();
        this.actualMessage = this.actionMenu.delete("customer");
        DriverManager.getInstance().setMessage(this.actualMessage);
    }

    @When("I delete the subaccount {string} of the customer {string}")
    public void iDeleteTheSubaccount(String subaccountName, String customerName) {
        this.actionMenu = this.customerRow.openActionMenu();
        this.actualMessage = this.actionMenu.delete("subaccount");
        DriverManager.getInstance().setMessage(this.actualMessage);
    }

    @Then("I should see the message {string}")
    public void iShouldSeeTheMessage(String message) {
        this.actualMessage = DriverManager.getInstance().getMessage();
        Assert.assertEquals("This message was not displayed: ".concat(message), message, this.actualMessage);
    }

    @When("I edit the customer {string} with the following data")
    public void iEditTheCustomerWithTheFollowingData(String customerName, DataTable customerTable) {
        Map<String, String> customer = customerTable.asMap(String.class, String.class);
        this.customerName = customer.get("name");
        this.type = customer.get("type");
        this.subaccount = customer.get("subaccount");
        this.actionMenu = this.customerRow.openActionMenu();
        this.actionMenu.edit();
        this.customerForm = new CustomerForm();
        this.actualMessage = customerForm.editCustomer(this.customerName, this.type, this.subaccount);
        DriverManager.getInstance().setMessage(this.actualMessage);
    }

    @Then("I should see the modified data in Customers table")
    public void iShouldSeeTheModifiedDataInCustomersTable() {
        this.customerRow = new CustomerRow(this.customerName);
        String actualCustomerName = this.customerRow.getCostumerColumn("Customer");
        String actualSubaccountName = this.customerRow.getCostumerColumn("Subaccount");
        String actualType = this.customerRow.getCostumerColumn("Type");
        Assert.assertEquals("Customer doesn't have this name: ".concat(this.customerName), this.customerName,
                actualCustomerName);
        Assert.assertEquals("Customer doesn't have this subaccount: ".concat(this.subaccount), this.subaccount,
                actualSubaccountName);
        Assert.assertEquals("Customer isn't this type: ".concat(this.type), this.type, actualType);
    }

    @Then("I see in the table the customer {string} and its subaccount {string}")
    public void iSeeInTheTableTheTheCustomerAndItsSubaccount(String customerName, String subaccountName) {
        this.customerRow = this.customers.getCustomer(subaccountName);
        String actualCustomerName = this.customerRow.getSubaccountColumn("Customer");
        String actualSubaccountName = this.customerRow.getSubaccountColumn("Subaccount");
        Assert.assertEquals(
                String.format("Customer '%s' doesn't have the subaccount '%s'", customerName, subaccountName),
                subaccountName, actualSubaccountName);
        Assert.assertEquals(
                String.format("Subaccount '%s' doesn't belong to the customer '%s'", subaccountName, customerName),
                customerName, actualCustomerName);
    }

    @Then("I should see the modified data in Subaccounts table")
    public void iShouldSeeTheModifiedDataInSubaccountsTable() {
        this.customerRow = new CustomerRow(this.subaccount);
        String actualCustomerName = this.customerRow.getSubaccountColumn("Customer");
        String actualSubaccountName = this.customerRow.getSubaccountColumn("Subaccount");
        String actualType = this.customerRow.getSubaccountColumn("Type");
        Assert.assertEquals("Customer doesn't have this name: ".concat(this.customerName), this.customerName,
                actualCustomerName);
        Assert.assertEquals("Customer doesn't have this subaccount: ".concat(this.subaccount), this.subaccount,
                actualSubaccountName);
        Assert.assertEquals("Customer isn't this type: ".concat(this.type), this.type, actualType);
    }
}
