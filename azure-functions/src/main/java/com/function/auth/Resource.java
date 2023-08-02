package com.function.auth;

public enum Resource {
        // Please comment the azure-function name related to each resource

        // CREATE
        CREATE_ADMIN_EMAIL,//TekvLSCreateAdminEmail
        CREATE_CUSTOMER,//TekvLSCreateCustomer
        CREATE_DEVICE,//TekvLSCreateDevice
        CREATE_LICENSE,//TekvLSCreateLicense
        CREATE_LICENSE_USAGE_DETAIL,//TekvLSCreateLicenseUsageDetail
        CREATE_PROJECT,//TekvLSCreateProject
        CREATE_SUBACCOUNT,//TekvLSCreateSubaccount
        CREATE_SUBACCOUNT_ADMIN_MAIL,//TekvLSCreateSubaccountAdminEmail
        CREATE_USAGE_DETAILS,//TekvLSCreateUsageDetails
        CREATE_BUNDLE,//TekvLSCreateBundle
        CREATE_CTAAS_SETUP,//TekvLSCreateCtaasSetup
        CREATE_CTAAS_TEST_SUITE,//TekvLSCreateCtaasTestSuite
        CREATE_SUBACCOUNT_STAKEHOLDER,//TekvLSCreateSubaccountStakeHolder
        CREATE_FEATURE_TOGGLE,//TekvLSCreateFeatureToggle
        CREATE_FEATURE_TOGGLE_EXCEPTION,//TekvLSCreateFeatureToggle
        CREATE_NOTE,//TekvLSCreateNote
        CREATE_SUBACCOUNT_ADMIN_DEVICE, //TekvLSCreateSubaccountAdminDevice
        CREATE_CONSUMPTION_MATRIX, //TekvLSCreateConsumptionMatrix
        CREATE_CALLBACK, //TekvLSCallback
        CREATE_CTAAS_SUPPORT_EMAIL, //TekvLSCreateCtaasSupportEmail
        // DELETE
        DELETE_ADMIN_EMAIL,//TekvLSDeleteAdminEmail
        DELETE_CUSTOMER,//TekvLSDeleteCustomerById
        DELETE_DEVICE,//TekvLSDeleteDeviceById
        DELETE_LICENSE,//TekvLSDeleteLicenseById
        DELETE_LICENSE_USAGE,//TekvLSDeleteLicenseUsageById
        DELETE_PROJECT,//TekvLSDeleteProjectById
        DELETE_SUBACCOUNT_ADMIN_EMAIL,//TekvLSDeleteSubaccountAdminEmail
        DELETE_SUB_ACCOUNT,//TekvLSDeleteSubaccountById
        DELETE_USAGE_DETAILS,//TekvLSDeleteUsageDetailsById
        DELETE_BUNDLE,//TekvLSDeleteBundleById
        DELETE_CTAAS_SETUP,//TekvLSDeleteCtaasSetupById
        DELETE_CTAAS_TEST_SUITE,//TekvLSDeleteCtaasTestSuiteById
        DELETE_SUBACCOUNT_STAKEHOLDER,//TekvLSDeleteSubaccountStakeHolderByEmail
        DELETE_FEATURE_TOGGLE,//TekvLSDeleteFeatureToggleById
        DELETE_FEATURE_TOGGLE_EXCEPTION,//TekvLSDeleteFeatureToggleException
        DELETE_NOTE,//TekvLSDeleteNoteById
        DELETE_SUBACCOUNT_ADMIN_DEVICE, // TekvLSDeleteSubaccountAdminDevice
        DELETE_CONSUMPTION_MATRIX, //TekvLSDeleteConsumptionMatrix
        DELETE_RESIDUAL_TEST_DATA, //TekvLSDeleteResidualTestData
        DELETE_CTAAS_SUPPORT_EMAIL, //TekvLSDeleteCtaasSupportEmail

        // READ
        GET_ALL_BUNDLES,//TekvLSGetAllBundles
        GET_ALL_CUSTOMERS,//TekvLSGetAllCustomers
        GET_ALL_DEVICES,//TekvLSGetAllDevices
        GET_ALL_DEVICE_TYPES,//TekvLSGetAllDevices
        GET_ALL_LICENSES,//TekvLSGetAllLicenses
        GET_ALL_LICENSE_USAGE_DETAILS,//TekvLSGetAllLicenseUsageDetails
        GET_ALL_PROJECTS,//TekvLSGetAllProjects
        GET_ALL_SUBACCOUNTS,//TekvLSGetAllSubaccounts
        GET_REPORTABLE_SUBACCOUNTS,//TekvLSGetReportableSubaccounts
        GET_CONSUMPTION_USAGE_DETAILS,//TekvLSGetConsumptionUsageDetails
        GET_USER_EMAIL_INFO,//TekvLSGetUserEmailsInfo
        GET_ALL_CTAAS_SETUPS,//TekvLSGetAllCtaasSetups
        GET_ALL_CTAAS_TEST_SUITES,//TekvLSGetAllCtaasTestSuites
        GET_ALL_SUBACCOUNT_STAKEHOLDER,//TekvLSGetAllStakeholders
        GET_AUTH_USER_PROFILE,//TekvLSGetAuthUserProfile
        GET_CTAAS_DASHBOARD,//TekvLSGetCtaasDashboard
        GET_ALL_FEATURE_TOGGLES,//TekvLSGetAllFeatureToggles
        GET_SUBSCRIPTIONS_OVERVIEW, //TeTekvLSGetSubscriptionsOverview
        GET_ALL_NOTES, //TeTekvLSGetAllNotes
        GET_CONSUMPTION_MATRIX, //TekvLSGetConsumptionMatrix
        GET_CHARTS,//PermissionForAllChartAPIs
        GET_MAP,//TekvLSGetMapCoordinates

        //UPDATE
        MODIFY_CUSTOMER,//TekvLSModifyCustomerById
        MODIFY_DEVICE,//TekvLSModifyDeviceById
        MODIFY_LICENSE,//TekvLSModifyLicenseById
        MODIFY_LICENSE_USAGE,//TekvLSModifyLicenseUsageById
        MODIFY_PROJECT,//TekvLSModifyProjectById
        MODIFY_SUBACCOUNT,//TekvLSModifySubaccountById
        MODIFY_BUNDLE,//TekvLSModifyBundleById
        MODIFY_CTAAS_SETUP,//TekvLSModifyCtaasSetupById
        MODIFY_CTAAS_TEST_SUITE,//TekvLSModifyCtaasTestSuiteById
        MODIFY_CTAAS_ONBOARDING,//TekvLSModifyCtaasOnBoardingById
        MODIFY_SUBACCOUNT_STAKEHOLDER,//TekvLSModifySubaccountStakeholderByEmail
        MODIFY_AUTH_USER_PROFILE,//TekvLSModifyAuthUserProfile
        MODIFY_FEATURE_TOGGLE, //TekvLSModifyFeatureToggleById
        MODIFY_CONSUMPTION_MATRIX, //TekvLSModifyConsumptionMatrixById
        MODIFY_FEATURE_TOGGLE_EXCEPTION //TekvLSModifyFeatureToggleException
}
