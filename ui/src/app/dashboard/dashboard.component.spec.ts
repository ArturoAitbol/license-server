import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
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

let dashboardComponentTestInstance: DashboardComponent;
let fixture: ComponentFixture<DashboardComponent>;

const RouterMock = {
    navigate: (commands: string[]) => {}
};

const beforeEachFunction = () => {
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
                provide: MatSnackBarRef,
                useValue: {}
            },
            {
                provide: CustomerService,
                useValue: CustomerServiceMock
            },
            {
                provide: DialogService,
                useValue: () => {
                    return {};
                }
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
    });
    fixture = TestBed.createComponent(DashboardComponent);
    dashboardComponentTestInstance = fixture.componentInstance;
    dashboardComponentTestInstance.ngOnInit();
    spyOn(console, 'log').and.callThrough();
    spyOn(CustomerServiceMock, 'getCustomerList').and.callThrough();
    spyOn(LicenseServiceMock, 'getLicenseList').and.callThrough();
    spyOn(SubaccountServiceMock, 'getSubAccountList').and.callThrough();
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
        fixture.detectChanges();
        expect(CustomerServiceMock.getCustomerList).toHaveBeenCalled();
        expect(LicenseServiceMock.getLicenseList).toHaveBeenCalled();
        expect(SubaccountServiceMock.getSubAccountList).toHaveBeenCalled();
    });
});


describe('Dialog calls and interactions', () => {
    beforeEach(beforeEachFunction);
    it('should openDialog with expected data for given arguments', () => {
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

    it('should execute rowAction() with expected data given set arguments',  () => {
        const selectedTestData = { selectedRow: { testProperty: 'testData'}, selectedOption: 'selectedTestOption', selectedIndex: 'selectedTestItem' };
        spyOn(dashboardComponentTestInstance, 'openDialog');
        spyOn(dashboardComponentTestInstance, 'openLicenseDetails');
        spyOn(dashboardComponentTestInstance, 'openLicenseConsumption');
        spyOn(dashboardComponentTestInstance, 'openProjectDetails');
        spyOn(dashboardComponentTestInstance, 'onDeleteAccount');

        selectedTestData.selectedOption = dashboardComponentTestInstance.VIEW_ADMIN_EMAILS;
        dashboardComponentTestInstance.rowAction(selectedTestData);
        expect(dashboardComponentTestInstance.openDialog).toHaveBeenCalledWith(selectedTestData.selectedOption, selectedTestData.selectedRow);

        selectedTestData.selectedOption = dashboardComponentTestInstance.VIEW_SUBACC_ADMIN_EMAILS;
        dashboardComponentTestInstance.rowAction(selectedTestData);
        expect(dashboardComponentTestInstance.openDialog).toHaveBeenCalledWith(selectedTestData.selectedOption, selectedTestData.selectedRow);

        selectedTestData.selectedOption = dashboardComponentTestInstance.MODIFY_ACCOUNT;
        dashboardComponentTestInstance.rowAction(selectedTestData);
        expect(dashboardComponentTestInstance.openDialog).toHaveBeenCalledWith(selectedTestData.selectedOption, selectedTestData.selectedRow);

        selectedTestData.selectedOption = dashboardComponentTestInstance.VIEW_LICENSES;
        dashboardComponentTestInstance.rowAction(selectedTestData);
        expect(dashboardComponentTestInstance.openLicenseDetails).toHaveBeenCalledWith(selectedTestData.selectedRow);

        selectedTestData.selectedOption = dashboardComponentTestInstance.VIEW_CONSUMPTION;
        dashboardComponentTestInstance.rowAction(selectedTestData);
        expect(dashboardComponentTestInstance.openLicenseConsumption).toHaveBeenCalledWith(selectedTestData.selectedRow);

        selectedTestData.selectedOption = dashboardComponentTestInstance.VIEW_PROJECTS;
        dashboardComponentTestInstance.rowAction(selectedTestData);
        expect(dashboardComponentTestInstance.openProjectDetails).toHaveBeenCalledWith(selectedTestData.selectedRow);

        selectedTestData.selectedOption = dashboardComponentTestInstance.DELETE_ACCOUNT;
        dashboardComponentTestInstance.rowAction(selectedTestData);
        expect(dashboardComponentTestInstance.onDeleteAccount).toHaveBeenCalledWith(selectedTestData.selectedIndex);
    });
});


describe('Navigation', () => {
    beforeEach(beforeEachFunction);
    it('should navigate to customer licenses after calling openLicenseDetails()', () => {
        spyOn(CustomerServiceMock, 'setSelectedCustomer');
        spyOn(RouterMock, 'navigate');
        dashboardComponentTestInstance.openLicenseDetails({});
        expect(RouterMock.navigate).toHaveBeenCalledWith(['/customer/licenses']);
    });

    it('should navigate to license consumption after calling openLicenseConsumption()', () => {
        spyOn(CustomerServiceMock, 'setSelectedCustomer');
        spyOn(RouterMock, 'navigate');
        dashboardComponentTestInstance.openLicenseConsumption({});
        expect(RouterMock.navigate).toHaveBeenCalledWith(['/customer/consumption']);
    });

    it('should navigate to project details after calling openProjectDetails()', () => {
        spyOn(CustomerServiceMock, 'setSelectedCustomer');
        spyOn(RouterMock, 'navigate');
        dashboardComponentTestInstance.openProjectDetails({});
        expect(RouterMock.navigate).toHaveBeenCalledWith(['/customer/projects']);
    });
});

