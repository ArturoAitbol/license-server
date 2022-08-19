package ui.runner;

import ui.core.DriverManager;
import io.cucumber.junit.Cucumber;
import io.cucumber.junit.CucumberOptions;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.runner.RunWith;

@RunWith(Cucumber.class)
@CucumberOptions(plugin = {
        "pretty",
        "json:reports/cucumber-reports/cucumber.json",
        "rerun:reports/rerun/rerun.txt"
        },
        features = "src/test/resources/features/",
        glue = "ui",
        tags = "@loginTest")
public class RunCucumberTests {

    @AfterClass
    public static void close() {
        DriverManager.getInstance().getDriver().quit();
    }
}