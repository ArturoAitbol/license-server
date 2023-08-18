export interface IUserProfile {
    name?: string;
    email?: string;
    companyName?: string;
    jobTitle?: string;
    phoneNumber?: string;
    subaccountId?: string;
    type?: string;
    notifications?: string | [] | any;
    latestCallbackRequest?: number;
    emailNotifications?:boolean;
}