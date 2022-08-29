
import {Observable} from 'rxjs';

export const CustomerAdminEmailServiceMock = {
    createAdminEmail: () => {
        console.log("create call");
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