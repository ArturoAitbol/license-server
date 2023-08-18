import {Observable, Subject, throwError} from 'rxjs';
import { tekVizionServices } from 'src/app/helpers/tekvizion-services';

const TEST_SUBACCOUNT_1 = {
    name: 'TEST SUBACCOUNT 1',
    customerId: '4a095621-5dea-4c68-91dd-705012e92a53',
    id: '11111111-1111-1111-1111-111111111111',
    subaccountAdminEmails: ['testSubaccountAdminEmail1@email.one', 'testSubaccountAdminEmail2@email.two']
};

const TEST_SUBACCOUNT_2 = {
    name: 'Default',
    customerId: 'b566c90f-3671-47e3-b01e-c44684e28f99',
    id: '31d81e5c-a916-470b-aabe-6860f8464211'
};

const TEST_SUBACCOUNT_3 = {
    name: 'Default',
    customerId: '0b1ef03f-98d8-4fa3-8f9f-6b0013ce5848',
    id: 'ac7a78c2-d0b2-4c81-9538-321562d426c7',
    services: tekVizionServices.tekTokenConstumption + ',' + tekVizionServices.SpotLight
};

const SUBACCOUNT_LIST = {
    subaccounts: [
        TEST_SUBACCOUNT_1,
        TEST_SUBACCOUNT_2,
        {
            name: 'Default',
            customerId: 'b8350fc2-93d5-41d3-897e-aa8b0ad54e1c',
            id: 'fae9fa51-845a-439b-a3df-9863fa55e451'
        },
        {
            name: '360 Custom (No Tokens)',
            customerId: 'aa85399d-1ce9-425d-9df7-d6e8a8baaec2',
            id: '24372e49-5f31-4b38-bc3e-fb6a5c371623',
            services: tekVizionServices.tekTokenConstumption + ',' + tekVizionServices.SpotLight
        },
        {
            name: 'Default',
            customerId: '740162ed-3abe-4f89-89ef-452e3c0787e2',
            id: 'd45db408-6ceb-4218-bd36-6355e0e21bfb'
        },
        {
            name: 'testv6',
            customerId: '06f808dd-0ecc-40dd-b98a-c6a1c5dda4fa',
            id: '1e22eb0d-e499-4dbc-8f68-3dff5a42086b'
        },
        {
            name: '360 Custom (No Tokens)',
            customerId: '10382e3e-ab62-475a-ab52-c0bdce40a628',
            id: 'd977656e-049a-4490-ad4c-c3fc9205d50f'
        },
        {
            name: 'Developer Account',
            customerId: '27c7c1a3-c68b-e811-816b-e0071b72c711',
            id: '3819dc98-0e34-4237-ad0f-e79895b887e9'
        },
        {
            name: 'CUBE - 360 Custom (No Tokens)',
            customerId: 'b5ce9ce7-9532-4671-9491-61a234311b70',
            id: '9b9cd5ee-27ae-41e0-976c-db263be8f71f'
        },
        {
            name: 'WebEx Calling - 360 Custom (No Tokens)',
            customerId: 'b5ce9ce7-9532-4671-9491-61a234311b70',
            id: '30249e2b-876c-48f5-a804-b4dc688c2d84'
        },
        {
            name: 'BWKS PSTN - 360 Custom (No Tokens)',
            customerId: 'b5ce9ce7-9532-4671-9491-61a234311b70',
            id: 'b50349c8-0811-4c21-a757-f70597a22990'
        },
        {
            name: 'Default',
            customerId: 'c4716775-bad0-4eee-8f77-e14f878c0320',
            id: 'e8cf8d9a-f842-44ac-9f9e-b1aa61f8386a'
        },
        {
            name: 'Grandstream - 360 Small',
            customerId: '6b5f9f5e-f33e-48a4-9345-f76e2c463550',
            id: 'd9ff3754-5adc-41f0-a23d-21fb33c0323d'
        },
        {
            name: 'IPC - 360 Custom (No Tokens)',
            customerId: 'ce3619a6-7af2-4967-8c7b-dd605939ef60',
            id: 'e17d1ef3-597c-4d17-a208-21b1a612ea5c'
        },
        {
            name: 'IPC - 360 Medium',
            customerId: 'ce3619a6-7af2-4967-8c7b-dd605939ef60',
            id: 'e5e293a7-1cab-4d95-86f0-c758541fd957'
        },
        {
            name: 'ISI - 360 Small',
            customerId: 'e01441a8-6589-4a10-a71e-fa6aeb0a98e3',
            id: 'a9f2c313-7d80-4c1f-bda5-91f2767b3716'
        },
        {
            name: 'Lifesize - 360 Small',
            customerId: 'ae0a4bcb-1a40-445d-9be1-56baaf8e6ae1',
            id: '04dfda26-98f4-42e5-889a-3edccf4b799c'
        },
        {
            name: 'Lumen - 360 Custom (No Tokens)',
            customerId: '368b487c-bdd8-491c-8a1c-00a688a80da5',
            id: '078b980a-96f8-460b-a44d-b7d37fbc858a'
        },
        {
            name: 'Martello - 360 Small',
            customerId: '7d133fd2-8228-44ff-9636-1881f58f2dbb',
            id: 'f5a609c0-8b70-4a10-9dc8-9536bdb5652c'
        },
        {
            name: 'Masergy - 360 Basic',
            customerId: '958b4b42-02de-40a2-ae35-cd343c0a0df5',
            id: '87283654-cb92-4355-ac0d-88dcafc778ad'
        },
        {
            name: 'MetTel - 360 Basic - MSFT Ready',
            customerId: '7d0c7b21-faad-4925-9844-77c06b78b8d6',
            id: '3f87fff9-200c-4f1b-af9e-5ab9ade5e3e3'
        },
        {
            name: 'Neustar - 360 Small',
            customerId: '9b401d46-4e03-4a5f-9729-71adac5bd1a7',
            id: '173c00ea-6e5c-462c-9295-ae5e14adc14f'
        },
        {
            name: 'Nexon - 360 Basic - MSFT Ready',
            customerId: '4d460c28-eeee-402b-9a8c-6be8f86daac8',
            id: '637b5502-cf56-4113-8354-cd7098442f97'
        },
        {
            name: 'NFON - 360 Basic - MSFT Ready',
            customerId: '0ecea4ac-1322-46b0-bc98-1d215c86f5a3',
            id: '845881b4-3584-4ae0-bf8a-0c12f7892095'
        },
        {
            name: 'Nokia - 360 Custom (No Tokens)',
            customerId: '1d7492f7-6626-47c1-9d43-621f2bc820ee',
            id: '485d3fe8-ee5d-41d9-a586-e033d4b95c95'
        },
        {
            name: 'PCCW - 360 Basic - MSFT Ready',
            customerId: '82a5c1f0-cd88-437f-880d-0e22a70edf8c',
            id: 'a6278e6c-8e45-421f-97f0-de60fce06608'
        },
        {
            name: 'Peerless - 360 Basic - MSFT Ready',
            customerId: '8a5ece98-41ca-433f-bd8c-4f5f7c253707',
            id: '48a8f94a-35ab-461c-9e8e-585692f087f5'
        },
        {
            name: 'Poly - 360 Medium',
            customerId: '7ebd6e00-a59a-4704-858c-d889cb698761',
            id: '9599c5bd-f702-4965-b655-29b0fed00e23'
        },
        {
            name: 'Poly - 360 Basic',
            customerId: '7ebd6e00-a59a-4704-858c-d889cb698761',
            id: '82e579e9-4444-46c9-aaf7-5b365c92524a'
        },
        {
            name: 'Ribbon - 360 Small',
            customerId: '875f3b42-1e49-412b-9c68-014b1294ee2d',
            id: 'cae19a1a-c9b5-4a55-8cdd-811dfea3770c'
        },
        {
            name: 'Tele2 - 360 Basic - MSFT Ready',
            customerId: 'd74b9e6f-63f2-456f-ab1c-3d993c93161c',
            id: '0454e724-f26f-4b64-a757-7d99a02f6464'
        },
        {
            name: 'T-Mobil / Sprint - 360 Custom (No Tokens)',
            customerId: '20a00e47-464f-4ff3-ba01-5269170d38ac',
            id: '241234a3-f182-4eb9-ae04-6e802f3db04f'
        },
        {
            name: 'VodafoneZiggo - 360 Large',
            customerId: '07c35ff3-f418-41f7-918a-f90c18052baa',
            id: '01442bce-d452-4742-bcb5-27b93a44314f'
        },
        {
            name: 'Unit Test - 360 Small - Old Token Model',
            customerId: '821f079f-be9f-4b11-b364-4f9652c581ce',
            id: '565e134e-62ef-4820-b077-2d8a6f628702'
        },
        {
            name: 'kaushik',
            customerId: '467aee0e-0cc8-4822-9789-fc90acea0a04',
            id: 'c428b1f2-0322-4686-a5cf-66eb4e74a0f5'
        },
        {
            name: '360 Small',
            customerId: '79f4f8b5-d9e9-e611-8101-3863bb3c7738',
            id: '9e6d1769-5f32-461d-a557-8fb9a499757b'
        },
        {
            name: 'Bell Canada - 360 Small',
            customerId: '054ff4d5-efee-4987-8695-30e1d2cbd070',
            id: '99ffe734-dccc-4020-b6b2-cc48216bdcca'
        },
        {
            name: 'BT - 360 Small - Old Token Model',
            customerId: '7749f42c-8c75-4c5e-b0c1-d937dae7c009',
            id: 'e8fc6a86-884f-4cfe-b220-73b4e5e97577'
        },
        {
            name: 'Charter - 360 Medium - Old Token Model',
            customerId: '926cc793-3526-4879-8966-3aa55ffb724f',
            id: '67e0b7a0-523f-439e-898a-3ed9c2f941f0'
        },
        {
            name: 'IR - 360 Medium',
            customerId: '19dd9b4b-a1f0-4f29-b9c3-37de53f57ff5',
            id: '66eb20c9-e65c-4aa6-b20f-eb42de96a0f5'
        },
        {
            name: 'EvolveIP - 360 Small - MSFT Ready',
            customerId: '8123b86f-7147-411c-b2ba-5967f75ce913',
            id: 'a8c40b4c-6eaf-4efd-bfd9-fa73bac4b2f2'
        },
        {
            name: 'EPOS - 360 Basic',
            customerId: '7a0d26a4-93c5-4c4d-b1f6-5574ea13a5ff',
            id: '37d5b2a8-63ac-4112-85ed-a2a2256fb4ba'
        },
        {
            name: 'Cox - 360 Medium',
            customerId: '91d70b2f-d201-4177-8704-2a03a37d2e46',
            id: '86ed6072-069c-4712-92d7-a258e354b798'
        },
        {
            name: 'Consolidated - 360 Small',
            customerId: '7ef34527-4b22-47e5-ae82-ec75aef3fb75',
            id: '22cc6133-6888-45ce-89ee-71f8571208a0'
        },
        {
            name: 'Cloud9 - 360 Small',
            customerId: 'aed14150-7807-425e-b858-50e1b5f15e9e',
            id: '0d916dcc-515f-47b5-b8c3-4f7884d274f5'
        },
        {
            name: 'Kandy - 360 Small',
            customerId: '38e2e282-c33d-4fa6-991a-38dcbb7eb080',
            id: 'ca0338ac-4ebc-4108-a92a-b1d253e05b31'
        },
        {
            name: 'Avaya - 360 Custom (With Tokens)',
            customerId: '371c89cd-5ac2-4118-86c8-f5c15fa28358',
            id: '8d81e306-bbdb-409f-b0e8-0ece1bc489ee'
        },
        {
            name: 'Avaya - 360 Small',
            customerId: '371c89cd-5ac2-4118-86c8-f5c15fa28358',
            id: '0f49e2e2-546e-4acf-a051-f5fcac1a3ae0'
        },
        {
            name: 'AudioCodes - 360 Small',
            customerId: 'fdadbc12-268e-4aa9-bfb8-1fe3d093cebc',
            id: '0aefbe26-e929-4a04-922e-0aee390c0d89'
        },
        {
            name: 'Alianza - 360 Small',
            customerId: '3bd6ed9a-8b7b-4946-87b5-1cd9f51cc1c1',
            id: '3242e5b8-7a7f-4050-9b50-eadaa7bcd048'
        },
        {
            name: 'Mutare - 360 Small',
            customerId: '64434b64-0f13-41a8-8c03-9ecd723e0d12',
            id: '3e3eb864-689d-40a6-816e-340a8def68dd'
        },
        {
            name: 'CBTS - 360 Basic - MSFT Ready',
            customerId: '55bfa01c-b790-473f-8c24-960f251912b9',
            id: '1730bb3f-1f13-4401-a366-a5dccdd620e0'
        },
        {
            name: 'Testsub',
            customerId: 'c4716775-bad0-4eee-8f77-e14f878c0320',
            id: '5f1fa1f7-92e3-4c92-b18b-d30f26ef4f73'
        },
        TEST_SUBACCOUNT_3,
        {
            name: 'Bigger Better 360 Small',
            customerId: '79f4f8b5-d9e9-e611-8101-3863bb3c7738',
            id: 'b01c05c7-dfec-400d-be57-505b0bcd7de4'
        },
        {
            name: 'testxx',
            customerId: '157fdef0-c28e-4764-9023-75c06daad09d',
            id: '0cde8c0e-9eab-4fa9-9dda-a38c0c514b3a'
        },
        {
            name: 'Default',
            customerId: '5cc24582-343c-4687-9af8-be25859afe45',
            id: '83dbbb1d-2bdc-484d-8c51-4f290e4e3002'
        },
        {
            name: 'Default',
            customerId: '0856df81-8d32-4adb-941a-c0d9187f36a7',
            id: '069dc3aa-dcb1-45e6-886f-be8f2345080f'
        },
        {
            name: 'Default',
            customerId: '467aee0e-0cc8-4822-9789-fc90acea0a04',
            id: '0364be93-447e-4fae-91b1-7278bbf63574'
        },
        {
            name: 'testv3Sub',
            customerId: '467aee0e-0cc8-4822-9789-fc90acea0a04',
            id: '89ef7e6a-367f-48c8-b69e-c52bf16a4e05'
        },
        {
            name: 'testDemo',
            customerId: '26898de8-7305-471f-9f11-01ca725ac20b',
            id: '53c19602-bbb4-49da-a277-0d29dcc1538d'
        },
        {
            name: 'testCustomerDemo2',
            customerId: '26898de8-7305-471f-9f11-01ca725ac20b',
            id: '1dfb59b1-62ec-4575-8ebc-8f31948d64f8'
        },
        {
            name: 'Default',
            customerId: '0ed27fc6-16f7-441e-9a2c-93e6eb5a7d10',
            id: '30ab21cd-61ae-4439-a532-84487b061bbd'
        },
        {
            name: 'Default',
            customerId: 'c30ba7a8-03bf-45d2-a795-b739acb469f8',
            id: '8078a836-66aa-4a51-b5db-5b2c008e55aa'
        },
        {
            name: 'testDemoR',
            customerId: '24f63557-5a4e-46ae-8ef7-d5c0b1767a8a',
            id: '6b06ef8d-5eb6-44c3-bf61-e78f8644767e'
        },
        {
            name: 'testcust',
            customerId: 'bc632667-705f-441c-9317-5323d906dc73',
            id: 'eea5f3b8-37eb-41fe-adad-5f94da124a5a'
        }
    ]
};
const ERROR_MSG = 'Expected subaccount response error';
const subaccountData =  new Subject<any>()

