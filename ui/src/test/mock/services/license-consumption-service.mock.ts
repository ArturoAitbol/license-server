import { Observable } from 'rxjs';

const MOCK_CONSUMPTION_A = { 
    consumptionDate: "2022-08-21",
    usageDays: [0,3],
    consumption: "2022-08-21 - Week 34",
    device: {
        id: "51fc2c47-b066-46f2-a613-93c350da9869",
        type: "SBC",
        product: "Connect 530",
        version: "9.0.4.7",
        vendor: "Allworx",
        granularity: "week",
    },
    callingPlatform: {
        id: "51fc2c47-b066-46f2-a613-93c350da9869",
        type: "PBX",
        product: "908E",
        version: "9.0.4.7",
        vendor: "Allworx"
    },
    id: "bc12f1d1-8cf0-4d20-af81-fc11c12bf152",
    tokensConsumed: 2,
    projectName: "test",
    projectId: "403e139b-5d28-42cc-b339-7a5ef20f416b",
    usageType: "Configuration"
};
const MOCK_CONSUMPTION_B = { 
    consumptionDate: "2022-08-14",
    usageDays: [1,2,3],
    consumption: "2022-08-14 - Week 33",
    device: {
        id: "51fc2c47-b066-46f2-a613-93c350da9869",
        type: "SBC",
        product: "Connect 530",
        version: "9.0.4.7",
        vendor: "Allworx",
        granularity: "week",
    },
    callingPlatform: {
        id: "51fc2c47-b066-46f2-a613-93c350da9869",
        type: "PBX",
        product: "908E",
        version: "9.0.4.7",
        vendor: "Allworx"
    },
    id: "4b393d0f-017c-4265-9023-b0b98f0fab6c",
    tokensConsumed: 1,
    projectName: "66666t",
    projectId: "a28a21d8-f67a-4b4e-ac17-ee0f471ff3fd",
    usageType: "Configuration"
};
const MOCK_CONSUMPTION_C = { 
    consumptionDate: "2022-08-14",
    product: "Broadsoft",
    usageDays: [0],
    consumption: "2022-08-14 - Week 33",
    device: {
        id: "51fc2c47-b066-46f2-a613-93c350da9869",
        type: "SBC",
        product: "Connect 530",
        version: "9.0.4.7",
        vendor: "Allworx",
        granularity: "week",
    },
    callingPlatform: {
        id: "51fc2c47-b066-46f2-a613-93c350da9869",
        type: "PBX",
        product: "908E",
        version: "9.0.4.7",
        vendor: "Allworx"
    },
    id: "ef07942a-a4a3-4ecb-af5d-0f670f08d7b4",
    tokensConsumed: 5,
    projectName: "test",
    projectId: "403e139b-5d28-42cc-b339-7a5ef20f416b",
    usageType: "Configuration"
};
const MOCK_CONSUMPTION_D = { 
    consumptionDate: "2022-08-07",
    product: "SIP Trunk Testing Engagement",
    usageDays: [0],
    consumption: "2022-08-07 - Week 32",
    device: {
        id: "51fc2c47-b066-46f2-a613-93c350da9869",
        type: "SBC",
        product: "Connect 530",
        version: "9.0.4.7",
        vendor: "Allworx",
        granularity: "static",
    },
    callingPlatform: {
        id: "51fc2c47-b066-46f2-a613-93c350da9869",
        type: "PBX",
        product: "908E",
        version: "9.0.4.7",
        vendor: "Allworx"
    },
    id: "6f706422-85b2-4e50-964a-80ed7b6135a6",
    tokensConsumed: 15,
    projectName: "24",
    projectId: "6eb1f15b-168d-4ef0-adb1-fec73b65af25",
    usageType: "Configuration"
};
const MOCK_CONSUMPTION_E = { 
    consumptionDate: "2022-08-07",
    product: "Alcatel Lucent OmniPCX/OpenTouch.OXE",
    usageDays: [0],
    consumption: "2022-08-07 - Week 32",
    device: {
        id: "51fc2c47-b066-46f2-a613-93c350da9869",
        type: "SBC",
        product: "Connect 530",
        version: "9.0.4.7",
        vendor: "Allworx",
        granularity: "week",
    },
    callingPlatform: {
        id: "51fc2c47-b066-46f2-a613-93c350da9869",
        type: "PBX",
        product: "908E",
        version: "9.0.4.7",
        vendor: "Allworx"
    },
    id: "df4869c4-e310-4fcb-87ae-6565ae7c1997",
    tokensConsumed: 4,
    projectName: "test",
    projectId: "403e139b-5d28-42cc-b339-7a5ef20f416b",
    usageType: "Configuration"
};
const MOCK_CONSUMPTION_F = { 
    consumptionDate: "2022-08-07",
    product: "Call Manager Express",
    usageDays: [1,3],
    consumption: "2022-08-07 - Week 32",
    device: {
        id: "51fc2c47-b066-46f2-a613-93c350da9869",
        type: "SBC",
        product: "Connect 530",
        version: "9.0.4.7",
        vendor: "Allworx",
        granularity: "week",
    },
    callingPlatform: {
        id: "51fc2c47-b066-46f2-a613-93c350da9869",
        type: "PBX",
        product: "908E",
        version: "9.0.4.7",
        vendor: "Allworx"
    },
    id: "df76d021-1431-4f9b-8b9f-be97bdd2fc85",
    tokensConsumed: 2,
    projectName: "24",
    projectId: "6eb1f15b-168d-4ef0-adb1-fec73b65af25",
    usageType: "Configuration"
};
const MOCK_CONSUMPTION_G = { 
    consumptionDate: "2022-08-07",
    product: "SIP Trunk Testing Engagement",
    usageDays: [2],
    consumption: "2022-08-07 - Week 32",
    device: {
        id: "51fc2c47-b066-46f2-a613-93c350da9869",
        type: "SBC",
        version: "9.0.4.7",
        vendor: "Allworx",
        granularity: "static",
    },
    callingPlatform: {
        id: "51fc2c47-b066-46f2-a613-93c350da9869",
        type: "PBX",
        version: "9.0.4.7",
        vendor: "Allworx"
    },
    id: "1397ed28-543d-477c-871e-06f450831465",
    tokensConsumed: 15,
    projectName: "test",
    projectId: "403e139b-5d28-42cc-b339-7a5ef20f416b",
    usageType: "Configuration"
};
const MOCK_CONSUMPTION_H = { 
    consumptionDate: "2022-08-02",
    product: "3CX",
    usageDays: [3],
    consumption: "2022-08-02 - Week 31",
    device: {
        id: "51fc2c47-b066-46f2-a613-93c350da9869",
        type: "SBC",
        product: "Connect 530",
        version: "9.0.4.7",
        vendor: "Allworx",
        granularity: "week",
    },
    callingPlatform: {
        id: "51fc2c47-b066-46f2-a613-93c350da9869",
        type: "PBX",
        product: "908E",
        version: "9.0.4.7",
        vendor: "Allworx"
    },
    id: "571084e2-3f9e-4897-ae12-df0bf534ffa5",
    tokensConsumed: 2,
    projectName: "test",
    projectId: "403e139b-5d28-42cc-b339-7a5ef20f416b",
    usageType: "Configuration"
};

