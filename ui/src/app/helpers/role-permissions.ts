export const permissions = {
    'tekvizion.DevicesAdmin': {
        paths: [
            'devices',
        ],
        elements: [
            'addDevice',
            'modifyDevice',
            'deleteDevice'
        ],
        tables: {
            customerOptions: [],
            devicesOptions:[
                'VIEW_DEVICES',
                'MODIFY_DEVICES',
                'DELETE_DEVICES',
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
            'dashboard',
            'customer',
            'consumption',
            'projects',
            'licenses',
            'devices',
            'redirect',
            'spotlight',
            'report-dashboards',
            'test-suites',
            'stakeholders',
            'setup',
            'subscriptions-overview',
            'details',
            'reports'
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
            'showBanner',
            'showUserToggle',
            'addStakeholderBtn',
            'changeSpotlightRole',
            'resetFilter'
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
                'DELETE_ACCOUNT'],
            
            licenseOptions: [
                'MODIFY_LICENSE',
                'DELETE_LICENSE'],
            licConsumptionOptions: [
                'EDIT',
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
            subscriptionsOverviewOptions: [
                'VIEW_LICENSES',
                'VIEW_CONSUMPTION',
            ],
            noteOptions: [],
            testReportsOptions: [
                'VIEW_REPORT',
            ]
        }
    },
    'tekvizion.SalesAdmin': {
        paths: [
            'dashboard',
            'customer',
            'consumption',
            'projects',
            'licenses',
            'redirect',
            'apps',
            'spotlight',
            'report-dashboards',
            'subscriptions-overview'
        ],
        elements: [
            'showBanner',
            'showUserToggle',
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
            'dashboard',
            'customer',
            'consumption',
            'projects',
            'licenses',
            'devices',
            'redirect',
            'apps',
            'spotlight',
            'report-dashboards',
            'test-suites',
            'stakeholders',
            'setup',
            'details',
            'reports'
        ],
        elements: [
            'addProject',
            'addLicenseConsumption',
            'addTestSuite',
            'showBanner',
            'showUserToggle',
            'resetFilter'
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
            subscriptionsOverviewOptions: [],
            testReportsOptions: [
                'VIEW_REPORT', 
            ]
        }
    },
    'distributor.FullAdmin': {
        paths: [
            'dashboard',
            'customer',
            'consumption',
            'projects',
            'licenses',
            'redirect',
            'apps',
            'spotlight',
            'report-dashboards'
        ],
        elements: [
            'showBanner',
            'showUserToggle'
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
            licConsumptionOptions: [],
            projectOptions: [
                'VIEW_CONSUMPTION'
            ],
            stakeholderOptions: [],
            ctaasTestSuiteOptions: []
        }
    },
    'customer.FullAdmin': {
        paths: [
            'dashboard',
            'customer',
            'consumption',
            'projects',
            'licenses',
            'redirect',
            'apps',
            'spotlight',
            'report-dashboards',
            'stakeholders',
            'notes',
            'details',
            'reports'
        ],
        elements: [
            'view-profile',
            'showUserToggle',
            'addStakeholderBtn',
            'changeSpotlightRole',
            'addSpotlightNote',
            'showLatestNote',
            'resetFilter'
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
            licConsumptionOptions: [],
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
                'VIEW_REPORT',
            ]
        }
    },
    'customer.SubaccountAdmin': {
        paths: [
            'dashboard',
            'customer',
            'consumption',
            'projects',
            'licenses',
            'redirect',
            'apps',
            'spotlight',
            'report-dashboards',
            'stakeholders',
            'notes',
            'details',
            'reports'
        ],
        elements: [
            'view-profile',
            'showUserToggle',
            'addStakeholderBtn',
            'changeSpotlightRole',
            'addSpotlightNote',
            'showLatestNote',
            'resetFilter'
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
            licConsumptionOptions: [],
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
                'VIEW_REPORT',
            ]
        }
    },
    'customer.SubaccountStakeholder': {
        paths: [
            'redirect',
            'apps',
            'spotlight',
            'report-dashboards',
            'stakeholders',
            'notes',
            'details',
            'reports'
        ],
        elements: [
            'showUserToggle',
            'view-profile',
            'showLatestNote',
            'resetFilter'
        ],
        tables: {
            customerOptions: [],
            licenseOptions: [],
            licConsumptionOptions: [],
            projectOptions: [],
            stakeholderOptions: [],
            ctaasTestSuiteOptions: [],
            noteOptions: [
                'VIEW_DASHBOARD'
            ],
            testReportsOptions: [
                'VIEW_REPORT',
            ]
        }
    }
};