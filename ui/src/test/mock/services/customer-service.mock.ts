import {Observable, throwError} from 'rxjs';
import { Customer } from 'src/app/model/customer.model';

const CUSTOMER_LIST = {
    customers: [
        {
            customerType: 'MSP',
            testCustomer: true,
            name: 'TestV3',
            id: '467aee0e-0cc8-4822-9789-fc90acea0a04'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Amazon',
            id: 'aa85399d-1ce9-425d-9df7-d6e8a8baaec2'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'BNSF',
            id: '10382e3e-ab62-475a-ab52-c0bdce40a628'
        },
        {
            customerType: 'Reseller',
            testCustomer: true,
            name: 'new test customer s',
            id: '5cc24582-343c-4687-9af8-be25859afe45'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Cisco',
            id: 'b5ce9ce7-9532-4671-9491-61a234311b70'
        },
        {
            customerType: 'MSP',
            testCustomer: true,
            name: 'Delete test customer',
            id: '0856df81-8d32-4adb-941a-c0d9187f36a7'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Crestron',
            id: 'c4716775-bad0-4eee-8f77-e14f878c0320'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Grandstream',
            id: '6b5f9f5e-f33e-48a4-9345-f76e2c463550'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'IPC',
            id: 'ce3619a6-7af2-4967-8c7b-dd605939ef60'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'ISI',
            id: 'e01441a8-6589-4a10-a71e-fa6aeb0a98e3'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Lifesize',
            id: 'ae0a4bcb-1a40-445d-9be1-56baaf8e6ae1'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Lumen',
            id: '368b487c-bdd8-491c-8a1c-00a688a80da5'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Martello',
            id: '7d133fd2-8228-44ff-9636-1881f58f2dbb'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Masergy',
            id: '958b4b42-02de-40a2-ae35-cd343c0a0df5'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'MetTel',
            id: '7d0c7b21-faad-4925-9844-77c06b78b8d6'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Neustar',
            id: '9b401d46-4e03-4a5f-9729-71adac5bd1a7'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Nexon',
            id: '4d460c28-eeee-402b-9a8c-6be8f86daac8'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'NFON',
            id: '0ecea4ac-1322-46b0-bc98-1d215c86f5a3'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Nokia Siemens Networks',
            id: '1d7492f7-6626-47c1-9d43-621f2bc820ee'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'PCCW',
            id: '82a5c1f0-cd88-437f-880d-0e22a70edf8c'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Peerless',
            id: '8a5ece98-41ca-433f-bd8c-4f5f7c253707'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Poly',
            id: '7ebd6e00-a59a-4704-858c-d889cb698761'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Ribbon',
            id: '875f3b42-1e49-412b-9c68-014b1294ee2d'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Tele2',
            id: 'd74b9e6f-63f2-456f-ab1c-3d993c93161c'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'T-Mobile / Sprint',
            id: '20a00e47-464f-4ff3-ba01-5269170d38ac'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'VodafoneZiggo',
            id: '07c35ff3-f418-41f7-918a-f90c18052baa'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Unit Test',
            id: '821f079f-be9f-4b11-b364-4f9652c581ce'
        },
        {
            customerType: 'Reseller',
            testCustomer: true,
            name: 'Customer Test S',
            id: '19660f52-4f35-489d-ae44-80161cbb7bd4'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Bell Canada',
            id: '054ff4d5-efee-4987-8695-30e1d2cbd070'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'British Telecom',
            id: '7749f42c-8c75-4c5e-b0c1-d937dae7c009'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Charter',
            id: '926cc793-3526-4879-8966-3aa55ffb724f'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Integrated Research (IR)',
            id: '19dd9b4b-a1f0-4f29-b9c3-37de53f57ff5'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'EvolveIP',
            id: '8123b86f-7147-411c-b2ba-5967f75ce913'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'EPOS Group A/S',
            id: '7a0d26a4-93c5-4c4d-b1f6-5574ea13a5ff'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Cox Communications',
            id: '91d70b2f-d201-4177-8704-2a03a37d2e46'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Consolidated',
            id: '7ef34527-4b22-47e5-ae82-ec75aef3fb75'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Cloud9 Technologies',
            id: 'aed14150-7807-425e-b858-50e1b5f15e9e'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'AVCtechnologies (Kandy)',
            id: '38e2e282-c33d-4fa6-991a-38dcbb7eb080'
        },
        {
            customerType: 'MSP',
            testCustomer: true,
            name: 'Customer S new',
            id: 'f3959479-8ad1-4847-9d4b-77eae2d1e58c'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Avaya',
            id: '371c89cd-5ac2-4118-86c8-f5c15fa28358'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'AudioCodes',
            id: 'fdadbc12-268e-4aa9-bfb8-1fe3d093cebc'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Alianza',
            id: '3bd6ed9a-8b7b-4946-87b5-1cd9f51cc1c1'
        },
        {
            customerType: 'MSP',
            testCustomer: true,
            name: 'testCustomerDemo',
            id: '26898de8-7305-471f-9f11-01ca725ac20b'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Mutare',
            id: '64434b64-0f13-41a8-8c03-9ecd723e0d12'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'CBTS',
            id: '55bfa01c-b790-473f-8c24-960f251912b9'
        },
        {
            customerType: 'MSP',
            testCustomer: true,
            name: 'Test Customer',
            id: '0b1ef03f-98d8-4fa3-8f9f-6b0013ce5848'
        },
        {
            customerType: 'MSP',
            testCustomer: true,
            name: 'Rodrigo Test',
            id: '740162ed-3abe-4f89-89ef-452e3c0787e2'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'testdemo',
            id: '24f63557-5a4e-46ae-8ef7-d5c0b1767a8a'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Logitech',
            id: '4a095621-5dea-4c68-91dd-705012e92a53'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'TestCustomer',
            id: 'bc632667-705f-441c-9317-5323d906dc73'
        },
        {
            customerType: 'MSP',
            testCustomer: false,
            name: 'test-0019',
            id: 'b8350fc2-93d5-41d3-897e-aa8b0ad54e1c'
        },
        {
            customerType: 'MSP',
            testCustomer: true,
            name: 'Access4',
            id: '79f4f8b5-d9e9-e611-8101-3863bb3c7738'
        },
        {
            customerType: 'MSP',
            testCustomer: true,
            name: '2Degrees',
            id: '58223065-c200-4f6b-be1a-1579b4eb4971'
        },
        {
            customerType: 'MSP',
            testCustomer: true,
            name: 'Developer Account',
            id: '27c7c1a3-c68b-e811-816b-e0071b72c711'
        },
        {
            customerType: 'MSP',
            testCustomer: true,
            name: 'Test Customer v1',
            id: '4862fa5a-d8da-49f5-800a-b72ea0ae2d95'
        },
        {
            customerType: 'MSP',
            testCustomer: true,
            name: 'testV2',
            id: '157fdef0-c28e-4764-9023-75c06daad09d'
        },

    ]
};

