import { HttpClient } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDialog, MatDialogRef} from "@angular/material/dialog";
import { MatSnackBarModule, MatSnackBarRef } from "@angular/material/snack-bar";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MsalService } from "@azure/msal-angular";
import { SharedModule } from "src/app/modules/shared/shared.module";
import { ProjectService } from "src/app/services/project.service";
import { SnackBarService } from "src/app/services/snack-bar.service";
import { MatDialogMock } from "src/test/mock/components/mat-dialog.mock";
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { MsalServiceMock } from "src/test/mock/services/msal-service.mock";
import { ProjectServiceMock } from "src/test/mock/services/project-service.mock";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { ProjectsComponent } from "../projects.component";
import { AddProjectComponent } from "./add-project.component";
import { of, throwError } from 'rxjs';
import moment from "moment";

let addPorjectComponentTestInstance: AddProjectComponent;
let fixture: ComponentFixture<AddProjectComponent>;
const dialogMock = new DialogServiceMock();

const beforeEachFunction = () => {
    TestBed.configureTestingModule({
        declarations: [ ProjectsComponent, AddProjectComponent ],
        imports: [ BrowserAnimationsModule, MatSnackBarModule, SharedModule,  ReactiveFormsModule ],
        providers: [
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
                provide: SnackBarService,
                useValue: SnackBarServiceMock
            }
        ]
    });
    fixture = TestBed.createComponent(AddProjectComponent);
    addPorjectComponentTestInstance = fixture.componentInstance;
}

describe('UI verification for add project component', () => {
    beforeEach(beforeEachFunction);
    it('should display essential UI components', () => {
        fixture.detectChanges();
        const h1 = fixture.nativeElement.querySelector('#page-title');
        const startDate = fixture.nativeElement.querySelector('#start-date-lable');
        const projectNameLabel = fixture.nativeElement.querySelector('#project-name-label');
        const projectCodeLabel = fixture.nativeElement.querySelector('#project-code-label');
        const cancelButton = fixture.nativeElement.querySelector('#cancel-button');
        const submitButton = fixture.nativeElement.querySelector('#submit-button');
        expect(h1.textContent).toBe('Add Project');
        expect(startDate.textContent).toBe('Start Date');
        expect(projectNameLabel.textContent).toBe('Project Name');
        expect(projectCodeLabel.textContent).toBe('Project Code');
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
            openDate: moment('16-08-2022', 'DDMMYYYY')
        });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('#submit-button').disabled).toBeFalse();
    });

    it('should disable the submit button with an empty parameter', () => {
        const addProjectForm = addPorjectComponentTestInstance.addProjectForm;
        addProjectForm.setValue({
            projectName: '',
            projectNumber: { test: 'test' },
            openDate: moment('16-08-2022', 'DDMMYYYY')
        });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('#submit-button').disabled).toBeTrue();
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
});

describe('add-project - FormGroup verification test', () => {
    beforeEach(beforeEachFunction);
    it('should create a formGroup with necessary controls', () => {
        fixture.detectChanges();
        expect(addPorjectComponentTestInstance.addProjectForm.get('projectName')).toBeTruthy();
        expect(addPorjectComponentTestInstance.addProjectForm.get('projectNumber')).toBeTruthy();
        expect(addPorjectComponentTestInstance.addProjectForm.get('openDate')).toBeTruthy();
    });

    it('should make all the controls required', () => {
        const addProjectForm = addPorjectComponentTestInstance.addProjectForm;
        addProjectForm.setValue({
            projectName: '',
            projectNumber: '',
            openDate: ''
        });
        expect(addProjectForm.get('projectName').valid).toBeFalse();
        expect(addProjectForm.get('projectNumber').valid).toBeFalse();
        expect(addProjectForm.get('openDate').valid).toBeFalse();
    });
});
