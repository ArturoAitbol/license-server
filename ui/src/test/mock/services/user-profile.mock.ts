import { Observable } from "rxjs";

const USER_PROFILE_DETAILS_LIST: any = [
    {
        name: 'testDemoR',
        email: 'testdemo.r@tekvizion.com',
        companyName: 'TekVizion',
        jobTitle: 'Engineer',
        phoneNumber: '9012345680',
        subaccountId: '6b06ef8d-5eb6-44c3-bf61-e78f8644767e',
        notifications: ['TYPE:High level', 'DAILY_REPORTS', 'MONTHLY_REPORTS']
    },
    {
        name: 'testcust',
        email: 'testcust@tekvizion.com',
        companyName: 'TekVizion',
        jobTitle: 'Lead Engineer',
        phoneNumber: '9012345678',
        subaccountId: 'eea5f3b8-37eb-41fe-adad-5f94da124a5a',
        notifications: ['TYPE:Detailed']
    }
];
let selectedUserProfile = USER_PROFILE_DETAILS_LIST[0];
export const UserProfileServiceMock = {
    selectedUserProfileDetails: { userProfile: selectedUserProfile },
    getUserProfileDetails: () => {
        return new Observable((observer) => {
            observer.next({ userProfile: USER_PROFILE_DETAILS_LIST[0] });
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    createUserProfile: (userDetails) => {
        return new Observable((observer) => {
            observer.next();
            observer.complete();
            return {
                unsubscribe() { }
            };
        });

    },
    updateUserProfile: (userDetails) => {
        return new Observable((observer) => {
            observer.next();
            observer.complete();
            return {
                unsubscribe() { }
            };
        });

    },
    setSubaccountUserProfileDetails: (userDetails) => {
        selectedUserProfile = userDetails;
    },
    getSubaccountUserProfileDetails: () => {
        return selectedUserProfile;
    }
};