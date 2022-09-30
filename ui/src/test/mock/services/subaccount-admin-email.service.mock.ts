import {Observable} from 'rxjs';
const SUBACCOUNT_ADMIN_EMAIL ={
    "subaccountAdminEmail": "test@tekvizion.com",
    "subaccountId": "20a00e47-464f-4ff3-ba01-5269170d38ac"
}
const MOCK_SUBACCOUNT_ADMIN_EMAIL_CREATED= {};
export const SubaccountAdminEmailServiceMock = {
    subaccountAdminEmail: SUBACCOUNT_ADMIN_EMAIL,
    createAdminEmail: () => {
        return new Observable((observer) => {
            observer.next(SUBACCOUNT_ADMIN_EMAIL);
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    deleteAdminEmail: () => {
        return new Observable((observer) => {
            observer.next({});
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    }
}