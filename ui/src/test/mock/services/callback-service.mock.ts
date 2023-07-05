import { Observable } from "rxjs";

const CALLBACK_A = {
    name:'testName3', 
    jobTitle:'testJob3', 
    companyName:'testCom3', 
    subaccountAdminEmail:'test3@gmail.com', 
    phoneNumber:'2222222222', 
    notifications: 'TYPE:LOW TIER',
    subaccountId: 'f6c0e45e-cfdc-4c1a-820e-bef6a856aaea',
    type:'High level'
}

export const CallbackServiceMock = {
    createCallback: (callback: any) => {
        return new Observable((observer) => {
            observer.next({
                name: 'testDemoR',
                email: 'testdemo.r@tekvizion.com',
                companyName: 'TekVizion',
                jobTitle: 'Engineer',
                phoneNumber: '9012345680',
                subaccountId: '6b06ef8d-5eb6-44c3-bf61-e78f8644767e',
                notifications: ['TYPE:High level', 'DAILY_REPORTS', 'MONTHLY_REPORTS']
            });
            observer.complete();
            return {
                unsubscribe() {return;}
            };
        });
    },
}