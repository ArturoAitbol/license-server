package com.function.util;

public abstract class Constants {
    // SpotLight constants
    public static Boolean DEFAULT_CTAAS_ON_BOARDING_COMPLETE = false;
    public static String DEFAULT_CTAAS_PROJECT_NAME = "SpotLight Project";
    public static String DEFAULT_CTAAS_PROJECT_STATUS = "Open";
    public static String DEFAULT_CTAAS_PROJECT_OWNER = null;
    public static String DEFAULT_CTAAS_DEVICE = "Base SpotLight platform ready";
    public static String DEFAULT_CONSUMPTION_TYPE = "Configuration";
    public static int STAKEHOLDERS_LIMIT_PER_SUBACCOUNT = 11;

    
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
