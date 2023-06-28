import { Observable, of } from "rxjs";
import { FeatureToggle } from "../../../app/model/feature-toggle.model";

const MOCK_TOGGLES =
    {
        "featureToggles": [
            {
                "author": "ogonzalez@tekvizionlabs.com",
                "name": "ad-customer-user-creation",
                "description": "Customer User Creation",
                "id": "950f47c7-a477-455b-b65b-331ecacc88dd",
                "exceptions": [
                    {
                        "subaccountId": "f5a609c0-8b70-4a10-9dc8-9536bdb5652c",
                        "customerId": "7d133fd2-8228-44ff-9636-1881f58f2dbb",
                        "subaccountName": "Test RealCustomer - 360 Small",
                        "customerName": "Test RealCustomer",
                        "status": false
                    }
                ],
                "status": false
            },
            {
                "name": "notificationFeature",
                "description": "Notification feature",
                "id": "d43815a7-8927-4c8d-a75f-49e080493827",
                "status": false
            },
            {
                "name": "testFT",
                "description": "Test FT",
                "id": "df6f5bc2-2687-49df-8dc0-beff88012235",
                "exceptions": [
                    {
                        "subaccountId": "96234b32-32d3-45a4-af26-4c912c0d6a06",
                        "customerId": "f1b695b5-b7d9-4245-86ca-9a2a9ccbe460",
                        "subaccountName": "Test Subaccount",
                        "customerName": "Test Subaccount",
                        "status": false
                    }
                ],
                "status": true
            }
        ]
    };

export const FeatureToggleMgmtServiceMock = {
    getFeatureToggles: () => {
        return of(MOCK_TOGGLES);
    },
    createFeatureToggle: (featureToggle: FeatureToggle) => {
        return new Observable((observer) => {
            observer.next(void 0);
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    modifyFeatureToggle: (featureToggle: FeatureToggle) => {
        return new Observable((observer) => {
            observer.next(void 0);
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    deleteFeatureToggle: (featureToggleId: string) => {
        return new Observable((observer) => {
            observer.next(void 0);
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    createException: (exception: {featureToggleId: string, subaccountId: string, status: boolean}) => {
        return new Observable((observer) => {
            observer.next(void 0);
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    updateException: (exception: {featureToggleId: string, subaccountId: string, status: boolean}) => {
        return new Observable((observer) => {
            observer.next(void 0);
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    deleteException: (featureToggleId: string, subaccountId: string) => {
        return new Observable((observer) => {
            observer.next(void 0);
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
};
