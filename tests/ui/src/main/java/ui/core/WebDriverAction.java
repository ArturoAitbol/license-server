package ui.core;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class WebDriverAction {
    public WebDriver driver;
    public WebDriverWait wait;
    private int defaultTimeout;
    private int minTimeout;

    public WebDriverAction(WebDriver driver, int defaultTimeout, int minTimeout) {
        this.driver = driver;
        this.defaultTimeout = defaultTimeout;
        this.minTimeout = minTimeout;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(this.defaultTimeout));
    }

    public void click(WebElement element) {
        wait.until(ExpectedConditions.elementToBeClickable(element));
        element.click();
    }

    public void click(By locator) {
        WebElement clickable = wait.until(ExpectedConditions.elementToBeClickable(locator));
        clickable.click();
    }

    public void forceClick(By locator) {
        WebElement element = wait.until(ExpectedConditions.presenceOfElementLocated(locator));
        JavascriptExecutor executor = (JavascriptExecutor)driver;
        executor.executeScript("arguments[0].click();", element);
    }

    public void forceClick(WebElement element){
        wait.until(ExpectedConditions.elementToBeClickable(element));
        JavascriptExecutor executor = (JavascriptExecutor)driver;
        executor.executeScript("arguments[0].click();", element);
    }

    public void selectToday(WebElement element){
        click(element);
        By todaySelector = By.cssSelector("div.mat-calendar-body-today");
        click(todaySelector);
    }

    public String confirmModal(WebElement element) {
        return element.getAttribute("disabled");
    }

    public void waitModal() {
        try {
            wait = new WebDriverWait(driver, Duration.ofSeconds(minTimeout));
            By modalLocator = By.cssSelector("svg[preserveAspectRatio]");
            wait.until(ExpectedConditions.visibilityOfElementLocated(modalLocator));
            wait = new WebDriverWait(driver, Duration.ofSeconds(defaultTimeout));
            wait.until(ExpectedConditions.invisibilityOfElementLocated(modalLocator));
        } catch (Exception e) {
            System.out.println("Spinner wasn't displayed");
            System.out.println(e);
        }
    }

    public void sendText(WebElement element, String text) {
        wait.until(ExpectedConditions.elementToBeClickable(element));
        element.sendKeys(text);
    }

    public void sendText(By locator, String text) {
        WebElement element = wait.until(ExpectedConditions.elementToBeClickable(locator));
        element.sendKeys(text);
    }

    public void replaceText(WebElement element, String text) {
        wait.until(ExpectedConditions.elementToBeClickable(element));
        if (!text.equals("none")) {
            element.clear();
            element.sendKeys(text);
        }
    }

    public void replaceOption(WebElement element, By option){
        wait.until(ExpectedConditions.elementToBeClickable(element));
        element.clear();
        By dateSelector = By.cssSelector("[formcontrolname='consDate']");
        WebElement clickable = wait.until(ExpectedConditions.presenceOfElementLocated(dateSelector));
        clickable.click();
        element.click();
        WebElement optionClickable = wait.until(ExpectedConditions.presenceOfElementLocated(option));
        JavascriptExecutor executor = (JavascriptExecutor)driver;
        executor.executeScript("arguments[0].click();", optionClickable);
    }

    public void selectOption(WebElement element, By option) {
        wait.until(ExpectedConditions.elementToBeClickable(element));
        element.click();
        WebElement optionClickable = wait.until(ExpectedConditions.presenceOfElementLocated(option));
        JavascriptExecutor executor = (JavascriptExecutor)driver;
        executor.executeScript("arguments[0].click();", optionClickable);
    }

    public String getText(By locator) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator)).getText();
    }

    public String getText(WebElement element) {
        return wait.until(ExpectedConditions.visibilityOf(element)).getText();
    }

    public void waitVisibilityElement(WebElement element) {
        wait.until(ExpectedConditions.visibilityOf(element));
    }

    public WebElement waitVisibilityElement(By locator) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    public List<WebElement> waitVisibilityElements(By locator) {
        return wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(locator));
    }

    public boolean checkTitle(String title) {
        boolean response = false;
        try {
            wait.until(ExpectedConditions.titleIs(title));
            response = true;
        } catch (Exception e) {
            System.out.println("Window didn't get the title:" + title);
        }
        return response;
    }
    public String checkElement(By locator){
        String output;
        try{
            driver.findElement(locator).click();
            output="ok";
        }
        catch (Exception e){
            output="error";
        }
        return output;
    }
}
