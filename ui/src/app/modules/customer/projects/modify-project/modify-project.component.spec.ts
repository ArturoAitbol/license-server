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

let modifyPorjectComponentTestInstance: ModifyProjectComponent;
let fixture: ComponentFixture<ModifyProjectComponent>;
let dialogRef: MatDialogRef<ModifyProjectComponent>;
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
        const projectTypeLable = fixture.nativeElement.querySelector('#project-type-label');
        const closeButton = fixture.nativeElement.querySelector('#cancel-button');
        const submitButton = fixture.nativeElement.querySelector('#submit-button');
        expect(h1.textContent).toBe('Edit Project');
        expect(startDateLabel.textContent).toBe('Start Date');
        expect(projectNameLabel.textContent).toBe('Project Name');
        expect(projectCodeLabel.textContent).toBe('Project Code');
        expect(projectTypeLable.textContent).toBe('Type');
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
});

describe('change status of projects', () => {
    beforeEach(beforeEachFunction);
    it('should execute changingStatus()', () => {
        const status = ''
        spyOn(modifyPorjectComponentTestInstance, 'onChanginStatus').and.callThrough();

        modifyPorjectComponentTestInstance.onChanginStatus(status)
        expect(modifyPorjectComponentTestInstance.onChanginStatus).toHaveBeenCalledOnceWith(status);

    });
});