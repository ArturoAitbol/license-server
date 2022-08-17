import { Observable } from "rxjs";

const BASIC_BUNDLE = {
    bundleName: "Basic",
    defaultDeviceAccessTokenss: "5000",
    defaultTokens: "55",
    id: "bf219b3a-5bb9-417d-bc02-7b8cb659059d"
};

const ADDON_BUNDLE = {
    bundleName: "AddOn",
    defaultDeviceAccessTokenss: "0",
    defaultTokens: "20",
    id: "fe6999a0-e235-4b0e-b2cb-092589d03f46"
};

const CUSTOM_BUNDLE = {
    bundleName: "Custom",
    id: "26fbe6a2-fe72-4c1e-9728-b1777038b9c8"
};

const BUNDLE_LIST = {
    bundles: [
        BASIC_BUNDLE,
        {
            bundleName: "Small",
            defaultDeviceAccessTokenss: "5000",
            defaultTokens: "150",
            id: "96b57c0b-ebbf-4e1a-8881-3052a28c0827"
        },
        {
            bundleName: "Medium",
            defaultDeviceAccessTokenss: "10000",
            defaultTokens: "300",
            id: "874929e5-a1b3-47dd-a683-93ad417a586f"
        },
        {
            bundleName: "Large",
            defaultDeviceAccessTokenss: "20000",
            defaultTokens: "500",
            id: "a0273d73-eff5-42d3-a5b0-28b2c2fcc264"
        },
        ADDON_BUNDLE,
        CUSTOM_BUNDLE
    ]
}

export const BundleServiceMock = {
    bundleList: BUNDLE_LIST,
    basicBundle: BASIC_BUNDLE,
    addonBundle: ADDON_BUNDLE,
    customBundle: CUSTOM_BUNDLE,
    getBundleList: () => {
        return new Observable((observer) => {
            observer.next(BUNDLE_LIST);
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    }
}