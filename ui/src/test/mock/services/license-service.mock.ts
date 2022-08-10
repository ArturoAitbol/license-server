import { Observable } from 'rxjs';
import { License } from 'src/app/model/license.model';

const MOCK_LICENSE_A: License = {
    subaccountId: 'ac7a78c2-d0b2-4c81-9538-321562d426c7',
    id: '16f4f014-5bed-4166-b10a-808b2e6655e3',
    status: 'Active',
    deviceLimit: '',
    tokensPurchased: '',
    startDate: '',
    renewalDate: '',
    packageType: '',
    customerName: '',
    subaccountName: 'subaccountNameA',
    customerType: ''
};
const MOCK_LICENSE_B: License = {
    subaccountId: '31d81e5c-a916-470b-aabe-6860f8464211',
    id: '31d82e5c-b911-460c-cdbe-6860f8464233',
    status: 'Active',
    deviceLimit: '',
    tokensPurchased: '',
    startDate: '',
    renewalDate: '',
    packageType: '',
    customerName: '',
    subaccountName: 'subaccountNameB',
    customerType: ''
};
const MOCK_LICENSE_C: License = {
    subaccountId: '31d81e5c-a916-470b-aabe-6860f8464211',
    id: '527b5c03-c0d6-4f41-8866-7255487aab48',
    status: 'Active',
    deviceLimit: '',
    tokensPurchased: '',
    startDate: '',
    renewalDate: '',
    packageType: '',
    customerName: '',
    subaccountName: 'subaccountNameB',
    customerType: ''
};
const MOCK_LICENSE_D: License = {
    subaccountId: '31d81e5c-a916-470b-aabe-6860f8464211',
    id: '273a38b7-20a1-487e-82fb-8861d96280fe',
    status: 'Active',
    deviceLimit: '',
    tokensPurchased: '',
    startDate: '',
    renewalDate: '',
    packageType: '',
    customerName: '',
    subaccountName: 'subaccountNameA',
    customerType: ''
};
const MOCK_LICENSE_E: License = {
    subaccountId: '3819dc98-0e34-4237-ad0f-e79895b887e9',
    id: '37c6ac96-dbf0-4195-a070-3eec4598183c',
    status: 'Expired',
    deviceLimit: '',
    tokensPurchased: '',
    startDate: '',
    renewalDate: '',
    packageType: '',
    customerName: '',
    subaccountName: 'subaccountNameA',
    customerType: ''
};
const MOCK_LICENSE_F: License = {
    subaccountId: '31d81e5c-a916-470b-aabe-6860f8464211',
    id: 'af7669e4-ed08-44c2-b405-547d81b10fa7',
    status: 'Active',
    deviceLimit: '',
    tokensPurchased: '',
    startDate: '',
    renewalDate: '',
    packageType: '',
    customerName: '',
    subaccountName: 'subaccountNameB',
    customerType: ''
};
const MOCK_LICENSE_G: License = {
    subaccountId: '3819dc98-0e34-4237-ad0f-e79895b887e9',
    id: '2c0345a7-89de-440b-998c-c85a3f31c63c',
    status: 'Expired',
    deviceLimit: '',
    tokensPurchased: '',
    startDate: '',
    renewalDate: '',
    packageType: '',
    customerName: '',
    subaccountName: 'subaccountNameB',
    customerType: ''
};
const MOCK_LICENSE_H: License = {
    subaccountId: 'a9f2c313-7d80-4c1f-bda5-91f2767b3716',
    id: '8d57a5fa-8ad4-4102-8276-6aa75f8a9870',
    status: 'Active',
    deviceLimit: '',
    tokensPurchased: '',
    startDate: '',
    renewalDate: '',
    packageType: '',
    customerName: '',
    subaccountName: 'subaccountNameB',
    customerType: ''
};
const MOCK_LICENSE_I: License = {
    subaccountId: '31d81e5c-a916-470b-aabe-6860f8464211',
    id: '989c0ed3-a8ba-4c81-bf87-19ab91790c93',
    status: 'Expired',
    deviceLimit: '',
    tokensPurchased: '',
    startDate: '',
    renewalDate: '',
    packageType: '',
    customerName: '',
    subaccountName: 'subaccountNameA',
    customerType: ''
};
const MOCK_LICENSE_J: License = {
    subaccountId: '31d81e5c-a916-470b-aabe-6860f8464211',
    id: 'c3b1bc60-5405-40b9-88c5-e9437972d5c6',
    status: 'Active',
    deviceLimit: '',
    tokensPurchased: '',
    startDate: '',
    renewalDate: '',
    packageType: '',
    customerName: '',
    subaccountName: 'subaccountNameA',
    customerType: ''
};
const MOCK_LICENSE_K: License = {
    subaccountId: '173c00ea-6e5c-462c-9295-ae5e14adc14f',
    id: '117694f7-1578-4078-94dc-64d5286ed0e4',
    status: 'Expired',
    deviceLimit: '',
    tokensPurchased: '',
    startDate: '',
    renewalDate: '',
    packageType: '',
    customerName: '',
    subaccountName: 'subaccountNameB',
    customerType: ''
}

