package com.function.auth;

import java.util.EnumSet;

import static com.function.auth.Resource.*;

public class Permissions {
        public static final EnumSet<Resource> FullAdminPermissions = EnumSet.of(
                        // CREATE
                        CREATE_CUSTOMER,
                        CREATE_SUBACCOUNT,
                        CREATE_ADMIN_EMAIL,
                        CREATE_SUBACCOUNT_ADMIN_MAIL,
                        CREATE_LICENSE,
                        CREATE_LICENSE_USAGE_DETAIL,
                        CREATE_USAGE_DETAILS,
                        CREATE_PROJECT,
                        CREATE_CTAAS_SETUP,
                        CREATE_CTAAS_SUPPORT_EMAIL,
                        CREATE_CTAAS_TEST_SUITE,
                        CREATE_SUBACCOUNT_STAKEHOLDER,
                        // CREATE_FEATURE_TOGGLE,
                        CREATE_NOTE,
                        // DELETE
                        DELETE_CUSTOMER,
                        DELETE_SUB_ACCOUNT,
                        DELETE_ADMIN_EMAIL,
                        DELETE_SUBACCOUNT_ADMIN_EMAIL,
                        DELETE_LICENSE,
                        DELETE_PROJECT,
                        DELETE_LICENSE_USAGE,
                        DELETE_USAGE_DETAILS,
                        DELETE_CTAAS_SETUP,
                        DELETE_CTAAS_SUPPORT_EMAIL,
                        DELETE_CTAAS_TEST_SUITE,
                        DELETE_SUBACCOUNT_STAKEHOLDER,
                        // DELETE_FEATURE_TOGGLE,
                        DELETE_NOTE,
                        DELETE_RESIDUAL_TEST_DATA,
                        // READ
                        GET_ALL_CUSTOMERS,
                        GET_ALL_SUBACCOUNTS,
                        GET_ALL_LICENSES,
                        GET_ALL_DEVICES,
                        GET_ALL_DEVICE_TYPES,
                        GET_ALL_PROJECTS,
                        GET_ALL_BUNDLES,
                        GET_ALL_LICENSE_USAGE_DETAILS,
                        GET_CONSUMPTION_USAGE_DETAILS,
                        GET_USER_EMAIL_INFO,
                        GET_ALL_CTAAS_SETUPS,
                        GET_ALL_CTAAS_TEST_SUITES,
                        GET_ALL_SUBACCOUNT_STAKEHOLDER,
                        GET_CTAAS_DASHBOARD,
                        GET_ALL_FEATURE_TOGGLES,
                        GET_SUBSCRIPTIONS_OVERVIEW,
                        GET_ALL_NOTES,
                        GET_CONSUMPTION_MATRIX,
                        GET_CHARTS,
                        GET_MAP,
                        // UPDATE
                        MODIFY_CUSTOMER,
                        MODIFY_SUBACCOUNT,
                        MODIFY_LICENSE,
                        MODIFY_PROJECT,
                        MODIFY_LICENSE_USAGE,
                        MODIFY_CTAAS_SETUP,
                        MODIFY_CTAAS_TEST_SUITE,
                        MODIFY_SUBACCOUNT_STAKEHOLDER
                        // MODIFY_FEATURE_TOGGLE
    );

        public static final EnumSet<Resource> SaleAdminPermissions = EnumSet.of(
                        // READ
                        GET_ALL_CUSTOMERS,
                        GET_ALL_SUBACCOUNTS,
                        GET_ALL_LICENSES,
                        GET_ALL_LICENSE_USAGE_DETAILS,
                        GET_CONSUMPTION_USAGE_DETAILS,
                        GET_ALL_DEVICES,
                        GET_ALL_DEVICE_TYPES,
                        GET_ALL_PROJECTS,
                        GET_ALL_BUNDLES,
                        GET_ALL_CTAAS_SETUPS,
                        GET_CTAAS_DASHBOARD,
                        GET_SUBSCRIPTIONS_OVERVIEW,
                        GET_CONSUMPTION_MATRIX,
                        GET_ALL_FEATURE_TOGGLES,
                        GET_CHARTS,
                        GET_MAP);

