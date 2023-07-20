package ui.hooks;

import ui.core.DriverManager;
import io.cucumber.java.After;
import io.cucumber.java.Scenario;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import ui.pages.Header;

import java.util.ArrayList;

public class Hooks {
    /*    @After
        public void close(){
            DriverManager.getInstance().getDriver().quit();
        }*/
    @After
    public static void takeScreenshot(Scenario scenario) {
        if (scenario.isFailed()) {
            WebDriver driver = DriverManager.getInstance().getDriver();
            final byte[] screenshot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES);
            scenario.attach(screenshot, "image/png", "screenshot");
        }
    }

    @After("@tokenNavigation or @loginStakeholder")
    public static void logout(Scenario scenario) {
        if (scenario.isFailed()) {
            Header header = new Header();
            boolean result = header.logout();
            System.out.println("Logout: " + result);
        }
    }

    @After("@spotLightDashboard")
    public static void closeSpotlightTab() {
        WebDriver driver = DriverManager.getInstance().getDriver();
        ArrayList<String> tabs = new ArrayList<String>(driver.getWindowHandles());
        if (tabs.size() > 1) {
            for (int i = tabs.size()-1; i > 0; i--) {
                driver.switchTo().window(tabs.get(i));
                driver.close();
            }
            driver.switchTo().window(tabs.get(0));
        }
    }
}