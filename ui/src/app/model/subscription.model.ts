export interface Subscription {
    customerId: string,
    customerName: string,
    subaccountId?: string,
    subaccountName?: string,
    licenseId?: string,
    licenseDescription?: string,
    licenseStatus?: string,
    licensePackageType?: string,
    licenseStartDate?: string,
    licenseRenewalDate?: string,
    licenseTokens?: number,
    licenseTokensConsumed?: number
}