export const SubaccountServiceMock = {
    subaccountData: subaccountData,
    subAccountListValue: SUBACCOUNT_LIST,
    testSubaccount1: TEST_SUBACCOUNT_1,
    testSubaccount2: TEST_SUBACCOUNT_2,
    testSubaccount3: TEST_SUBACCOUNT_3,
    getSubAccountList: () => {
        return new Observable( (observer) => {
            observer.next(
                JSON.parse(JSON.stringify(SUBACCOUNT_LIST))
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    getSubAccountDetails: (subAccountId?: string) => {
        return new Observable( (observer) => {
            observer.next(
                JSON.parse(JSON.stringify({
                    subaccounts: [ SUBACCOUNT_LIST.subaccounts.find( (subAccount) => subAccount.id === subAccountId ) ]
                }))
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    deleteSubAccount: (subAccountId: string) => {
        return new Observable((observer) => {
            observer.next({ res: {} });
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    createSubAccount: (details: any) => {
        return new Observable((observer) => {
            observer.next({ res: {} });
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    createSubAccountWithError: () => {
        return new Observable((observer) => {
            observer.next({
                error: 'Expected create subaccount error'
            });
            observer.complete();
            return {
                unsubscribe() {}
            };
        });
    },
    errorResponse: () => {
        return throwError({
            error: 'Expected subaccount response error'
        });
    },
    updateSubAccount: (subaccount: any) => {
        return new Observable((observer) => {
            observer.next();
            observer.complete();
            return {
                unsubscribe() {}
            };
        });
    },
    getSelectedSubAccount: () => {
        return {
            id: "fbb2d912-b202-432d-8c07-dce0dad51f7f",
            name: "testv2Demo",
            customerId: "157fdef0-c28e-4764-9023-75c06daad09d",
            services: "tokenConsumption,spotlight",
            testCustomer: false,
            companyName:"testComp",
            customerName: "testName"
        }
    },
    setSelectedSubAccount: () => {
        subaccountData.next({
            id: "fbb2d912-b202-432d-8c07-dce0dad51f7f",
            name: "testv2Demo",
            customerId: "157fdef0-c28e-4764-9023-75c06daad09d",
            services: "tokenConsumption,spotlight",
            testCustomer: false,
            companyName:"testComp",
            customerName: "testName"
        })
    },
    getSubaccountUserProfileDetails: () => {
        return {
            subaccountId: "2c8e386b-d1bd-48b3-b73a-12bfa5d00805",
            phoneNumber: "+1111111111",
            jobTitle: "Subaccount Admin",
            companyName: "TekVizion",
            name: "Subaccount Admin",
            email: "test-customer-subaccount-admin@tekvizionlabs.com"
        }
    }
};
