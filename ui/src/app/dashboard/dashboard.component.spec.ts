import { HttpClient } from '@angular/common/http';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
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
import { AddCustomerAccountModalComponent } from './add-customer-account-modal/add-customer-account-modal.component';
import { AddSubaccountModalComponent } from './add-subaccount-modal/add-subaccount-modal.component';
import { ModifyCustomerAccountComponent } from './modify-customer-account/modify-customer-account.component';
import { AdminEmailsComponent } from './admin-emails-modal/admin-emails.component';
import { SubaccountAdminEmailsComponent } from './subaccount-admin-emails-modal/subaccount-admin-emails.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LicenseServiceMock } from '../../test/mock/services/license-service.mock';
import { CustomerServiceMock } from '../../test/mock/services/customer-service.mock';
import { SubaccountServiceMock } from '../../test/mock/services/subaccount-service.mock';
import { MatDialogMock } from '../../test/mock/components/mat-dialog.mock';
import { MsalServiceMock } from '../../test/mock/services/msal-service.mock';
import { SnackBarServiceMock } from "../../test/mock/services/snack-bar-service.mock";
import { SnackBarService } from "../services/snack-bar.service";
import { DialogServiceMock } from '../../test/mock/services/dialog.service.mock';

let dashboardComponentTestInstance: DashboardComponent;
let fixture: ComponentFixture<DashboardComponent>;
const dialogServiceMock = new DialogServiceMock();
const customerServiceMock = new CustomerServiceMock();

const RouterMock = {
    navigate: (commands: string[]) => {}
};

const beforeEachFunction = async () => {
    let mockStorage = {};

    spyOn(localStorage, 'getItem').and.callFake( (key: string): string => {
        return mockStorage[key] || null;
    });
    spyOn(localStorage, 'removeItem').and.callFake((key:string): void => {
        delete mockStorage[key];
    });
    spyOn(localStorage, 'setItem').and.callFake((key:string, value:string):string =>  {
        return mockStorage[key] = <string>value;
    });
    spyOn(localStorage, 'clear').and.callFake(() => {
        mockStorage = {};
    });
    TestBed.configureTestingModule({
        declarations: [DashboardComponent, DataTableComponent, AddCustomerAccountModalComponent, AddSubaccountModalComponent, ModifyCustomerAccountComponent, AdminEmailsComponent, SubaccountAdminEmailsComponent],
        imports: [BrowserAnimationsModule, MatSnackBarModule, SharedModule],
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
                useValue: customerServiceMock
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
                provide: HttpClient,
                useValue: HttpClient
            }
        ]
    }).compileComponents().then(() => {
        fixture = TestBed.createComponent(DashboardComponent);
        dashboardComponentTestInstance = fixture.componentInstance;
        dashboardComponentTestInstance.ngOnInit();
    });
};

