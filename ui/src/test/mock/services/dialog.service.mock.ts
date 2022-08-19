import {ConfirmDialogData} from '../../../app/model/confirm-dialog.model';
import {Observable} from 'rxjs';
import {DeleteCustomerDialogData} from '../../../app/model/delete-customer-dialog.model';

export class DialogServiceMock {
    expectedResult: {confirm, deleteAllData};
    expectedConfirmDialogValue: boolean;
    constructor() { }

    setExpectedConfirmDialogValue(expectedConfirmDialogValue: boolean): void {
        this.expectedConfirmDialogValue = expectedConfirmDialogValue;
    }

    setExpectedResult(expectedResult: {confirm, deleteAllData}): void {
        this.expectedResult = expectedResult;
    }

    confirmDialog(data: ConfirmDialogData): Observable<boolean> {
        return new Observable<boolean>((observer) => {
            observer.next(this.expectedConfirmDialogValue);
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    }

    deleteCustomerDialog(data: DeleteCustomerDialogData): Observable<{confirm, deleteAllData}> {
        return new Observable<{confirm, deleteAllData}>((observer) => {
            observer.next(this.expectedResult);
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    }

    afterClosed(): void{}
    afterAll() {
        return new Observable((observer) => {
            observer.next({ res: {} });
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    }
}
