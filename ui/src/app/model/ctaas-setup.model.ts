export interface ICtaasSetup {
    id: string;
    azureResourceGroup: string;
    onBoardingComplete: string;
    status: string;
    subaccountId: string;
    tapUrl: string;
    maintenance?: boolean;
}
