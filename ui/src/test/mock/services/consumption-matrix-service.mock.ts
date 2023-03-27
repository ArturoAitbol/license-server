import { Observable } from "rxjs";
import { IConsumptionMatrixEntry } from "../../../app/model/consumption-matrix-entry.model";

const CONSUMPTION_MATRIX_AS_LIST = {
    "consumptionMatrix": [
        {
            "tokens": "2",
            "id": "89eeb522-157f-4125-96e6-b4cc900fa9d1",
            "dutType": "Device/Phone/ATA",
            "callingPlatform": "CCaaS"
        },
        {
            "tokens": "2",
            "id": "5798ecd9-6db9-43a6-a521-b21f065e7879",
            "dutType": "Device/Phone/ATA",
            "callingPlatform": "CPaaS"
        },
        {
            "updatedBy": "rvasquez@tekvizionlabs.com",
            "tokens": "",
            "id": "eea27aa4-f2b7-455a-a8ea-af85ee6ac25e",
            "dutType": "SBC",
            "callingPlatform": "PBX"
        },
        {
            "tokens": "5",
            "id": "34859fba-9987-4a1c-b176-14569b331653",
            "dutType": "SBC",
            "callingPlatform": "CCaaS"
        },
        {
            "tokens": "5",
            "id": "b66edd36-ee7f-42e7-bfb4-41810ea69fe6",
            "dutType": "SBC",
            "callingPlatform": "CPaaS"
        },
        {
            "tokens": "5",
            "id": "c323f5f8-cd49-4b0b-ac74-fe2113b658b8",
            "dutType": "BYOC",
            "callingPlatform": "UCaaS"
        },
        {
            "tokens": "5",
            "id": "9285ca9e-04c3-49df-9d59-085322a13319",
            "dutType": "BYOC",
            "callingPlatform": "CPaaS"
        },
        {
            "updatedBy": "rvasquez@tekvizionlabs.com",
            "tokens": "3",
            "dutType": "Application",
            "callingPlatform": "PBX"
        },
        {
            "tokens": "3",
            "id": "1ba09c6f-9a2a-4181-ac1e-b7217763df96",
            "dutType": "Application",
            "callingPlatform": "UCaaS"
        },
        {
            "tokens": "3",
            "id": "0e709699-3dab-47f1-a710-ebd2ae78d57b",
            "dutType": "Application",
            "callingPlatform": "Contact Center"
        },
        {
            "tokens": "3",
            "id": "ea00b987-0f14-4888-a0ce-f963d1eb7592",
            "dutType": "Application",
            "callingPlatform": "CCaaS"
        },
        {
            "tokens": "3",
            "id": "7ab51789-e767-42cc-a9ba-4ab4aef81d1f",
            "dutType": "Application",
            "callingPlatform": "CPaaS"
        },
        {
            "updatedBy": undefined,
            "tokens": "5",
            "id": "9c0cc4a5-a773-46f3-b73e-a09c55080b1f",
            "dutType": "Headset",
            "callingPlatform": "PBX"
        },
        {
            "tokens": "5",
            "id": "9f53d1ae-e22d-4c3b-b05d-6bf6b13c0658",
            "dutType": "Headset",
            "callingPlatform": "UCaaS"
        },
        {
            "tokens": "5",
            "id": "f2b57afb-c389-48ec-a54b-7d8a05a51f32",
            "dutType": "Headset",
            "callingPlatform": "CCaaS"
        },
        {
            "tokens": "5",
            "id": "2bdaf2af-838f-4053-b3fa-ef22aaa11b0d",
            "dutType": "Headset",
            "callingPlatform": "CPaaS"
        },
        {
            "updatedBy": "rvasquez@tekvizionlabs.com",
            "tokens": "2",
            "id": "af4a2ee5-8f1f-4745-83ec-8d6e15fd3f33",
            "dutType": "Device/Phone/ATA",
            "callingPlatform": "PBX"
        },
        {
            "updatedBy": "rvasquez@tekvizionlabs.com",
            "tokens": "2",
            "id": "44c4d082-a1e2-4320-b7d1-f43f91571e80",
            "dutType": "Soft Client/UC Client",
            "callingPlatform": "Contact Center"
        },
        {
            "updatedBy": "rvasquez@tekvizionlabs.com",
            "tokens": "2",
            "id": "49cedad1-379b-43ad-9727-e0ecb8714a7f",
            "dutType": "Soft Client/UC Client",
            "callingPlatform": "CPaaS"
        },
        {
            "updatedBy": "rvasquez@tekvizionlabs.com",
            "tokens": "3",
            "id": "d22b2842-9258-41d1-b715-b0638c7bf426",
            "dutType": "Soft Client/UC Client",
            "callingPlatform": "UCaaS"
        },
        {
            "updatedBy": "rvasquez@tekvizionlabs.com",
            "tokens": "2",
            "id": "28b7aed8-4eae-4613-ad93-897e60967d7a",
            "dutType": "Soft Client/UC Client",
            "callingPlatform": "Contact Center"
        },
        {
            "updatedBy": "rvasquez@tekvizionlabs.com",
            "tokens": "2",
            "id": "e5e02c22-ceaf-4fb1-ba66-ab25d874e39c",
            "dutType": "Soft Client/UC Client",
            "callingPlatform": "CPaaS"
        },
        {
            "updatedBy": "rvasquez@tekvizionlabs.com",
            "tokens": "3",
            "id": "7564aab0-5331-4ab5-85f7-e37acbdfd90d",
            "dutType": "Soft Client/UC Client",
            "callingPlatform": "CCaaS"
        },
        {
            "updatedBy": "rvasquez@tekvizionlabs.com",
            "tokens": "3",
            "id": "7564aab0-5331-4ab5-85f7-e37acbdfd90d",
            "dutType": "Soft Client/UC Client",
            "callingPlatform": "CCaaS"
        },
        {
            "updatedBy": "rvasquez@tekvizionlabs.com",
            "tokens": "2",
            "id": "3ad3f83e-2654-466d-b9e9-9cd8ded28110",
            "dutType": "SBC",
            "callingPlatform": "UCaaS"
        },
        {
            "updatedBy": "rvasquez@tekvizionlabs.com",
            "tokens": "2",
            "id": "5726d813-834e-40c4-a52e-e9ac63459e03",
            "dutType": "Device/Phone/ATA",
            "callingPlatform": "UCaaS"
        },
        {
            "updatedBy": "rvasquez@tekvizionlabs.com",
            "tokens": "3",
            "id": "30ab93f1-3bde-4721-8892-1ba34a005d08",
            "dutType": "Device/Phone/ATA",
            "callingPlatform": "Contact Center"
        },
        {
            "updatedBy": "rvasquez@tekvizionlabs.com",
            "tokens": "6",
            "id": "0cba280f-06fa-47c2-9782-c16d8bf8ed05",
            "dutType": "BYOC",
            "callingPlatform": "CCaaS"
        },
        {
            "updatedBy": "",
            "tokens": "2",
            "id": "9c5cdb5b-5dd1-4e76-adf1-4c38063410a2",
            "dutType": "Device/Phone/ATA",
            "callingPlatform": "CCaaS"
        },
        {
            "updatedBy": "",
            "tokens": "2",
            "id": "39ea3bed-bab2-4909-a7de-bec58735a8e8",
            "dutType": "Device/Phone/ATA",
            "callingPlatform": "CCaaS"
        },
        {
            "updatedBy": "",
            "tokens": "2",
            "id": "be91d498-d8e5-42cc-9dd7-0fd292689250",
            "dutType": "Device/Phone/ATA",
            "callingPlatform": "CCaaS"
        },
        {
            "updatedBy": "",
            "tokens": "2",
            "id": "8a8e2920-d818-4694-9416-f425f735c4e5",
            "dutType": "Device/Phone/ATA",
            "callingPlatform": "CCaaS"
        },
        {
            "updatedBy": "",
            "tokens": "2",
            "id": "ab36686b-e4cc-4cb5-8d6a-8e42e371fd6d",
            "dutType": "Device/Phone/ATA",
            "callingPlatform": "CCaaS"
        },
        {
            "updatedBy": "",
            "tokens": "2",
            "id": "c56b6a5b-520d-47a4-b215-316b913d971c",
            "dutType": "Device/Phone/ATA",
            "callingPlatform": "CCaaS"
        }
    ]
};

export const ConsumptionMatrixServiceMock = {
    getConsumptionMatrix: () => {
        return new Observable((observer) => {
            observer.next(
                JSON.parse(JSON.stringify(CONSUMPTION_MATRIX_AS_LIST))
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    deleteConsumptionEntry: (id: string) => {
        return new Observable((observer) => {
            observer.next();
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    updateConsumptionMatrix: (id: string, entry: IConsumptionMatrixEntry) => {
        return new Observable((observer) => {
            observer.next();
            observer.complete();
            return {
                unsubscribe() {}
            };
        });
    },
    createConsumptionMatrix: (entry: IConsumptionMatrixEntry) => {
        return new Observable((observer) => {
            observer.next({});
            observer.complete();
            return {
                unsubscribe() {}
            };
        });
    }
}

