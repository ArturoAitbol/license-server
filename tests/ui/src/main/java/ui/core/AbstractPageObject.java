package ui.core;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

abstract public class AbstractPageObject {
    protected WebDriver driver;
    protected WebDriverWait wait;
    protected WebDriverAction action;

    public AbstractPageObject(){
        this.driver = DriverManager.getInstance().getDriver();
        this.wait = new WebDriverWait(this.driver, Duration.ofSeconds(60));
        this.action = new WebDriverAction(this.driver, this.wait);
        PageFactory.initElements(this.driver, this);
    }
}