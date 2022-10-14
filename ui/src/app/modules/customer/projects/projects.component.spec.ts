import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { of, throwError } from 'rxjs';
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
import { SnackBarService } from "../../../services/snack-bar.service";
import { LicenseService } from 'src/app/services/license.service';
import { LicenseServiceMock } from 'src/test/mock/services/license-service.mock';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';

let projectsComponentTestInstance: ProjectsComponent;
let fixture: ComponentFixture<ProjectsComponent>;
const dialogService = new DialogServiceMock();
let loader: HarnessLoader;

const RouterMock = {
    navigate: (commands: string[]) => { }
};

const defaultTestBedConfig = {
        declarations: [ProjectsComponent, DataTableComponent, ModifyProjectComponent, AddProjectComponent],
        imports: [BrowserAnimationsModule, MatSnackBarModule, SharedModule, FormsModule, ReactiveFormsModule],
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
            },
            {
                provide: SnackBarService,
                useValue: SnackBarServiceMock
            },
            {
                provide: FormBuilder
            },
        ]
};

const beforeEachFunction = () => {
    TestBed.configureTestingModule(defaultTestBedConfig);
    fixture = TestBed.createComponent(ProjectsComponent);
    projectsComponentTestInstance = fixture.componentInstance;
    projectsComponentTestInstance.ngOnInit();
    loader = TestbedHarnessEnvironment.loader(fixture);
    spyOn(console, 'log').and.callThrough();
    spyOn(CurrentCustomerServiceMock, 'getSelectedCustomer').and.callThrough();
    spyOn(ProjectServiceMock, 'setSelectedSubAccount').and.callThrough();
}

