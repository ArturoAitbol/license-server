export interface Device {
    id: string;
    vendor: string;
    product: string;
    version: string;
    deviceType: string;
    granularity: string;
    tokensToConsume: number;
}