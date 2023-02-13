import { HttpClient } from '@angular/common/http';
import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { CustomerService } from '../services/customer.service';
import { DialogService } from '../services/dialog.service';
import { LicenseService } from '../services/license.service';
import { SubAccountService } from '../services/sub-account.service';
import { DashboardComponent } from './dashboard.component';
import { SharedModule } from '../modules/shared/shared.module';
import { DataTableComponent } from '../generics/data-table/data-table.component';
import { AddCustomerAccountModalComponent } from '../modules/dashboard-customer/add-customer-account-modal/add-customer-account-modal.component';
import { AddSubaccountModalComponent } from '../modules/dashboard-customer/add-subaccount-modal/add-subaccount-modal.component';
import { ModifyCustomerAccountComponent } from '../modules/dashboard-customer/modify-customer-account/modify-customer-account.component';
import { AdminEmailsComponent } from '../modules/dashboard-customer/admin-emails-modal/admin-emails.component';
import { SubaccountAdminEmailsComponent } from '../modules/dashboard-customer/subaccount-admin-emails-modal/subaccount-admin-emails.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LicenseServiceMock } from '../../test/mock/services/license-service.mock';
import { CustomerServiceMock } from '../../test/mock/services/customer-service.mock';
import { SubaccountServiceMock } from '../../test/mock/services/subaccount-service.mock';
import { MatDialogMock } from '../../test/mock/components/mat-dialog.mock';
import { MsalServiceMock } from '../../test/mock/services/msal-service.mock';
import { SnackBarServiceMock } from "../../test/mock/services/snack-bar-service.mock";
import { SnackBarService } from "../services/snack-bar.service";
import { DialogServiceMock } from '../../test/mock/services/dialog-service.mock';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { tekVizionServices } from '../helpers/tekvizion-services';
import { of, throwError } from 'rxjs';
import { Sort } from '@angular/material/sort';
import { FeatureToggleServiceMock } from 'src/test/mock/services/feature-toggle-service.mock';
import { FeatureToggleService } from '../services/feature-toggle.service';

let dashboardComponentTestInstance: DashboardComponent;
let fixture: ComponentFixture<DashboardComponent>;
const dialogServiceMock = new DialogServiceMock();

const RouterMock = {
    navigate: (commands: string[], queryParams: any) => { }
};

const defaultTestBedConfig = {
    declarations: [DashboardComponent, DataTableComponent, AddCustomerAccountModalComponent, AddSubaccountModalComponent, ModifyCustomerAccountComponent, AdminEmailsComponent, SubaccountAdminEmailsComponent],
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
            provide: SnackBarService,
            useValue: SnackBarServiceMock
        },
        {
            provide: CustomerService,
            useValue: CustomerServiceMock
        },
        {
            provide: DialogService,
            useValue: dialogServiceMock
        },
        {
            provide: LicenseService,
            useValue: LicenseServiceMock
        },
        {
            provide: SubAccountService,
            useValue: SubaccountServiceMock
        },
        {
            provide: MsalService,
            useValue: MsalServiceMock
        },
        {
            provide: FeatureToggleService,
            useValue: FeatureToggleServiceMock
        },
        {
            provide: HttpClient,
            useValue: HttpClient
        }
    ]
    
};

const beforeEachFunction = async () =>{
    TestBed.configureTestingModule(defaultTestBedConfig).compileComponents().then(() => {
        fixture = TestBed.createComponent(DashboardComponent);
        dashboardComponentTestInstance = fixture.componentInstance;
        dashboardComponentTestInstance.ngOnInit();
    });
}

