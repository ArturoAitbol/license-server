import {Observable} from 'rxjs';

export const CustomerAdminEmailServiceMock = {
    createAdminEmail: () => {
        return new Observable((observer) => {
            observer.next( {} );
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