const MOCK_CONSUMPTIONS_LIST = [
    MOCK_CONSUMPTION_A,
    MOCK_CONSUMPTION_B,
    MOCK_CONSUMPTION_C,
    MOCK_CONSUMPTION_D,
    MOCK_CONSUMPTION_E,
    MOCK_CONSUMPTION_F,
    MOCK_CONSUMPTION_G,
    MOCK_CONSUMPTION_H,
];

const MOCK_WEEKLY_LIST = [
    { weekId: 'Week 35 (2022-08-28 - 2022-09-03)', tokensConsumed: 0 },
    { weekId: "Week 34 (2022-08-21 - 2022-08-27)", tokensConsumed: 2 },
    { weekId: "Week 33 (2022-08-14 - 2022-08-20)", tokensConsumed: 6 },
    { weekId: "Week 32 (2022-08-07 - 2022-08-13)", tokensConsumed: 36 },
    { weekId: "Week 31 (2022-07-31 - 2022-08-06)", tokensConsumed: 2 }
];
const MOCK_PROJECT_CONSUMPTION_LIST = [
    { name: "test", tokensConsumed: 28, projectId: "403e139b-5d28-42cc-b339-7a5ef20f416b", status: "Open" },
    { name: "66666t", tokensConsumed: 1, projectId: "a28a21d8-f67a-4b4e-ac17-ee0f471ff3fd", status: "Open" },
    { name: "24", tokensConsumed: 17, projectId: "6eb1f15b-168d-4ef0-adb1-fec73b65af25", status: "Open" }
];

