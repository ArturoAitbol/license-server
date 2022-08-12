import { HttpClient } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDialog, MatDialogRef} from "@angular/material/dialog";
import { MatSnackBarModule, MatSnackBarRef } from "@angular/material/snack-bar";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MsalService } from "@azure/msal-angular";
import { SharedModule } from "src/app/modules/shared/shared.module";
import { ProjectService } from "src/app/services/project.service";
import { MatDialogMock } from "src/test/mock/components/mat-dialog.mock";
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { MsalServiceMock } from "src/test/mock/services/msal-service.mock";
import { ProjectServiceMock } from "src/test/mock/services/project-service.mock";
import { ProjectsComponent } from "../projects.component";
import { AddProjectComponent } from "./add-project.component";

let addPorjectComponentTestInstance: AddProjectComponent;
let fixture: ComponentFixture<AddProjectComponent>;
const dialogMock = new DialogServiceMock();



const beforeEachFunction = () => {
    TestBed.configureTestingModule({
        declarations: [ProjectsComponent, AddProjectComponent],
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
        const  projectNameLabel = fixture.nativeElement.querySelector('#project-name-label');
        const  projectCodeLabel = fixture.nativeElement.querySelector('#project-code-label');
        const  cancelButton = fixture.nativeElement.querySelector('#cancel-button');
        expect(h1.textContent).toBe('Add Project');
        expect(projectNameLabel.textContent).toBe('Project Name');
        expect(projectCodeLabel.textContent).toBe('Project Code');
        expect(cancelButton.textContent).toBe('Cancel');
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
});