package com.function.util;

public abstract class Constants {
    // SpotLight constants
    public static Boolean DEFAULT_CTAAS_ON_BOARDING_COMPLETE = false;
    public static String DEFAULT_CTAAS_PROJECT_NAME = "SpotLight Project";
    public static String DEFAULT_CTAAS_PROJECT_STATUS = "Open";
    public static String DEFAULT_CTAAS_PROJECT_OWNER = null;
    public static String DEFAULT_CTAAS_DEVICE = "Base SpotLight platform ready";
    public static String DEFAULT_CONSUMPTION_TYPE = "Configuration";
    public static String DEFAULT_REPORT_NAME = "Calling Reliability + Feature Functionality + Voice Quality (POLQA)";
    public static int STAKEHOLDERS_LIMIT_PER_SUBACCOUNT = 11;
    public static int STAKEHOLDERS_LIMIT_PER_DEMO_SUBACCOUNT = 50;
    public static String TEMP_ONPOINT_USERNAME = "administrator@tekvizion.com";
    public static String TEMP_ONPOINT_PASSWORD = "admin123";
    public static String SPOTLIGHT_API_PATH = "v1/spotlight";
    public static String MESSAGE_FOR_INVALID_TAP_URL = "Unable to execute the query, invalid tap url";
    public static String LOG_MESSAGE_FOR_INVALID_TAP_URL = "Invalid TAP URL";
    public static long REQUEST_CALLBACK_MINUTES_BETWEEN_REQUESTS = 30;

    
    // ENUMS
    public enum CTaaSSetupStatus {
        INPROGRESS("SETUP_INPROGRESS"),
        READY("SETUP_READY");

        private final String value;
        CTaaSSetupStatus(String value){
            this.value = value;
        }
        public String value() {
            return this.value;
        }
    }

    public enum ReportTypes {
        FEATURE_FUNCTIONALITY("LTS"),
        CALLING_RELIABILITY("STS"),
        POLQA("POLQA");

        private final String value;
        ReportTypes(String value){
            this.value = value;
        }
        public String value() {
            return this.value;
        }
    }

    public enum SubaccountServices {
        TOKEN_CONSUMPTION("tokenConsumption"),
        SPOTLIGHT("spotlight");

        private final String value;
        SubaccountServices(String value){
            this.value = value;
        }
        public String value() {
            return this.value;
        }
    }

    public enum DeviceGranularity {
        DAYLY("day"),
        WEEKLY("week"),
        MONTHLY("month"),
        STATIC("static");

        private final String value;
        DeviceGranularity(String value){
            this.value = value;
        }
        public String value() {
            return this.value;
        }
    }
}
