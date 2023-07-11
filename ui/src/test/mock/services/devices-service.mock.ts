import { of, Observable } from "rxjs";
import { Device } from "src/app/model/device.model";

const DEVICE_A = {
    id: "001ee852-4ab5-4642-85e1-58f5a477fbb3",
    vendor: "HylaFAX",
    product: "HylaFAX Enterprise",
    version: "6.2",
    type: "PBX",
    granularity: "static",
    tokensToConsume: 0,
    deprecatedDate: "",
    startDate: new Date(),
    subaccountId: "",
    supportType: true
};

const DEVICE_B:Device = {
    "supportType": true,
    "product": "HylaFAX Enterprise",
    "deprecatedDate": "infinity",
    "vendor": "AHylaFAX",
    "granularity": "static",
    "subaccountId": "fbb2d912-b202-432d-8c07-dce0dad51f7f",
    "id": "c49a3148-1e74-4090-9876-d062011d9bcb",
    "type": "FAX",
    "version": "6.2",
    "tokensToConsume": 5,
    "startDate": new Date()
}
const DEVICE_C:Device = {
    "supportType": true,
    "product": "HylaFAX Enterprise",
    "deprecatedDate": "infinity",
    "vendor": "BHylaFAX",
    "granularity": "static",
    "subaccountId": "fbb2d912-b202-432d-8c07-dce0dad51f7f",
    "id": "c49a3148-1e74-4090-9876-d062011d9bcb",
    "type": "FAX",
    "version": "6.2",
    "tokensToConsume": 0,
    "startDate": new Date()
}
const DEVICE_D:Device = {
    "supportType": true,
    "product": "HylaFAX Enterprise",
    "deprecatedDate": "infinity",
    "vendor": "CHylaFAX",
    "granularity": "static",
    "subaccountId": "fbb2d912-b202-432d-8c07-dce0dad51f7f",
    "id": "c49a3148-1e74-4090-9876-d062011d9bcb",
    "type": "FAX",
    "version": "6.2",
    "tokensToConsume": 48,
    "startDate": new Date()
}
const DEVICE_E:Device = {
    "supportType": true,
    "product": "HylaFAX Enterprise",
    "deprecatedDate": "infinity",
    "vendor": "DHylaFAX",
    "granularity": "static",
    "subaccountId": "fbb2d912-b202-432d-8c07-dce0dad51f7f",
    "id": "c49a3148-1e74-4090-9876-d062011d9bcb",
    "type": "FAX",
    "version": "6.2",
    "tokensToConsume": 48,
    "startDate": new Date()
}

const DEVICE_F:Device = {
    "supportType": true,
    "product": "HylaFAX Enterprise",
    "deprecatedDate": "infinity",
    "vendor": "EHylaFAX",
    "granularity": "static",
    "subaccountId": "fbb2d912-b202-432d-8c07-dce0dad51f7f",
    "id": "c49a3148-1e74-4090-9876-d062011d9bcb",
    "type": "FAX",
    "version": "6.2",
    "tokensToConsume": 4,
    "startDate": new Date()
}

const UNSORTED_DEVICE_LIST = {
    devices:[
        DEVICE_F,
        DEVICE_B,
        DEVICE_D,
        DEVICE_C,
        DEVICE_E
    ]
}
const ASC_TOKEN_SORTED_LIST = {
    devices: [
        DEVICE_C,
        DEVICE_F,
        DEVICE_B,
        DEVICE_E,
        DEVICE_D,
    ]
}

const DESC_TOKEN_SORTED_LIST = {
    devices: [
        DEVICE_D,
        DEVICE_E,
        DEVICE_B,
        DEVICE_F,
        DEVICE_C,
    ]
}
const ASC_SORTED_LIST = {
    devices: [
        DEVICE_B,
        DEVICE_C,
        DEVICE_D,
        DEVICE_E,
        DEVICE_F
    ]
}