describe('UI verification tests', () => {
    beforeEach(beforeEachFunction);
    it('should display essential UI and components', () => {
        fixture.detectChanges();
        const h1 = fixture.nativeElement.querySelector('#page-title');
        const addCustomerButton = fixture.nativeElement.querySelector('#add-customer-button');
        const addSubaccountButton = fixture.nativeElement.querySelector('#add-subaccount-button');
        dashboardComponentTestInstance.sizeChange();
        dashboardComponentTestInstance.getColor('available');
        expect(h1.textContent).toBe('Customers');
        expect(addCustomerButton.textContent).toBe('Add Customer');
        expect(addSubaccountButton.textContent).toBe('Add Subaccount');
    });

    it('should load correct data columns for the table', () => {
        fixture.detectChanges();
        const customerColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[0];
        const subAccountColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[1];
        const typeColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[2];
        const statusColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[3];
        expect(customerColumn.innerText).toBe('Customer');
        expect(subAccountColumn.innerText).toBe('Subaccount');
        expect(typeColumn.innerText).toBe('Type');
        expect(statusColumn.innerText).toBe('Subscription Status');
    });

    it('should call sortData and sort the data', () => {
        const sort: Sort = { active: 'name', direction: 'desc' }
        fixture.detectChanges();
        spyOn(dashboardComponentTestInstance, 'sortData').and.callThrough();
            
        dashboardComponentTestInstance.sortData(sort);
        expect(dashboardComponentTestInstance.sortData).toHaveBeenCalledWith(sort);
            
        sort.direction = 'asc';
        dashboardComponentTestInstance.sortData(sort);
            
        sort.direction = '';
        dashboardComponentTestInstance.sortData(sort);
    });
});

describe('Data collection and parsing tests', () => {
    beforeEach(beforeEachFunction);
    it('should make a call to get customers, licences and subaccounts', () => {
        spyOn(CustomerServiceMock, 'getCustomerList').and.callThrough();
        spyOn(LicenseServiceMock, 'getLicenseList').and.callThrough();
        spyOn(SubaccountServiceMock, 'getSubAccountList').and.callThrough();
        fixture.detectChanges();
        expect(CustomerServiceMock.getCustomerList).toHaveBeenCalled();
        expect(dashboardComponentTestInstance.isLoadingResults).toBeFalse();
        expect(dashboardComponentTestInstance.isRequestCompleted).toBeTrue();
        expect(LicenseServiceMock.getLicenseList).toHaveBeenCalled();
        expect(SubaccountServiceMock.getSubAccountList).toHaveBeenCalled();
    });
});

