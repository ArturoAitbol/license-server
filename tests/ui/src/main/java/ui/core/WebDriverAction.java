package ui.core;

import org.apache.logging.log4j.LogManager;
import org.openqa.selenium.By;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

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

    public String confirmModal(WebElement element) {
        return element.getAttribute("disabled");
    }

    public String simpleClick(By locator) {
        String output;
        try {
            WebElement element = this.driver.findElement(locator);
            element.click();
            output = "ok";
        } catch (Exception e) {
            System.out.println("Element is not present: " + e.toString());
            output = "error";
        }
        return output;
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

    public void selectOption(WebElement element, By option) {
        try {
            wait.until(ExpectedConditions.elementToBeClickable(element));
            element.click();
            wait.until(ExpectedConditions.presenceOfElementLocated(option)).click();
        } catch (Exception e) {
            System.out.println("Selected option is not able: " + option.toString());
            System.out.println("Ex: " + e.toString());
        }
    }

    public String checkText(WebElement element, String text) {
        boolean present;
        present = wait.until(ExpectedConditions.textToBePresentInElement(element, text));
        if (present)
            return element.getText();
        else
            return "There isn't this text: " + text;
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
            WebElement element = this.driver.findElement(locator);
            present = "yes";
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
        wait.until(ExpectedConditions.visibilityOf(element));
    }

    public void waitVisibilityElement(By locator) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    public void checkTitle(String title) {
        try {
            this.wait.until(ExpectedConditions.titleIs(title));
        } catch (Exception e) {
            System.out.println("Window didn't get the title:" + title);
        }
    }
}
