package ui.pages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

public class Header {
    @FindBy(css="mat-toolbar.mat-toolbar")
    WebElement header;
}
