package ui.step_definitions;

import java.util.Map;

import io.cucumber.datatable.DataTable;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import junit.framework.Assert;
import ui.pages.Customers;
import ui.pages.Licenses.LicenseForm;
import ui.pages.Licenses.LicenseRow;
import ui.pages.Licenses.Licenses;

public class LicenseSteps {
    private LicenseRow licenseRow;
    private Licenses licenses;
    private Customers customers;
    private LicenseForm licenseForm;

    public LicenseSteps(Licenses licenses) {
        this.licenses = licenses;
    }

    @And("I wait {int} seconds")
    public void wait(int seconds) throws InterruptedException {
        Thread.sleep(seconds * 1000);
    }

    @Then("I should see the {string} table")
    public void iShouldSeeTableTitle(String expectedTitle) {
        this.licenses = new Licenses();
        String actualTitle = this.licenses.getTableTitle();
        Assert.assertEquals("Page doesn't have the title: ".concat(expectedTitle), expectedTitle, actualTitle);
    }

    @Given("I open the Add Package form")
    public void iOpenTheAddPackageForm() {
        this.licenseForm = new LicenseForm();
        this.licenseForm = this.licenses.openLicenseForm();
    }

    @When("I create a package with the following data")
    public void iCreateAPackageWithTheFollowingData(DataTable packageTable) {
        Map<String, String> license = packageTable.asMap(String.class, String.class);
        String startDate = license.get("startDate");
        String renewalDate = license.get("renewalDate");
        String packageType = license.get("packageType");
        String deviceLimit = license.getOrDefault("deviceAccessTekTokens", null);
        String tokensPurchased = license.getOrDefault("tekTokens", null);
        this.licenses = licenseForm.createLicense(startDate, renewalDate, packageType, deviceLimit, tokensPurchased);
    }

    @Then("I see the {string} package in the table")
    public void iShouldSeeThePackageInTheTable(String packageType) {
        this.licenseRow = this.licenses.getLicense(packageType);
        String actualPackage = this.licenseRow.getColumnValue("Package Type");
        Assert.assertEquals("Licenses table doesn't have the license: ".concat(packageType), packageType,
                actualPackage);
    }

    @Then("I see the {string} package with {int} device access tokens and {int} tekTokens")
    public void iShouldSeeThePackageInTheTable(String packageType, int deviceTokens, int tekTokens) {
        this.licenseRow = this.licenses.getLicense(packageType);
        String actualPackage = this.licenseRow.getColumnValue("Package Type");
        String deviceLimit = this.licenseRow.getColumnValue("Device Limit");
        String pkgTekTokens = this.licenseRow.getColumnValue("tekTokens");
        Assert.assertEquals("Licenses table doesn't have the license: ".concat(packageType), packageType,
                actualPackage);
        Assert.assertEquals("Licenses table doesn't have the license: ".concat(packageType), deviceTokens,
                deviceLimit);
        Assert.assertEquals("Licenses table doesn't have the license: ".concat(packageType), tekTokens,
                pkgTekTokens);
    }

    @When("I click back button")
    public void iClickBackButton() {
        this.licenses.clickBackButton();
        this.customers = new Customers();
    }
}
