import { Observable} from 'rxjs';

export const MatDialogMock = {
    open: <T, D = any, R = any>(arg1, options) => {
        return {
            afterClosed: () => {
                return new Observable((observer) => {
                    observer.next(
                        true
                    );
                    observer.complete();
                    return {
                        unsubscribe() { }
                    };
                });
            },
            componentInstance:{}
        };
    },
    close: () => {
        return null;
    }
};