        public static final EnumSet<Resource> ConfigTesterPermissions = EnumSet.of(
                        // CREATE
                        CREATE_LICENSE_USAGE_DETAIL,
                        CREATE_PROJECT,
                        CREATE_USAGE_DETAILS,
                        CREATE_CTAAS_SETUP,
                        CREATE_CTAAS_SUPPORT_EMAIL,
                        CREATE_CTAAS_TEST_SUITE,
                        CREATE_SUBACCOUNT_STAKEHOLDER,
                        // DELETE
                        DELETE_LICENSE_USAGE,
                        DELETE_USAGE_DETAILS,
                        DELETE_SUBACCOUNT_STAKEHOLDER,
                        DELETE_CTAAS_TEST_SUITE,
                        DELETE_CTAAS_SUPPORT_EMAIL,
                        // READ
                        GET_ALL_CUSTOMERS,
                        GET_ALL_SUBACCOUNTS,
                        GET_ALL_LICENSES,
                        GET_ALL_LICENSE_USAGE_DETAILS,
                        GET_CONSUMPTION_USAGE_DETAILS,
                        GET_ALL_DEVICES,
                        GET_ALL_DEVICE_TYPES,
                        GET_ALL_PROJECTS,
                        GET_ALL_BUNDLES,
                        GET_ALL_CTAAS_SETUPS,
                        GET_ALL_CTAAS_TEST_SUITES,
                        GET_ALL_SUBACCOUNT_STAKEHOLDER,
                        GET_CTAAS_DASHBOARD,
                        GET_ALL_NOTES,
                        GET_CONSUMPTION_MATRIX,
                        GET_ALL_FEATURE_TOGGLES,
                        GET_CHARTS,
                        GET_MAP,
                        // UPDATE
                        MODIFY_PROJECT,
                        MODIFY_LICENSE_USAGE,
                        MODIFY_CTAAS_SETUP,
                        MODIFY_CTAAS_TEST_SUITE,
                        MODIFY_SUBACCOUNT_STAKEHOLDER
    );

        public static final EnumSet<Resource> devicesAdminPermissions = EnumSet.of(
                        // CREATE
                        CREATE_DEVICE,
                        CREATE_BUNDLE,
                        CREATE_FEATURE_TOGGLE,
                        CREATE_FEATURE_TOGGLE_EXCEPTION,
                        CREATE_CONSUMPTION_MATRIX,
                        // DELETE
                        DELETE_DEVICE,
                        DELETE_BUNDLE,
                        DELETE_FEATURE_TOGGLE,
                        DELETE_FEATURE_TOGGLE_EXCEPTION,
                        DELETE_CONSUMPTION_MATRIX,
                        // READ
                        GET_ALL_CUSTOMERS,
                        GET_ALL_SUBACCOUNTS,
                        GET_ALL_DEVICES,
                        GET_ALL_DEVICE_TYPES,
                        GET_ALL_BUNDLES,
                        GET_ALL_FEATURE_TOGGLES,
                        GET_CONSUMPTION_MATRIX,
                        // UPDATE
                        MODIFY_DEVICE,
                        MODIFY_BUNDLE,
                        MODIFY_FEATURE_TOGGLE,
                        MODIFY_FEATURE_TOGGLE_EXCEPTION,
                        MODIFY_CONSUMPTION_MATRIX);

        public static final EnumSet<Resource> automationPlatformPermissions = EnumSet.of(
                        // CREATE
                        CREATE_LICENSE_USAGE_DETAIL,
                        CREATE_USAGE_DETAILS,
                        // READ
                        GET_ALL_DEVICES,
                        GET_ALL_FEATURE_TOGGLES,
                        GET_ALL_DEVICE_TYPES);

        public static final EnumSet<Resource> crmPermissions = EnumSet.of(
                        // CREATE
                        CREATE_CUSTOMER,
                        CREATE_SUBACCOUNT,
                        CREATE_ADMIN_EMAIL,
                        CREATE_SUBACCOUNT_ADMIN_MAIL,
                        CREATE_LICENSE,
                        CREATE_CTAAS_SETUP,
                        CREATE_CTAAS_SUPPORT_EMAIL,
                        // READ
                        GET_ALL_CUSTOMERS,
                        GET_ALL_SUBACCOUNTS,
                        GET_ALL_LICENSES,
                        GET_ALL_LICENSE_USAGE_DETAILS,
                        GET_CONSUMPTION_USAGE_DETAILS,
                        GET_SUBSCRIPTIONS_OVERVIEW,
                        GET_ALL_FEATURE_TOGGLES,
                        // UPDATE
                        MODIFY_CUSTOMER,
                        MODIFY_SUBACCOUNT,
                        MODIFY_LICENSE);

        public static final EnumSet<Resource> distributorAdminPermissions = EnumSet.of(
                        // READ
                        GET_ALL_CUSTOMERS,
                        GET_ALL_SUBACCOUNTS,
                        GET_ALL_LICENSES,
                        GET_ALL_LICENSE_USAGE_DETAILS,
                        GET_CONSUMPTION_USAGE_DETAILS,
                        GET_ALL_DEVICES,
                        GET_ALL_DEVICE_TYPES,
                        GET_ALL_PROJECTS,
                        GET_ALL_BUNDLES,
                        GET_ALL_FEATURE_TOGGLES);

        public static final EnumSet<Resource> customerAdminPermissions = EnumSet.of(
                        // CREATE
                        CREATE_SUBACCOUNT_STAKEHOLDER,
                        CREATE_NOTE,
                        // DELETE
                        DELETE_SUBACCOUNT_STAKEHOLDER,
                        DELETE_NOTE,
                        // READ
                        GET_ALL_CUSTOMERS,
                        GET_ALL_SUBACCOUNTS,
                        GET_ALL_LICENSES,
                        GET_ALL_LICENSE_USAGE_DETAILS,
                        GET_CONSUMPTION_USAGE_DETAILS,
                        GET_ALL_DEVICES,
                        GET_ALL_DEVICE_TYPES,
                        GET_ALL_PROJECTS,
                        GET_ALL_BUNDLES,
                        GET_ALL_CTAAS_SETUPS,
                        GET_ALL_SUBACCOUNT_STAKEHOLDER,
                        GET_CTAAS_DASHBOARD,
                        GET_ALL_NOTES,
                        GET_ALL_FEATURE_TOGGLES,
                        GET_CHARTS,
                        GET_MAP,
                        // MODIFY
                        MODIFY_CTAAS_ONBOARDING,
                        MODIFY_SUBACCOUNT_STAKEHOLDER);