describe('Dialog calls and interactions', () => {
    beforeEach(beforeEachFunction);
    it('should make dialog.open call with expected arguments in openDialog', () => {
        const selectedItemTestData = { testProperty: 'testValue' };
        const expectedArgument = {
            width: 'auto',
            data: selectedItemTestData,
            disableClose: true
        };
        spyOn(MatDialogMock, 'open').and.callThrough();
        dashboardComponentTestInstance.openDialog('add-customer', selectedItemTestData);
        expect(MatDialogMock.open).toHaveBeenCalledWith(AddCustomerAccountModalComponent, { width: '400px', disableClose: true });

        dashboardComponentTestInstance.openDialog('add-subaccount', selectedItemTestData);
        expect(MatDialogMock.open).toHaveBeenCalledWith(AddSubaccountModalComponent, { width: '400px', disableClose: true });

        dashboardComponentTestInstance.openDialog('modify', selectedItemTestData);
        expect(MatDialogMock.open).toHaveBeenCalledWith(ModifyCustomerAccountComponent, expectedArgument);

        dashboardComponentTestInstance.openDialog(dashboardComponentTestInstance.MODIFY_ACCOUNT, selectedItemTestData);
        expect(MatDialogMock.open).toHaveBeenCalledWith(ModifyCustomerAccountComponent, expectedArgument);

        dashboardComponentTestInstance.openDialog(dashboardComponentTestInstance.VIEW_ADMIN_EMAILS, selectedItemTestData);
        expect(MatDialogMock.open).toHaveBeenCalledWith(AdminEmailsComponent, expectedArgument);

        dashboardComponentTestInstance.openDialog(dashboardComponentTestInstance.VIEW_SUBACC_ADMIN_EMAILS, selectedItemTestData);
        expect(MatDialogMock.open).toHaveBeenCalledWith(SubaccountAdminEmailsComponent, expectedArgument);
    });

    it('should call addCustomerAccount when calling the #add-customer-button function', fakeAsync(() => {
        spyOn(dashboardComponentTestInstance, 'addCustomerAccount').and.callThrough();
        spyOn(dashboardComponentTestInstance, 'openDialog');
        fixture.detectChanges();
        const button = fixture.debugElement.nativeElement.querySelector('#add-customer-button');
        button.click();
        tick();
        expect(dashboardComponentTestInstance.addCustomerAccount).toHaveBeenCalled();
        expect(dashboardComponentTestInstance.openDialog).toHaveBeenCalledWith('add-customer');
        discardPeriodicTasks();
    }));

    it('should call openDialog when calling the #add-customer-button function', fakeAsync(() => {
        spyOn(dashboardComponentTestInstance, 'addSubaccount').and.callThrough();
        spyOn(dashboardComponentTestInstance, 'openDialog');
        fixture.detectChanges();
        const button = fixture.debugElement.nativeElement.querySelector('#add-subaccount-button');
        button.click();
        tick();
        expect(dashboardComponentTestInstance.addSubaccount).toHaveBeenCalled();
        expect(dashboardComponentTestInstance.openDialog).toHaveBeenCalledWith('add-subaccount');
        discardPeriodicTasks();
    }));

    it('should delete customer if resultAllData is true', async () => {
        const expectedCustomerObject = {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Unit Test',
            id: '821f079f-be9f-4b11-b364-4f9652c581ce',
            subaccountName: 'Unit Test - 360 Small - Old Token Model',
            subaccountId: '565e134e-62ef-4820-b077-2d8a6f628702',
            status: 'Expired'
        };
        spyOn(dashboardComponentTestInstance, 'openConfirmCancelDialog').and.callThrough();
        spyOn(dialogServiceMock, 'deleteCustomerDialog').and.callThrough();
        spyOn(CustomerServiceMock, 'deleteCustomer').and.callThrough();
        spyOn( dialogServiceMock,'setExpectedResult').and.callThrough();
        dialogServiceMock.setExpectedResult({ confirm: true, deleteAllData: true });
        fixture.detectChanges();
        dashboardComponentTestInstance.openConfirmCancelDialog(expectedCustomerObject);
        await fixture.whenStable();

        expect(dialogServiceMock.deleteCustomerDialog).toHaveBeenCalledWith({
            title: 'Confirm Action',
            message: 'Do you want to confirm this action?',
            confirmCaption: 'Delete Subaccount',
            deleteAllDataCaption: 'Delete Customer',
            cancelCaption: 'Cancel',
            canDeleteSubaccount: false
        });
        expect(CustomerServiceMock.deleteCustomer).toHaveBeenCalledWith(expectedCustomerObject.id);
    });

    it('should delete subaccount if resultAllData is false', async () => {
        const expectedCustomerObject = {
            customerType: 'MSP',
            testCustomer: false,
            name: 'Unit Test',
            id: '821f079f-be9f-4b11-b364-4f9652c581ce',
            subaccountName: 'Unit Test - 360 Small - Old Token Model',
            subaccountId: '565e134e-62ef-4820-b077-2d8a6f628702',
            status: 'Expired'
        };
        spyOn(dashboardComponentTestInstance, 'openConfirmCancelDialog').and.callThrough();
        spyOn(dialogServiceMock, 'deleteCustomerDialog').and.callThrough();
        spyOn(SubaccountServiceMock, 'deleteSubAccount').and.callThrough();
        spyOn( dialogServiceMock,'setExpectedResult').and.callThrough();
        dialogServiceMock.setExpectedResult({ confirm: true, deleteAllData: false });
        fixture.detectChanges();
        dashboardComponentTestInstance.openConfirmCancelDialog(expectedCustomerObject);
        await fixture.whenStable();
        expect(dialogServiceMock.deleteCustomerDialog).toHaveBeenCalledWith({
            title: 'Confirm Action',
            message: 'Do you want to confirm this action?',
            confirmCaption: 'Delete Subaccount',
            deleteAllDataCaption: 'Delete Customer',
            cancelCaption: 'Cancel',
            canDeleteSubaccount: false
        });
        expect(SubaccountServiceMock.deleteSubAccount).toHaveBeenCalledWith(expectedCustomerObject.subaccountId);
    });
});

