import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CustomerService } from 'src/app/services/customer.service';
import { DialogService } from 'src/app/services/dialog.service';
import { ProjectServiceMock } from 'src/test/mock/services/project-service.mock';
import { SnackBarServiceMock } from 'src/test/mock/services/snack-bar-service.mock';
import { AddProjectComponent } from './add-project/add-project.component';
import { ModifyProjectComponent } from './modify-project/modify-project.component';
import { ProjectsComponent } from './projects.component';
import { Sort } from '@angular/material/sort';
import { DialogServiceMock } from 'src/test/mock/services/dialog-service.mock';
import { LicenseServiceMock } from 'src/test/mock/services/license-service.mock';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { SubaccountServiceMock } from 'src/test/mock/services/subaccount-service.mock';
import { TestBedConfigBuilder } from '../../../../test/mock/TestBedConfigHelper.mock';
import { RouterMock } from '../../../../test/mock/Router.mock';
import { CustomerServiceMock } from '../../../../test/mock/services/customer-service.mock';

let projectsComponentTestInstance: ProjectsComponent;
let fixture: ComponentFixture<ProjectsComponent>;
const dialogService = new DialogServiceMock();
let loader: HarnessLoader;

const configBuilder = new TestBedConfigBuilder().useDefaultConfig(ProjectsComponent);
configBuilder.addProvider({ provide: DialogService, useValue: dialogService });

const beforeEachFunction = () => {
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(ProjectsComponent);
    projectsComponentTestInstance = fixture.componentInstance;
    projectsComponentTestInstance.ngOnInit();
    loader = TestbedHarnessEnvironment.loader(fixture);
    spyOn(CustomerServiceMock, 'getSelectedCustomer').and.callThrough();
    spyOn(ProjectServiceMock, 'setSelectedSubAccount').and.callThrough();
    spyOn(SubaccountServiceMock, 'getSelectedSubAccount').and.returnValue({
        id: "eea5f3b8-37eb-41fe-adad-5f94da124a5a",
        name: "testv2Demo",
        customerId: "157fdef0-c28e-4764-9023-75c06daad09d",
        services: "tokenConsumption,spotlight",
        testCustomer: false,
        companyName:"testComp",
        customerName:"testName"
    });
    spyOn(SubaccountServiceMock, 'setSelectedSubAccount').and.callThrough();
}

