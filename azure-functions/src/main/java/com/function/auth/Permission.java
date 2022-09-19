package com.function.auth;

public enum Permission {
        //CREATE
        CREATE_ADMIN_EMAIL("TekvLSCreateAdminEmail"),
        CREATE_CUSTOMER("TekvLSCreateCustomer"),
        CREATE_DEVICE("TekvLSCreateDevice"),
        CREATE_LICENSE("TekvLSCreateLicense"),
        CREATE_LICENSE_USAGE_DETAIL("TekvLSCreateLicenseUsageDetail"),
        CREATE_PROJECT("TekvLSCreateProject"),
        CREATE_SUBACCOUNT("TekvLSCreateSubaccount"),
        CREATE_SUBACCOUNT_ADMIN_MAIL("TekvLSCreateSubaccountAdminEmail"),
        CREATE_USAGE_DETAILS("TekvLSCreateUsageDetails"),
        CREATE_BUNDLE("TekvLSCreateBundle"),
        CREATE_CTAAS_SETUP("TekvLSCreateCtaasSetup"),
        CREATE_SUBACCOUNT_STAKEHOLDER("TekvLSCreateSubaccountStakeHolder"),

        //DELETE
        DELETE_ADMIN_EMAIL("TekvLSDeleteAdminEmail"),
        DELETE_CUSTOMER("TekvLSDeleteCustomerById"),
        DELETE_DEVICE("TekvLSDeleteDeviceById"),
        DELETE_LICENSE("TekvLSDeleteLicenseById"),
        DELETE_LICENSE_USAGE("TekvLSDeleteLicenseUsageById"),
        DELETE_PROJECT("TekvLSDeleteProjectById"),
        DELETE_SUBACCOUNT_ADMIN_EMAIL("TekvLSDeleteSubaccountAdminEmail"),
        DELETE_SUB_ACCOUNT("TekvLSDeleteSubaccountById"),
        DELETE_USAGE_DETAILS("TekvLSDeleteUsageDetailsById"),
        DELETE_BUNDLE("TekvLSDeleteBundleById"),
        DELETE_CTAAS_SETUP("TekvLSDeleteCtaasSetupById"),
        DELETE_SUBACCOUNT_STAKEHOLDER("TekvLSDeleteSubaccountStakeHolder"),

        //READ
        GET_ALL_BUNDLES("TekvLSGetAllBundles"),
        GET_ALL_CUSTOMERS("TekvLSGetAllCustomers"),
        GET_ALL_DEVICES ("TekvLSGetAllDevices"),
        GET_ALL_LICENSES("TekvLSGetAllLicenses"),
        GET_ALL_LICENSE_USAGE_DETAILS("TekvLSGetAllLicenseUsageDetails"),
        GET_ALL_PROJECTS("TekvLSGetAllProjects"),
        GET_ALL_SUBACCOUNTS("TekvLSGetAllSubaccounts"),
        GET_CONSUMPTION_USAGE_DETAILS("TekvLSGetConsumptionUsageDetails"),
        GET_USER_EMAIL_INFO("TekvLSGetUserEmailsInfo"),
        GET_ALL_CTAAS_SETUPS("TekvLSGetAllCtaasSetups"),
        GET_ALL_SUBACCOUNT_STAKEHOLDER("TekvLSGetAllStakeholders"),
        GET_AUTH_USER_PROFILE("TekvLSGetAuthUserProfile"),
        
        //UPDATE
        MODIFY_CUSTOMER("TekvLSModifyCustomerById"),
        MODIFY_DEVICE("TekvLSModifyDeviceById"),
        MODIFY_LICENSE("TekvLSModifyLicenseById"),
        MODIFY_LICENSE_USAGE("TekvLSModifyLicenseUsageById"),
        MODIFY_PROJECT("TekvLSModifyProjectById"),
        MODIFY_SUBACCOUNT("TekvLSModifySubaccountById"),
        MODIFY_BUNDLE("TekvLSModifyBundleById"),
		MODIFY_CTAAS_SETUP("TekvLSModifyCtaasSetupById"),
		MODIFY_CTAAS_ONBOARDING("TekvLSModifyCtaasOnBoardingById"),
		MODIFY_SUBACCOUNT_STAKEHOLDER("TekvLSModifySubaccountStakeholder"),
		MODIFY_AUTH_USER_PROFILE("TekvLSModifyAuthUserProfile");
	
        private final String value;

        Permission(String value){
                this.value = value;
        }
        public String value() {
                return this.value;
        }
}

