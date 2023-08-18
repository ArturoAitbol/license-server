package ui.step_definitions;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.aeonbits.owner.ConfigFactory;

import ui.pages.Apps;
import ui.pages.customer.Customers;
import ui.pages.Header;
import ui.pages.Landing;
import ui.pages.LoginForm;
import ui.utils.Environment;

public class LoginSteps {
    Landing landing;
    LoginForm loginForm;
    Customers customers;
    Header header;
    Apps apps;

    Environment environment = ConfigFactory.create(Environment.class);
    String logged;

    public LoginSteps(Landing landing) {
        this.landing = landing;
    }

    @Given("I am on the landing page")
    public void iAmOnTheLandingPage() {
        this.logged = this.landing.checkIfLoggedIn();
    }

    @Given("I try to login using a {string}")
    public void iTryToLoginUsingA(String role) throws Exception {
        if (this.logged.equals("error")){
            System.out.println("User needs to login");
            String email, password;
            this.loginForm = this.landing.openLoginForm();
            switch (role){
                case "FullAdministrator":
                    email = environment.username();
                    password = environment.password();
                    break;
                case "SubaccountAdministrator":
                    email = environment.subaccountAdminUser();
                    password = environment.subaccountAdminPassword();
                    break;
                case "Stakeholder":
                    email = environment.stakeholderUser();
                    password = environment.stakeholderPassword();
                    break;
                default:
                    throw new Exception("Invalid role. Check feature file");
            }
            this.customers = this.loginForm.SignIn(email, password, role);
        }
        if (this.logged.equals("ok")){
            System.out.println("User has already logged into the Portal");
            switch (role){
                case "FullAdministrator":
                    this.customers = new Customers();
                    break;
                case "SubaccountAdministrator":
                    this.apps = new Apps();
                    break;
                case "Stakeholder":
                    this.apps = new Apps();
                    break;
                default:
                    this.customers = new Customers();
                    break;
            }
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
