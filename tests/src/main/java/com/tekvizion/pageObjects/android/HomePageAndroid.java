package com.tekvizion.pageObjects.android;

import com.tekvizion.pageObjects.ios.Login;
import com.tekvizion.utils.AndroidActions;
import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.ios.IOSDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.AppiumFieldDecorator;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.PageFactory;

public class HomePageAndroid extends AndroidActions {
    AndroidDriver driver;
    @AndroidFindBy(className = "android.webkit.WebView")
    private WebElement homeView;
//    @AndroidFindBy(xpath = "//android.widget.Button[@text='login-button']")
//    @AndroidFindBy(xpath = "//android.widget.Button[(@content-desc='login-button') or (@text='login-button')]")
    @AndroidFindBy(xpath = "//android.widget.Button[@*='login-button']")
    private WebElement loginButton;

    public HomePageAndroid(AndroidDriver driver) {
        super(driver);
        this.driver = driver;
        PageFactory.initElements(new AppiumFieldDecorator(driver), this);
    }
    public LoginAndroid goToLoginForm(){
//        homeView.click();
//        loginButton.click();
        click(loginButton);
        return new LoginAndroid(driver);
    }
}