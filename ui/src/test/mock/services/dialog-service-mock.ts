import {ConfirmDialogData} from '../../../app/model/confirm-dialog.model';
import {Observable} from 'rxjs';

export class DialogServiceMock {
    expectedValue:any;
    constructor() {
    }

    setExpectedValue(expectedValue: any): void {
        this.expectedValue = expectedValue;
    }

    confirmDialog(data: ConfirmDialogData): Observable<boolean> {
        return new Observable<boolean>((observer) => {
            observer.next(this.expectedValue);
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    }

    afterClosed(): void{}
}
