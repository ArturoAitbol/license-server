import { ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { of } from "rxjs";
import { DialogService } from "src/app/services/dialog.service";
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { UserProfileServiceMock } from "src/test/mock/services/user-profile.mock";
import { ViewProfileComponent } from "./view-profile.component";
import { TestBedConfigBuilder } from '../../../test/mock/TestBedConfigHelper.mock';


let ViewProfileComponentTestInstance: ViewProfileComponent;
let fixture: ComponentFixture<ViewProfileComponent>;
const dialogService = new DialogServiceMock();

const currentProfile = {
    companyName: "testCompany",
    email: "teststakeholder11@gmail.com",
    jobTitle: "test",
    name: "testName",
    notifications: 'Weekly Reports,Monthly Summaries',
    phoneNumber: "2222222222",
    subaccountId: "f6c0e45e-cfdc-4c1a-820e-bef6a856aaea",
    type: "High level"
};

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(ViewProfileComponent);
    configBuilder.addProvider({ provide: MAT_DIALOG_DATA, useValue:currentProfile });
    configBuilder.addProvider({ provide: DialogService, useValue:dialogService });
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(ViewProfileComponent);
    ViewProfileComponentTestInstance = fixture.componentInstance;
    ViewProfileComponentTestInstance.ngOnInit();
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
        const cancelBtn = fixture.nativeElement.querySelector('#cancelBtn');
        const submitBtn = fixture.nativeElement.querySelector('#submitBtn');

        expect(modalTitle.textContent).toBe('Profile');
        expect(nameLabel.textContent).toBe('Name');
        expect(jobTitleLabel.textContent).toBe('Job Title');
        expect(emailLabel.textContent).toBe('Email');
        expect(companyNameLabel.textContent).toBe('Company Name');
        expect(cancelBtn.textContent).toBe('Cancel');
        expect(submitBtn.textContent).toBe('Update');
    });
});


describe('view profile - displays of messages and errors', () => {
    beforeEach(beforeEachFunction);

    it('view profile - should call update', fakeAsync(() => {
        spyOn(ViewProfileComponentTestInstance, 'updateProfile').and.callThrough();
        spyOn(UserProfileServiceMock, 'updateUserProfile').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        spyOn(ViewProfileComponentTestInstance, 'onCancel').and.callThrough();
        tick(500);
        ViewProfileComponentTestInstance.updateProfile(); 
        tick(500);
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Updated Profile successfully', '');
        expect(ViewProfileComponentTestInstance.onCancel).toHaveBeenCalledWith('closed');
    }));

    it('it should display a error message if something wrong happened updating profile', fakeAsync(() => {
        spyOn(ViewProfileComponentTestInstance, 'updateProfile').and.callThrough();
        spyOn(UserProfileServiceMock, 'updateUserProfile').and.returnValue(of({error:'some error'}));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        spyOn(ViewProfileComponentTestInstance, 'onCancel').and.callThrough();
        tick(500);
        ViewProfileComponentTestInstance.updateProfile(); 
        tick(500);
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('some error', 'Error updating profile details');
        expect(ViewProfileComponentTestInstance.onCancel).toHaveBeenCalledWith('error');
    }));

    it('it should display a error message if something wrong happened while updating profile', fakeAsync(() => {
        fixture.detectChanges();
        spyOn(ViewProfileComponentTestInstance, 'updateProfile').and.callThrough();
        spyOn(UserProfileServiceMock, 'updateUserProfile').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        spyOn(ViewProfileComponentTestInstance, 'onCancel').and.callThrough();
        ViewProfileComponentTestInstance.viewProfileForm = null
        tick(500);
        ViewProfileComponentTestInstance.updateProfile(); 
        tick(500);
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(undefined, 'Error updating profile details');
        expect(ViewProfileComponentTestInstance.onCancel).toHaveBeenCalledWith('error');
    }));
});