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
            observer.next(
                {
                    body:[
                        {
                            name:'testName3', 
                            jobTitle:'testJob3', 
                            companyName:'testCom3', 
                            subaccountAdminEmail:'test3@gmail.com', 
                            phoneNumber:'2222222222', 
                            notifications: 'TYPE:LOW TIER',
                            subaccountId: 'f6c0e45e-cfdc-4c1a-820e-bef6a856aaea',
                            type:'High level'
                        }
                    ]
                }
            );
            observer.complete();
            return {
                unsubscribe() { return; }
            };
        });
    },
}