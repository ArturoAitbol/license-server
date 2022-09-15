package ui.step_definitions;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.aeonbits.owner.ConfigFactory;

import ui.pages.Customers;
import ui.pages.Header;
import ui.pages.Landing;
import ui.pages.LoginForm;
import ui.utils.Environment;

public class LoginSteps {
    Landing landing;
    LoginForm loginForm;
    Customers customers;
    Header header;
    Environment environment = ConfigFactory.create(Environment.class);
    String logged;
    // private String logged;

    public LoginSteps(Landing landing) {
        this.landing = landing;
    }

    @Given("I am on the landing page")
    public void iAmOnTheLandingPage() {
        this.logged = this.landing.checkIfLoggedIn();
    }

    @When("I try to login with email and password")
    public void iTryToLoginWithEmailAndPassword() {
        if (this.logged.equals("error")){
            this.loginForm = this.landing.openLoginForm();
            String email = environment.username();
            String password = environment.password();
            this.customers = this.loginForm.SignIn(email, password);
        }
        if (this.logged.equals("ok")){
//            System.out.println("User has already been logged on");
            this.customers = new Customers();
        }
    }

    @Then("I should see the {string} page")
    public void iShouldSeeThePage(String expectedTitle) {
        String actualTitle = this.customers.getTitle();
        assertEquals("Page doesn't have the title: ".concat(expectedTitle), expectedTitle, actualTitle);
    }

    @And("I logout")
    public void iLogout() {
        this.header = new Header();
        boolean result = this.header.logout();
        assertTrue("Couldn't logout from License Server", result);
    }
}
