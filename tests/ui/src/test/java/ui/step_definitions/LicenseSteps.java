package ui.step_definitions;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

import io.cucumber.datatable.DataTable;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.junit.Assert;
import ui.core.DriverManager;
import ui.pages.ActionMenu;
import ui.pages.CustomerRow;
import ui.pages.Customers;
import ui.pages.ProjectRow;
import ui.pages.packages.PackageForm;
import ui.pages.packages.PackageRow;
import ui.pages.packages.Packages;

public class LicenseSteps {
    private Customers customers;
    private CustomerRow customerRow;
    private PackageRow packageRow;
    private Packages packages;
    private PackageForm packageForm;
    private String actualMessage = "none";
    String startDate, renewalDate, packageType, deviceLimit, tokensPurchased;
    SimpleDateFormat formatter = new SimpleDateFormat("M/d/yyyy");

    public LicenseSteps(Customers customers) {
        this.customers = customers;
    }

    @And("I go to the Packages view of {string}")
    public void iGoToThePackagesViewOf(String customerName) {
        this.customerRow = this.customers.getCustomer(customerName);
        ActionMenu actionMenu = this.customerRow.openActionMenu();
        this.packages = actionMenu.goToPackages();
    }

    @Then("I should see the {string} table")
    public void iShouldSeeTableTitle(String expectedTitle) {
        String actualTitle = this.packages.getTableTitle();
        Assert.assertEquals("Page doesn't have the title: ".concat(expectedTitle), expectedTitle, actualTitle);
    }

    @Given("I open the Add Package form")
    public void iOpenTheAddPackageForm() {
        this.packageForm = this.packages.openPackageForm();
    }

    @When("I create a package with the following data")
    public void iCreateAPackageWithTheFollowingData(DataTable packageTable) {
        Map<String, String> license = packageTable.asMap(String.class, String.class);
        this.startDate = license.get("startDate");
        this.renewalDate = license.get("renewalDate");
        this.packageType = license.get("packageType");
        this.deviceLimit = license.getOrDefault("deviceAccessTekTokens", null);
        this.tokensPurchased = license.getOrDefault("tekTokens", null);
        this.packages = this.packageForm.createPackage(this.startDate, this.renewalDate, this.packageType, this.deviceLimit, this.tokensPurchased);
    }

    @Then("I see the {string} package in the table")
    public void iShouldSeeThePackageInTheTable(String packageType) {
        this.packageRow = new PackageRow(packageType);
        String actualPackage = this.packageRow.getColumnValue("Package Type");
        Assert.assertEquals("Licenses table doesn't have the license: ".concat(packageType), packageType,
                actualPackage);
    }

    @Then("I see the {string} package with {int} device access tokens and {int} tekTokens")
    public void iShouldSeeThePackageInTheTable(String packageType, int deviceTokens, int tekTokens) {
        String actualPackage = this.packageRow.getColumnValue("Package Type");
        String deviceLimit = this.packageRow.getColumnValue("Device Limit");
        String pkgTekTokens = this.packageRow.getColumnValue("tekTokens");
        Assert.assertEquals("Licenses table doesn't have the license: ".concat(packageType), packageType,
                actualPackage);
        Assert.assertEquals("Licenses table doesn't have the license: ".concat(packageType), deviceTokens,
                deviceLimit);
        Assert.assertEquals("Licenses table doesn't have the license: ".concat(packageType), tekTokens,
                pkgTekTokens);
    }

    @Then("I delete the {string} package")
    public void iDeleteAPackage(String packageType) {
        this.packageRow = new PackageRow(packageType);
        ActionMenu actionMenu = this.packageRow.openActionMenu();
        this.actualMessage = actionMenu.delete("license");
        DriverManager.getInstance().setMessage(this.actualMessage);
    }

    @And("I edit the package {string} with the following data")
    public void iEditThePackageWithTheFollowingData(String packageType, DataTable dataTable) {
        this.packageRow = new PackageRow(packageType);
        ActionMenu actionMenu = this.packageRow.openActionMenu();
        actionMenu.edit();
        this.packageForm = new PackageForm();
        Map<String, String> license = dataTable.asMap(String.class, String.class);
        this.startDate = license.getOrDefault("startDate", "none");
        this.renewalDate = license.getOrDefault("renewalDate", "none");
        this.packageType = license.getOrDefault("packageType", "none");
        this.deviceLimit = license.getOrDefault("deviceAccessTekTokens", null);
        this.tokensPurchased = license.getOrDefault("tekTokens", null);
        this.packages = this.packageForm.editPackage(this.startDate, this.renewalDate, this.packageType, this.deviceLimit, this.tokensPurchased);
        this.actualMessage = this.packages.getMessage();
        DriverManager.getInstance().setMessage(this.actualMessage);
    }

    @And("I should see the modified data in Packages table")
    public void iShouldSeeTheModifiedDataInPackagesTable() throws ParseException {
        if (!this.packageType.equals("none")){
            this.packageRow = new PackageRow(this.packageType);
            String actualName = this.packageRow.getColumnValue("Package Type");
            Assert.assertEquals("Project doesn't have this name: ".concat(this.packageType), this.packageType, actualName);
            if (!this.deviceLimit.equals("none")){
                String actualDeviceLimit = this.packageRow.getColumnValue("Device Limit");
                Assert.assertEquals("Project doesn't have this name: ".concat(this.deviceLimit), this.deviceLimit, actualDeviceLimit);
            }
            if (!this.tokensPurchased.equals("none")){
                String actualTokens = this.packageRow.getColumnValue("tekTokens");
                Assert.assertEquals("Project doesn't have this name: ".concat(this.tokensPurchased), this.tokensPurchased, actualTokens);
            }
        }
        if (!this.startDate.equals("none")){
            Date startDate = formatter.parse(this.startDate);
            formatter = new SimpleDateFormat("yyyy-MM-dd");
            String expectedDate = formatter.format(startDate);
            String actualStartDate = this.packageRow.getColumnValue("Start Date");
            Assert.assertEquals("Project doesn't have this start date: ".concat(expectedDate), expectedDate, actualStartDate);
        }
        if (!this.renewalDate.equals("none")){
            Date renewalDate = formatter.parse(this.renewalDate);
            formatter = new SimpleDateFormat("yyyy-MM-dd");
            String expectedDate = formatter.format(renewalDate);
            String actualRenewalDate = this.packageRow.getColumnValue("Renewal Date");
            Assert.assertEquals("Project doesn't have this start date: ".concat(expectedDate), expectedDate, actualRenewalDate);
        }
    }
}