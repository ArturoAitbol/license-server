export interface IStakeholder {
    name: string;
    jobTitle: string;
    companyName: string;
    subaccountAdminEmail: string;
    phoneNumber: string;
    notifications: string;
    subaccountId?: string;
    type:string;
    role:string;
    parsedRole:string;
    latestCallbackRequestDate?:string;
    emailNotifications?: any;
}