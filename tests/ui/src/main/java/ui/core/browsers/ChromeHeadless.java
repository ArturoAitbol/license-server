package ui.core.browsers;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import ui.core.AbstractDriver;

public class ChromeHeadless extends AbstractDriver {
    @Override
    public WebDriver initDriver() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--lang=en");
        options.addArguments("--remote-allow-origins=*");
        options.setHeadless(true);
        options.addArguments("window-size=1920,1080");
        return new ChromeDriver(options);
    }
}