const DESC_SORTED_LIST = {
    devices:[
        DEVICE_F,
        DEVICE_E,
        DEVICE_D,
        DEVICE_C,
        DEVICE_B
    ]
}
const DEVICE_LIST = {
    devices: [
        DEVICE_A,
        {
            supportType: true,
            product: "Multitech FAX Finder IP FAX server",
            vendor: "Multitech",
            granularity: "static",
            id: "936662a7-febd-4cbf-bc58-477e5d5a9d10",
            version: "5.0",
            tokensToConsume: 0,
            startDate: new Date()
        },
        {
            supportType: true,
            product: "OpenText--Right FAX",
            vendor: "Opentext",
            granularity: "static",
            id: "9ba1f445-28da-4e36-907c-6864c98b6928",
            version: "20.2",
            tokensToConsume: 0,
            startDate: new Date()
        },
        {
            supportType: true,
            product: "Xmedius FAX server",
            vendor: "Xmedius",
            granularity: "static",
            id: "59525742-7133-4be5-9399-a111be7664cb",
            version: "9.0",
            tokensToConsume: 0
        },
        {
            supportType: true,
            product: "Genesys Pure Cloud",
            vendor: "Genesys",
            granularity: "static",
            id: "422c2998-4553-4d5c-81f3-6e29b66c8788",
            version: "1.0.0.10206",
            tokensToConsume: 0
        },
        {
            supportType: false,
            product: "3CX",
            vendor: "3CX",
            granularity: "week",
            id: "ef7a4bcd-fc3f-4f87-bf87-ae934799690b",
            version: "18.0.1880",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "Adtran NetVanta Series (7100)",
            vendor: "Adtran",
            granularity: "week",
            id: "f6bded44-d753-4035-85d6-064dfd096471",
            version: "11.10.3",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "Alcatel Lucent OmniPCX/OpenTouch.OXE",
            vendor: "Alcatel Lucent",
            granularity: "week",
            id: "06e9720c-b7b7-4124-b67a-5332dfe116f8",
            version: "12.4",
            tokensToConsume: 4
        },
        {
            supportType: false,
            product: "Alcatel Lucent OXO",
            vendor: "Alcatel Lucent",
            granularity: "week",
            id: "389ef7a2-ca9e-44de-ac6f-61bb00034b87",
            version: "v032/021.001",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "Connect 530",
            vendor: "Allworx",
            granularity: "week",
            id: "51fc2c47-b066-46f2-a613-93c350da9869",
            version: "9.0.4.7",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "Allworx",
            vendor: "Allworx",
            granularity: "week",
            id: "430db5b6-fed1-4d27-91f8-09387e4852e8",
            version: "6x (12x, 24x, 48x)",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "Altigen",
            vendor: "Altigen",
            granularity: "week",
            id: "31301ccd-bcdc-42b5-bb09-ecf56a5eb83a",
            version: "9",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "Asterisk (CLI)",
            vendor: "Asterisk",
            granularity: "week",
            id: "198c4a3c-8e17-4c3b-a99c-92a8ea3fa74d",
            version: "16.13.0",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "Asterisk FreePBX GUI",
            vendor: "Asterisk",
            granularity: "week",
            id: "040c8ab8-fa9d-4f0b-9695-bb42df4dd92a",
            version: "17.9.1",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "CS1000/CS1K",
            vendor: "Avaya",
            granularity: "week",
            id: "78027528-725b-4a14-a69d-dbbdbce43500",
            version: "7.6",
            tokensToConsume: 3
        },
        {
            supportType: false,
            product: "Avaya Aura with Avaya ESBC",
            vendor: "Avaya",
            granularity: "week",
            id: "bf1493e4-90df-47ed-9bba-fbc72f9eb981",
            version: "7.1.3.1",
            tokensToConsume: 5
        },
        {
            supportType: false,
            product: "Avaya Aura with Avaya ESBC",
            vendor: "Avaya",
            granularity: "week",
            id: "b250dfb3-76b1-4851-87d8-9f2daf56c4fd",
            version: "8.1.3.2.813207",
            tokensToConsume: 5
        },
        {
            supportType: false,
            product: "Avaya Aura with Avaya ESBC",
            vendor: "Avaya",
            granularity: "week",
            id: "cd66ec04-ad2e-413f-bec3-a3560a477102",
            version: "10.1",
            tokensToConsume: 5
        },
        {
            supportType: false,
            product: "IP Office v2",
            vendor: "Avaya",
            granularity: "week",
            id: "4c66a5a9-3321-4f06-af8d-6874aa0d0d2f",
            version: "11.1.0 Build 95",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "IP Office v1",
            vendor: "Avaya",
            granularity: "week",
            id: "051f24c7-1a38-4ba7-9f30-40ff4b79141b",
            version: "9",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "Broadsoft",
            vendor: "Broadsoft",
            granularity: "week",
            id: "f500558a-d6d5-4518-9869-63b7f7fd2eff",
            version: "22",
            tokensToConsume: 5
        },
        {
            supportType: false,
            product: "Broadsoft",
            vendor: "Broadsoft",
            granularity: "week",
            id: "5d371899-3557-4f4a-b7ab-a4fd7c6a8851",
            version: "23",
            tokensToConsume: 5
        },
        {
            supportType: false,
            product: "Broadsoft",
            vendor: "Broadsoft",
            granularity: "week",
            id: "10544264-fce2-4d7f-9d0b-ba7049ffe882",
            version: "24",
            tokensToConsume: 5
        },
        {
            supportType: false,
            product: "Unified Call Manager System",
            vendor: "Cisco",
            granularity: "week",
            id: "1922a5fb-228c-4a90-b2d3-ec517d7a3f9a",
            version: "12.5",
            tokensToConsume: 3
        },
        {
            supportType: false,
            product: "Unified Call Manager System",
            vendor: "Cisco",
            granularity: "week",
            id: "21a8e70d-bfe7-4080-8540-4535ed0708ad",
            version: "14",
            tokensToConsume: 3
        },
        {
            supportType: false,
            product: "Unified Call Manager System",
            vendor: "Cisco",
            granularity: "week",
            id: "758cb7e6-9924-4042-a393-f9d056a9f71c",
            version: "14.0.1.11900-132",
            tokensToConsume: 3
        },
        {
            supportType: false,
            product: "Call Manager Express",
            vendor: "Cisco",
            granularity: "week",
            id: "d41126e1-53eb-473f-b011-9bd0ac44644a",
            version: "14.1",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "Contact Center Enterprise (UCCE)",
            vendor: "Cisco",
            granularity: "week",
            id: "44abfe81-595b-4ebe-9835-4dc841fb31b9",
            version: "12.6",
            tokensToConsume: 7
        },
        {
            supportType: false,
            product: "Contact Center Express (UCCX)",
            vendor: "Cisco",
            granularity: "week",
            id: "f59825ce-8949-4e33-aba9-6eaa27a9de73",
            version: "12.5",
            tokensToConsume: 4
        },
        {
            supportType: false,
            product: "Elastix",
            vendor: "Elastix",
            granularity: "week",
            id: "0d9e7ef9-53d1-4c33-a52b-b4c7ecad206e",
            version: "2.5.0",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "QX50",
            vendor: "Epygi",
            granularity: "week",
            id: "70f3e917-4553-445a-89fd-45bca45ae075",
            version: "6.3.39",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "eMG80",
            vendor: "Ericcson LG",
            granularity: "week",
            id: "3c515e47-f724-4115-be31-55a6e67c44db",
            version: "2.2.18",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "Communications Server 50/100/200/600/1000",
            vendor: "ESI",
            granularity: "week",
            id: "416e91f1-5c02-489c-b971-48c305751cfc",
            version: "12.5.55.30",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "Business Phone System",
            vendor: "Fonality",
            granularity: "week",
            id: "4256dda3-6ceb-4e7d-9bbf-76509b19be42",
            version: "14",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "FortiVoice FVE",
            vendor: "Fortinet",
            granularity: "week",
            id: "df960781-3e91-4395-98b3-6fcb5b8931aa",
            version: "20E2 5.3.3",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "FreePBX",
            vendor: "FreePBX",
            granularity: "week",
            id: "d0fd50bd-8000-43a2-9aa8-b0fb5ead7116",
            version: "15.0.17.34",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "UCM 6510 (61xx,62xx,6510)",
            vendor: "Grandstream",
            granularity: "week",
            id: "68829841-1a6a-40db-91f4-262e496e1b08",
            version: "1.0.19.27",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "UCM 6208 (61xx,62xx,6510)",
            vendor: "Grandstream",
            granularity: "week",
            id: "5d01b0e3-aa05-4163-98e6-2bb76d53ca22",
            version: "1.0.19.21",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "UCM 6308",
            vendor: "Grandstream",
            granularity: "week",
            id: "3680544b-f3b5-411f-87a1-e22b9ffd5373",
            version: "1.0.15.10",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "Pure Cloud",
            vendor: "Genesys",
            granularity: "week",
            id: "12a3ce3f-3e58-4233-9e0a-f859558ec819",
            version: "1.0.0.10206",
            tokensToConsume: 4
        },
        {
            supportType: false,
            product: "Pure Connect 2019",
            vendor: "Genesys",
            granularity: "week",
            id: "ac4600ac-27d0-4e1e-8af6-99121e55a2d1",
            version: "R1",
            tokensToConsume: 4
        },
        {
            supportType: false,
            product: "Pure Connect 2020",
            vendor: "Genesys",
            granularity: "week",
            id: "2864d6c9-4752-4887-a35a-28c84ad6dc1f",
            version: "R3",
            tokensToConsume: 4
        },
        {
            supportType: false,
            product: "Pure Engage",
            vendor: "Genesys",
            granularity: "week",
            id: "72a37d08-2415-4113-928f-e035b43924f0",
            version: "8.5",
            tokensToConsume: 5
        },
        {
            supportType: false,
            product: "Innovaphone",
            vendor: "Innova",
            granularity: "week",
            id: "c8018652-85e1-492b-8f5c-11d43a3e1c28",
            version: "13r1 sr21 (13.2678)",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "Unigy",
            vendor: "IPC Systems",
            granularity: "week",
            id: "7997ca23-288e-4e38-ac2a-4f4be6255759",
            version: "5.2",
            tokensToConsume: 5
        },
        {
            supportType: false,
            product: "Unigy",
            vendor: "IPC Systems",
            granularity: "week",
            id: "e427697c-ba19-44dc-8c91-6b41dcf1d73c",
            version: "04.03.00.02.0018",
            tokensToConsume: 5
        },
        {
            supportType: false,
            product: "IP1200",
            vendor: "Ipitomy",
            granularity: "week",
            id: "cc56dffb-50ed-4b8b-9c0d-757e71c28069",
            version: "5.1.1",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "Skype for Business 2015",
            vendor: "Microsoft",
            granularity: "week",
            id: "c676902a-59b1-49db-9c0a-1cf3514a7dd7",
            version: "6.0.9319.562",
            tokensToConsume: 3
        },
        {
            supportType: false,
            product: "Skype for Business 2019",
            vendor: "Microsoft",
            granularity: "week",
            id: "7da90420-95ba-4fe9-9572-4a7ade186ddf",
            version: "7.0.2046.123",
            tokensToConsume: 3
        },
        {
            supportType: false,
            product: "Teams",
            vendor: "Microsoft",
            granularity: "week",
            id: "13937da3-98ec-48c1-a970-36dc335d566c",
            version: "1.4.00.35564 (64-bit)",
            tokensToConsume: 3
        },
        {
            supportType: false,
            product: "MiVoice Business (MiVB)",
            vendor: "Mitel",
            granularity: "week",
            id: "3baa5c29-f94d-4281-83b0-d705c2e2f5ad",
            version: "9.3  SP2(9.3.0.19)",
            tokensToConsume: 3
        },
        {
            supportType: false,
            product: "MiVoice Business (MiVB)",
            vendor: "Mitel",
            granularity: "week",
            id: "eb788769-3bbd-471b-9b90-d14e61658731",
            version: "8.0 SP3 PR3",
            tokensToConsume: 3
        },
        {
            supportType: false,
            product: "MiVoice Business ISS",
            vendor: "Mitel",
            granularity: "week",
            id: "6d05cf7b-fc29-4bd6-8cb0-0b3222d97925",
            version: "9.1 SP1 PR1",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "MiVoice Business Virtual",
            vendor: "Mitel",
            granularity: "week",
            id: "e0661dde-4149-486e-9fd6-3bc3465a4586",
            version: "9.1 SP1 PR2",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "MiVoice Office 250 Phone System",
            vendor: "Mitel",
            granularity: "week",
            id: "f2cd6098-be9e-4d6e-a059-e9070c1222ca",
            version: "6.3 SP2",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "MiVoice Office 250 Phone System",
            vendor: "Mitel",
            granularity: "week",
            id: "7daa94c7-4a9e-4626-b187-7009c4708be9",
            version: "6.3 SP4",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "MX-ONE",
            vendor: "Mitel",
            granularity: "week",
            id: "fd2b9b81-5a40-4138-91cf-726d286108f4",
            version: "7.3",
            tokensToConsume: 3
        },
        {
            supportType: false,
            product: "MiVoice Office 400",
            vendor: "Mitel",
            granularity: "week",
            id: "8db87069-4c56-4613-9617-b79abb92edcb",
            version: "6.2",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "Univerge 3C",
            vendor: "NEC",
            granularity: "week",
            id: "c757df36-6436-4b43-9a53-bbfa5a6e7e0e",
            version: "10.0.0.14",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "SL1100",
            vendor: "NEC",
            granularity: "week",
            id: "30f53bfd-fe18-4d65-97f7-d7c8fa292290",
            version: "7",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "SL2100",
            vendor: "NEC",
            granularity: "week",
            id: "cf6a9efe-14a9-4a3f-a5bc-62279faf246e",
            version: "2.00.00",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "SV9100 (EMEA)",
            vendor: "NEC",
            granularity: "week",
            id: "696c7bb9-6b30-430f-afc1-3e8c0005eda3",
            version: "11.00.52",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "SV9100 (US)",
            vendor: "NEC",
            granularity: "week",
            id: "a1c18609-c6d9-4103-b0b6-e43a7fc8a4c9",
            version: "10.50.52",
            tokensToConsume: 2
        },
        {
            supportType: true,
            product: "CICDTest1659967098",
            vendor: "CICDTest",
            granularity: "week",
            id: "c17a45de-0c68-4c0c-bceb-fb04edee880c",
            version: "1.0",
            tokensToConsume: 1
        },
        {
            supportType: false,
            product: "SV9300",
            vendor: "NEC",
            granularity: "week",
            id: "8cefdb4e-2f5d-4f4d-af35-9c0c4a76a3bc",
            version: "6.1.3",
            tokensToConsume: 3
        },
        {
            supportType: false,
            product: "SV9500",
            vendor: "NEC",
            granularity: "week",
            id: "5d60af1b-3508-4fed-ab2b-53ee81b7582a",
            version: "5.01.00",
            tokensToConsume: 5
        },
        {
            supportType: false,
            product: "KX-NS700",
            vendor: "Panasonic",
            granularity: "week",
            id: "755955b7-4100-4328-9f6e-7038b92e4a02",
            version: "v007.00138",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "KX-NS1000",
            vendor: "Panasonic",
            granularity: "week",
            id: "800c5b76-a6dd-424f-b46a-3b9273867572",
            version: "v8.00055",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "TDE",
            vendor: "Panasonic",
            granularity: "week",
            id: "faf781f0-5c43-48fd-9d93-5b1f2e2cf0e0",
            version: "8.0.1.21",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "OfficeServ 7100",
            vendor: "Samsung",
            granularity: "week",
            id: "4119fcd9-b40f-40a1-9d72-0d6f84db04b2",
            version: "5.0.3",
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "Test",
            vendor: "Test",
            granularity: "week",
            id: "eb2e8d89-b5a0-4e6c-8b11-83aad2674d7f",
            version: null,
            tokensToConsume: 2
        },
        {
            supportType: true,
            product: "Test",
            vendor: "TestSupport",
            granularity: "week",
            id: "eb2e8d89-b5a0-4e6c-8b11-83aad3674d7f",
            version: '2.1',
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "CERT",
            vendor: "CERT",
            granularity: "static",
            type: "CERT",
            id: "eb2e8d89-b5a0-4e6c-8b11-83aad3674d7f",
            version: null,
            tokensToConsume: 2
        },
        {
            supportType: false,
            product: "Sandbox",
            vendor: "Sandbox",
            granularity: "week",
            type: "Sandbox",
            id: "eb2e8d89-b5a0-4e6c-8b11-83aad3674d7f",
            version: null,
            tokensToConsume: 2
        }
    ]
};

