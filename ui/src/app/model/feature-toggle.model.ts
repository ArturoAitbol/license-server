export interface FeatureToggle {
    name: string;
    description: string;
    id?: string;
    status: boolean;
    author?: string;
    exceptions?: { subaccountId: string, subaccountName: string, customerName: string, customerId: string, status: boolean }[];
}