describe('openLicenseDetails() openLicenseConsumption() openProjectDetails()', () => {
    beforeEach(beforeEachFunction);
    it('should navigate to customer licenses after calling openLicenseDetails()', () => {
        spyOn(CustomerServiceMock, 'setSelectedCustomer');
        spyOn(RouterMock, 'navigate');
        dashboardComponentTestInstance.openLicenseDetails({});
        expect(RouterMock.navigate).toHaveBeenCalledWith(['/customer/licenses'],{queryParams:{subaccountId: undefined }});
    });

    it('should navigate to license consumption after calling openLicenseConsumption()', () => {
        const selectedTestData = { selectedRow: {
            name: "testV2",
            id: "157fdef0-c28e-4764-9023-75c06daad09d",
            subaccountName: "testv2Demo",
            subaccountId: "fbb2d912-b202-432d-8c07-dce0dad51f7f",
            services: "tokenConsumption,spotlight"
        }, 
        selectedOption: 'selectedTestOption', 
        selectedIndex: '0' };  
        spyOn(CustomerServiceMock, 'setSelectedCustomer');
        spyOn(RouterMock, 'navigate');
        dashboardComponentTestInstance.openLicenseConsumption({});
        expect(RouterMock.navigate).toHaveBeenCalledWith(['/customer/consumption'],{queryParams:{subaccountId: undefined }});
    });

    it('should navigate to project details after calling openProjectDetails()', () => {
        spyOn(CustomerServiceMock, 'setSelectedCustomer');
        spyOn(RouterMock, 'navigate');
        dashboardComponentTestInstance.openProjectDetails({});
        expect(RouterMock.navigate).toHaveBeenCalledWith(['/customer/projects'],{queryParams:{subaccountId:undefined }});
    });

    it('should navigate to Spotlight dashboard ', () => {
        const selectedTestData = { selectedRow: {
            name: "testV2",
            id: "157fdef0-c28e-4764-9023-75c06daad09d",
            subaccountName: "testv2Demo",
            subaccountId: "fbb2d912-b202-432d-8c07-dce0dad51f7f",
            services: "tokenConsumption"
        }, 
        selectedOption: 'selectedTestOption', 
        selectedIndex: '0' }; 
        spyOn(dashboardComponentTestInstance, 'rowAction').and.callThrough();
        spyOn(RouterMock, 'navigate').and.callThrough();
        spyOn(SnackBarServiceMock,'openSnackBar').and.callThrough();

        selectedTestData.selectedOption = dashboardComponentTestInstance.VIEW_CTAAS_DASHBOARD;
        dashboardComponentTestInstance.rowAction(selectedTestData);
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Spotlight service is not available for this Subaccount', '');
    });
});

describe('routes to spothlight dashboard', () => {
    const RouterMock2 = {
        navigate: (commands: string[], queryParams:any) => { }
    };
    beforeEach(() => {
        TestBed.configureTestingModule(defaultTestBedConfig);
        TestBed.overrideProvider(Router, {
            useValue: RouterMock2
        });
        fixture = TestBed.createComponent(DashboardComponent);
        dashboardComponentTestInstance = fixture.componentInstance;
    });
    
    it('should navigate to Spotlight dashboard ', () => {
        const selectedTestData = { selectedRow: {
            name: "testV2",
            id: "157fdef0-c28e-4764-9023-75c06daad09d",
            subaccountName: "testv2Demo",
            subaccountId: "fbb2d912-b202-432d-8c07-dce0dad51f7f",
            services: "tokenConsumption,spotlight"
        },
        selectedOption: 'selectedTestOption', 
        selectedIndex: '0' }; 
        spyOn(dashboardComponentTestInstance, 'rowAction').and.callThrough();
        spyOn(FeatureToggleServiceMock, "isFeatureEnabled").and.callThrough();
        spyOn(RouterMock2, 'navigate').and.callThrough();
        const routePath = '/spotlight/visualization';
        selectedTestData.selectedOption = dashboardComponentTestInstance.VIEW_CTAAS_DASHBOARD;
        dashboardComponentTestInstance.rowAction(selectedTestData);
        expect(RouterMock2.navigate).toHaveBeenCalledWith([routePath],{queryParams:{subaccountId: selectedTestData.selectedRow.subaccountId}});
    });
});

