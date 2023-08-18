import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogMock } from "src/test/mock/components/mat-dialog.mock";
import { ProjectServiceMock } from "src/test/mock/services/project-service.mock";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { AddProjectComponent } from "./add-project.component";
import { of, throwError } from 'rxjs';
import { LicenseServiceMock } from "src/test/mock/services/license-service.mock";
import moment from "moment";
import { TestBedConfigBuilder } from '../../../../../test/mock/TestBedConfigHelper.mock';

let addPorjectComponentTestInstance: AddProjectComponent;
let fixture: ComponentFixture<AddProjectComponent>;

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(AddProjectComponent);
    configBuilder.addDeclaration(AddProjectComponent);
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(AddProjectComponent);
    addPorjectComponentTestInstance = fixture.componentInstance;
};

describe('UI verification for add project component', () => {
    beforeEach(beforeEachFunction);
    it('should display essential UI components', () => {
        fixture.detectChanges();
        const h1 = fixture.nativeElement.querySelector('#page-title');
        const startDate = fixture.nativeElement.querySelector('#start-date-lable');
        const submitButton = fixture.nativeElement.querySelector('#submit-project-button');
        const  projectNameLabel = fixture.nativeElement.querySelector('#project-name-label');
        const  projectCodeLabel = fixture.nativeElement.querySelector('#project-code-label');
        const  projectLicenseLabel = fixture.nativeElement.querySelector('#project-license-label');
        const  cancelButton = fixture.nativeElement.querySelector('#cancel-button');
        expect(h1.textContent).toBe('Add Project');
        expect(startDate.textContent).toBe('Start Date');
        expect(projectNameLabel.textContent).toBe('Project Name');
        expect(projectCodeLabel.textContent).toBe('Project Code');
        expect(projectLicenseLabel.textContent).toBe('TekVizion 360 Subscription');
        expect(cancelButton.textContent).toBe('Cancel');
        expect(submitButton.disabled).toBeTrue();
    });
});

describe('add projects interactions', () => {
    beforeEach(beforeEachFunction);
    it('should call submit', () => {
        fixture.detectChanges();
        spyOn(addPorjectComponentTestInstance,'submit').and.callThrough();
        spyOn(addPorjectComponentTestInstance, 'onCancel').and.callThrough();

        addPorjectComponentTestInstance.submit();
        expect(addPorjectComponentTestInstance.submit).toHaveBeenCalled();

        addPorjectComponentTestInstance.onCancel();
        expect(addPorjectComponentTestInstance.onCancel).toHaveBeenCalled();
    });

    it('should enable the submit button on not empty parameters', () => {
        const addProjectForm = addPorjectComponentTestInstance.addProjectForm;
        addProjectForm.setValue({
            projectName: {test: 'test'},
            projectNumber: { test: 'test' },
            openDate: moment('16-08-2022', 'DDMMYYYY'),
            licenseId: { test:'test' }
        });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('#submit-project-button').disabled).toBeFalse();
    });

    it('should disable the submit button with an empty parameter', () => {
        const addProjectForm = addPorjectComponentTestInstance.addProjectForm;
        addProjectForm.setValue({
            projectName: '',
            projectNumber: { test: 'test' },
            openDate: moment('16-08-2022', 'DDMMYYYY'),
            licenseId: { test: 'test' }
        });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('#submit-project-button').disabled).toBeTrue();
    });

    it('should reset the Start Date and its limist when calling onLicenseChange()',()=>{
        spyOn(addPorjectComponentTestInstance,'onLicenseChange').and.callThrough();
        const license = LicenseServiceMock.mockLicenseA;
        addPorjectComponentTestInstance.licenses = JSON.parse(JSON.stringify(LicenseServiceMock.licensesList.licenses));

        addPorjectComponentTestInstance.onLicenseChange(license.id);

        expect(addPorjectComponentTestInstance.addProjectForm.get('openDate').value).toBe('');
        expect(addPorjectComponentTestInstance.addProjectForm.get('openDate').enabled).toBeTrue();
        expect(addPorjectComponentTestInstance.minDate).toEqual(new Date(license.startDate + " 00:00:00"));
        expect(addPorjectComponentTestInstance.maxDate).toEqual(new Date(license.renewalDate + " 00:00:00"));
    });
});

describe('Dialog calls and interactions', () => {
    beforeEach(beforeEachFunction);

    it('should show a message if an error ocurred while a submit failed', () => {
        const response = {error:"some error message"};
        spyOn(ProjectServiceMock, 'createProject').and.returnValue(of(response));
        spyOn(SnackBarServiceMock,'openSnackBar').and.callThrough();
        fixture.detectChanges();

        addPorjectComponentTestInstance.submit();

        expect(ProjectServiceMock.createProject).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(response.error, 'Error adding project!');
    });

    it('should show a message if an error was thrown while adding a project after calling submit()', () => {
        const err = { error:"some error"};
        spyOn(ProjectServiceMock, 'createProject').and.returnValue(throwError(err));
        spyOn(SnackBarServiceMock,'openSnackBar').and.callThrough();
        spyOn(console, 'error').and.callThrough();
        fixture.detectChanges();

        addPorjectComponentTestInstance.submit();

        expect(ProjectServiceMock.createProject).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(err.error, 'Error adding project!');
        expect(console.error).toHaveBeenCalledWith('error adding a new project', err);
        expect(addPorjectComponentTestInstance.isDataLoading).toBeFalse();
    });

    it('should show a message if an error ocurred while loading data ngOnInit()', () => {
        const err = {error: 'some error'};
        spyOn(LicenseServiceMock, 'getLicenseList').and.returnValue(throwError(err));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        spyOn(console, 'error').and.callThrough()
        fixture.detectChanges();

        expect(LicenseServiceMock.getLicenseList).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(err.error, 'Error requesting subscriptions!');
        expect(console.error).toHaveBeenCalledWith('error fetching subscriptions', err);
        expect(addPorjectComponentTestInstance.isDataLoading).toBeFalse();
    });
});

describe('obtaining the data od licenses from ngOnInit()', () => {
    beforeEach(beforeEachFunction);

    it('should obtain the list of licenses', () => {
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
        spyOn(LicenseServiceMock, 'getLicenseList').and.returnValue(of(res))

        addPorjectComponentTestInstance.ngOnInit();

        expect(LicenseServiceMock.getLicenseList).toHaveBeenCalled();
    });
});

describe('add-project - FormGroup verification test', () => {
    beforeEach(beforeEachFunction);
    it('should create a formGroup with necessary controls', () => {
        fixture.detectChanges();
        expect(addPorjectComponentTestInstance.addProjectForm.get('projectName')).toBeTruthy();
        expect(addPorjectComponentTestInstance.addProjectForm.get('projectNumber')).toBeTruthy();
        expect(addPorjectComponentTestInstance.addProjectForm.get('openDate')).toBeTruthy();
        expect(addPorjectComponentTestInstance.addProjectForm.get('licenseId')).toBeTruthy();
    });

    it('should make all the controls required', () => {
        const addProjectForm = addPorjectComponentTestInstance.addProjectForm;
        addProjectForm.setValue({
            projectName: '',
            projectNumber: '',
            openDate: '',
            licenseId: ''
        });
        expect(addProjectForm.get('projectName').valid).toBeFalse();
        expect(addProjectForm.get('projectNumber').valid).toBeFalse();
        expect(addProjectForm.get('openDate').valid).toBeFalse();
        expect(addProjectForm.get('licenseId').valid).toBeFalse();
    });
});
