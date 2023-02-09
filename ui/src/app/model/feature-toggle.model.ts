export interface FeatureToggle {
    name: string;
    description: string;
    id: string;
    status: boolean;
    exceptions?: { subaccountId: string, subaccountName: string, customerName: string, status: boolean }[];
}