describe('.rowAction()', () => {
    beforeEach(beforeEachFunction);
    it('should make a call to openLicenseDetails or snackBarService if the selected option is VIEW_LICENSES', () => {
        const selectedTestData = {
            selectedRow: {
                testProperty: 'testData',
                subaccountId: undefined,
                id: '821f079f-be9f-4b11-b364-4f9652c581ce'
            },
            selectedOption: 'selectedTestOption',
            selectedIndex: 'selectedTestItem',
            subaccountId: 'test-id'
        };
        spyOn(dashboardComponentTestInstance, 'openLicenseDetails');
        spyOn(SnackBarServiceMock, 'openSnackBar');

        selectedTestData.selectedOption = dashboardComponentTestInstance.VIEW_LICENSES;
        selectedTestData.selectedRow.subaccountId = undefined;
        dashboardComponentTestInstance.rowAction(selectedTestData);
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Subaccount is missing, create one to access this view', '');

        selectedTestData.selectedRow.subaccountId = 'not undefined';
        dashboardComponentTestInstance.rowAction(selectedTestData);
        expect(dashboardComponentTestInstance.openLicenseDetails).toHaveBeenCalledWith(selectedTestData.selectedRow);
    });

    it('should make a call to openLicenseConsumption or snackBarService if the selected option is VIEW_CONSUMPTION', () => {
        const selectedTestData = {
            selectedRow: {
                testProperty: 'testData',
                subaccountId: undefined
            },
            selectedOption: 'selectedTestOption',
            selectedIndex: 'selectedTestItem',
            subaccountId: 'test-id'
        };
        spyOn(dashboardComponentTestInstance, 'openLicenseConsumption');
        spyOn(SnackBarServiceMock, 'openSnackBar');

        selectedTestData.selectedOption = dashboardComponentTestInstance.VIEW_CONSUMPTION;
        selectedTestData.selectedRow.subaccountId = undefined;
        dashboardComponentTestInstance.rowAction(selectedTestData);
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Subaccount is missing, create one to access this view', '');

        selectedTestData.selectedRow.subaccountId = 'not undefined';
        dashboardComponentTestInstance.rowAction(selectedTestData);
        expect(dashboardComponentTestInstance.openLicenseConsumption).toHaveBeenCalledWith(selectedTestData.selectedRow);
    });

    it('should make a call to openProjectDetails or snackBarService if the selected option is VIEW_PROJECTS', () => {
        const selectedTestData = {
            selectedRow: {
                testProperty: 'testData',
                subaccountId: undefined
            },
            selectedOption: 'selectedTestOption',
            selectedIndex: 'selectedTestItem',
            subaccountId: 'test-id'
        };
        spyOn(dashboardComponentTestInstance, 'openProjectDetails');
        spyOn(SnackBarServiceMock, 'openSnackBar');

        selectedTestData.selectedOption = dashboardComponentTestInstance.VIEW_PROJECTS;
        selectedTestData.selectedRow.subaccountId = undefined;
        dashboardComponentTestInstance.rowAction(selectedTestData);
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Subaccount is missing, create one to access this view', '');

        selectedTestData.selectedRow.subaccountId = 'not undefined';
        dashboardComponentTestInstance.rowAction(selectedTestData);
        expect(dashboardComponentTestInstance.openProjectDetails).toHaveBeenCalledWith(selectedTestData.selectedRow);
    });

    it('should make a call to openDialog if the selected option is VIEW_ADMIN_EMAILS', () => {
        const selectedTestData = {
            selectedRow: {
                testProperty: 'testData',
                subaccountId: '6b06ef8d-5eb6-44c3-bf61-e78f8644767e'
            },
            selectedOption: 'selectedTestOption',
            selectedIndex: 'selectedTestItem',
            subaccountId: 'test-id'
        };
        spyOn(dashboardComponentTestInstance, 'openDialog');
        fixture.detectChanges();
        selectedTestData.selectedOption = dashboardComponentTestInstance.VIEW_ADMIN_EMAILS;
        dashboardComponentTestInstance.rowAction(selectedTestData);
        expect(dashboardComponentTestInstance.openDialog).toHaveBeenCalledWith(dashboardComponentTestInstance.VIEW_ADMIN_EMAILS, selectedTestData.selectedRow);
    });

    it('should make a call to openDialog if the selected option is VIEW_SUBACC_ADMIN_EMAILS', () => {
        const selectedTestData = {
            selectedRow: {
                testProperty: 'testData',
                subaccountId: undefined
            },
            selectedOption: 'selectedTestOption',
            selectedIndex: 'selectedTestItem',
            subaccountId: 'test-id'
        };
        spyOn(dashboardComponentTestInstance, 'openDialog');
        spyOn(SnackBarServiceMock, 'openSnackBar');

        selectedTestData.selectedOption = dashboardComponentTestInstance.VIEW_SUBACC_ADMIN_EMAILS;
        selectedTestData.selectedRow.subaccountId = undefined;
        dashboardComponentTestInstance.rowAction(selectedTestData);
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Subaccount is missing, create one to access this view', '');

        selectedTestData.selectedRow.subaccountId = 'not undefined';
        dashboardComponentTestInstance.rowAction(selectedTestData);
        expect(dashboardComponentTestInstance.openDialog).toHaveBeenCalledWith(dashboardComponentTestInstance.VIEW_SUBACC_ADMIN_EMAILS, selectedTestData.selectedRow);
    });

    it('should make a call to openDialog if the selected option is MODIFY_ACCOUNT', () => {
        const selectedTestData = {
            selectedRow: {
                testProperty: 'testData',
                subaccountId: '6b06ef8d-5eb6-44c3-bf61-e78f8644767e'
            },
            selectedOption: 'selectedTestOption',
            selectedIndex: 'selectedTestItem',
            subaccountId: 'test-id'
        };
        spyOn(dashboardComponentTestInstance, 'openDialog');
        fixture.detectChanges();
        selectedTestData.selectedOption = dashboardComponentTestInstance.MODIFY_ACCOUNT;
        dashboardComponentTestInstance.rowAction(selectedTestData);
        expect(dashboardComponentTestInstance.openDialog).toHaveBeenCalledWith(dashboardComponentTestInstance.MODIFY_ACCOUNT, selectedTestData.selectedRow);
    });

    it('should make a call to onDeleteAccount if the selected option is DELETE_ACCOUNT', async () => {
        const selectedTestData = {
            selectedRow: {
                testProperty: 'testData',
                subaccountId: '565e134e-62ef-4820-b077-2d8a6f628702',
                id: '821f079f-be9f-4b11-b364-4f9652c581ce'
            },
            selectedOption: 'selectedTestOption',
            selectedIndex: 'selectedTestItem',
            subaccountId: 'test-id'
        };
        spyOn(dashboardComponentTestInstance, 'onDeleteAccount').and.callThrough();

        selectedTestData.selectedOption = dashboardComponentTestInstance.DELETE_ACCOUNT;
        dialogServiceMock.setExpectedResult({ confirm: true, deleteAllData: true });
        fixture.detectChanges();
        await fixture.whenStable();
        dashboardComponentTestInstance.rowAction(selectedTestData);
        expect(dashboardComponentTestInstance.onDeleteAccount).toHaveBeenCalledWith(selectedTestData.selectedRow);
    });
});

