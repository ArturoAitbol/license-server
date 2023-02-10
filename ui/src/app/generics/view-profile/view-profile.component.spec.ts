import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule, FormBuilder } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MsalService } from "@azure/msal-angular";
import { SharedModule } from "src/app/modules/shared/shared.module";
import { DialogService } from "src/app/services/dialog.service";
import { SnackBarService } from "src/app/services/snack-bar.service";
import { SubAccountService } from "src/app/services/sub-account.service";
import { UserProfileService } from "src/app/services/user-profile.service";
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { MsalServiceMock } from "src/test/mock/services/msal-service.mock";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { SubaccountServiceMock } from "src/test/mock/services/subaccount-service.mock";
import { UserProfileServiceMock } from "src/test/mock/services/user-profile.mock";
import { ViewProfileComponent } from "./view-profile.component";


let ViewProfileComponentTestInstance: ViewProfileComponent;
let fixture: ComponentFixture<ViewProfileComponent>;
const dialogService = new DialogServiceMock();
let loader: HarnessLoader;

const MatDialogRefMock = {
    close: () => { }
};

const beforeEachFunction = () => {
    TestBed.configureTestingModule({
        declarations: [ViewProfileComponent],
        imports: [BrowserAnimationsModule, MatSnackBarModule, SharedModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule],
        providers: [
            {
                provide: FormBuilder,
            },
            {
                provide: SnackBarService,
                useValue: SnackBarServiceMock
            },
            {
                provide: SubAccountService,
                useValue: SubaccountServiceMock
            },
            {
                provide: HttpClient
            },
            {
                provide: MsalService,
                useValue: MsalServiceMock
            },
            {
                provide: DialogService,
                useValue: dialogService
            },
            {
                provide: MatDialogRef,
                useValue: MatDialogRefMock
            },
            {
                provide: UserProfileService,
                useValue: UserProfileServiceMock
            }
        ]
    });
    fixture = TestBed.createComponent(ViewProfileComponent);
    ViewProfileComponentTestInstance = fixture.componentInstance;
    ViewProfileComponentTestInstance.ngOnInit();
    loader = TestbedHarnessEnvironment.loader(fixture);
    spyOn(console, 'log').and.callThrough();
}


describe('UI verification test for Profile modal', () => {
    beforeEach(beforeEachFunction);

    it('should display subaccount admin modal label correctly ', () => {
        fixture.detectChanges();
        const modalTitle = fixture.nativeElement.querySelector('#modal-title');
        const nameLabel = fixture.nativeElement.querySelector('#name-label');
        const jobTitleLabel = fixture.nativeElement.querySelector('#job-title-label');
        const emailLabel = fixture.nativeElement.querySelector('#email-label');
        const companyNameLabel = fixture.nativeElement.querySelector('#company-name-label');
        const phoneNumberLabel = fixture.nativeElement.querySelector('#phone-number-label');
        const cancelBtn = fixture.nativeElement.querySelector('#cancelBtn');
        const submitBtn = fixture.nativeElement.querySelector('#submitBtn');

        expect(modalTitle.textContent).toBe('Profile');
        expect(nameLabel.textContent).toBe('Name');
        expect(jobTitleLabel.textContent).toBe('Job Title');
        expect(emailLabel.textContent).toBe('Email');
        expect(companyNameLabel.textContent).toBe('Company Name');
        expect(phoneNumberLabel.textContent).toBe('Phone Number');
        expect(cancelBtn.textContent).toBe('Cancel');
        expect(submitBtn.textContent).toBe('Update');
    });
});


describe('Fetch and display user profile in UI', () => {
    beforeEach(beforeEachFunction);
    it('should display snackbar error if customer service fails', () => {
        spyOn(UserProfileServiceMock, 'getUserProfileDetails').and.callThrough();
        fixture.detectChanges();
        expect(UserProfileServiceMock.getUserProfileDetails).toHaveBeenCalledWith();
    });
});