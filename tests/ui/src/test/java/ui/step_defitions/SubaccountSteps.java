package ui.step_defitions;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import ui.pages.*;

import java.util.Map;

public class SubaccountSteps {
    Customers customers;
    SubaccountForm subaccountForm;
    CustomerRow customerRow;
    String actualMessage;
    ActionMenu actionMenu;

    public SubaccountSteps(Customers customers) {
        this.customers = customers;
    }

    @Given("I open the Add Subaccount form")
    public void iOpenTheAddCustomerForm() {
        this.subaccountForm = this.customers.openSubaccountForm();
    }

    @When("I create a subaccount with the following data")
    public void iCreateASubaccountWithTheFollowingData(DataTable dataTable) {
        Map<String, String> subaccount = dataTable.asMap(String.class, String.class);
        String customer = subaccount.get("customer");
        String subAccountName = subaccount.get("name");
        String subAdminEmail = subaccount.get("subAdminEmail");
        this.customers = this.subaccountForm.createSubaccount(customer, subAccountName, subAdminEmail);
    }


/*    @Then("I see in the table the customer {string} and its subaccount {string}")
    public void iSeeInTheTableTheTheCustomerAndItsSubaccount(String customerName, String subaccountName) {
        SubaccountRow subaccountRow = this.customers.getSubaccount(subaccountName);
        String actualSubaccountName = subaccountRow.getColumnValue("Subaccount");
        String actualCustomerName = subaccountRow.getColumnValue("Customer");
    }*/
}
