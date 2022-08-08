package ui.core;

import ui.core.AbstractDriver;
import org.openqa.selenium.WebDriver;
import ui.core.browsers.Chrome;

import java.util.HashMap;
import java.util.Map;

public class DriverFactory {

    private static Map<String, AbstractDriver> DRIVERS = new HashMap<>();
    static {
        DRIVERS.put("chrome", new Chrome());
//        DRIVERS.put("firefox", new Firefox());
//        DRIVERS.put("edge", new Edge());
//        DRIVERS.put("opera", new Opera());
//        DRIVERS.put("headless_chrome", new ChromeHeadless());
    }

    public static WebDriver createDriver(String browser){
        return DRIVERS.get(browser).initDriver();
    }
}