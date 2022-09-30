import { Observable } from "rxjs";

const STAKE_HOLDERS_LIST = {
    stakeHolders:[
        {
            name: 'rge',
            jobTitle: 'tert',
            companyName: 'tert',
            subaccountAdminEmail: 'tert@gmail.com',
            phoneNumber: '1111111111',
            notifications: 'TYPE:LOW TIER,DAILY_REPORTS,WEEKLY_REPORTS,MONTHLY_REPORTS',
            subaccountId: 'f6c0e45e-cfdc-4c1a-820e-bef6a856aaea',
            type:'LOW TIER'
        },
        {
            name:'vbvb', 
            jobTitle:'bvbvb', 
            companyName:'bvbvb', 
            subaccountAdminEmail:'vbvbvb@gmail.com', 
            phoneNumber:'2222222222', 
            notifications:'TYPE:HIGH TIER,DAILY_REPORTS,WEEKLY_REPORTS',
            subaccountId: 'f6c0e45e-cfdc-4c1a-820e-bef6a856aaea',
            type:'HIGH TIER'
        }
    ]
};

export const StakeHolderServiceMock = {
    stakeHolderValue: STAKE_HOLDERS_LIST,
    getStakeholderList: () => {
        return new Observable((observer) => {
            observer.next(
                JSON.parse(JSON.stringify(STAKE_HOLDERS_LIST))
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    deleteStakeholder: () => {
        return new Observable((observer) => {
            observer.next(
                { 
                    body:[
                        {
                            email:'tert@gmail.com',
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
    updateStakeholderDetails: () => {
        return new Observable((observer) => {
            observer.next();
            observer.complete();
            return {
                unsubscribe() {}
            };
        });
    }
}