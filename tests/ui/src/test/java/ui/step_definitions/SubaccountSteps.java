package ui.step_definitions;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import ui.core.DriverManager;
import ui.pages.*;
import ui.pages.customer.CustomerRow;
import ui.pages.customer.Customers;
import ui.pages.subaccounts.SubaccountForm;

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

/*    @Given("I open the Add Subaccount form")
    public void iOpenTheAddCustomerForm() {
        this.subaccountForm = this.customers.openSubaccountForm();
    }
*/
/*    @When("I create a subaccount with the following data")
    public void iCreateASubaccountWithTheFollowingData(DataTable dataTable) {
        Map<String, String> subaccount = dataTable.asMap(String.class, String.class);
        String customer = subaccount.get("customer");
        String subAccountName = subaccount.get("name");
        String subAdminEmail = subaccount.get("subAdminEmail");
        if (!DriverManager.getInstance().getActiveDirectoryStatus())
            subAdminEmail = DriverManager.getInstance().addTimeStampToEmail(subAdminEmail);
        this.customers = this.subaccountForm.createSubaccount(customer, subAccountName, subAdminEmail);
        this.actualMessage = this.customers.getMessage();
        DriverManager.getInstance().setMessage(this.actualMessage);
    }
*/
/*    @Then("I see in the table the customer {string} and its subaccount {string}")
    public void iSeeInTheTableTheTheCustomerAndItsSubaccount(String customerName, String subaccountName) {
        SubaccountRow subaccountRow = this.customers.getSubaccount(subaccountName);
        String actualSubaccountName = subaccountRow.getColumnValue("Subaccount");
        String actualCustomerName = subaccountRow.getColumnValue("Customer");
    }
*/
}
