package ui.core;

import org.aeonbits.owner.ConfigFactory;
import ui.utils.Environment;
import org.openqa.selenium.WebDriver;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;

public class DriverManager {
    private WebDriver driver;
    private static DriverManager driverManager;
    private String message;
    private boolean activeDirectory;
    private String timeStamp;
    Environment environment;

    private DriverManager(){
        this.environment = ConfigFactory.create(Environment.class);
        String browser = this.environment.browser().toLowerCase();
        this.activeDirectory = this.environment.activeDirectory();
        this.driver = DriverFactory.createDriver(browser);
        this.driver.manage().window().maximize();
        SimpleDateFormat sdf1 = new SimpleDateFormat("yyyy-MM-dd.HH.mm.ss");
        Timestamp timestamp = new Timestamp(System.currentTimeMillis());
        this.timeStamp = sdf1.format(timestamp);
    }
    public static DriverManager getInstance(){
        if (driverManager == null){
            driverManager = new DriverManager();
        }
        return driverManager;
    }
    public WebDriver getDriver(){
        return this.driver;
    }

    public void setMessage(String message){
        this.message = message;
    }
    public String getMessage(){
        return this.message;
    }

    public boolean getActiveDirectoryStatus(){
        return this.activeDirectory;
    }
    public String getTimeStamp(){
        return this.timeStamp;
    }

    public String addTimeStampToEmail(String emailAddress){
        if (emailAddress.isEmpty())
            return this.environment.subaccountAdminUser();
        else {
            StringBuilder s1= new StringBuilder(emailAddress);
            StringBuilder s2= new StringBuilder(DriverManager.getInstance().getTimeStamp());
            int indexToInsert= emailAddress.indexOf("@");
            s1.insert(indexToInsert, s2);
            return s1.toString();
        }
    }
}