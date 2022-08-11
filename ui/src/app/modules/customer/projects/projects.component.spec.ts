import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed} from '@angular/core/testing';
import { MatDialog} from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { Observable } from 'rxjs';
import { DataTableComponent } from 'src/app/generics/data-table/data-table.component';
import { CustomerService } from 'src/app/services/customer.service';
import { DialogService } from 'src/app/services/dialog.service';
import { ProjectService } from 'src/app/services/project.service';
import { MatDialogMock } from 'src/test/mock/components/mat-dialog.mock';
import { CurrentCustomerServiceMock } from 'src/test/mock/services/current-customer-service.mock';
import { MsalServiceMock } from 'src/test/mock/services/msal-service.mock';
import { ProjectServiceMock } from 'src/test/mock/services/project-service.mock';
import { SnackBarServiceMock } from 'src/test/mock/services/snack-bar-service.mock';
import { SharedModule } from '../../shared/shared.module';
import { AddProjectComponent } from './add-project/add-project.component';
import { ModifyProjectComponent } from './modify-project/modify-project.component';
import { ProjectsComponent } from './projects.component';
import { Sort } from '@angular/material/sort';
import { DialogServiceMock } from 'src/test/mock/services/dialog-service.mock';

let projectsComponentTestInstance: ProjectsComponent;
let fixture: ComponentFixture<ProjectsComponent>;
const dialogService = new DialogServiceMock();

const RouterMock = {
    navigate: (commands: string[]) => {}
};

const beforeEachFunction = () => {
    TestBed.configureTestingModule({
        declarations: [ ProjectsComponent, DataTableComponent, ModifyProjectComponent, AddProjectComponent ],
        imports: [ BrowserAnimationsModule, MatSnackBarModule, SharedModule ],
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
                provide: DialogService,
                useValue: dialogService
            },
            {
                provide: CustomerService,
                useValue: CurrentCustomerServiceMock
            },
            {
                provide: MsalService,
                useValue: MsalServiceMock
            },
            {
                provide: HttpClient,
                useValue: HttpClient
            }
        ]
    });
    fixture = TestBed.createComponent(ProjectsComponent);
    projectsComponentTestInstance = fixture.componentInstance;
    projectsComponentTestInstance.ngOnInit();
    spyOn(console, 'log').and.callThrough();
    spyOn(CurrentCustomerServiceMock, 'getSelectedCustomer' ).and.callThrough();
    spyOn(ProjectServiceMock, 'setSelectedSubAccount').and.callThrough();
    spyOn(ProjectServiceMock, 'getProjectDetailsBySubAccount').and.callThrough();
};

describe('UI verification test', () => {
    beforeEach(beforeEachFunction);
    it('should display essential UI and components', () =>{
        fixture.detectChanges();
        const h2 = fixture.nativeElement.querySelector('#page-title');
        const addProjectButton = fixture.nativeElement.querySelector('#add-new-project-button');
        const goBackButton = fixture.nativeElement.querySelector('#go-back-button');
        expect(h2.textContent).toBe('Project Summary');
        expect(addProjectButton.textContent).toBe('Add New Project ');
        expect(goBackButton.textContent).toBe('Back');
    });

    it('should load correct data columns for the table', () => {
        fixture.detectChanges();
        const projectCodeColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[0];
        const projectNameColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[1];
        const projectStatusColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[2];
        const projectStartDateColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[3];
        const projectCloseDateColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[4];
        expect(projectCodeColumn.innerText).toBe('Project Code');
        expect(projectNameColumn.innerText).toBe('Project Name');
        expect(projectStatusColumn.innerText).toBe('Status');
        expect(projectStartDateColumn.innerText).toBe('Start Date');
        expect(projectCloseDateColumn.innerText).toBe('Close Date');
    });

    it('should execute sortData()', () => {
        const sort: Sort  = {active:'name', direction:'desc'  }

        spyOn(projectsComponentTestInstance, 'sortData').and.callThrough();

        projectsComponentTestInstance.sortData(sort);
        expect(projectsComponentTestInstance.sortData).toHaveBeenCalledWith(sort);

        sort.direction = 'asc';
        projectsComponentTestInstance.sortData(sort);
        
        sort.direction = '';
        projectsComponentTestInstance.sortData(sort);
    });
});

