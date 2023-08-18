export const permissions = {
    'tekvizion.DevicesAdmin': {
        paths: [
            'devices',
            'consumption-matrix',
            'redirect',
            'feature-toggles'
        ],
        elements: [
            'addDevice',
            'modifyDevice',
            'deleteDevice',
            'editConsumptionMatrix'
        ],
        tables: {
            customerOptions: [],
            deviceOptions: [
                'MODIFY_DEVICE',
                'DELETE_DEVICE',
            ],
            licenseOptions: [],
            licConsumptionOptions: [],
            projectOptions: [],
            ctaasTestSuiteOptions: [],
            stakeholderOptions: [],
            subscriptionsOverviewOptions: [],
        }
    },
    'tekvizion.FullAdmin': {
        paths: [
            'customers-dashboard',
            'customer',
            'consumption',
            'projects',
            'licenses',
            'devices',
            'redirect',
            'spotlight',
            'notes',
            'test-suites',
            'stakeholders',
            'setup',
            'subscriptions-overview',
            'details',
            'reports',
            'consumption-matrix',
            'map',
            'spotlight-dashboard'
        ],
        elements: [
            'addCustomer',
            'addSubaccount',
            'addLicense',
            'addLicenseConsumption',
            'addProject',
            'addAdminEmail',
            'deleteAdminEmail',
            'addSubAccAdminEmail',
            'deleteSubAccAdminEmail',
            'auditInfo',
            'addTestSuite',
            'addStakeholderBtn',
            'changeSpotlightRole',
            'resetFilter',
            'maintenanceModeCheckbox',
            'viewDetailedReport',
            'emailNotifications',
            'addSupportEmail',
            'deleteSupportEmail',
        ],
        tables: {
            customerOptions: [
                'VIEW_LICENSES',
                'VIEW_CONSUMPTION',
                'VIEW_PROJECTS',
                'VIEW_ADMIN_EMAILS',
                'VIEW_SUBACC_ADMIN_EMAILS',
                'VIEW_CTAAS_DASHBOARD',
                'MODIFY_ACCOUNT',
                'DELETE_ACCOUNT'
            ],
            licenseOptions: [
                'MODIFY_LICENSE',
                'DELETE_LICENSE'],
            licConsumptionOptions: [
                'EDIT',
                'VIEW_DETAILS',
                'DELETE'
            ],
            projectOptions: [
                'VIEW_CONSUMPTION',
                'MODIFY_PROJECT',
                'CLOSE_PROJECT',
                'DELETE_PROJECT'
            ],
            ctaasTestSuiteOptions: [
                'MODIFY_TEST_SUITE',
                'DELETE_TEST_SUITE'
            ],
            stakeholderOptions: [
                'MODIFY_STAKEHOLDER',
                'DELETE_STAKEHOLDER'
            ],
            noteOptions: [
                'VIEW_DASHBOARD'
            ],
            subscriptionsOverviewOptions: [
                'VIEW_LICENSES',
                'VIEW_CONSUMPTION',
            ],
            deviceOptions: [
                'MODIFY_DEVICE',
                'DELETE_DEVICE',
            ],
            testReportsOptions: [
                'VIEW_DETAILS'
            ]
        }
    },
    'tekvizion.SalesAdmin': {
        paths: [
            'customers-dashboard',
            'spotlight-dashboard',
            'customer',
            'consumption',
            'projects',
            'licenses',
            'redirect',
            'apps',
            'spotlight',
            'subscriptions-overview',
            'consumption-matrix',
            'map'
        ],
        elements: [
        ],
        tables: {
            customerOptions: [
                'VIEW_LICENSES',
                'VIEW_CONSUMPTION',
                'VIEW_PROJECTS',
                'VIEW_ADMIN_EMAILS',
                'VIEW_SUBACC_ADMIN_EMAILS',
                'VIEW_CTAAS_DASHBOARD',
            ],
            licenseOptions: [
            ],
            licConsumptionOptions: [
                'VIEW_DETAILS',
            ],
            projectOptions: [
                'VIEW_CONSUMPTION'
            ],
            stakeholderOptions: [],
            ctaasTestSuiteOptions: [],
            subscriptionsOverviewOptions: [
                'VIEW_LICENSES',
                'VIEW_CONSUMPTION',
            ],
        }
    },
    'tekvizion.ConfigTester': {
        paths: [
            'customers-dashboard',
            'customer',
            'consumption',
            'projects',
            'licenses',
            'devices',
            'redirect',
            'apps',
            'spotlight',
            'notes',
            'test-suites',
            'stakeholders',
            'setup',
            'details',
            'reports',
            'consumption-matrix',
            'spotlight-dashboard',
            'map'
        ],
        elements: [
            'addProject',
            'addLicenseConsumption',
            'addTestSuite',
            'resetFilter',
            'maintenanceModeCheckbox',
            'viewDetailedReport',
            'addSupportEmail',
            'deleteSupportEmail',
            'emailNotifications'
        ],
        tables: {
            customerOptions: [
                'VIEW_LICENSES',
                'VIEW_CONSUMPTION',
                'VIEW_PROJECTS',
                'VIEW_ADMIN_EMAILS',
                'VIEW_SUBACC_ADMIN_EMAILS',
                'VIEW_CTAAS_DASHBOARD'
            ],
            licenseOptions: [],
            licConsumptionOptions: [
                'EDIT',
                'VIEW_DETAILS',
                'DELETE'
            ],
            projectOptions: [
                'VIEW_CONSUMPTION',
                'MODIFY_PROJECT',
                'CLOSE_PROJECT'
            ],
            ctaasTestSuiteOptions: [
                'MODIFY_TEST_SUITE',
                'DELETE_TEST_SUITE'
            ],
            stakeholderOptions: [
                'MODIFY_STAKEHOLDER',
                'DELETE_STAKEHOLDER'
            ],
            noteOptions: [
                'VIEW_DASHBOARD'
            ],
            subscriptionsOverviewOptions: [],
            deviceOptions: [],
            testReportsOptions: [
                'VIEW_DETAILS'
            ]
        }
    },
    'tekvizion.IGESAdmin': {
        paths: [
            'customers-dashboard',
            'customer',
            'consumption',
            'projects',
            'licenses',
            'devices',
            'redirect',
            'apps',
            'spotlight',
            'notes',
            'test-suites',
            'stakeholders',
            'setup',
            'details',
            'reports',
            'consumption-matrix',
            'spotlight-dashboard',
            'map'
        ],
        elements: [
            'addProject',
            'addLicenseConsumption',
            'addTestSuite',
            'resetFilter',
            'maintenanceModeCheckbox',
            'addSupportEmail'
        ],
        tables: {
            customerOptions: [
                'VIEW_LICENSES',
                'VIEW_CONSUMPTION',
                'VIEW_PROJECTS',
                'VIEW_ADMIN_EMAILS',
                'VIEW_SUBACC_ADMIN_EMAILS',
                'VIEW_CTAAS_DASHBOARD'
            ],
            licenseOptions: [],
            licConsumptionOptions: [
                'EDIT',
                'VIEW_DETAILS',
                'DELETE'
            ],
            projectOptions: [
                'VIEW_CONSUMPTION',
                'MODIFY_PROJECT',
                'CLOSE_PROJECT'
            ],
            ctaasTestSuiteOptions: [
                'MODIFY_TEST_SUITE',
                'DELETE_TEST_SUITE'
            ],
            stakeholderOptions: [
                'MODIFY_STAKEHOLDER',
                'DELETE_STAKEHOLDER'
            ],
            noteOptions: [
                'VIEW_DASHBOARD'
            ],
            subscriptionsOverviewOptions: [],
            deviceOptions: [],
            testReportsOptions: [
                'VIEW_DETAILS'
            ]
        }
    },
    'distributor.FullAdmin': {
        paths: [
            'customers-dashboard',
            'customer',
            'consumption',
            'projects',
            'licenses',
            'redirect',
            'apps',
            'spotlight',
            'report-dashboards',
            'spotlight-dashboard'
        ],
        elements: [
            'viewDetailedReport'
        ],
        tables: {
            customerOptions: [
                'VIEW_LICENSES',
                'VIEW_CONSUMPTION',
                'VIEW_PROJECTS',
                'VIEW_ADMIN_EMAILS',
                'VIEW_SUBACC_ADMIN_EMAILS',
                'VIEW_CTAAS_DASHBOARD'
            ],
            licenseOptions: [],
            licConsumptionOptions: [
                'VIEW_DETAILS',
            ],
            projectOptions: [
                'VIEW_CONSUMPTION'
            ],
            stakeholderOptions: [],
            ctaasTestSuiteOptions: []
        }
    },
    'customer.FullAdmin': {
        paths: [
            'customers-dashboard',
            'customer',
            'consumption',
            'projects',
            'licenses',
            'redirect',
            'apps',
            'spotlight',
            'stakeholders',
            'notes',
            'details',
            'reports',
            'spotlight-dashboard',
            'map'
        ],
        elements: [
            'view-profile',
            'addStakeholderBtn',
            'changeSpotlightRole',
            'addSpotlightNote',
            'resetFilter',
            'request-call',
            'viewDetailedReport',
            'emailNotifications'
        ],
        tables: {
            customerOptions: [
                'VIEW_LICENSES',
                'VIEW_CONSUMPTION',
                'VIEW_PROJECTS',
                'VIEW_ADMIN_EMAILS',
                'VIEW_SUBACC_ADMIN_EMAILS',
                'VIEW_CTAAS_DASHBOARD'
            ],
            licenseOptions: [],
            licConsumptionOptions: [
                'VIEW_DETAILS',
            ],
            projectOptions: [
                'VIEW_CONSUMPTION'
            ],
            stakeholderOptions: [
                'MODIFY_STAKEHOLDER',
                'DELETE_STAKEHOLDER'
            ],
            ctaasTestSuiteOptions: [],
            noteOptions: [
                'CLOSE_NOTE',
                'VIEW_DASHBOARD'
            ],
            testReportsOptions: [
                'VIEW_DETAILS'
            ]
        }
    },
    'customer.SubaccountAdmin': {
        paths: [
            'customers-dashboard',
            'customer',
            'consumption',
            'projects',
            'licenses',
            'redirect',
            'apps',
            'spotlight',
            'stakeholders',
            'notes',
            'details',
            'reports',
            'spotlight-dashboard',
            'map'
        ],
        elements: [
            'view-profile',
            'view-roles-permission',
            'view-role',
            'addStakeholderBtn',
            'changeSpotlightRole',
            'addSpotlightNote',
            'resetFilter',
            'request-call',
            'viewDetailedReport',
            'emailNotifications'
        ],
        tables: {
            customerOptions: [
                'VIEW_LICENSES',
                'VIEW_CONSUMPTION',
                'VIEW_PROJECTS',
                'VIEW_ADMIN_EMAILS',
                'VIEW_SUBACC_ADMIN_EMAILS',
                'VIEW_CTAAS_DASHBOARD'
            ],
            licenseOptions: [],
            licConsumptionOptions: [
                'VIEW_DETAILS',
            ],
            projectOptions: [
                'VIEW_CONSUMPTION'
            ],
            stakeholderOptions: [
                'MODIFY_STAKEHOLDER',
                'DELETE_STAKEHOLDER'
            ],
            ctaasTestSuiteOptions: [],
            noteOptions: [
                'CLOSE_NOTE',
                'VIEW_DASHBOARD'
            ],
            testReportsOptions: [
                'VIEW_DETAILS'
            ]
        }
    },
    'customer.SubaccountStakeholder': {
        paths: [
            'redirect',
            'apps',
            'spotlight',
            'stakeholders',
            'notes',
            'details',
            'reports',
            'spotlight-dashboard',
            'map'
        ],
        elements: [
            'view-profile',
            'view-roles-permission',
            'view-role',
            'resetFilter',
            'request-call',
            'viewDetailedReport',
            'emailNotifications'
        ],
        tables: {
            customerOptions: [],
            licenseOptions: [],
            licConsumptionOptions: [],
            projectOptions: [],
            ctaasTestSuiteOptions: [],
            noteOptions: [
                'VIEW_DASHBOARD'
            ],
            testReportsOptions: [
                'VIEW_DETAILS'
            ]
        }
    }
};
