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

    public WebDriverAction(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait = wait;
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

    public String confirmModal(WebElement element) {
        return element.getAttribute("disabled");
    }

    public void waitModal(By locator) {
        wait.until(ExpectedConditions.invisibilityOfElementLocated(locator));
    }

    public void sendText(WebElement element, String text) {
        wait.until(ExpectedConditions.elementToBeClickable(element));
        element.clear();
        element.sendKeys(text);
    }

    public void sendText(By locator, String text) {
        WebElement element = wait.until(ExpectedConditions.elementToBeClickable(locator));
        element.clear();
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
        JavascriptExecutor executor = (JavascriptExecutor)this.driver;
        executor.executeScript("arguments[0].click();", optionClickable);
    }

    public void selectOption(WebElement element, By option) {
        wait.until(ExpectedConditions.elementToBeClickable(element));
        element.click();
        WebElement optionClickable = wait.until(ExpectedConditions.presenceOfElementLocated(option));
        JavascriptExecutor executor = (JavascriptExecutor)this.driver;
        executor.executeScript("arguments[0].click();", optionClickable);
    }

    public WebElement getElement(By locator) {
        return wait.until(ExpectedConditions.presenceOfElementLocated(locator));
    }

    public List<WebElement> getElements(By locator) {
        return wait.until(ExpectedConditions.presenceOfAllElementsLocatedBy(locator));
    }

    public String getText(By locator) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator)).getText();
    }

    public String errorPresent(By locator) {
        String present;
        try {
            // WebElement element = this.driver.findElement(locator);
            present="yes";
        } catch (Exception e) {
            System.out.println("No error");
            present = "no";
        }
        return present;
    }

    public String getText(WebElement element) {
        return wait.until(ExpectedConditions.visibilityOf(element)).getText();
    }

    public void waitVisibilityElement(WebElement element) {
        this.wait = new WebDriverWait(this.driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOf(element));
        this.wait = new WebDriverWait(this.driver, Duration.ofSeconds(60));
    }

    public WebElement waitVisibilityElement(By locator) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    public void checkTitle(String title) {
        try {
            this.wait.until(ExpectedConditions.titleIs(title));
        } catch (Exception e) {
            System.out.println("Window didn't get the title:" + title);
        }
    }
    public String checkElement(By locator){
        String output;
        try{
            this.driver.findElement(locator).click();
            output="ok";
        }
        catch (Exception e){
//            LOGGER.warn("Element is not present: "+ e.toString());
//            System.out.println("Element is not present: "+ e.toString());
            output="error";
        }
        return output;
    }
}
