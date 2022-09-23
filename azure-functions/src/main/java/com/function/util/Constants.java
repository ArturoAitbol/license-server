package com.function.util;

public abstract class Constants {
    // CTaaS constants
    public static Boolean DEFAULT_CTAAS_ON_BOARDING_COMPLETE = false;
    public static String DEFAULT_CTAAS_PROJECT_NAME = "CTaaS Project";
    public static String DEFAULT_CTAAS_PROJECT_NUMBER = "CTaaS 1";
    public static String DEFAULT_CTAAS_PROJECT_STATUS = "Open";
    public static String DEFAULT_CTAAS_PROJECT_OWNER = null;
    public static String DEFAULT_CTAAS_DEVICE = "Base CTaaS platform ready";
    public static String DEFAULT_CONSUMPTION_TYPE = "Configuration";

    
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
        CTAAS("Ctaas");

        private final String value;
        SubaccountServices(String value){
            this.value = value;
        }
        public String value() {
            return this.value;
        }
    }
}