describe('projects - UI verification test', () => {
    beforeEach(beforeEachFunction);
    it('should display essential UI and components', async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        spyOn(projectsComponentTestInstance, 'sizeChange').and.callThrough();

        const h2 = fixture.nativeElement.querySelector('#page-subtitle');
        const addProjectButton = fixture.nativeElement.querySelector('#add-new-project-button');

        projectsComponentTestInstance.sizeChange();
        expect(projectsComponentTestInstance.sizeChange).toHaveBeenCalled();
        expect(h2.textContent).toBe('Project Summary');
        expect(addProjectButton.textContent).toBe('Add New Project ');

        // Filters
        const licenseFilterForm = await loader.getHarness(MatFormFieldHarness.with({ selector: "#license-filter-form" }));
        expect(await licenseFilterForm.getLabel()).toContain('TekVizion 360 Subscription');
    });

    it('should load correct data columns for the table', () => {
        fixture.detectChanges();

        const headers: HTMLElement[] = fixture.nativeElement.querySelectorAll('.mat-sort-header-content');
        // this has been temporarily disabled
        // expect(headers[0].innerText).toBe('Project Code');
        expect(headers[0].innerText).toBe('Project Name');
        expect(headers[1].innerText).toBe('License Description');
        expect(headers[2].innerText).toBe('Status');
        expect(headers[3].innerText).toBe('Start Date');
        expect(headers[4].innerText).toBe('Close Date');
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

describe('projects.component - Data collection and parsing tests', () => {
    beforeEach(beforeEachFunction);
    it('should make a call to get licenses and projects after initializing', () => {
        const subaccountId = 'eea5f3b8-37eb-41fe-adad-5f94da124a5a'
        spyOn(LicenseServiceMock, 'getLicenseList').and.callThrough();
        spyOn(ProjectServiceMock, 'getProjectDetailsBySubAccount').and.callThrough();

        fixture.detectChanges();
        projectsComponentTestInstance.currentCustomer = null;
        expect(LicenseServiceMock.getLicenseList).toHaveBeenCalled();
        expect(CustomerServiceMock.getSelectedCustomer).toHaveBeenCalled();
        expect(ProjectServiceMock.setSelectedSubAccount).toHaveBeenCalled();
        expect(ProjectServiceMock.getProjectDetailsBySubAccount).toHaveBeenCalledWith(subaccountId);
        expect(projectsComponentTestInstance.projects.length).toEqual(6);
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

        fixture.detectChanges();

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
        dialogService.setExpectedConfirmDialogValue(true);
        projectsComponentTestInstance.rowAction(selectedTestData);
        expect(projectsComponentTestInstance.confirmCloseDialog).toHaveBeenCalledWith(selectedTestData.selectedIndex);
        expect(dialogService.confirmDialog).toHaveBeenCalled();

        selectedTestData.selectedOption = projectsComponentTestInstance.DELETE_PROJECT;
        dialogService.setExpectedConfirmDialogValue(true);
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
        dialogService.setExpectedConfirmDialogValue(true);
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
        dialogService.setExpectedConfirmDialogValue(true);
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
        dialogService.setExpectedConfirmDialogValue(true);
        projectsComponentTestInstance.rowAction(selectedTestData);
        expect(dialogService.confirmDialog).toHaveBeenCalled();

        expect(ProjectServiceMock.deleteProject).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Project deleted successfully!');
    });

    it('should execute columnAction', async  () => {
        const selectedTestData = { selectedRow: { id: "eea5f3b8-37eb-41fe-adad-5f94da124a5a" }, selectedIndex: '0', columnName: 'Status' };
        spyOn(projectsComponentTestInstance, 'columnAction').and.callThrough();
        spyOn(projectsComponentTestInstance, 'openDialog').and.callThrough();
        spyOn(projectsComponentTestInstance, 'openConsumptionView').and.callThrough();

        fixture.detectChanges();
        await fixture.detectChanges();

        projectsComponentTestInstance.columnAction(selectedTestData);
        expect(projectsComponentTestInstance.openDialog).toHaveBeenCalledWith(ModifyProjectComponent, selectedTestData.selectedRow);

        selectedTestData.columnName='Project Name';
        projectsComponentTestInstance.columnAction(selectedTestData);
        expect(projectsComponentTestInstance.openConsumptionView).toHaveBeenCalledWith(selectedTestData.selectedRow);
    });

    it('should execute onChangeLicense', () => {
        spyOn(projectsComponentTestInstance, 'onChangeLicense').and.callThrough();
        fixture.detectChanges();
    
        projectsComponentTestInstance.onChangeLicense('986137d3-063d-4c0e-9b27-85fcf3b3272e')
        expect(projectsComponentTestInstance.onChangeLicense).toHaveBeenCalled();
    });
});

describe('projects - navigate', () => {
    beforeEach(beforeEachFunction);

    it('should navigate to license consumption after calling openConsumptionView()', () => {
        spyOn(RouterMock, 'navigate');
        projectsComponentTestInstance.openConsumptionView({});
        expect(RouterMock.navigate).toHaveBeenCalledWith(['/customer/consumption'], {queryParams: {subaccountId: undefined }});
    });
});

describe('test customer false and routing with query params', () => {
    beforeEach(() => {
        TestBed.configureTestingModule(configBuilder.getConfig());
        TestBed.overrideProvider(CustomerService, {
            useValue:{
                getSelectedCustomer:() => {
                    return{ 
                        id: '0b1ef03f-98d8-4fa3-8f9f-6b0013ce5848',
                        name: 'Test Customer',
                        status: 'Active',
                        customerType: 'MSP',
                        subaccountId: 'eea5f3b8-37eb-41fe-adad-5f94da124a5a',
                        licenseId: 'a3475bf9-41d5-432a-ae2d-ccf7681385cf',
                        subaccountName: 'Default',
                        testCustomer: false,
                        services: 'tokenConsumption,Ctaas'
                    }
                }
            }
        }),
        TestBed.overrideProvider(Router, {
            useValue:RouterMock
        })
        fixture = TestBed.createComponent(ProjectsComponent);
        projectsComponentTestInstance = fixture.componentInstance;
    });

    it('should fetch the data of a real customer', () => {
        spyOn(LicenseServiceMock, 'getLicenseList').and.callThrough();
        spyOn(ProjectServiceMock, 'getProjectDetailsBySubAccount').and.callThrough();

        fixture.detectChanges();

        expect(LicenseServiceMock.getLicenseList).toHaveBeenCalled();
        expect(ProjectServiceMock.getProjectDetailsBySubAccount).toHaveBeenCalled();
        expect(projectsComponentTestInstance.projects.length).toEqual(1);
    });

    it('should navigate to license consumption after calling openConsumptionView()', () => {
        spyOn(RouterMock, 'navigate').and.callThrough();
        fixture.detectChanges();
        projectsComponentTestInstance.openConsumptionView({});
        expect(RouterMock.navigate).toHaveBeenCalledWith(['/customer/consumption'], {queryParams:{subaccountId:undefined}});
    });
});
