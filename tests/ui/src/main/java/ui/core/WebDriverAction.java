package ui.core;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import ui.pages.ActionMenu;

import java.time.Duration;
import java.util.List;

public class WebDriverAction {
    public WebDriver driver;
    public WebDriverWait wait;
    private int defaultTimeout;
    private int minTimeout, maxTimeout;

    public WebDriverAction(WebDriver driver, int defaultTimeout, int minTimeout, int maxTimeout) {
        this.driver = driver;
        this.defaultTimeout = defaultTimeout;
        this.minTimeout = minTimeout;
        this.maxTimeout = maxTimeout;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(this.defaultTimeout));
    }

    public void clickable(By locator){
        wait.until(ExpectedConditions.elementToBeClickable(locator));
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

    public void waitSpinner(By elementSelector) {
        try {
            wait = new WebDriverWait(driver, Duration.ofSeconds(this.minTimeout));
            wait.until(ExpectedConditions.visibilityOfElementLocated(elementSelector));
            wait = new WebDriverWait(driver, Duration.ofSeconds(this.defaultTimeout));
            wait.until(ExpectedConditions.invisibilityOfElementLocated(elementSelector));
        } catch (Exception e) {
            System.out.println("Spinner wasn't displayed");
            System.out.println(e);
            wait = new WebDriverWait(driver, Duration.ofSeconds(this.defaultTimeout));
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

    public String getAttribute(By locator,String attributeName) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator)).getAttribute(attributeName);
    }

    public String getText(WebElement element) {
        return wait.until(ExpectedConditions.visibilityOf(element)).getText();
    }
    public void waitInvisibilityElement(WebElement element) {
        try{
            wait.until(ExpectedConditions.invisibilityOf(element));
            System.out.println("Element is not displayed anymore");
        } catch (Exception e) {
            System.out.println("Element not found:" + element.toString());
            System.out.println(e);
        }
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
            wait = new WebDriverWait(driver, Duration.ofSeconds(this.maxTimeout));
            wait.until(ExpectedConditions.titleIs(title));
            response = true;
        } catch (Exception e) {
            System.out.println("Window didn't get the title:" + title);
        }
        wait = new WebDriverWait(driver, Duration.ofSeconds(this.defaultTimeout));
        return response;
    }
    public boolean checkText(By selector, String text) {
        boolean response = false;
        try {
            wait.until(ExpectedConditions.textToBePresentInElementLocated(selector, text));
            response = true;
        } catch (Exception e) {
            System.out.println("Element doesn't have the text:" + text);
        }
        return response;
    }
    public String checkElement(By locator){
        String output;
        try {
            wait = new WebDriverWait(driver, Duration.ofSeconds(this.maxTimeout));
            wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
            output="ok";
        }
        catch (Exception e){
            output="error";
            wait = new WebDriverWait(driver, Duration.ofSeconds(this.defaultTimeout));
        }
        wait = new WebDriverWait(driver, Duration.ofSeconds(this.defaultTimeout));
        return output;
    }

    public void waitPropertyToBe(WebElement element, String property, String value){
        wait.until(ExpectedConditions.domPropertyToBe(element, property, value));
    }

    public void scrollToElement(WebElement element) {
        JavascriptExecutor js = (JavascriptExecutor) this.driver;
        js.executeScript("arguments[0].scrollIntoView();", element);
    }

    public ActionMenu openActionMenu(String elementName){
        By actionMenuSelector = By.xpath(elementName + "/following-sibling::td[@id='more_vert']/button");
        String visible = checkElement(actionMenuSelector);
        if(visible.equals("ok"))
            forceClick(actionMenuSelector);
        else if (visible.equals("error")) {
            System.out.println("Action menu button was not found at the first attempt. Refreshing customers view...");
            this.driver.navigate().refresh();
            visible = checkElement(actionMenuSelector);
            if (visible.equals("ok"))
                forceClick(actionMenuSelector);
            else
                throw new RuntimeException();
        }
        return new ActionMenu();
    }
}
