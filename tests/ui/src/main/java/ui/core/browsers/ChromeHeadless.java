package ui.core.browsers;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import ui.core.AbstractDriver;

public class ChromeHeadless extends AbstractDriver {
    @Override
    public WebDriver initDriver() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--lang=en");

        options.setHeadless(true);
        options.addArguments("window-size=1920,1080");
        return new ChromeDriver(options);
    }
}