describe('UI verification tests', () => {
    beforeEach(beforeEachFunction);
    it('should display essential UI and components', () => {
        fixture.detectChanges();
        const h1 = fixture.nativeElement.querySelector('#page-title');
        const addCustomerButton = fixture.nativeElement.querySelector('#add-customer-button');
        const addSubaccountButton = fixture.nativeElement.querySelector('#add-subaccount-button');
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
});

describe('Data collection and parsing tests', () => {
    beforeEach(beforeEachFunction);
    it('should make a call to get customers, licences and subaccounts', () => {
        spyOn(customerServiceMock, 'getCustomerList').and.callThrough();
        spyOn(LicenseServiceMock, 'getLicenseList').and.callThrough();
        spyOn(SubaccountServiceMock, 'getSubAccountList').and.callThrough();
        fixture.detectChanges();
        expect(customerServiceMock.getCustomerList).toHaveBeenCalled();
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
        let button = fixture.debugElement.nativeElement.querySelector('#add-customer-button');
        button.click();
        tick();
        expect(dashboardComponentTestInstance.addCustomerAccount).toHaveBeenCalled();
        expect(dashboardComponentTestInstance.openDialog).toHaveBeenCalledWith('add-customer');
    }));

    it('should call openDialog when calling the #add-customer-button function', fakeAsync(() => {
        spyOn(dashboardComponentTestInstance, 'addSubaccount').and.callThrough();
        spyOn(dashboardComponentTestInstance, 'openDialog');
        fixture.detectChanges();
        let button = fixture.debugElement.nativeElement.querySelector('#add-subaccount-button');
        button.click();
        tick();
        expect(dashboardComponentTestInstance.addSubaccount).toHaveBeenCalled();
        expect(dashboardComponentTestInstance.openDialog).toHaveBeenCalledWith('add-subaccount');
    }));

    it('should delete customer if resultAllData is true', () => {
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
        spyOn(customerServiceMock, 'deleteCustomer').and.callThrough();
        dialogServiceMock.setExpectedResult({ confirm: true, deleteAllData: true });
        dashboardComponentTestInstance.customerList['0'] = expectedCustomerObject;
        dashboardComponentTestInstance.openConfirmCancelDialog('0');

        expect(dialogServiceMock.deleteCustomerDialog).toHaveBeenCalledWith({
            title: 'Confirm Action',
            message: 'Do you want to confirm this action?',
            confirmCaption: 'Delete Subaccount',
            deleteAllDataCaption: 'Delete Customer',
            cancelCaption: 'Cancel',
            canDeleteSubaccount: false
        });
        expect(customerServiceMock.deleteCustomer).toHaveBeenCalledWith(expectedCustomerObject.id);
    });

    it('should delete subaccount if resultAllData is false', () => {
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
        dialogServiceMock.setExpectedResult({ confirm: true, deleteAllData: false });
        dashboardComponentTestInstance.customerList['0'] = expectedCustomerObject;
        dashboardComponentTestInstance.openConfirmCancelDialog('0');

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
        spyOn(customerServiceMock, 'setSelectedCustomer');
        spyOn(RouterMock, 'navigate');
        dashboardComponentTestInstance.openLicenseDetails({});
        expect(RouterMock.navigate).toHaveBeenCalledWith(['/customer/licenses']);
    });

    it('should navigate to license consumption after calling openLicenseConsumption()', () => {
        spyOn(customerServiceMock, 'setSelectedCustomer');
        spyOn(RouterMock, 'navigate');
        dashboardComponentTestInstance.openLicenseConsumption({});
        expect(RouterMock.navigate).toHaveBeenCalledWith(['/customer/consumption']);
    });

    it('should navigate to project details after calling openProjectDetails()', () => {
        spyOn(customerServiceMock, 'setSelectedCustomer');
        spyOn(RouterMock, 'navigate');
        dashboardComponentTestInstance.openProjectDetails({});
        expect(RouterMock.navigate).toHaveBeenCalledWith(['/customer/projects']);
    });
});

describe('.rowAction()', () => {
    beforeEach(beforeEachFunction);
    it('should make a call to openLicenseDetails or snackBarService if the selected option is VIEW_LICENSES', () => {
        const selectedTestData = {
            selectedRow: {
                testProperty: 'testData',
                subaccountId: undefined
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
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Subaccount is missing, create one to access tekVizion360 Packages view', '');

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
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Subaccount is missing, create one to access tekToken Consumption view', '');

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
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Subaccount is missing, create one to access Projects view', '');

        selectedTestData.selectedRow.subaccountId = 'not undefined';
        dashboardComponentTestInstance.rowAction(selectedTestData);
        expect(dashboardComponentTestInstance.openProjectDetails).toHaveBeenCalledWith(selectedTestData.selectedRow);
    });

    it('should make a call to openDialog if the selected option is VIEW_ADMIN_EMAILS', () => {
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

        selectedTestData.selectedOption = dashboardComponentTestInstance.VIEW_SUBACC_ADMIN_EMAILS;
        dashboardComponentTestInstance.rowAction(selectedTestData);
        expect(dashboardComponentTestInstance.openDialog).toHaveBeenCalledWith(dashboardComponentTestInstance.VIEW_SUBACC_ADMIN_EMAILS, selectedTestData.selectedRow);
    });

    it('should make a call to openDialog if the selected option is MODIFY_ACCOUNT', () => {
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

        selectedTestData.selectedOption = dashboardComponentTestInstance.MODIFY_ACCOUNT;
        dashboardComponentTestInstance.rowAction(selectedTestData);
        expect(dashboardComponentTestInstance.openDialog).toHaveBeenCalledWith(dashboardComponentTestInstance.MODIFY_ACCOUNT, selectedTestData.selectedRow);
    });

    it('should make a call to onDeleteAccount if the selected option is DELETE_ACCOUNT', () => {
        const selectedTestData = {
            selectedRow: {
                testProperty: 'testData',
                subaccountId: undefined
            },
            selectedOption: 'selectedTestOption',
            selectedIndex: 'selectedTestItem',
            subaccountId: 'test-id'
        };
        spyOn(dashboardComponentTestInstance, 'onDeleteAccount').and.callThrough();

        selectedTestData.selectedOption = dashboardComponentTestInstance.DELETE_ACCOUNT;
        dashboardComponentTestInstance.rowAction(selectedTestData);
        expect(dashboardComponentTestInstance.onDeleteAccount).toHaveBeenCalledWith(selectedTestData.selectedIndex);
    });
});

describe('.columnAction()', ()  => {
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
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Subaccount is missing, create one to access tekVizion360 Packages view', '');

        selectedTestData.selectedRow.status = 'not undefined';
        dashboardComponentTestInstance.columnAction(selectedTestData);
        expect(dashboardComponentTestInstance.openLicenseDetails).toHaveBeenCalledWith(selectedTestData.selectedRow);
    });

});
