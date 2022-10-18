import {Observable, throwError} from 'rxjs';
import { tekVizionServices } from 'src/app/helpers/tekvizion-services';

const TEST_SETUP_1 = {
    azureResourceGroup: 'az-tap',
    id: 'd973456e-049a-4490-ad4c-c3fc9205d50f',
    onBoardingComplete: true,
    powerBiReportId: '287846f9-d707-4fc9-bbbe-f11db4de53bb',
    powerBiWorkspaceId: '3036896b-185c-4480-8574-858845b48675',
    status: 'IN PROGRESS',
    subaccountId: 'bedc06f7-4689-48c0-87e4-3c1ca0dbad4b',
    tapUrl: 'www.taptekvizion.com',
};

const CTAAS_SETUP_LIST = [
        TEST_SETUP_1,
        {   
            azureResourceGroup: 'ab-tap',
            id: 'd977656e-049a-4490-ad4c-c3fc9205d50f',
            onBoardingComplete: true,
            powerBiReportId: '237846f9-d707-4fc9-bbbe-f11db4de53bb',
            powerBiWorkspaceId: '3026896b-185c-4480-8574-858845b48675',
            status: 'IN PROGRESS',
            tapUrl: 'www.taptekvizion.com',
        },
        {   
            azureResourceGroup: 'ac-tap',
            id: '3819dc98-0e34-4237-ad0f-e79895b887e9',
            onBoardingComplete: true,
            powerBiReportId: 'fae9fa51-845a-439b-a3df-9863fa55e451',
            powerBiWorkspaceId: 'b8350fc2-93d5-41d3-897e-aa8b0ad54e1c',
            status: 'READY',
            tapUrl: 'www.taptekvizion.com',
        },
        {   
            azureResourceGroup: 'aa-tap',
            id: '1e22eb0d-e499-4dbc-8f68-3dff5a42086b',
            onBoardingComplete: true,
            powerBiReportId: '24372e49-5f31-4b38-bc3e-fb6a5c371623',
            powerBiWorkspaceId: 'aa85399d-1ce9-425d-9df7-d6e8a8baaec2',
            status: 'IN PROGRESS',
            tapUrl: 'www.taptekvizion.com',
        }
        
    ];
const ERROR_MSG = 'Expected setupDetails response error';

export const CtaasSetupServiceMock = {
    usersListValue: CTAAS_SETUP_LIST,
    testuser1: TEST_SETUP_1,

    getSubaccountCtaasSetupDetails: () => {
        return new Observable( (observer) => {
            observer.next(
                {
                    ctaasSetups: [CTAAS_SETUP_LIST[0]]
                }
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },

    updateCtaasSetupDetailsById: () => {
        return new Observable((setupDetails) => {
            setupDetails.next(()=>{
                const updateSetup = CTAAS_SETUP_LIST.find(user =>
                user.azureResourceGroup === 'd973456e-049a-4490-ad4c-c3fc9205d50f');
                updateSetup.status = 'READY';
            });
            setupDetails.complete();
            return {
                unsubscribe() {}
            };
        });
    }
};