const DEVICE_TYPES = {
    "deviceTypes": [
        { "name": "PBX" },
        { "name": "SBC" },
        { "name": "GATEWAY" },
        { "name": "PHONE" },
        { "name": "TRUNK" },
        { "name": "FAX" },
        { "name": "CC" },
        { "name": "Contact Center" },
        { "name": "UCAAS" },
        { "name": "UCaaS" },
        { "name": "CCaaS" },
        { "name": "CPaaS" },
        { "name": "CLIENT" },
        { "name": "CERT" },
        { "name": "Sandbox" },
        { "name": "Device/Phone/ATA" },
        { "name": "Soft Client/UC Client" },
        { "name": "BYOC" },
        { "name": "Application" },
        { "name": "Headset" },
        { "name": "Video Collab Device (ROW)" },
        { "name": "Video Collab Device (US)" },
        { "name": "OTHER" }
    ],
    "callingPlatformTypes": [
        { "name": "PBX" },
        { "name": "UCaaS" },
        { "name": "Contact Center" },
        { "name": "CCaaS" },
        { "name": "CPaaS" }],
    "dutTypes": [
        { "name": "Device/Phone/ATA" },
        { "name": "Soft Client/UC Client" },
        { "name": "SBC" },
        { "name": "BYOC" },
        { "name": "Application" },
        { "name": "Headset" },
        { "name": "Video Collab Device (ROW)" },
        { "name": "Video Collab Device (US)" }
    ]
}

