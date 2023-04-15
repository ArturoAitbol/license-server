import {Observable, throwError} from 'rxjs';


export const SubaccountAdminEmailServiceMock = {
    createAdminEmail:(details: any) => {
        return new Observable((observer) => {
            observer.next(null);
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    deleteAdminEmail: (adminEmail: string) => {
        return new Observable((observer) => {
            observer.next(null);
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    apiErrorResponse: () => {
        return new Observable((observer) => {
            observer.next({
                error: 'Expected create subaccount admin email error'
            });
            observer.complete();
            return {
                unsubscribe() {}
            };
        });
    },
    errorResponse: () => {
        return throwError({
            error: 'Expected subaccount admin emails response error'
        });
    }
};