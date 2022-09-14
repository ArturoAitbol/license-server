export const permissions = {
    'tekvizion.FullAdmin': {
        paths: [
            'dashboard',
            'customer',
            'consumption',
            'projects',
            'licenses',
            'redirect'
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
            'auditInfo'
        ],
        tables: {
            customerOptions: [
                'VIEW_LICENSES',
                'VIEW_CONSUMPTION',
                'VIEW_PROJECTS',
                'VIEW_ADMIN_EMAILS',
                'VIEW_SUBACC_ADMIN_EMAILS',
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
            'redirect'
        ],
        elements: [
            'addCustomer',
            'addSubaccount',
            'addLicense',
            'addAdminEmail',
            'deleteAdminEmail',
            'addSubAccAdminEmail',
            'deleteSubAccAdminEmail'],
        tables: {
            customerOptions: [
                'VIEW_LICENSES',
                'VIEW_CONSUMPTION',
                'VIEW_PROJECTS',
                'VIEW_ADMIN_EMAILS',
                'VIEW_SUBACC_ADMIN_EMAILS',
                'MODIFY_ACCOUNT'],
            licenseOptions: [
                'MODIFY_LICENSE'
            ],
            licConsumptionOptions: [
            ],
            projectOptions: [
                'VIEW_CONSUMPTION'
            ]
        }
    },
    'tekvizion.ConfigTester': {
        paths: [
            'dashboard',
            'customer',
            'consumption',
            'projects',
            'licenses',
            'redirect'
        ],
        elements: [
            'addProject',
            'addLicenseConsumption'
        ],
        tables: {
            customerOptions: [
                'VIEW_LICENSES',
                'VIEW_CONSUMPTION',
                'VIEW_PROJECTS',
                'VIEW_ADMIN_EMAILS',
                'VIEW_SUBACC_ADMIN_EMAILS'],
            licenseOptions: [],
            licConsumptionOptions: [
                'EDIT',
                'DELETE'
            ],
            projectOptions: [
                'VIEW_CONSUMPTION',
                'MODIFY_PROJECT',
                'CLOSE_PROJECT'
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
            'redirect'
        ],
        elements: [],
        tables: {
            customerOptions: [
                'VIEW_LICENSES',
                'VIEW_CONSUMPTION',
                'VIEW_PROJECTS',
                'VIEW_ADMIN_EMAILS',
                'VIEW_SUBACC_ADMIN_EMAILS'],
            licenseOptions: [],
            licConsumptionOptions: [],
            projectOptions: [
                'VIEW_CONSUMPTION'
            ]
        }
    },
    'customer.FullAdmin': {
        paths: [
            'dashboard',
            'customer',
            'consumption',
            'projects',
            'licenses',
            'redirect'
        ],
        elements: [],
        tables: {
            customerOptions: [
                'VIEW_LICENSES',
                'VIEW_CONSUMPTION',
                'VIEW_PROJECTS',
                'VIEW_ADMIN_EMAILS',
                'VIEW_SUBACC_ADMIN_EMAILS'],
            licenseOptions: [],
            licConsumptionOptions: [],
            projectOptions: [
                'VIEW_CONSUMPTION'
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
            'ctaas'
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
            ]
        }
    },
    'customer.SubaccountStakeholder': {
        paths: [
            'redirect',
            'apps',
            'ctaas',
            'dashboard'
        ],
        elements: [],
        tables: {
            customerOptions: [],
            licenseOptions: [],
            licConsumptionOptions: [],
            projectOptions: []
        }
    }
};

