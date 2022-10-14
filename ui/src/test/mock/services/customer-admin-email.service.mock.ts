import {Observable} from 'rxjs';
const CUSTOMER_ADMIN_EMAIL ={
    "customerAdminEmail":"z-test+1@customer.com",
    "customerId":"e3c62d9c-d3f2-4b16-9164-28b76017c8f5"
}
const MOCK_CUSTOMER_ADMIN_EMAIL_CREATED= {};
export const CustomerAdminEmailServiceMock = {
    customerAdminEmail: CUSTOMER_ADMIN_EMAIL,
    createAdminEmail: () => {
        return new Observable((observer) => {
            observer.next(CUSTOMER_ADMIN_EMAIL);
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