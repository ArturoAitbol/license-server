import {Component, OnDestroy, OnInit} from '@angular/core';
import {TestCase} from 'src/app/model/test-case';
import {Subscription} from 'rxjs';
import {TestCaseService} from 'src/app/services/test-case.service';
import {ToastrService} from 'ngx-toastr';

@Component({
    selector: 'edit-test',
    templateUrl: './edit-test.component.html',
    styleUrls: ['./edit-test.component.css']
})
export class EditTestComponent implements OnInit, OnDestroy {
    test: TestCase = new TestCase();
    subscription: Subscription;
    regexPattern: string;

    constructor(private testCaseService: TestCaseService,
                private toastr: ToastrService) {
    }

    ngOnInit() {
        this.regexPattern = this.testCaseService.testCaseRxPattern;
        this.test = this.testCaseService.getTestCase();
    }

    editTest() {
        // to trim the test tag names
        const tags = this.test.tags;
        this.test.tags = tags.trim();
        // service call
        this.subscription = this.testCaseService.editTestCase(this.test).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to update test: ' + response.response.message, 'Error');
            } else {
                this.toastr.success('Test Case updated succesfully', 'Success');
                this.testCaseService.closeModal.emit('edited');
            }
        });
    }

    closeModal() {
        this.testCaseService.closeModal.emit();
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
