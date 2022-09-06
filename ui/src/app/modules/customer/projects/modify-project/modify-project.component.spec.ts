import { HttpClient } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBarModule, MatSnackBarRef } from "@angular/material/snack-bar";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Router } from "@angular/router";
import { MsalService } from "@azure/msal-angular";
import { SharedModule } from "src/app/modules/shared/shared.module";
import { ProjectService } from "src/app/services/project.service";
import { MatDialogMock } from "src/test/mock/components/mat-dialog.mock";
import { currentProject } from "src/test/mock/services/current-project-service.mock";
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { MsalServiceMock } from "src/test/mock/services/msal-service.mock";
import { ProjectServiceMock } from "src/test/mock/services/project-service.mock";
import { ProjectsComponent } from "../projects.component";
import { ModifyProjectComponent } from "./modify-project.component";
import { of, throwError } from 'rxjs';
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { SnackBarService } from "src/app/services/snack-bar.service";
import { LicenseService } from "src/app/services/license.service";
import { LicenseServiceMock } from "src/test/mock/services/license-service.mock";
import moment from "moment";

let modifyPorjectComponentTestInstance: ModifyProjectComponent;
let fixture: ComponentFixture<ModifyProjectComponent>;
const dialogMock = new DialogServiceMock();

const RouterMock = {
    navigate: (commands: string[]) => {}
};

const beforeEachFunction = () => {
    TestBed.configureTestingModule({
        declarations: [ModifyProjectComponent, ProjectsComponent],
        imports: [ BrowserAnimationsModule, MatSnackBarModule, SharedModule,  ReactiveFormsModule ],
        providers: [
            {
                provide: Router,
                useValue: RouterMock
            },
            {
                provide: MatDialog,
                useValue: MatDialogMock
            },
            {
                provide: MatSnackBarRef,
                useValue: {}
            },
            {
                provide: ProjectService,
                useValue: ProjectServiceMock
            },
            {
                provide: LicenseService,
                useValue: LicenseServiceMock
            },
            {
                provide: MsalService,
                useValue: MsalServiceMock
            },
            {
                provide: HttpClient,
                useValue: HttpClient
            },
            {
                provide: MatDialogRef,
                useValue: dialogMock
            },
            {
                provide: MAT_DIALOG_DATA,
                useValue: currentProject
            },
            {
                provide: SnackBarService,
                useValue: SnackBarServiceMock
            }
        ]
    });
    fixture = TestBed.createComponent(ModifyProjectComponent);
    modifyPorjectComponentTestInstance = fixture.componentInstance;
    modifyPorjectComponentTestInstance.ngOnInit();
}

describe('UI verification test for modify component', () => {
    beforeEach(beforeEachFunction);
    it('should display essential UI components', () => {
        fixture.detectChanges();
        const h1 = fixture.nativeElement.querySelector('#modal-title');
        const startDateLabel = fixture.nativeElement.querySelector('#start-date-label');
        const projectNameLabel = fixture.nativeElement.querySelector('#project-name-label');
        const projectCodeLabel = fixture.nativeElement.querySelector('#project-code-label');
        const projectLicenseLable = fixture.nativeElement.querySelector('#project-license-label');
        const projectStatusLable = fixture.nativeElement.querySelector('#project-status-label');
        const closeButton = fixture.nativeElement.querySelector('#cancel-button');
        const submitButton = fixture.nativeElement.querySelector('#submit-project-button');
        expect(h1.textContent).toBe('Edit Project');
        expect(startDateLabel.textContent).toBe('Start Date');
        expect(projectNameLabel.textContent).toBe('Project Name');
        expect(projectCodeLabel.textContent).toBe('Project Code');
        expect(projectLicenseLable.textContent).toBe('tekVizion 360 Subscription');
        expect(projectStatusLable.textContent).toBe('Status');
        expect(closeButton.textContent).toBe('Cancel');
        expect(submitButton.textContent).toBe('Submit');
    });
});