        public static final EnumSet<Resource> SubAccountAdminPermissions = EnumSet.of(
                        // CREATE
                        CREATE_SUBACCOUNT_STAKEHOLDER,
                        CREATE_NOTE,
                        CREATE_SUBACCOUNT_ADMIN_DEVICE,
                        CREATE_CALLBACK,
                        // DELETE
                        DELETE_SUBACCOUNT_STAKEHOLDER,
                        DELETE_NOTE,
                        DELETE_SUBACCOUNT_ADMIN_DEVICE,
                        // READ
                        GET_ALL_CUSTOMERS,
                        GET_ALL_SUBACCOUNTS,
                        GET_ALL_LICENSES,
                        GET_ALL_LICENSE_USAGE_DETAILS,
                        GET_CONSUMPTION_USAGE_DETAILS,
                        GET_ALL_DEVICES,
                        GET_ALL_DEVICE_TYPES,
                        GET_ALL_PROJECTS,
                        GET_ALL_BUNDLES,
                        GET_ALL_CTAAS_SETUPS,
                        GET_ALL_SUBACCOUNT_STAKEHOLDER,
                        GET_AUTH_USER_PROFILE,
                        GET_CTAAS_DASHBOARD,
                        GET_ALL_NOTES,
                        GET_ALL_FEATURE_TOGGLES,
                        GET_CHARTS,
                        GET_MAP,
                        // MODIFY
                        MODIFY_CTAAS_ONBOARDING,
                        MODIFY_SUBACCOUNT_STAKEHOLDER,
                        MODIFY_AUTH_USER_PROFILE);

        public static final EnumSet<Resource> SubAccountStakeholderPermissions = EnumSet.of(
                        // CREATE
                        CREATE_SUBACCOUNT_ADMIN_DEVICE,
        
                        CREATE_CALLBACK,
                        // DELETE
                        DELETE_SUBACCOUNT_ADMIN_DEVICE,
                        // READ
                        GET_ALL_CUSTOMERS,
                        GET_ALL_SUBACCOUNTS,
                        GET_ALL_CTAAS_SETUPS,
                        GET_AUTH_USER_PROFILE,
                        GET_CTAAS_DASHBOARD,
                        GET_ALL_NOTES,
                        GET_ALL_SUBACCOUNT_STAKEHOLDER,
                        GET_ALL_FEATURE_TOGGLES,
                        GET_CHARTS,
                        GET_MAP,
                        // MODIFY
                        MODIFY_AUTH_USER_PROFILE);

            public static final EnumSet<Resource> IGESAdminPermissions = EnumSet.of(                
                        // CREATE
                        CREATE_LICENSE_USAGE_DETAIL,
                        CREATE_PROJECT,
                        CREATE_USAGE_DETAILS,
                        CREATE_CTAAS_SETUP,
                        CREATE_CTAAS_SUPPORT_EMAIL,
                        CREATE_CTAAS_TEST_SUITE,
                        CREATE_SUBACCOUNT_STAKEHOLDER,
                        // DELETE
                        DELETE_LICENSE_USAGE,
                        DELETE_USAGE_DETAILS,
                        DELETE_SUBACCOUNT_STAKEHOLDER,
                        DELETE_CTAAS_TEST_SUITE,
                        // READ
                        GET_REPORTABLE_SUBACCOUNTS,
                        GET_ALL_CUSTOMERS,
                        GET_ALL_SUBACCOUNTS,
                        GET_ALL_LICENSES,
                        GET_ALL_LICENSE_USAGE_DETAILS,
                        GET_CONSUMPTION_USAGE_DETAILS,
                        GET_ALL_DEVICES,
                        GET_ALL_DEVICE_TYPES,
                        GET_ALL_PROJECTS,
                        GET_ALL_BUNDLES,
                        GET_ALL_CTAAS_SETUPS,
                        GET_ALL_CTAAS_TEST_SUITES,
                        GET_ALL_SUBACCOUNT_STAKEHOLDER,
                        GET_CTAAS_DASHBOARD,
                        GET_ALL_NOTES,
                        GET_CONSUMPTION_MATRIX,
                        GET_ALL_FEATURE_TOGGLES,
                        GET_CHARTS,
                        GET_MAP,
                        // UPDATE
                        MODIFY_PROJECT,
                        MODIFY_LICENSE_USAGE,
                        MODIFY_CTAAS_SETUP,
                        MODIFY_CTAAS_TEST_SUITE,
                        MODIFY_SUBACCOUNT_STAKEHOLDER
            );
}