describe('Data collection and parsing tests', () => {
    beforeEach(beforeEachFunction);
    it('should make a call to get project list after initializing', () => {
        fixture.detectChanges();
        expect(CurrentCustomerServiceMock.getSelectedCustomer).toHaveBeenCalled();
        expect(ProjectServiceMock.setSelectedSubAccount).toHaveBeenCalled();
        expect(ProjectServiceMock.getProjectDetailsBySubAccount).toHaveBeenCalled();
        expect(projectsComponentTestInstance.projects).toBe(ProjectServiceMock.projectsListValue.projects)
    });
});

describe('Dialog calls and interactions', () => {
    beforeEach(beforeEachFunction);
    it('should open new project comp', () =>{
        spyOn(projectsComponentTestInstance, 'openDialog');
        projectsComponentTestInstance.onNewProject();
        expect(projectsComponentTestInstance.openDialog).toHaveBeenCalledWith(AddProjectComponent);
    })

    it('should execute rowAction() with expected data given set arguments', () => {
        const selectedTestData = { selectedRow: { testProperty: 'testData'}, selectedOption: 'selectedTestOption', selectedIndex: '0' };
        spyOn(projectsComponentTestInstance, 'openDialog').and.callThrough();
        spyOn(projectsComponentTestInstance, 'confirmCloseDialog').and.callThrough();
        spyOn(projectsComponentTestInstance, 'confirmDeleteDialog').and.callThrough();
        spyOn(projectsComponentTestInstance, 'openConsumptionView').and.callThrough();
        spyOn(dialogService, 'confirmDialog').and.callThrough();

        selectedTestData.selectedOption = projectsComponentTestInstance.MODIFY_PROJECT;
        projectsComponentTestInstance.rowAction(selectedTestData);
        expect(projectsComponentTestInstance.openDialog).toHaveBeenCalledWith(ModifyProjectComponent, selectedTestData.selectedRow);

        selectedTestData.selectedOption = projectsComponentTestInstance.CLOSE_PROJECT;
        projectsComponentTestInstance.rowAction(selectedTestData);
        expect(projectsComponentTestInstance.confirmCloseDialog).toHaveBeenCalledWith(selectedTestData.selectedIndex);

        selectedTestData.selectedOption = projectsComponentTestInstance.DELETE_PROJECT;
        projectsComponentTestInstance.rowAction(selectedTestData);
        expect(projectsComponentTestInstance.confirmDeleteDialog).toHaveBeenCalledWith(selectedTestData.selectedIndex);

        selectedTestData.selectedOption = projectsComponentTestInstance.VIEW_CONSUMPTION;
        projectsComponentTestInstance.rowAction(selectedTestData);
        expect(projectsComponentTestInstance.openConsumptionView).toHaveBeenCalledWith(selectedTestData.selectedRow);

        selectedTestData.selectedOption = projectsComponentTestInstance.CLOSE_PROJECT;
        dialogService.setExpectedValue(true);
        projectsComponentTestInstance.rowAction(selectedTestData);
        expect(projectsComponentTestInstance.confirmCloseDialog).toHaveBeenCalledWith(selectedTestData.selectedIndex);
        expect(dialogService.confirmDialog).toHaveBeenCalled();
        
        selectedTestData.selectedOption = projectsComponentTestInstance.DELETE_PROJECT;
        dialogService.setExpectedValue(true);
        projectsComponentTestInstance.rowAction(selectedTestData);
        expect(projectsComponentTestInstance.confirmDeleteDialog).toHaveBeenCalledWith(selectedTestData.selectedIndex);
        expect(dialogService.confirmDialog).toHaveBeenCalled();
    });
});

describe('navigate', () => {
    beforeEach(beforeEachFunction);

    it('should navigate to license consumption after calling openConsumptionView()', () => {
        spyOn(RouterMock, 'navigate');
        projectsComponentTestInstance.openConsumptionView({});
        expect(RouterMock.navigate).toHaveBeenCalledWith(['/customer/consumption']);
    });

    it('should navigate to dashboard after calling goToDashboard()', () => {
        spyOn(RouterMock, 'navigate');
        projectsComponentTestInstance.goToDashboard();
        expect(RouterMock.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
});
