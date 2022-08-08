package ui.core;

import ui.utils.Environment;
import org.openqa.selenium.WebDriver;

public class DriverManager {
    private WebDriver driver;
    private static DriverManager driverManager;

    private DriverManager(){
        String browser = Environment.getInstance().getValue("$['browser']").toLowerCase();
        this.driver = DriverFactory.createDriver(browser);
        this.driver.manage().window().maximize();
    }

    public static DriverManager getInstance(){
        if (driverManager == null){
            driverManager = new DriverManager();
        }
        return driverManager;
    }

    public WebDriver getDriver(){
        return this.driver;
    }

}