//import org.apache.logging.log4j.LogManager;
//import org.apache.logging.log4j.Logger;

import org.json.JSONObject;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.List;
import java.util.logging.*;
import java.util.logging.LogManager;
import java.util.logging.SimpleFormatter;

public class main{
    static Logger logger = Logger.getLogger(main.class.getName());

    public static void main(String[] args){
/*        try {
            LogManager.getLogManager().readConfiguration(new FileInputStream("mylogging.properties"));
        } catch (SecurityException | IOException e1) {
            e1.printStackTrace();
        }
        try {
            //FileHandler file name with max size and number of log files limit
            Handler fileHandler = new FileHandler("logger_1.log", 2000, 5);
//            fileHandler.setFormatter(new MyFormatter());
            logger.addHandler(fileHandler);

            for(int i=0; i<10; i++){
                //logging messages
                logger.log(Level.INFO, "Msg"+i);
            }
            logger.log(Level.CONFIG, "Config data");
            logger.info("Complete");
        } catch (SecurityException | IOException e) {
            e.printStackTrace();
        }*/

/*        "bundles":[{"name":"MEDIUM","deviceAccessTokens":"10000","tokens":"300","id":"874929e5-a1b3-47dd-a683-93ad417a586f"}]
        List<String> list = new List<String>();*/

        String bundleString = "{'name':'Test','tokens':'30', 'deviceAccessToken':'5'}";
        JSONObject bodyRequest = new JSONObject(bundleString);

        System.out.println(bodyRequest.toString());
        System.out.println(bodyRequest.getString("name"));
        bodyRequest.getString("name");
    }
}
