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
            type:'Detailed',
            role: 'customer.SubaccountAdmin'
        },
        {
            name:'testName2', 
            jobTitle:'testJob2', 
            companyName:'testComp2', 
            subaccountAdminEmail:'test2@gmail.com', 
            phoneNumber:'2222222222', 
            notifications:'TYPE:High level,DAILY_REPORTS,WEEKLY_REPORTS',
            subaccountId: 'f6c0e45e-cfdc-4c1a-820e-bef6a856aaea',
            type:'High level',
            role: 'customer.Stakeholder'
        },
        {
            name:'testName3', 
            jobTitle:'testJob3', 
            companyName:'testCom3', 
            subaccountAdminEmail:'test3@gmail.com', 
            phoneNumber:'2222222222', 
            notifications: 'TYPE:LOW TIER',
            subaccountId: 'f6c0e45e-cfdc-4c1a-820e-bef6a856aaea',
            type:'High level',
            role: 'customer.Stakeholder'
        }
    ]
};

const STAKEHOLDER_A = {
    name: 'testName1',
    jobTitle: 'testJob1',
    companyName: 'testName1',
    phoneNumber: '1111111111',
    notifications: 'TYPE:Detailed,DAILY_REPORTS,WEEKLY_REPORTS,MONTHLY_REPORTS',
    subaccountId: 'f6c0e45e-cfdc-4c1a-820e-bef6a856aaea',
    type:'Detailed'
}

const STAKEHOLDER_B = {
    name:'testName2', 
    jobTitle:'testJob2', 
    companyName:'testComp2', 
    subaccountAdminEmail:'test2@gmail.com', 
    phoneNumber:'2222222222', 
    notifications:'TYPE:High level,DAILY_REPORTS,WEEKLY_REPORTS',
    subaccountId: 'f6c0e45e-cfdc-4c1a-820e-bef6a856aaea',
    type:'High level'
}

const STAKEHOLDER_C = {
    name:'testName3', 
    jobTitle:'testJob3', 
    companyName:'testCom3', 
    subaccountAdminEmail:'test3@gmail.com', 
    phoneNumber:'2222222222', 
    notifications: 'TYPE:LOW TIER',
    subaccountId: 'f6c0e45e-cfdc-4c1a-820e-bef6a856aaea',
    type:'High level'
}


const SORTED_BY_JOB_TITLE_ASC = {
    stakeHolders: [
        STAKEHOLDER_A,
        STAKEHOLDER_B,
        STAKEHOLDER_C
    ]
}

const SORTED_BY_JOB_TITLE_DES = {
    stakeHolders: [
        STAKEHOLDER_C,
        STAKEHOLDER_B,
        STAKEHOLDER_A
    ]
}

const UNSORTED_STAKEHOLDER_LIST = {
    stakeHolders:[
        STAKEHOLDER_C,
        STAKEHOLDER_A,
        STAKEHOLDER_B,
    ]
}
export const StakeHolderServiceMock = {
    stakeHolderValue: STAKE_HOLDERS_LIST,
    sortedJobAsc: SORTED_BY_JOB_TITLE_ASC,
    sortedJobDes: SORTED_BY_JOB_TITLE_DES,
    unsortedStakeholderList: UNSORTED_STAKEHOLDER_LIST,
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