describe('.columnAction()', () => {
    beforeEach(beforeEachFunction);
    it('should make a call to openLicenseConsumption or snackBarService if the column name is "Subaccount"', () => {
        const selectedTestData: { selectedRow: any, selectedIndex: string, columnName: string } = {
            selectedRow: {
                subaccountId: undefined
            },
            selectedIndex: 'testSelectedIndex',
            columnName: 'testColumnName'
        };
        spyOn(dashboardComponentTestInstance, 'openLicenseConsumption').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar');

        selectedTestData.columnName = 'Subaccount';
        dashboardComponentTestInstance.columnAction(selectedTestData);
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Subaccount is missing, create one to access tekToken Consumption view', '');

        selectedTestData.selectedRow.subaccountId = 'not undefined';
        dashboardComponentTestInstance.columnAction(selectedTestData);
        expect(dashboardComponentTestInstance.openLicenseConsumption).toHaveBeenCalledWith(selectedTestData.selectedRow);
    });

    it('should make a call to openLicenseDetails or snackBarService if the column name is "Subaccount"', () => {
        const selectedTestData: { selectedRow: any, selectedIndex: string, columnName: string } = {
            selectedRow: {
                status: undefined
            },
            selectedIndex: 'testSelectedIndex',
            columnName: 'testColumnName'
        };
        spyOn(dashboardComponentTestInstance, 'openLicenseDetails').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar');

        selectedTestData.columnName = 'Subscription Status';
        dashboardComponentTestInstance.columnAction(selectedTestData);
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Subaccount is missing, create one to access tekVizion360 Subscriptions view', '');

        selectedTestData.selectedRow.status = 'not undefined';
        dashboardComponentTestInstance.columnAction(selectedTestData);
        expect(dashboardComponentTestInstance.openLicenseDetails).toHaveBeenCalledWith(selectedTestData.selectedRow);
    });

});

