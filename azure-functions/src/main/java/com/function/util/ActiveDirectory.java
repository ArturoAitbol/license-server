package com.function.util;

import java.io.IOException;
import java.io.InputStream;
import java.util.Optional;
import java.util.Properties;
import java.util.logging.Logger;

public enum ActiveDirectory {
    INSTANCE;

    final private Properties properties = new Properties();
    final private Logger logger = Logger.getLogger(FeatureToggles.class.getName());


    ActiveDirectory() {
        String environment = Optional.ofNullable(System.getenv("ENVIRONMENT_NAME")).orElse("production");
        try (InputStream input = FeatureToggles.class.getResourceAsStream("/active-directory/active-directory." + environment + ".properties")) {
            properties.load(input);
        } catch (IOException ex) {
            logger.warning("Could not load the Active Directory properties for" + environment);
        }
    }

    public String getLicenseAPIProperty(String property){
        switch (property){
            case "object-id":
                return properties.getProperty("licenseAPI_ObjectID");
            case "customer-role-id":
                return properties.getProperty("licenseAPI_CustomerRoleID");
            case "subaccount-role-id":
                return properties.getProperty("licenseAPI_SubaccountRoleID");
            default:
                return null;
        }
    }

    public String getLicensePortalProperty(String property){
        switch (property){
            case "object-id":
                return properties.getProperty("licensePortal_ObjectID");
            case "customer-role-id":
                return properties.getProperty("licensePortal_CustomerRoleID");
            case "subaccount-role-id":
                return properties.getProperty("licensePortal_SubaccountRoleID");
            default:
                return null;
        }
    }

    public String getEmailInviteUrl(){
        return properties.getProperty("email_invite_redirect_URL");
    }
}
