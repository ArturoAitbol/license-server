package ui.step_defitions;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.junit.Assert;
import ui.pages.Customers;
import ui.pages.Header;
import ui.pages.Landing;
import ui.pages.LoginForm;

public class LoginSteps {
    Landing landing;
    LoginForm loginForm;
    Customers customers;
    Header header;

    public LoginSteps(Landing landing){
        this.landing = landing;
    }

    @Given("I am on the landing page")
    public void iAmOnTheLandingPage() {
    }

    @When("I try to login with {string} as email and {string} as password")
    public void iTryToLoginWithAsEmailAndAsPassword(String email, String password) {
        this.loginForm = this.landing.openLoginForm();
        this.customers = this.loginForm.SignIn(email, password);
//        System.out.println(this.logged);
    }

    @Then("I should see the {string} page")
    public void iShouldSeeThePage(String expectedTitle) {
        String actualTitle = this.customers.getTitle();
        Assert.assertEquals("Page doesn't have the title: ".concat(expectedTitle), expectedTitle, actualTitle);
//        System.out.println(actualTitle + "=" + expectedTitle);
    }

    @And("I logout")
    public void iLogout() {
        this.header = new Header();
        boolean result = this.header.logout();
        Assert.assertTrue("Couldn't logout from License Server", result);
    }
}
