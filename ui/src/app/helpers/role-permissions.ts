export const permissions = {
    'tekvizion.DevicesAdmin': {
        paths: [],
        elements: [],
        tables: {
            customerOptions: [],
            licenseOptions: [],
            licConsumptionOptions: [],
            projectOptions: [],
            ctaasTestSuiteOptions: [],
            stakeholderOptions: []
        }
    },
    'tekvizion.FullAdmin': {
        paths: [
            'dashboard',
            'customer',
            'consumption',
            'projects',
            'licenses',
            'redirect',
            'spotlight',
            'report-dashboards',
            'test-suites',
            'stakeholders',
            "setup",
            'subscriptions-overview'
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
            'showUserToggle'
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
            'addCustomer',
            'addSubaccount',
            'addLicense',
            'addAdminEmail',
            'deleteAdminEmail',
            'addSubAccAdminEmail',
            'deleteSubAccAdminEmail',
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
                'VIEW_CTAAS_DASHBOARD',
                'MODIFY_ACCOUNT'],
            licenseOptions: [
                'MODIFY_LICENSE'
            ],
            licConsumptionOptions: [
            ],
            projectOptions: [
                'VIEW_CONSUMPTION'
            ],
            stakeholderOptions: [],
            ctaasTestSuiteOptions: []
        }
    },
    'tekvizion.ConfigTester': {
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
            'test-suites',
            'stakeholders',
            'setup',
            'subscriptions-overview'
        ],
        elements: [
            'addProject',
            'addLicenseConsumption',
            'addTestSuite',
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
            'stakeholders'
        ],
        elements: ['showBanner'],
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
            ctaasTestSuiteOptions: []
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
            'stakeholders'
        ],
        elements: [],
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
            ctaasTestSuiteOptions: []
        }
    },
    'customer.SubaccountStakeholder': {
        paths: [
            'redirect',
            'apps',
            'spotlight',
            'report-dashboards'
        ],
        elements: [],
        tables: {
            customerOptions: [],
            licenseOptions: [],
            licConsumptionOptions: [],
            projectOptions: [],
            stakeholderOptions: [],
            ctaasTestSuiteOptions: []
        }
    }
};