describe('modify project interactions', () => {
    beforeEach(beforeEachFunction);
     it('should execute submit action', () => {
        spyOn(modifyPorjectComponentTestInstance, 'submit').and.callThrough();
        spyOn(modifyPorjectComponentTestInstance, 'onCancel').and.callThrough();
        spyOn(dialogMock, 'close').and.callThrough();

        modifyPorjectComponentTestInstance.submit();
        expect(modifyPorjectComponentTestInstance.submit).toHaveBeenCalled();

        modifyPorjectComponentTestInstance.onCancel();
        expect(modifyPorjectComponentTestInstance.onCancel).toHaveBeenCalled();
    }); 

    it('should execute submit action with a null respose', () => {
        const res = undefined;
        spyOn(modifyPorjectComponentTestInstance, 'submit').and.callThrough();
        spyOn(ProjectServiceMock, 'updateProject').and.returnValue(of(res));

        modifyPorjectComponentTestInstance.submit();

        expect(ProjectServiceMock.updateProject).toHaveBeenCalled();
    });
});

describe('change status of projects', () => {
    beforeEach(beforeEachFunction);
    it('should execute changingStatus()', () => {
        spyOn(modifyPorjectComponentTestInstance, 'onChangingStatus').and.callThrough();
        const status = 'Open'
        modifyPorjectComponentTestInstance.onChangingStatus(status)
        fixture.detectChanges();

        expect(modifyPorjectComponentTestInstance.onChangingStatus).toHaveBeenCalledWith(status);
    });

    it('should execute changinStatus() with close status', () => {
        spyOn(modifyPorjectComponentTestInstance, 'onChangingStatus').and.callThrough();
        const status = 'close';
        modifyPorjectComponentTestInstance.onChangingStatus(status);
        fixture.detectChanges();

        expect(modifyPorjectComponentTestInstance.onChangingStatus).toHaveBeenCalledWith(status)
    });
});


describe('change dates of projects', () => {
    beforeEach(beforeEachFunction);
    it('should modify the minimun close date allowed when calling onChangingStartDate()', () => {
        spyOn(modifyPorjectComponentTestInstance, 'onChangingStartDate').and.callThrough();
        const newStartDate = '2022-07-01';
        modifyPorjectComponentTestInstance.onChangingStartDate(newStartDate);

        expect(modifyPorjectComponentTestInstance.minCloseDate).toEqual(new Date(newStartDate));
    });

    it('should reset the start and close dates and its limits according to the license selected when calling onLicenseChange()', () => {
        spyOn(modifyPorjectComponentTestInstance, 'onLicenseChange').and.callThrough();
        modifyPorjectComponentTestInstance.licenses = LicenseServiceMock.licensesList.licenses;
        const license = LicenseServiceMock.mockLicenseA;
        const startDate = new Date(license.startDate + " 00:00:00");
        const renewalDate = new Date(license.renewalDate + " 00:00:00");
        modifyPorjectComponentTestInstance.today = renewalDate;
        
        
        modifyPorjectComponentTestInstance.onLicenseChange(license.id);

        expect(modifyPorjectComponentTestInstance.updateProjectForm.get('openDate').value).toBe('');
        expect(modifyPorjectComponentTestInstance.updateProjectForm.get('closeDate').value).toBe('');
        expect(modifyPorjectComponentTestInstance.minDate).toEqual(startDate);
        expect(modifyPorjectComponentTestInstance.maxDate).toEqual(renewalDate);
        expect(modifyPorjectComponentTestInstance.minCloseDate).toEqual(startDate);
        expect(modifyPorjectComponentTestInstance.maxCloseDate).toEqual(renewalDate);
    });
});

