export interface SubAccount {
    id?: string;
    customerId: string;
    name: string;
    subaccountAdminEmails: string[];
    services?: string | string[];
}