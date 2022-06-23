export interface Device {
    id: string;
    vendor: string;
    product: string;
    version: string;
    type: string;
    granularity: string;
    tokensToConsume: number;
    deprecatedDate: string;
    startDate: Date;
    subaccountId: string;
    supportType: boolean;
}