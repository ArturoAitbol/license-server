import { Observable } from "rxjs";

const DEVICE_LIST = {
    devices: [
        {
            supportType: true,
            product: "HylaFAX Enterprise",
            vendor: "HylaFAX",
            granularity: "static",
            id: "001ee852-4ab5-4642-85e1-58f5a477fbb3",
            version: "6.2",
            tokensToConsume: 0
        },
        {
            supportType: true,
            product: "Multitech FAX Finder IP FAX server",
            vendor: "Multitech",
            granularity: "static",
            id: "936662a7-febd-4cbf-bc58-477e5d5a9d10",
            version: "5.0",
            tokensToConsume: 0
        },
    ]
}

export const DevicesServiceMock = {
    devicesListValue: DEVICE_LIST,
    getDevicesList: () =>{
        return new Observable((observer) => {
            observer.next(
                DEVICE_LIST
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    }
}