describe('Filtering table rows', () => {
    beforeEach(beforeEachFunction);
    it('should filter the rows in the table based on the name, type and status filters', async () => {
        dashboardComponentTestInstance.filterForm.patchValue({ customerFilterControl: "Amazon", typeFilterControl: "MSP", subStatusFilterControl: "Inactive" });
        fixture.detectChanges();
        await fixture.whenStable();
        expect(dashboardComponentTestInstance.filteredCustomerList.length).toBe(1);
        const objectToCompare: any = { "customerType": "MSP", "testCustomer": false, "name": "Amazon", "id": "aa85399d-1ce9-425d-9df7-d6e8a8baaec2", "subaccountName": "360 Custom (No Tokens)", "subaccountId": "24372e49-5f31-4b38-bc3e-fb6a5c371623", "status": "Inactive" };
        objectToCompare.services = tekVizionServices.tekTokenConstumption + ',' + tekVizionServices.SpotLight;
        expect(dashboardComponentTestInstance.filteredCustomerList[0]).toEqual(objectToCompare);
    });
});

describe('error messages', () => {
    beforeEach(beforeEachFunction);
    it('should display an message if an error ocurred while fetching data', () => {
        const err = "some error";
        spyOn(CustomerServiceMock, 'getCustomerList').and.returnValue(throwError(err));
        spyOn(console, 'debug').and.callThrough();

       dashboardComponentTestInstance.ngOnInit();

        expect(console.debug).toHaveBeenCalledWith('error', err);
        expect(dashboardComponentTestInstance.isLoadingResults).toBeFalse();
        expect(dashboardComponentTestInstance.isRequestCompleted).toBeTrue();
    });

    it('should display a message if ocurred an error deleting a customer', () => {
        const expectedCustomerObjectA = {
            customerType: 'MSP',
            testCustomer: false,
            name: 'UnitTestA',
            id: '821f079f-be9f-4b11-b364-4f9652c581ce',
            subaccountName: 'Unit Test - 360 Small - Old Token Model',
            subaccountId: '565e134e-62ef-4820-b077-2d8a6f628702',
            status: 'Expired'
        };
        const res = {error: "some error"};
        spyOn(dashboardComponentTestInstance, 'openConfirmCancelDialog').and.callThrough();
        spyOn(dialogServiceMock, 'deleteCustomerDialog').and.callThrough();
        spyOn(CustomerServiceMock, 'deleteCustomer').and.returnValue(of(res));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        spyOn(dialogServiceMock, 'setExpectedResult').and.callThrough();
        dialogServiceMock.setExpectedResult({ confirm: true, deleteAllData: true });
        dashboardComponentTestInstance.openConfirmCancelDialog(expectedCustomerObjectA);
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Error customer could not be deleted !', '');
    });

    it('should return a null response', () => {
        const expectedCustomerObjectB = {
            customerType: 'MSP',
            testCustomer: false,
            name: 'UnitTestB',
            id: '821f079f-be9f-4b11-b364-4f9652c581ce',
            subaccountName: 'Unit Test - 360 Small - Old Token Model',
            subaccountId: '565e134e-62ef-4820-b077-2d8a6f628702',
            status: 'Expired'
        };
        const res = null;
        spyOn(dashboardComponentTestInstance, 'openConfirmCancelDialog').and.callThrough();
        spyOn(dialogServiceMock, 'deleteCustomerDialog').and.callThrough();
        spyOn(CustomerServiceMock, 'deleteCustomer').and.returnValue(of(res));
        spyOn(dialogServiceMock, 'setExpectedResult').and.callThrough();
        dialogServiceMock.setExpectedResult({ confirm: true, deleteAllData: true });
        dashboardComponentTestInstance.openConfirmCancelDialog(expectedCustomerObjectB);
        expect(CustomerServiceMock.deleteCustomer).toHaveBeenCalled();
    });

    it('should display a meesage if an error ocurred while deleting a subaccount', () => {
        const expectedCustomerObjectC = {
            customerType: 'MSP',
            testCustomer: false,
            name: 'UnitTestC',
            id: '821f079f-be9f-4b11-b364-4f9652c581ce',
            subaccountName: 'Unit Test - 360 Small - Old Token Model',
            subaccountId: '565e134e-62ef-4820-b077-2d8a6f628702',
            status: 'Expired'
        };
        const res = {error:"some error"};
        spyOn(dashboardComponentTestInstance, 'openConfirmCancelDialog').and.callThrough();
        spyOn(dialogServiceMock, 'deleteCustomerDialog').and.callThrough();
        spyOn(SubaccountServiceMock, 'deleteSubAccount').and.returnValue(of(res));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        spyOn(dialogServiceMock, 'setExpectedResult').and.callThrough();
        dialogServiceMock.setExpectedResult({ confirm: true, deleteAllData: false });
        dashboardComponentTestInstance.openConfirmCancelDialog(expectedCustomerObjectC);
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Error Subaccount could not be deleted !', '');
    });

    it('should return a null response', () => {
        const expectedCustomerObjectD = {
            customerType: 'MSP',
            testCustomer: false,
            name: 'UnitTestD',
            id: '821f079f-be9f-4b11-b364-4f9652c581ce',
            subaccountName: 'Unit Test - 360 Small - Old Token Model',
            subaccountId: '565e134e-62ef-4820-b077-2d8a6f628702',
            status: 'Expired'
        };
        const res = null;
        spyOn(dashboardComponentTestInstance, 'openConfirmCancelDialog').and.callThrough();
        spyOn(dialogServiceMock, 'deleteCustomerDialog').and.callThrough();
        spyOn(SubaccountServiceMock, 'deleteSubAccount').and.returnValue(of(res));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        spyOn(dialogServiceMock, 'setExpectedResult').and.callThrough();
        dialogServiceMock.setExpectedResult({ confirm: true, deleteAllData: false });
        dashboardComponentTestInstance.openConfirmCancelDialog(expectedCustomerObjectD);
        expect(SubaccountServiceMock.deleteSubAccount).toHaveBeenCalled();
    });
});
