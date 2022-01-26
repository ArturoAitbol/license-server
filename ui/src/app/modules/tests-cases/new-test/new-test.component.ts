import {Component, OnDestroy, OnInit} from '@angular/core';
import {TestCaseService} from 'src/app/services/test-case.service';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {TestsViewService} from 'src/app/services/tests-view.service';
import {TestCase} from 'src/app/model/test-case';
import {ToastrService} from 'ngx-toastr';
import {BsModalRef} from 'ngx-bootstrap/modal/public_api';


@Component({
    selector: 'new-test',
    templateUrl: './new-test.component.html',
    styleUrls: ['./new-test.component.css']
})
export class NewTestComponent implements OnInit, OnDestroy {
    test: TestCase = new TestCase();
    subscription: Subscription;
    modalRef: BsModalRef;
    regexPattern: string;

    constructor(private testCaseService: TestCaseService,
                private router: Router,
                private testsViewService: TestsViewService,
                private toastr: ToastrService) {
    }

    ngOnInit() {
        this.regexPattern = this.testCaseService.testCaseRxPattern;
        this.subscription = this.testsViewService.createNewTest.subscribe(res => {
            this.createTest();
        });
    }

    createTest() {
        this.test.ownerName = '';
        this.test.published = false;
        this.test.actions = [{}];
        this.test.lastModified = '';
        this.test.inventory = [{}];
        this.testCaseService.createTestCase(this.test).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to create a new test:' + response.response.message, 'Error');
            } else {
                this.test.id = response.response.id;
                this.router.navigate(['/testCase/' + this.test.id]);
                this.testsViewService.hideModal.emit();
            }
        });
    }


    hideModal() {
        this.testsViewService.hideModal.emit();
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