describe('Dialog calls and interactions', () => {
    beforeEach(beforeEachFunction);
    it('should show a message if an error ocurred while a submit failed', () => {
        const response = {error:"some error message"};
        spyOn(ProjectServiceMock, 'updateProject').and.returnValue(of(response));
        spyOn(SnackBarServiceMock,'openSnackBar').and.callThrough();
        fixture.detectChanges();

        modifyPorjectComponentTestInstance.submit();

        expect(ProjectServiceMock.updateProject).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(response.error, 'Error updating project!');
    });

    it('should show a message if an error ocurred while loading data', () => {  
        const err = {error: "some error"};
        spyOn(LicenseServiceMock, 'getLicenseList').and.returnValue(throwError(err));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        spyOn(console, 'error').and.callThrough();
        fixture.detectChanges();

        expect(LicenseServiceMock.getLicenseList).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(err.error, 'Error requesting subscriptions!');
        expect(console.error).toHaveBeenCalledWith('error fetching subscriptions', err);
        expect(modifyPorjectComponentTestInstance.isDataLoading).toBeFalse();
    });
}); 

describe('obtaining the data of licenses in the ngOnInit()', () => {
    beforeEach(beforeEachFunction);
    it('should load the data of licenses in ngOnInit()', () => {
        fixture.detectChanges();
        const res = {
            error: false, 
            licenses: [{subaccountId: 'ac7a78c2-d0b2-4c81-9538-321562d426c7',
                id: '16f4f014-5bed-4166-b10a-808b2e6655e3',
                description: 'DescriptionA',
                status: 'Active',
                deviceLimit: '',
                tokensPurchased: 150,
                startDate: '2022-08-01',
                renewalDate: '2022-09-30',
                subscriptionType: ''
            }]
        };
        spyOn(LicenseServiceMock, 'getLicenseList').and.returnValue(of(res));

        fixture.detectChanges();
        modifyPorjectComponentTestInstance.ngOnInit();

        expect(LicenseServiceMock.getLicenseList).toHaveBeenCalled();
    });
});

describe('modify-project FormGroup verification', () => {
    beforeEach(beforeEachFunction);
    it('should create formGroup with necessary controls', () => {
        fixture.detectChanges();
        expect(modifyPorjectComponentTestInstance.updateProjectForm.get('projectName')).toBeTruthy();
        expect(modifyPorjectComponentTestInstance.updateProjectForm.get('projectNumber')).toBeTruthy();
        expect(modifyPorjectComponentTestInstance.updateProjectForm.get('openDate')).toBeTruthy();
        expect(modifyPorjectComponentTestInstance.updateProjectForm.get('closeDate')).toBeTruthy();
        expect(modifyPorjectComponentTestInstance.updateProjectForm.get('status')).toBeTruthy();
    });

    it('should make all the controls required', () => {
        const modifyProjectForm = modifyPorjectComponentTestInstance.updateProjectForm;
        modifyProjectForm.setValue({
            projectName: '',
            projectNumber: '',
            openDate: '',
            closeDate: '',
            status: '',
            licenseId: ''
        });

        expect(modifyProjectForm.get('projectName').valid).toBeFalse();
        expect(modifyProjectForm.get('projectNumber').valid).toBeFalse();
        expect(modifyProjectForm.get('openDate').valid).toBeFalse();
        expect(modifyProjectForm.get('closeDate').valid).toBeFalse();
        expect(modifyProjectForm.get('status').valid).toBeFalse();
        expect(modifyProjectForm.get('licenseId').valid).toBeFalse();
    });

    it('should not show the submit button if there are missing parameters', () => {
        fixture.detectChanges();
        const modifyProjectForm = modifyPorjectComponentTestInstance.updateProjectForm;
        modifyProjectForm.setValue({
            projectName: '',
            projectNumber: { test: 'test' },
            openDate: moment('16-08-2022', 'DDMMYYYY'),
            closeDate: moment('16-08-2022', 'DDMMYYYY'),
            status: 'Open',
            licenseId: { test:'test' }
        });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('#submit-project-button').disabled).toBeTrue();
    });

});