const MOCK_UPDATED_CUSTOMER = {
    customerType: 'Reseller',
    testCustomer: true,
    name: 'new test customer s updated',
    id: '19660f52-4f35-489d-ae44-80161cbb7bd4',
    subaccountName:"Default",
    subaccountId:"ac7a78c2-d0b2-4c81-9538-321562d426c7",
    adminEmails: ['adminEmail@unit-test.com'],
    status:"Active",
};

const SELECTED_CUSTOMER = {
    customerType:"MSP",
    testCustomer:true,
    name:"Test Customer",
    id:"0b1ef03f-98d8-4fa3-8f9f-6b0013ce5848",
    subaccountName:"Default",
    subaccountId:"ac7a78c2-d0b2-4c81-9538-321562d426c7",
    status:"Active",
    adminEmails: ['adminEmail@unit-test.com']
}

const REAL_CUSTOMER = {
    customerType:"MSP",
    testCustomer:false,
    name: 'Amazon',
    id: 'aa85399d-1ce9-425d-9df7-d6e8a8baaec2',
    subaccountName:"360 Custom (No Tokens)",
    subaccountId:"24372e49-5f31-4b38-bc3e-fb6a5c371623",
    status:"Active",
    adminEmails: ['adminEmail@unit-test.com']
}

const EMAIL_CUSTOMER = {
    customerType:"MSP",
    testCustomer:true,
    name:"Test Customer",
    id:"0b1ef03f-98d8-4fa3-8f9f-6b0013ce5848",
    subaccountName:"Default",
    subaccountId:"ac7a78c2-d0b2-4c81-9538-321562d426c7",
    adminEmails:["email@email.com"],
    status:"Active"
}

const CUSTOMER_ADMIN_EMAIL ={
    customerAdminEmail: "test@email.com", 
    customerId: "0b1ef03f-98d8-4fa3-8f9f-6b0013ce5848"
}

const CUSTOMER_WITH_EMAILS_LIST = {
    customers: [
        MOCK_UPDATED_CUSTOMER,SELECTED_CUSTOMER,REAL_CUSTOMER,EMAIL_CUSTOMER

    ]
};
const MOCK_ADMINEMAILS_CREATED= {};
export const CustomerServiceMock = {
    customerListValue: CUSTOMER_LIST,
    selectedCustomer: SELECTED_CUSTOMER,
    realCustomer:REAL_CUSTOMER,
    updatedMockCustomer: MOCK_UPDATED_CUSTOMER,
    emailCustomer: EMAIL_CUSTOMER,
    customerAdminEmail: CUSTOMER_ADMIN_EMAIL,
    mockNewAdminEmails:MOCK_ADMINEMAILS_CREATED,
    getCustomerList: () => {
        return new Observable((observer) => {
            observer.next(
                CUSTOMER_LIST
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    deleteCustomer (customerId: string) {
        return new Observable((observer) => {
            observer.next(this.expectedResponse);
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    setSelectedCustomer: () => {

    },
    getCustomerById: (customerId?: string) => {
        return new Observable((observer) => {
            let customer = EMAIL_CUSTOMER;
            if(customerId)
                customer = CUSTOMER_WITH_EMAILS_LIST.customers.find((customer) => (customer.id === customerId));
            observer.next({customers:[customer]});
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },

    updateCustomer: (customer: any) => {
        return new Observable((observer) => {
            observer.next(MOCK_UPDATED_CUSTOMER);
            observer.complete();
            return {
                unsubscribe() {}
            };
        });
    },
    getSelectedCustomer: () => {
        return SELECTED_CUSTOMER;
    },
    getEmailList: () => {
        return EMAIL_CUSTOMER.adminEmails;
    },
    createAdminEmail: (data) =>{
        return new Observable((observer) => {
            observer.next(MOCK_ADMINEMAILS_CREATED);
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    createCustomer: (customer: Customer) => {
        return new Observable((observer) => {
            observer.next({
                id: '12341234-1234-1234-1234-123412341234'
            });
            observer.complete();
            return {
                unsubscribe() {}
            };
        });
    },
    createCustomerWithError: () => {
        return new Observable((observer) => {
            observer.next({
                error: 'Expected create customer error'
            });
            observer.complete();
            return {
                unsubscribe() {}
            };
        });
    },
    errorResponse: () => {
        return throwError({
            error: 'Expected customer response error'
        });
    }
}