const MOCK_EQUIPMENT_LIST = [
    { product: "Alcatel Lucent OmniPCX/OpenTouch.OXE", vendor: "Alcatel Lucent", id: "06e9720c-b7b7-4124-b67a-5332dfe116f8", version: "12.4" },
    { product: "Connect 530", vendor: "Allworx", id: "51fc2c47-b066-46f2-a613-93c350da9869", version: "9.0.4.7" },
    { product: "SIP Trunk Testing Engagement", vendor: "tekVizion", id: "5a6fbb8b-f524-4cc8-9c45-3efcc9b0cde0", version: "1.0" },
    { product: "908E", vendor: "Adtran", id: "8ce2f5c0-203c-48c2-a747-b9c5632a9027", version: "R13.3.0.E" },
    { product: "Call Manager Express", vendor: "Cisco", id: "d41126e1-53eb-473f-b011-9bd0ac44644a", version: "14.1" },
    { product: "3CX", vendor: "3CX", id: "ef7a4bcd-fc3f-4f87-bf87-ae934799690b", version: "18.0.1880" },
    { product: "Broadsoft", vendor: "Broadsoft", id: "f500558a-d6d5-4518-9869-63b7f7fd2eff", version: "22" }
];

const MOCK_SUMMARY_INFO = {
    devicesConnected: 0,
    tokensConsumed: 46
};
const MOCK_DETAILED_INFO = {
    usage: MOCK_CONSUMPTIONS_LIST,
    usageTotalCount: MOCK_CONSUMPTIONS_LIST.length,
    weeklyConsumption: MOCK_WEEKLY_LIST,
    projectConsumption: MOCK_PROJECT_CONSUMPTION_LIST,
    tokenConsumption: { AutomationPlatform: 10 , Configuration: 46 }
};

const MOCK_DETAILED_INFO_NO_TOKEN_CONSUMPTION = {
    usage: [],
    usageTotalCount: 0,
    weeklyConsumption: [],
    projectConsumption: [],
    tokenConsumption: {}
};

const MOCK_EQUIPMENT_INFO = {
    equipmentSummary: MOCK_EQUIPMENT_LIST
};

const MOCK_CREATED_CONSUMPTION = {};
const MOCK_UPDATED_CONSUMPTION = {};
const MOCK_DELETED_CONSUMPTION = {};

export const ConsumptionServiceMock = {
    usageList: MOCK_CONSUMPTIONS_LIST,
    mockNewConsumption:MOCK_CREATED_CONSUMPTION,
    updatedMockConsumptionD: MOCK_UPDATED_CONSUMPTION,
    mockDeletedConsumption: MOCK_DELETED_CONSUMPTION,
    mockSummaryInfo: MOCK_SUMMARY_INFO,
    mockEquipmentInfo: MOCK_EQUIPMENT_INFO,
    mockDetailedInfo: MOCK_DETAILED_INFO,
    mockConsumptionA: MOCK_CONSUMPTION_A,
    mockConsumptionD: MOCK_CONSUMPTION_D,
    mockDetailedInfoNoTokenConsumption: MOCK_DETAILED_INFO_NO_TOKEN_CONSUMPTION,
    getLicenseConsumptionDetails: (data) => {
        return new Observable((observer) => {
            let consumptionInfo;
            switch (data.view) {
                case "summary": 
                    consumptionInfo = MOCK_SUMMARY_INFO;
                    break;
                case "equipment": 
                    consumptionInfo = MOCK_EQUIPMENT_INFO;
                    break;
                default:
                    consumptionInfo = JSON.parse(JSON.stringify(MOCK_DETAILED_INFO));
                    break;
           }
            observer.next(
                JSON.parse(JSON.stringify(consumptionInfo))
            );
            observer.complete();
            return {
                unsubscribe() { }
           };
        });
    },
    updateLicenseConsumptionDetails: (data) => {
        return new Observable((observer) => {
            observer.next(
                JSON.parse(JSON.stringify(MOCK_UPDATED_CONSUMPTION))
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    deleteLicenseConsumptionDetails: (consumptionId) => {
        return new Observable((observer) => {
            const removedConsumption = MOCK_CONSUMPTIONS_LIST.find((consumption: any) => consumption.id === consumptionId);
            observer.next(
                JSON.parse(JSON.stringify(removedConsumption))
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    addLicenseConsumptionDetails: (data) =>{
        return new Observable((observer) => {
            observer.next(
                JSON.parse(JSON.stringify(MOCK_CREATED_CONSUMPTION))
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    }
};