describe('UI verification test', () => {
    beforeEach(beforeEachFunction);
    it('should display essential UI and components', async () => {
        fixture.detectChanges();
        spyOn(projectsComponentTestInstance, 'sizeChange').and.callThrough();

        const h2 = fixture.nativeElement.querySelector('#page-subtitle');
        const addProjectButton = fixture.nativeElement.querySelector('#add-new-project-button');
        const goBackButton = fixture.nativeElement.querySelector('#go-back-button');

        projectsComponentTestInstance.sizeChange();
        expect(projectsComponentTestInstance.sizeChange).toHaveBeenCalled();
        expect(h2.textContent).toBe('Project Summary');
        expect(addProjectButton.textContent).toBe('Add New Project ');
        expect(goBackButton.textContent).toBe('Back');

        // Filters
        const licenseFilterForm = await loader.getHarness(MatFormFieldHarness.with({ selector: "#license-filter-form" }));
        expect(await licenseFilterForm.getLabel()).toContain('tekVizion 360 Subscription');
    });

    it('should load correct data columns for the table', () => {
        fixture.detectChanges();

        const headers: HTMLElement[] = fixture.nativeElement.querySelectorAll('.mat-sort-header-content');
        expect(headers[0].innerText).toBe('Project Code');
        expect(headers[1].innerText).toBe('Project Name');
        expect(headers[2].innerText).toBe('License Description');
        expect(headers[3].innerText).toBe('Status');
        expect(headers[4].innerText).toBe('Start Date');
        expect(headers[5].innerText).toBe('Close Date');
    });

    it('should execute sortData()', () => {
        const sort: Sort = { active: 'projectName', direction: 'desc' }

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
    it('should make a call to get licenses and projects after initializing', () => {
        spyOn(LicenseServiceMock, 'getLicenseList').and.callThrough();
        spyOn(ProjectServiceMock, 'getProjectDetailsBySubAccount').and.callThrough();

        fixture.detectChanges();
        projectsComponentTestInstance.currentCustomer = null;
        expect(CurrentCustomerServiceMock.getSelectedCustomer).toHaveBeenCalled();
        expect(ProjectServiceMock.setSelectedSubAccount).toHaveBeenCalled();
        expect(ProjectServiceMock.getProjectDetailsBySubAccount).toHaveBeenCalled();
        expect(projectsComponentTestInstance.projects).toBe(ProjectServiceMock.projectsListValue.projects);
    });

    it('should change the loading-related variables if getProjects() got an error', () => {
        spyOn(ProjectServiceMock, 'getProjectDetailsBySubAccount').and.returnValue(throwError("error"));
        fixture.detectChanges();

        expect(projectsComponentTestInstance.isLoadingResults).toBeFalse();
        expect(projectsComponentTestInstance.isRequestCompleted).toBeTrue();
    });
});

describe('Dialog calls and interactions', () => {
    beforeEach(beforeEachFunction);
    it('should open new project comp', () => {
        spyOn(projectsComponentTestInstance, 'openDialog');
        projectsComponentTestInstance.onNewProject();
        expect(projectsComponentTestInstance.openDialog).toHaveBeenCalledWith(AddProjectComponent);
    });

    it('should execute rowAction() with expected data given set arguments', () => {
        const selectedTestData = { selectedRow: { testProperty: 'testData' }, selectedOption: 'selectedTestOption', selectedIndex: '0' };

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

    it('should show a message if an error ocurred while closing a project after calling confirmCloseDialog()', () => {
        const selectedTestData = { selectedRow: { testProperty: 'testData' }, selectedOption: 'selectedTestOption', selectedIndex: '0' };
        const response = { body: { error: "some error message" } };
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        spyOn(ProjectServiceMock, 'closeProject').and.returnValue(of(response));
        spyOn(dialogService, 'confirmDialog').and.callThrough();
        fixture.detectChanges();

        selectedTestData.selectedOption = projectsComponentTestInstance.CLOSE_PROJECT;
        dialogService.setExpectedValue(true);
        projectsComponentTestInstance.rowAction(selectedTestData);
        expect(dialogService.confirmDialog).toHaveBeenCalled();

        expect(ProjectServiceMock.closeProject).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(response.body.error, 'Error closing project!');
    });

    it('should show a message if successfully closed a project after calling confirmCloseDialog()', () => {
        const selectedTestData = { selectedRow: { testProperty: 'testData' }, selectedOption: 'selectedTestOption', selectedIndex: '0' };
        const response = { body: null }
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        spyOn(ProjectServiceMock, 'closeProject').and.returnValue(of(response));
        spyOn(dialogService, 'confirmDialog').and.callThrough();
        fixture.detectChanges();

        selectedTestData.selectedOption = projectsComponentTestInstance.CLOSE_PROJECT;
        dialogService.setExpectedValue(true);
        projectsComponentTestInstance.rowAction(selectedTestData);
        expect(dialogService.confirmDialog).toHaveBeenCalled();

        expect(ProjectServiceMock.closeProject).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Project closed successfully!');
    });

    it('should show a message if successfully deleted a project after calling confirmDeleteDialog()', () => {
        const selectedTestData = { selectedRow: { testProperty: 'testData' }, selectedOption: 'selectedTestOption', selectedIndex: '0' };
        const response = { status: 200 };
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        spyOn(ProjectServiceMock, 'deleteProject').and.returnValue(of(response));
        spyOn(dialogService, 'confirmDialog').and.callThrough();
        fixture.detectChanges();

        selectedTestData.selectedOption = projectsComponentTestInstance.DELETE_PROJECT;
        dialogService.setExpectedValue(true);
        projectsComponentTestInstance.rowAction(selectedTestData);
        expect(dialogService.confirmDialog).toHaveBeenCalled();

        expect(ProjectServiceMock.deleteProject).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Project deleted successfully!');
    });

    it('should execute columnAction', () => {
        const selectedTestData = { selectedRow: { testProperty: 'testData' }, selectedIndex: '0', columnName: 'Status' };
        spyOn(projectsComponentTestInstance, 'columnAction').and.callThrough();
        spyOn(projectsComponentTestInstance, 'openDialog').and.callThrough();
        spyOn(projectsComponentTestInstance, 'openConsumptionView').and.callThrough();

        projectsComponentTestInstance.columnAction(selectedTestData);
        expect(projectsComponentTestInstance.openDialog).toHaveBeenCalledWith(ModifyProjectComponent, selectedTestData.selectedRow);

        selectedTestData.columnName='Project Name';
        projectsComponentTestInstance.columnAction(selectedTestData);
        expect(projectsComponentTestInstance.openConsumptionView).toHaveBeenCalledWith(selectedTestData.selectedRow);
    });

    it('should execute onChangeLicense', () => {
        fixture.detectChanges();
        spyOn(projectsComponentTestInstance, 'onChangeLicense').and.callThrough();;
    
        projectsComponentTestInstance.onChangeLicense('16f4f014-5bed-4166-b10a-808b2e6655e3')
        expect(projectsComponentTestInstance.onChangeLicense).toHaveBeenCalled();
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

describe('test customer false ', () => {
    beforeEach(() => {
        TestBed.configureTestingModule(defaultTestBedConfig);
        TestBed.overrideProvider(CustomerService, {
            useValue:{
                getSelectedCustomer:() => {
                    return{ 
                        id: '0b1ef03f-98d8-4fa3-8f9f-6b0013ce5848',
                        name: 'Test Customer',
                        status: 'Active',
                        customerType: 'MSP',
                        subaccountId: 'ac7a78c2-d0b2-4c81-9538-321562d426c7',
                        licenseId: '16f4f014-5bed-4166-b10a-808b2e6655e3',
                        subaccountName: 'Default',
                        testCustomer: false,
                        services: 'tokenConsumption,Ctaas'
                    }
                }
            }
        })
        fixture = TestBed.createComponent(ProjectsComponent);
        projectsComponentTestInstance = fixture.componentInstance;
    });

    it('should fetch the data of a real customer', () => {
        spyOn(LicenseServiceMock, 'getLicenseList').and.callThrough();
        spyOn(ProjectServiceMock, 'getProjectDetailsBySubAccount').and.callThrough();

        fixture.detectChanges();

        expect(ProjectServiceMock.getProjectDetailsBySubAccount).toHaveBeenCalled();
        expect(projectsComponentTestInstance.projects).toBe(ProjectServiceMock.projectsListValue.projects);
    });
});
