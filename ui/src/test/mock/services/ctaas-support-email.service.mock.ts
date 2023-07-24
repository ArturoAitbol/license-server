import {Observable} from 'rxjs';

export const CtaasSupportEmailServiceMock = {
    createSupportEmail: () => {
        return new Observable((observer) => {
            observer.next({});
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    deleteSupportEmail: () => {
        return new Observable((observer) => {
            observer.next({});
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    }
}