import { Observable } from "rxjs";

const STAKE_HOLDERS_LIST = {
    stakeHolders:[
        {
            name: 'rge',
            jobTitle: 'tert',
            companyName: 'tert',
            subaccountAdminEmail: 'tert@gmail.com',
            phoneNumber: '1111111111',
            notifications: 'TYPE: weekly, daily',
            subaccountId: 'f6c0e45e-cfdc-4c1a-820e-bef6a856aaea',
            type:'LOW TIER',
            label: ''
        },
        {
            name:'vbvb', 
            jobTitle:'bvbvb', 
            companyName:'bvbvb', 
            subaccountAdminEmail:'vbvbvb@gmail.com', 
            phoneNumber:'2222222222', 
            subaccountId: 'f6c0e45e-cfdc-4c1a-820e-bef6a856aaea',
            type:'HIGH TIER', 
            notifications:'TYPE: daily, weekly',
            label: ''
        }
    ]
};

export const StakeHolderServiceMock = {
    stakeHolderValue: STAKE_HOLDERS_LIST,
    getStakeholderList: (id?:string) => {
        return new Observable((observer) => {
            observer.next(
                STAKE_HOLDERS_LIST
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
}