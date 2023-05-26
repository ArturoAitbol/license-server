export enum ReportType {
    DAILY_FEATURE_FUNCTIONALITY = 'Daily-FeatureFunctionality',
    DAILY_CALLING_RELIABILITY = 'Daily-CallingReliability',
    DAILY_VQ = 'Daily-VQ',
    WEEKLY_FEATURE_FUNCTIONALITY = 'Weekly-FeatureFunctionality',
    WEEKLY_CALLING_RELIABILITY = 'Weekly-CallingReliability',
    WEEKLY_VQ = 'Weekly-VQ',
}

export enum ReportName {
    // report names in web
    FEATURE_FUNCTIONALITY_NAME = 'Feature Functionality',
    CALLING_RELIABILITY_NAME = 'Calling Reliability',
    VQ_NAME = 'Voice Quality (POLQA)',
    // test plan names in TAP
    TAP_FEATURE_FUNCTIONALITY = 'LTS',
    TAP_CALLING_RELIABILITY = 'STS',
    TAP_VQ = 'POLQA'
}