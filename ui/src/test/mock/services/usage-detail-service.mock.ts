import { Observable } from "rxjs";

export const usageDetailServiceMock = {
    getUsageDetailsByConsumptionId: () => {
        return new Observable((observer) => {
            observer.next(
                {
                    usageDays: [
                        {
                            consumptionId: "bc12f1d1-8cf0-4d20-af81-fc11c12bf152",
                            dayOfWeek: 0,
                            id: "012e75a4-2f66-457c-a2ad-820953e2587b",
                            macAddress: "",
                            modifiedBy: "pfernandez@tekvizionlabs.com",
                            serialNumber: "",
                            usageDate: "2022-08-21"
                        }
                    ]
                }
            );
            observer.complete();
            return {
                unsubscribe() {}
            };
        });
    },
    createUsageDetails: () => {
        return new Observable((observer) => {
            observer.next(
                {
                  
                }
            );
            observer.complete();
            return {
                unsubscribe() {}
            };
        });
    }
}
