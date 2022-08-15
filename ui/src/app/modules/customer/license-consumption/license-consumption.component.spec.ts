import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed} from '@angular/core/testing';
import { MatDialog} from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
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
import { LicenseConsumptionComponent } from './license-consumption.component';
import { AddLicenseConsumptionComponent } from './add-license-consumption/add-license-consumption.component';
import { ModifyLicenseConsumptionDetailsComponent } from './modify-license-consumption-details/modify-license-consumption-details.component';
import { Sort } from '@angular/material/sort';
import { DialogServiceMock } from 'src/test/mock/services/dialog-service.mock';
import { LicenseConsumptionService } from 'src/app/services/license-consumption.service';
import { LicenseServiceMock } from 'src/test/mock/services/license-service.mock';
import { LicenseService } from 'src/app/services/license.service';

let licenseConsumptionComponentTestInstance: LicenseConsumptionComponent;
let fixture: ComponentFixture<LicenseConsumptionComponent>;
const dialogService = new DialogServiceMock();

const RouterMock = {
    navigate: (commands: string[]) => {}
};

const beforeEachFunction = () => {
    TestBed.configureTestingModule({
        declarations: [ LicenseConsumptionComponent, DataTableComponent, ModifyLicenseConsumptionDetailsComponent, AddLicenseConsumptionComponent ],
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
                provide: LicenseService,
                useValue: LicenseServiceMock
            },
            {
                provide: LicenseConsumptionService,
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
    fixture = TestBed.createComponent(LicenseConsumptionComponent);
    licenseConsumptionComponentTestInstance = fixture.componentInstance;
    licenseConsumptionComponentTestInstance.ngOnInit();
    spyOn(console, 'log').and.callThrough();
    spyOn(CurrentCustomerServiceMock, 'getSelectedCustomer' ).and.callThrough();
    spyOn(ProjectServiceMock, 'setSelectedSubAccount').and.callThrough();
    spyOn(ProjectServiceMock, 'getProjectDetailsBySubAccount').and.callThrough();
};
/*
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

        spyOn(licenseConsumptionComponentTestInstance, 'sortData').and.callThrough();

        licenseConsumptionComponentTestInstance.sortData(sort, []);
        expect(licenseConsumptionComponentTestInstance.sortData).toHaveBeenCalledWith(sort, []);

        sort.direction = 'asc';
        licenseConsumptionComponentTestInstance.sortData(sort, []);
        
        sort.direction = '';
        licenseConsumptionComponentTestInstance.sortData(sort, []);
    });
});

describe('Data collection and parsing tests', () => {
    beforeEach(beforeEachFunction);
    it('should make a call to get project list after initializing', () => {
        fixture.detectChanges();
        expect(CurrentCustomerServiceMock.getSelectedCustomer).toHaveBeenCalled();
        expect(ProjectServiceMock.setSelectedSubAccount).toHaveBeenCalled();
        expect(ProjectServiceMock.getProjectDetailsBySubAccount).toHaveBeenCalled();
        expect(licenseConsumptionComponentTestInstance.projects).toBe(ProjectServiceMock.projectsListValue.projects)
    });
});

describe('Dialog calls and interactions', () => {
    beforeEach(beforeEachFunction);
    // it('should open new project comp', () =>{
    //     spyOn(licenseConsumptionComponentTestInstance, 'openDialog');
    //     licenseConsumptionComponentTestInstance.onNewProject();
    //     expect(licenseConsumptionComponentTestInstance.openDialog).toHaveBeenCalledWith(AddLicenseConsumptionComponent);
    // })

    it('should execute rowAction() with expected data given set arguments', () => {
        const selectedTestData = { selectedRow: { testProperty: 'testData'}, selectedOption: 'selectedTestOption', selectedIndex: '0' };
        spyOn(licenseConsumptionComponentTestInstance, 'openDialog').and.callThrough();
        // spyOn(licenseConsumptionComponentTestInstance, 'confirmCloseDialog').and.callThrough();
        // spyOn(licenseConsumptionComponentTestInstance, 'confirmDeleteDialog').and.callThrough();
        // spyOn(licenseConsumptionComponentTestInstance, 'openConsumptionView').and.callThrough();
        // spyOn(dialogService, 'confirmDialog').and.callThrough();

        // selectedTestData.selectedOption = licenseConsumptionComponentTestInstance.MODIFY_PROJECT;
        // licenseConsumptionComponentTestInstance.rowAction(selectedTestData);
        // expect(licenseConsumptionComponentTestInstance.openDialog).toHaveBeenCalledWith(ModifyLicenseConsumptionDetailsComponent, selectedTestData.selectedRow);

        // selectedTestData.selectedOption = licenseConsumptionComponentTestInstance.CLOSE_PROJECT;
        // licenseConsumptionComponentTestInstance.rowAction(selectedTestData);
        // expect(licenseConsumptionComponentTestInstance.confirmCloseDialog).toHaveBeenCalledWith(selectedTestData.selectedIndex);

        // selectedTestData.selectedOption = licenseConsumptionComponentTestInstance.DELETE_PROJECT;
        // licenseConsumptionComponentTestInstance.rowAction(selectedTestData);
        // expect(licenseConsumptionComponentTestInstance.confirmDeleteDialog).toHaveBeenCalledWith(selectedTestData.selectedIndex);

        // selectedTestData.selectedOption = licenseConsumptionComponentTestInstance.VIEW_CONSUMPTION;
        // licenseConsumptionComponentTestInstance.rowAction(selectedTestData);
        // expect(licenseConsumptionComponentTestInstance.openConsumptionView).toHaveBeenCalledWith(selectedTestData.selectedRow);

        // selectedTestData.selectedOption = licenseConsumptionComponentTestInstance.CLOSE_PROJECT;
        // dialogService.setExpectedValue(true);
        // licenseConsumptionComponentTestInstance.rowAction(selectedTestData);
        // expect(licenseConsumptionComponentTestInstance.confirmCloseDialog).toHaveBeenCalledWith(selectedTestData.selectedIndex);
        // expect(dialogService.confirmDialog).toHaveBeenCalled();
        
        // selectedTestData.selectedOption = licenseConsumptionComponentTestInstance.DELETE_PROJECT;
        // dialogService.setExpectedValue(true);
        // licenseConsumptionComponentTestInstance.rowAction(selectedTestData);
        // expect(licenseConsumptionComponentTestInstance.confirmDeleteDialog).toHaveBeenCalledWith(selectedTestData.selectedIndex);
        // expect(dialogService.confirmDialog).toHaveBeenCalled();
    });
});

describe('navigate', () => {
    beforeEach(beforeEachFunction);

    // it('should navigate to license consumption after calling openConsumptionView()', () => {
    //     spyOn(RouterMock, 'navigate');
    //     licenseConsumptionComponentTestInstance.openConsumptionView({});
    //     expect(RouterMock.navigate).toHaveBeenCalledWith(['/customer/consumption']);
    // });

    it('should navigate to dashboard after calling goToDashboard()', () => {
        spyOn(RouterMock, 'navigate');
        licenseConsumptionComponentTestInstance.goToDashboard();
        expect(RouterMock.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
});
*/