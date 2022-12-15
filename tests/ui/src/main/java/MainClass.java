import com.google.common.collect.Sets;
import org.aeonbits.owner.ConfigFactory;
import org.apache.commons.lang.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

public class MainClass {
//    private static WebDriver driver;
//    private static final Logger LOGGER = LogManager.getLogger();
    public static void main(String args[]) throws ParseException {
        SimpleDateFormat sdf1 = new SimpleDateFormat("yyyy-MM-dd.HH.mm.ss");
        Timestamp timestamp = new Timestamp(System.currentTimeMillis());
        System.out.println(sdf1.format(timestamp));

        String adminEmail = "test-admin@tekvizion.com";
        String timeStamp = sdf1.format(timestamp);
        StringBuilder s1= new StringBuilder(adminEmail);
        StringBuilder s2= new StringBuilder(timeStamp);
        int indexToInsert= adminEmail.indexOf("@");
        s1.insert(indexToInsert, s2);
        System.out.println(s1);

/*        Environment testEnvironment = ConfigFactory.create(Environment.class);
        System.out.println(testEnvironment.url());
        System.out.println(testEnvironment.browser());*/
//        System.out.println(testEnvironment.getDBPort());
    }

}
