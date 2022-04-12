
export interface CustomerLicense {
    id: string;
    customerAccounts: string;
    customerSubAccounts: string;
    packageType: string;
    startDate: string;
    renewalDate: string;
    status: string;
    action: boolean;
}