const VENDORS_LIST = {
    "vendors": [
        "HylaFAX",
        "Xmedius",
        "Genesys",
        "3CX",
        "Adtran",
        "Alcatel Lucent",
        "Allworx",
        "Altigen",
        "Asterisk",
        "Avaya",
        "Broadsoft",
        "Cisco",
        "Elastix",
        "Epygi",
        "Ericcson LG",
        "ESI",
        "Fonality",
        "Fortinet",
        "FreePBX",
        "Grandstream",
        "Innova",
        "IPC Systems",
        "Ipitomy",
        "Microsoft",
        "Mitel",
        "NEC",
        "Panasonic",
        "Test"
    ],
    "supportVendors": [
        "HylaFAX",
        "TestSupport",
        "Multitech",
        "Opentext",
        "Genesys"
    ]
};

const DEVICE = {
    days:[
        {
            "name": "Sun",
            "used": false,
            "disabled": true
        },
        {
            "name": "Mon",
            "used": false,
            "disabled": true
        },
        {
            "name": "Tue",
            "used": false,
            "disabled": true
        },
        {
            "name": "Wed",
            "used": false,
            "disabled": true
        },
        {
            "name": "Thu",
            "used": false,
            "disabled": true
        },
        {
            "name": "Fri",
            "used": true,
            "disabled": false
        },
        {
            "name": "Sat",
            "used": true,
            "disabled": false
        }
    ],id: "f2cd6098-be9e-4d6e-a059-e9070c1222ca",
    product:"MiVoice Office 250 Phone System - v.6.3 SP2",
    vendor:"Mitel"
}

