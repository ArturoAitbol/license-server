import { Observable } from "rxjs";

const STAKE_HOLDERS_LIST = {
    stakeHolders:[
        {
            name: 'testName1',
            jobTitle: 'testJob1',
            companyName: 'testName1',
            phoneNumber: '1111111111',
            notifications: 'TYPE:Detailed,DAILY_REPORTS,WEEKLY_REPORTS,MONTHLY_REPORTS',
            subaccountId: 'f6c0e45e-cfdc-4c1a-820e-bef6a856aaea',
            type:'Detailed'
        },
        {
            name:'testName2', 
            jobTitle:'testJob2', 
            companyName:'testComp2', 
            subaccountAdminEmail:'test2@gmail.com', 
            phoneNumber:'2222222222', 
            notifications:'TYPE:High level,DAILY_REPORTS,WEEKLY_REPORTS',
            subaccountId: 'f6c0e45e-cfdc-4c1a-820e-bef6a856aaea',
            type:'HIGH TIER'
        },
        {
            name:'testName3', 
            jobTitle:'testJob3', 
            companyName:'testCom3', 
            subaccountAdminEmail:'test3@gmail.com', 
            phoneNumber:'2222222222', 
            notifications: 'TYPE:LOW TIER',
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
            observer.next();
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
    },
    createStakeholder: () => {
        return new Observable((observer) => {
            observer.next({});
            observer.complete();
            return {
                unsubscribe() {}
            };
        });
    }
}