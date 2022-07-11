import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { CustomerService } from '../services/customer.service';
import { DialogService } from '../services/dialog.service';
import { LicenseService } from '../services/license.service';
import { SubAccountService } from '../services/sub-account.service';
import { DashboardComponent } from './dashboard.component';
import { SharedModule } from '../modules/shared/shared.module';
import { DataTableComponent } from '../generics/data-table/data-table.component';

// import { permissions } from '../helpers/role-permissions';
// import { SubaccountAdminEmailService } from '../services/subaccount-admin-email.service';
// import { AddCustomerAccountModalComponent } from './add-customer-account-modal/add-customer-account-modal.component';
// import { AddSubaccountModalComponent } from './add-subaccount-modal/add-subaccount-modal.component';
// import { AdminEmailsComponent } from './admin-emails-modal/admin-emails.component';
// import { ModifyCustomerAccountComponent } from './modify-customer-account/modify-customer-account.component';
// import { SubaccountAdminEmailsComponent } from './subaccount-admin-emails-modal/subaccount-admin-emails.component';

let dashboardComponentTestInstance: DashboardComponent;
let fixture: ComponentFixture<DashboardComponent>;
let h1: HTMLElement;
beforeEach(() => {
    TestBed.configureTestingModule({
        declarations: [DashboardComponent, DataTableComponent],
        imports: [HttpClientModule, MatDialogModule, MatSnackBarModule, SharedModule],
        providers: [
            {
               provide: Router,
               useValue: {}
            },
            {
                provide: MatDialogRef,
                useValue: {}
            },
            {
                provide: MatSnackBarRef,
                useValue: {}
            },
            {
                provide: CustomerService,
                useValue: {}
            },
            {
                provide: DialogService,
                useValue: {}
            },
            {
                provide: LicenseService,
                useValue: {}
            },
            {
                provide: SubAccountService,
                useValue: {}
            },
            {
                provide: MsalService,
                useValue: {}
            },
            {
                provide: SharedModule,
                useValue: SharedModule
            },
          ]
    });
    fixture = TestBed.createComponent(DashboardComponent);
    dashboardComponentTestInstance = fixture.componentInstance;
    h1 = fixture.nativeElement.querySelector('#page-title');
    spyOn(console, 'log').and.callThrough();

});
it('should display the Customer heading', () => {
    expect(h1.textContent).toBe('Customers');
});
