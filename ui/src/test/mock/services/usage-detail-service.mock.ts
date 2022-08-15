import { Observable } from "rxjs"

const USAGE_DETAIL_LIST = {
    modifiedBy: "user@tekvizionlabs.com",
    usageDays: [
        {
            consumptionId: "483b7876-9be9-4bfa-b097-275bea5ac9a0",
            dayOfWeek: 4,
            id: "2c06c971-0074-4c43-b113-5c3e2c393c38",
            macAddress: "",
            modifiedBy: "user@tekvizionlabs.com",
            serialNumber: "",
            usageDate: "2024-02-05",
        },
        {
            consumptionId: "483b7876-9be9-4bfa-b097-275bea5ac9a0",
            dayOfWeek: 5,
            id: "a6a2ffae-61a6-4094-b26a-6efb959957fc",
            macAddress: "",
            modifiedBy: "user@tekvizionlabs.com",
            serialNumber: "",
            usageDate: "2024-02-06",
        }
    ]
};

export const UsageDetailServiceMock = {
    usageDetails: USAGE_DETAIL_LIST,
    getUsageDetailsByConsumptionId : (consumptionId: string)=>{
        return new Observable( (observer) => {
            observer.next({...USAGE_DETAIL_LIST});
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    deleteUsageDetails : (data: any)=>{
        return new Observable( (observer) => {
            observer.next();
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    }
}