const MOCK_UPDATED_LICENSE_D: License = {
    subaccountId: '31d81e5c-a916-470b-aabe-6860f8464211',
    id: '273a38b7-20a1-487e-82fb-8861d96280fe',
    status: 'Inactive',
    deviceLimit: '',
    tokensPurchased: '',
    startDate: '',
    renewalDate: '',
    packageType: '',
    customerName: '',
    subaccountName: 'subaccountNameA',
    customerType: ''
};

const MOCK_LICENSES_LIST = {
    licenses: [
        MOCK_LICENSE_A,
        MOCK_LICENSE_B,
        MOCK_LICENSE_C,
        MOCK_LICENSE_D,
        MOCK_LICENSE_E,
        MOCK_LICENSE_F,
        MOCK_LICENSE_G,
        MOCK_LICENSE_H,
        MOCK_LICENSE_I,
        MOCK_LICENSE_J,
        MOCK_LICENSE_K
    ]
};

const MOCK_FILTERED_ID_LICENSES_LIST = {
    licenses: [
        MOCK_LICENSE_E,
        MOCK_LICENSE_G
    ]
};

const MOCK_FILTERED_NAME_LICENSES_LIST = {
    licenses: [
        MOCK_LICENSE_A,
        MOCK_LICENSE_D,
        MOCK_LICENSE_E,
        MOCK_LICENSE_I,
        MOCK_LICENSE_J,
    ]
};

const MOCK_UNSORTED_STATUS_LICENSES_LIST = {
    licenses: [
        MOCK_LICENSE_A,
        MOCK_LICENSE_E,
        MOCK_LICENSE_B,
        MOCK_LICENSE_G
    ]
}

const MOCK_SORTED_ASC_STATUS_LICENSES_LIST = {
    licenses: [
        MOCK_LICENSE_A,
        MOCK_LICENSE_B,
        MOCK_LICENSE_E,
        MOCK_LICENSE_G
    ]
}

const MOCK_SORTED_DESC_STATUS_LICENSES_LIST = {
    licenses: [
        MOCK_LICENSE_E,
        MOCK_LICENSE_G,
        MOCK_LICENSE_A,
        MOCK_LICENSE_B
    ]
}

const MOCK_DELETED_LICENSE: License = {
    subaccountId: '31d81e5c-a916-470b-aabe-6860f8464211',
    id: '273a38b7-20a1-487e-82fb-8861d96280fe',
    status: 'Active',
    deviceLimit: '',
    tokensPurchased: '',
    startDate: '',
    renewalDate: '',
    packageType: '',
    customerName: '',
    subaccountName: 'subaccountNameA',
    customerType: ''
};

const MOCK_CREATED_LICENSE: License = {
    subaccountId: '2d298a66-5db2-4e25-bdfc-7f052ae4bc63',
    id: '5232b68b-e211-48a8-8ee2-44e505c0961f',
    status: 'Active',
    deviceLimit: "12",
    tokensPurchased: "120",
    startDate: "",
    renewalDate: "",
    packageType: "",
    customerName: "",
    subaccountName: "",
    customerType: ""
};

export const LicenseServiceMock = {
    licensesList: MOCK_LICENSES_LIST,
    filteredSubAccountIdList: MOCK_FILTERED_ID_LICENSES_LIST,
    filteredSubAccountNameList: MOCK_FILTERED_NAME_LICENSES_LIST,
    mockLicenseA: MOCK_LICENSE_A,
    updatedMockLicenseD: MOCK_UPDATED_LICENSE_D,
    mockDeletedLicense: MOCK_DELETED_LICENSE,
    mockNewLicense:MOCK_CREATED_LICENSE,
    unsortedLicensesList: MOCK_UNSORTED_STATUS_LICENSES_LIST,
    sortedAscLicensesList: MOCK_SORTED_ASC_STATUS_LICENSES_LIST,
    sortedDescLicensesList: MOCK_SORTED_DESC_STATUS_LICENSES_LIST,
    getLicenseList: (subaccountId?: string, subaccountName?: string) => {
        return new Observable((observer) => {
            let licenseList;
            if (subaccountId)
                licenseList = {licenses: MOCK_LICENSES_LIST.licenses.filter((license: License) => (license.subaccountId === subaccountId))};
            else if (subaccountName)
                licenseList = {licenses: MOCK_LICENSES_LIST.licenses.filter((license: License) => (license.subaccountName === subaccountName))};
            else
                licenseList = MOCK_LICENSES_LIST;
            observer.next(licenseList);
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    getLicenseById: (id) => {
        return new Observable((observer) => {
            const license = MOCK_LICENSES_LIST.licenses.find((license: License) => (license.id === id));
            observer.next(license);
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    updateLicense: (license) => {
        return new Observable((observer) => {
            observer.next(MOCK_UPDATED_LICENSE_D);
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    deleteLicense: (licenseId) => {
        return new Observable((observer) => {
            const removedLicense = MOCK_LICENSES_LIST.licenses.find((license: License) => license.id === licenseId);
            observer.next(removedLicense);
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    createLicense: (license) =>{
        return new Observable((observer) => {
            observer.next(MOCK_CREATED_LICENSE);
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    }

};
