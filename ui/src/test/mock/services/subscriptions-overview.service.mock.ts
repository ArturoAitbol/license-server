import { Observable } from "rxjs";
const SUBSCRIPTIONS_LIST = {
    subscriptions: [
        {
            "subaccountId": "6fe7d952-13cd-4b5d-90bd-6dce6c2ed475",
            "licenseRenewalDate": "2023-02-02",
            "licenseTokens": 150,
            "licenseDescription": "test",
            "licenseStatus": "Active",
            "licenseStartDate": "2022-10-10",
            "customerId": "0ec98484-2215-ea11-a811-000d3a31cd00",
            "licensePackageType": "Small",
            "subaccountName": "Test Sub",
            "licenseId": "71dd76db-615f-4173-83cf-a12603c560de",
            "licenseTokensConsumed": 0,
            "customerName": "Test Customer"
        },
        {
            "subaccountId": "31d81e5c-a916-470b-aabe-6860f8464211",
            "licenseRenewalDate": "2022-07-26",
            "licenseTokens": 500,
            "licenseDescription": "License description",
            "licenseStatus": "Expired",
            "licenseStartDate": "2022-07-10",
            "customerId": "467aee0e-0cc8-4822-9789-fc90acea0a04",
            "licensePackageType": "Large",
            "subaccountName": "Test Sub 2",
            "licenseId": "31b92e5c-b811-460b-ccbe-6860f8464233",
            "licenseTokensConsumed": 0,
            "customerName": "Test Customer 2"
        },
        {
            "subaccountId": "966b6161-e28d-497b-8244-e3880b142584",
            "licenseTokens": 0,
            "customerId": "b062d227-5b26-4343-920a-9f3693d47c8a",
            "subaccountName": "Test Sub 3",
            "licenseTokensConsumed": 0,
            "customerName": "Test Customer 3",
        },
        {
            "licenseTokens": 0,
            "customerId": "b062d227-5b26-4343-930a-9f3693d47c8a",
            "licenseTokensConsumed": 0,
            "customerName": "Test Customer 4",
        },
    ]
};

export const SubscriptionsOverviewServiceMock = {
    subscriptionOverview: SUBSCRIPTIONS_LIST,
    getSubscriptionsList: () => {
        return new Observable((observer) => {
            observer.next(
                JSON.parse(JSON.stringify(SUBSCRIPTIONS_LIST))
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
};
