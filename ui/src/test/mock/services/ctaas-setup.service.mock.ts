import {Observable, throwError} from 'rxjs';
import { tekVizionServices } from 'src/app/helpers/tekvizion-services';

const TEST_SETUP_1 = {
    azureResourceGroup: 'az-tap',
    id: 'd973456e-049a-4490-ad4c-c3fc9205d50f',
    onBoardingComplete: true,
    status: 'SETUP_READY',
    subaccountId: 'fc7a78c2-d0b2-4c81-9538-321562d426c7',
    tapUrl: 'www.taptekvizion.com',
    supportEmails:["test@example.com","test-2@example.com"]
};
const TEST_SETUP_2 = {   
    azureResourceGroup: 'ab-tap',
    id: 'd977656e-049a-4490-ad4c-c3fc9205d50f',
    onBoardingComplete: true,
    status: 'SETUP_READY',
    subaccountId: 'ac7a78c2-d0b2-4c81-9538-321562d426f7',
    tapUrl: 'www.taptekvizion.com',
    supportEmails:["test@example.com","test-2@example.com"]
};
const TEST_SETUP_3 ={   
    azureResourceGroup: 'aa-tap',
    id: '1e22eb0d-e499-4dbc-8f68-3dff5a42086b',
    onBoardingComplete: true,
    status: 'SETUP_INPROGRESS',
    subaccountId: 'ac7a78c2-d0b2-4c81-9538-321562d426c7',
    tapUrl: 'www.taptekvizion.com',
    supportEmails:["test@example.com","test-2@example.com"]
};
const TEST_SETUP_4 ={   
    azureResourceGroup: 'aa-tap',
    id: '1e22eb0d-e499-4dbc-8f68-3dff5a42086b',
    onBoardingComplete: true,
    status: 'SETUP_READY',
    subaccountId: '11111111-1111-1111-1111-111111111111',
    tapUrl: 'www.taptekvizion.com',
    supportEmails:["test@example.com","test-2@example.com"]
};
const TEST_SETUP_5 ={   
    azureResourceGroup: 'ad-tap',
    id: '1e22eb0d-e499-4dbc-8f68-3dff5a42086b',
    onBoardingComplete: false,
    status: 'SETUP_INPROGRESS',
    subaccountId: 'fbb2d912-b202-432d-8c07-dce0dad51f7f',
    tapUrl: 'www.taptekvizion.com',
    supportEmails:["test@example.com","test-2@example.com"]
};

const TEST_SETUP_MAINTENANCE = {
    azureResourceGroup: 'az-tap',
    id: 'd973456e-049a-4490-ad4c-c3fc9205d50f',
    onBoardingComplete: true,
    status: 'SETUP_READY',
    subaccountId: 'fc7a78c2-d0b2-4c81-9538-321562d426c7',
    tapUrl: 'www.taptekvizion.com',
    supportEmails:["test@example.com","test-2@example.com"],
    maintenance: true
};

const CTAAS_SETUP_LIST = {
    setups: [
        TEST_SETUP_1,
        TEST_SETUP_2,
        TEST_SETUP_3, 
        TEST_SETUP_4,
        TEST_SETUP_5
    ]
}
const ERROR_MSG = 'Expected setupDetails response error';

export const CtaasSetupServiceMock = {
    usersListValue: CTAAS_SETUP_LIST,
    testSetup1: TEST_SETUP_1,
    testSetup2: TEST_SETUP_5,
    testSetupMaintenance: TEST_SETUP_MAINTENANCE,

    getSubaccountCtaasSetupDetails: (id) => {
        return new Observable( (observer) => {
            observer.next(
                {
                    ctaasSetups: CTAAS_SETUP_LIST.setups.filter((e) => e.subaccountId === id)
                }
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },

    updateCtaasSetupDetailsById: (id) => {
        return new Observable((observer) => {
            observer.next(()=>{
                const updateSetup = CTAAS_SETUP_LIST.setups.find(user =>
                user.subaccountId === id);
                updateSetup.status = 'SETUP_READY';
            });
            observer.complete();
            return {
                unsubscribe() {}
            };
        });
    },

    updateSubaccountCtaasDetails: (onBoardingComplete: boolean, ctaasSetupId: string) => {
        return new Observable((observer) => {
            observer.next(()=>{
                const updateSetup = CTAAS_SETUP_LIST.setups.find(user =>
                user.id === ctaasSetupId);
                updateSetup.status = 'SETUP_READY';
            });
            observer.complete();
            return {
                unsubscribe() {}
            };
        });
    }

};
