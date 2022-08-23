package ui.core;

import org.aeonbits.owner.ConfigFactory;
import ui.utils.Environment;
import org.openqa.selenium.WebDriver;

public class DriverManager {
    private WebDriver driver;
    private static DriverManager driverManager;
    private String message;

    private DriverManager(){
        Environment environment = ConfigFactory.create(Environment.class);
        String browser = environment.browser().toLowerCase();
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

    public void setMessage(String message){
        this.message = message;
    }
    public String getMessage(){
        return this.message;
    }
}