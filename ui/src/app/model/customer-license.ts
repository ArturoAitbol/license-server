
export interface CustomerLicense {
    id: string;
    customerAccounts: string;
    customerSubAccounts: string;
    subscriptionType: string;
    startDate: string;
    renewalDate: string;
    status: string;
    action: boolean;
}