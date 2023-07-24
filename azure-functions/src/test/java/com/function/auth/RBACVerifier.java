package com.function.auth;

import java.util.EnumMap;
import static com.function.auth.Resource.*;

public class RBACVerifier {

        private static final RBACVerifier instance = new RBACVerifier();

        public static RBACVerifier getInstance() {
                return instance;
        }

        public EnumMap<Resource, ExpectedPermissions> verifiers = new EnumMap<>(Resource.class);

        private RBACVerifier() {
                verifiers.put(CREATE_ADMIN_EMAIL, new ExpectedPermissions(
                                true,
                                false,
                                false,
                                false,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false));

                verifiers.put(CREATE_CUSTOMER, new ExpectedPermissions(
                                true,
                                false,
                                false,
                                false,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false));

                verifiers.put(CREATE_DEVICE, new ExpectedPermissions(false,
                                false,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false));

                verifiers.put(CREATE_LICENSE, new ExpectedPermissions(
                                true,
                                false,
                                false,
                                false,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false));

                verifiers.put(CREATE_LICENSE_USAGE_DETAIL, new ExpectedPermissions(
                                true,
                                false,
                                true,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                true));

                verifiers.put(CREATE_PROJECT, new ExpectedPermissions(
                                true,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                true));
                verifiers.put(CREATE_SUBACCOUNT, new ExpectedPermissions(
                                true,
                                false,
                                false,
                                false,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(CREATE_SUBACCOUNT_ADMIN_MAIL, new ExpectedPermissions(
                                true,
                                false,
                                false,
                                false,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(CREATE_USAGE_DETAILS, new ExpectedPermissions(
                                true,
                                false,
                                true,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                true));
                verifiers.put(CREATE_BUNDLE, new ExpectedPermissions(false,
                                false,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(CREATE_CTAAS_SETUP, new ExpectedPermissions(
                                true,
                                false,
                                true,
                                false,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                true));
                verifiers.put(CREATE_CTAAS_SUPPORT_EMAIL, new ExpectedPermissions(
                        true,
                        false,
                        true,
                        false,
                        false,
                        true,
                        false,
                        false,
                        false,
                        false,
                        true));
                verifiers.put(CREATE_CTAAS_TEST_SUITE, new ExpectedPermissions(
                                true,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                true));
                verifiers.put(CREATE_SUBACCOUNT_STAKEHOLDER, new ExpectedPermissions(
                                true,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                true,
                                true,
                                false,
                                true));
                verifiers.put(CREATE_FEATURE_TOGGLE, new ExpectedPermissions(
                                false,
                                false,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(CREATE_FEATURE_TOGGLE_EXCEPTION, new ExpectedPermissions(
                                false,
                                false,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(CREATE_NOTE, new ExpectedPermissions(
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                true,
                                true,
                                false,
                                false));

                verifiers.put(CREATE_SUBACCOUNT_ADMIN_DEVICE, new ExpectedPermissions(
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                true,
                                true,
                                false));
                verifiers.put(CREATE_CONSUMPTION_MATRIX, new ExpectedPermissions(
                                false,
                                false,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(DELETE_ADMIN_EMAIL, new ExpectedPermissions(
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(DELETE_CUSTOMER, new ExpectedPermissions(
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(DELETE_DEVICE, new ExpectedPermissions(false,
                                false,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(DELETE_LICENSE, new ExpectedPermissions(
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(DELETE_LICENSE_USAGE, new ExpectedPermissions(
                                true,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                true));
                verifiers.put(DELETE_PROJECT, new ExpectedPermissions(
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(DELETE_SUBACCOUNT_ADMIN_EMAIL, new ExpectedPermissions(
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(DELETE_SUB_ACCOUNT, new ExpectedPermissions(
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(DELETE_USAGE_DETAILS, new ExpectedPermissions(
                                true,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                true));
                verifiers.put(DELETE_BUNDLE, new ExpectedPermissions(false,
                                false,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(DELETE_CTAAS_SETUP, new ExpectedPermissions(
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(DELETE_CTAAS_SUPPORT_EMAIL, new ExpectedPermissions(
                        true,
                        false,
                        false,
                        false,
                        false,
                        false,
                        false,
                        false,
                        false,
                        false,
                        false));
                verifiers.put(DELETE_CTAAS_TEST_SUITE, new ExpectedPermissions(
                                true,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                true));
                verifiers.put(DELETE_SUBACCOUNT_STAKEHOLDER, new ExpectedPermissions(
                                true,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                true,
                                true,
                                false,
                                true));
                verifiers.put(DELETE_FEATURE_TOGGLE, new ExpectedPermissions(
                                false,
                                false,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(DELETE_NOTE, new ExpectedPermissions(
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                true,
                                true,
                                false,
                                false));

                verifiers.put(DELETE_SUBACCOUNT_ADMIN_DEVICE, new ExpectedPermissions(
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                true,
                                true,
                                false));
                verifiers.put(DELETE_CONSUMPTION_MATRIX, new ExpectedPermissions(
                                false,
                                false,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(DELETE_FEATURE_TOGGLE_EXCEPTION, new ExpectedPermissions(
                                false,
                                false,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(GET_ALL_BUNDLES, new ExpectedPermissions(
                                true,
                                true,
                                true,
                                true,
                                false,
                                false,
                                true,
                                true,
                                true,
                                false,
                                true));
                verifiers.put(GET_ALL_CUSTOMERS, new ExpectedPermissions(
                                true,
                                true,
                                true,
                                true,
                                false,
                                true,
                                true,
                                true,
                                true,
                                true,
                                true));
                verifiers.put(GET_ALL_DEVICES, new ExpectedPermissions(
                                true,
                                true,
                                true,
                                true,
                                true,
                                false,
                                true,
                                true,
                                true,
                                false,
                                true));
                verifiers.put(GET_ALL_DEVICE_TYPES, new ExpectedPermissions(
                                true,
                                true,
                                true,
                                true,
                                true,
                                false,
                                true,
                                true,
                                true,
                                false,
                                true));
                verifiers.put(GET_ALL_LICENSES, new ExpectedPermissions(
                                true,
                                true,
                                true,
                                false,
                                false,
                                true,
                                true,
                                true,
                                true,
                                false,
                                true));
                verifiers.put(GET_ALL_LICENSE_USAGE_DETAILS, new ExpectedPermissions(
                                true,
                                true,
                                true,
                                false,
                                false,
                                true,
                                true,
                                true,
                                true,
                                false,
                                true));
                verifiers.put(GET_ALL_PROJECTS, new ExpectedPermissions(
                                true,
                                true,
                                true,
                                false,
                                false,
                                false,
                                true,
                                true,
                                true,
                                false,
                                true));
                verifiers.put(GET_ALL_SUBACCOUNTS, new ExpectedPermissions(
                                true,
                                true,
                                true,
                                true,
                                false,
                                true,
                                true,
                                true,
                                true,
                                true,
                                true));
                verifiers.put(GET_REPORTABLE_SUBACCOUNTS, new ExpectedPermissions(
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                true));
                verifiers.put(GET_CONSUMPTION_USAGE_DETAILS, new ExpectedPermissions(
                                true,
                                true,
                                true,
                                false,
                                false,
                                true,
                                true,
                                true,
                                true,
                                false,
                                true));
                verifiers.put(GET_USER_EMAIL_INFO, new ExpectedPermissions(
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(GET_ALL_CTAAS_SETUPS, new ExpectedPermissions(
                                true,
                                true,
                                true,
                                false,
                                false,
                                false,
                                false,
                                true,
                                true,
                                true,
                                true));
                verifiers.put(GET_ALL_CTAAS_TEST_SUITES, new ExpectedPermissions(
                                true,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                true));
                verifiers.put(GET_ALL_SUBACCOUNT_STAKEHOLDER, new ExpectedPermissions(
                                true,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                true,
                                true,
                                true,
                                true));
                verifiers.put(GET_AUTH_USER_PROFILE, new ExpectedPermissions(
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                true,
                                true,
                                false));
                verifiers.put(GET_CTAAS_DASHBOARD, new ExpectedPermissions(
                                true,
                                true,
                                true,
                                false,
                                false,
                                false,
                                false,
                                true,
                                true,
                                true,
                                true));
                verifiers.put(GET_ALL_REPORTS, new ExpectedPermissions(
                                true,
                                true,
                                true,
                                false,
                                false,
                                false,
                                false,
                                true,
                                true,
                                true,
                                true));
                verifiers.put(GET_ALL_FEATURE_TOGGLES, new ExpectedPermissions(
                                true,
                                true,
                                true,
                                true,
                                true,
                                true,
                                true,
                                true,
                                true,
                                true,
                                true));
                verifiers.put(GET_SUBSCRIPTIONS_OVERVIEW, new ExpectedPermissions(
                                true,
                                true,
                                false,
                                false,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(GET_ALL_NOTES, new ExpectedPermissions(
                                true,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                true,
                                true,
                                true,
                                true));
                verifiers.put(GET_CONSUMPTION_MATRIX, new ExpectedPermissions(
                                true,
                                true,
                                true,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                true));
                verifiers.put(GET_CHARTS, new ExpectedPermissions(
                                true,
                                true,
                                true,
                                false,
                                false,
                                false,
                                false,
                                true,
                                true,
                                true,
                                true));
                verifiers.put(MODIFY_CUSTOMER, new ExpectedPermissions(
                                true,
                                false,
                                false,
                                false,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(MODIFY_DEVICE, new ExpectedPermissions(false,
                                false,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(MODIFY_LICENSE, new ExpectedPermissions(
                                true,
                                false,
                                false,
                                false,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(MODIFY_LICENSE_USAGE, new ExpectedPermissions(
                                true,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                true));
                verifiers.put(MODIFY_PROJECT, new ExpectedPermissions(
                                true,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                true));
                verifiers.put(MODIFY_SUBACCOUNT, new ExpectedPermissions(
                                true,
                                false,
                                false,
                                false,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(MODIFY_BUNDLE, new ExpectedPermissions(false,
                                false,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(MODIFY_CTAAS_SETUP, new ExpectedPermissions(
                                true,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                true));
                verifiers.put(MODIFY_CTAAS_TEST_SUITE, new ExpectedPermissions(
                                true,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                true));
                verifiers.put(MODIFY_CTAAS_ONBOARDING, new ExpectedPermissions(false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                true,
                                true,
                                false,
                                false));
                verifiers.put(MODIFY_SUBACCOUNT_STAKEHOLDER, new ExpectedPermissions(
                                true,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                true,
                                true,
                                false,
                                true));
                verifiers.put(MODIFY_AUTH_USER_PROFILE, new ExpectedPermissions(false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                true,
                                true,
                                false));
                verifiers.put(MODIFY_FEATURE_TOGGLE, new ExpectedPermissions(
                                false,
                                false,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(MODIFY_FEATURE_TOGGLE_EXCEPTION, new ExpectedPermissions(
                                false,
                                false,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(MODIFY_CONSUMPTION_MATRIX, new ExpectedPermissions(
                                false,
                                false,
                                false,
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(DELETE_RESIDUAL_TEST_DATA, new ExpectedPermissions(
                                true,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false));
                verifiers.put(CREATE_CALLBACK, new ExpectedPermissions(
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                true,
                                true,
                                false));
                verifiers.put(GET_MAP, new ExpectedPermissions(
                                true,
                                true,
                                true,
                                false,
                                false,
                                false,
                                false,
                                true,
                                true,
                                true,
                                true));
        }
}