export const DevicesServiceMock = {
    mockDeviceA: DEVICE_A,
    devicesListValue: DEVICE_LIST,
    vendorList: VENDORS_LIST,
    unsortedDeviceList: UNSORTED_DEVICE_LIST,
    ascSortedList: ASC_SORTED_LIST,
    descSortedList: DESC_SORTED_LIST,
    deviceToCompare: DEVICE_B,
    device: DEVICE,
    deviceTypes: DEVICE_TYPES,
    tokenAscSortedList: ASC_TOKEN_SORTED_LIST,
    tokenDescSortedList: DESC_TOKEN_SORTED_LIST,
    getDevicesList: (subaccountId?: string, vendor?: string, product?: string, version?: string) => {
        return of(
            JSON.parse(JSON.stringify({ devices: vendor ? DEVICE_LIST.devices.filter(device => device.vendor === vendor) : DEVICE_LIST.devices }))
        );
    },
    getDevicesTypesList: () => {
        return of(
            JSON.parse(JSON.stringify(DEVICE_TYPES))
        )
    },
    getAllDeviceVendors: () => {
        return of(
            JSON.parse(JSON.stringify(VENDORS_LIST))
        )
    },

    getDeviceById: (id: string) => {
        return of({ devices: [DEVICE_LIST.devices.filter(device => device.id === id)[0]] })
    },
    updateDevice: (device: any) => {
        return new Observable((observer) => {
            observer.next(
                {

                }
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    createDevice: (device: any) => {
        return new Observable((observer) => {
            observer.next(
                {
                    body: [
                        {

                        }
                    ]
                }
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    deleteDevice: (deviceId) => {
        return new Observable((observer) => {
            const removedDevice = DEVICE_LIST.devices.find((device: Device) => device.id === deviceId);
            observer.next(
                JSON.parse(JSON.stringify(removedDevice))
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    }
};

