package ui.core;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.PageFactory;

abstract public class AbstractPageObject {
    protected WebDriver driver;
    protected WebDriverAction action;
    private final int DEFAULT_TIMEOUT = 60;
    private final int MINIMUM_TIMEOUT = 10;

    public AbstractPageObject(){
        this.driver = DriverManager.getInstance().getDriver();
        this.action = new WebDriverAction(this.driver, DEFAULT_TIMEOUT, MINIMUM_TIMEOUT);
        PageFactory.initElements(this.driver, this);
    }
}