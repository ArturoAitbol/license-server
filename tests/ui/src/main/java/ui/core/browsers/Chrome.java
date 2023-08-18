package ui.core.browsers;

import ui.core.AbstractDriver;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

public class Chrome extends AbstractDriver {
    @Override
    public WebDriver initDriver() {
//        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--lang=en");
        options.addArguments("--remote-allow-origins=*");
        return new ChromeDriver(options);
    }
}