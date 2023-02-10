import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialog } from "@angular/material/dialog";
import { Sort } from "@angular/material/sort";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Router } from "@angular/router";
import { MsalService } from "@azure/msal-angular";
import { throwError } from "rxjs";
import { License } from "src/app/model/license.model";
import { CustomerService } from "src/app/services/customer.service";
import { DialogService } from "src/app/services/dialog.service";
import { LicenseService } from "src/app/services/license.service";
import { SnackBarService } from "src/app/services/snack-bar.service";
import { SubAccountService } from "src/app/services/sub-account.service";
import { MatDialogMock } from "src/test/mock/components/mat-dialog.mock";
import { CustomerServiceMock } from "src/test/mock/services/customer-service.mock";
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { LicenseServiceMock } from "src/test/mock/services/license-service.mock";
import { MsalServiceMock } from "src/test/mock/services/msal-service.mock";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { SubaccountServiceMock } from "src/test/mock/services/subaccount-service.mock";
import { SharedModule } from "../../shared/shared.module";
import { AddLicenseComponent } from "./add-license/add-license.component";
import { LicensesComponent } from "./licenses.component"
import { ModifyLicenseComponent } from "./modify-license/modify-license.component";

let licensesComponentTestInstance: LicensesComponent;
let fixture : ComponentFixture<LicensesComponent>;

const RouterMock = {
    navigate: (commands: string[]) => {}
};

const dialogServiceMock = new DialogServiceMock();

const beforeEachFunction = () =>{
    TestBed.configureTestingModule({
        declarations:[LicensesComponent],
        imports: [CommonModule,SharedModule,BrowserAnimationsModule],
        providers: [ 
             {
            provide: MatDialog,
            useValue: MatDialogMock
        },
        {
            provide: SnackBarService,
            useValue: SnackBarServiceMock
        },
        {
            provide: Router,
            useValue: RouterMock
        },
        {
            provide: MsalService,
            useValue: MsalServiceMock
        },
        {
            provide: CustomerService,
            useValue: CustomerServiceMock
        },
        {
            provide: LicenseService,
            useValue: LicenseServiceMock
        },
        {
            provide: DialogService,
            useValue: dialogServiceMock
        },
        {
            provide: SubAccountService,
            useValue: SubaccountServiceMock
        },
        {
            provide: HttpClient,
            useValue: HttpClient
        }
    ]
    });
    fixture = TestBed.createComponent(LicensesComponent);
    licensesComponentTestInstance = fixture.componentInstance;
}

describe('licenses - UI verification tests',()=>{

    beforeEach(beforeEachFunction);

    it('should display essential UI and components and call sizeChange()',()=>{
        spyOn(licensesComponentTestInstance, 'sizeChange').and.callThrough();

        fixture.detectChanges();
        licensesComponentTestInstance.sizeChange();

        const h1: HTMLElement = fixture.nativeElement.querySelector('#page-title');
        const h2: HTMLElement = fixture.nativeElement.querySelector('#table-title');
        const backButton: HTMLElement = fixture.nativeElement.querySelector('#back-button');
        const addLicenseButton: HTMLElement = fixture.nativeElement.querySelector('#add-license-button');
        const currentSubaccount = licensesComponentTestInstance.customerSubaccountDetails;
        expect(h1.textContent).toBe(`${currentSubaccount.customerName} - ${currentSubaccount.name}`);
        expect(h2.textContent).toBe('tekVizion 360 Subscriptions');
        expect(backButton.textContent).toBe('Back');
        expect(addLicenseButton.textContent).toBe('Add tekVizion 360 Subscription');
    });

    it('sould load correct data columns for the table', ()=>{
        fixture.detectChanges();
        
        const headers: HTMLElement[] = fixture.nativeElement.querySelectorAll('.mat-sort-header-content');
        expect(headers[0].innerText).toBe('Start Date');
        expect(headers[1].innerText).toBe('Renewal Date');
        expect(headers[2].innerText).toBe('Description');
        expect(headers[3].innerText).toBe('Status');
        expect(headers[4].innerText).toBe('Subscription Type');
        expect(headers[5].innerText).toBe('Device Limit');
        expect(headers[6].innerText).toBe('tekTokens');
    });
});

describe('Data collection and parsing tests',()=>{

    beforeEach(beforeEachFunction);

    it('should make a call to get selected Customer, licenses and actionMenuOptions',()=>{
        spyOn(LicenseServiceMock,'getLicenseList').and.callThrough();
        spyOn(SubaccountServiceMock,'getSelectedSubAccount').and.callThrough();
        spyOn(MsalServiceMock.instance,'getActiveAccount').and.callThrough();

        fixture.detectChanges();
        
        expect(SubaccountServiceMock.getSelectedSubAccount).toHaveBeenCalled();
        expect(LicenseServiceMock.getLicenseList).toHaveBeenCalled();
        expect(MsalServiceMock.instance.getActiveAccount).toHaveBeenCalled();
        expect(licensesComponentTestInstance.actionMenuOptions).not.toEqual(['Edit','Delete']);
    });

    it('should change the loading-related variables if getLicenses() got an error',()=>{
        spyOn(LicenseServiceMock,'getLicenseList').and.returnValue(throwError("error"));

        fixture.detectChanges();

        expect(licensesComponentTestInstance.isLoadingResults).toBeFalse();
        expect(licensesComponentTestInstance.isRequestCompleted).toBeTrue();
    });

    it('should remove the delete option if the selected customer is not a test customer',()=>{
        spyOn(CustomerServiceMock,'getSelectedCustomer').and.returnValue(CustomerServiceMock.realCustomer);

        fixture.detectChanges();

        expect(licensesComponentTestInstance.actionMenuOptions).not.toContain('Delete');
    });

    it('should sort the table after calling sortData() according to the set arguments',()=>{
        licensesComponentTestInstance.licenses = LicenseServiceMock.unsortedLicensesList.licenses;
        licensesComponentTestInstance.sortData({active: "status", direction: "asc"});
        expect(licensesComponentTestInstance.licenses).toEqual(LicenseServiceMock.sortedAscLicensesList.licenses);

        licensesComponentTestInstance.sortData({active: "status", direction: "desc"});
        expect(licensesComponentTestInstance.licenses).toEqual(LicenseServiceMock.sortedDescLicensesList.licenses);

        licensesComponentTestInstance.licensesBk = LicenseServiceMock.unsortedLicensesList.licenses;
        licensesComponentTestInstance.sortData({active: "status", direction: ''});
        expect(licensesComponentTestInstance.licenses).toEqual(LicenseServiceMock.unsortedLicensesList.licenses);

        licensesComponentTestInstance.licenses = LicenseServiceMock.unsortedLicensesList.licenses;
        licensesComponentTestInstance.sortData({active: "tokensPurchased", direction: "asc"});
        expect(licensesComponentTestInstance.licenses).toEqual(LicenseServiceMock.sortedAscTokenPurchasedList.licenses);

        licensesComponentTestInstance.sortData({active: "tokensPurchased", direction: "desc"});
        expect(licensesComponentTestInstance.licenses).toEqual(LicenseServiceMock.sortedDescTokenPurchasedList.licenses);

        fixture.detectChanges();
        licensesComponentTestInstance.licenses = LicenseServiceMock.mockUnsortedTwoTokensPurchased.licenses;
        licensesComponentTestInstance.sortData({active: "tokensPurchased", direction: "desc"});
        expect(licensesComponentTestInstance.licenses).toEqual(LicenseServiceMock.mockSortedDescTwoTokensPurchsed.licenses);

    });
});

describe('Dialog calls and interactions', ()=>{

    beforeEach(beforeEachFunction);

    it('should execute rowAction() with expected data given set arguments',()=>{
        spyOn(licensesComponentTestInstance,'openDialog');
        spyOn(licensesComponentTestInstance,'onDelete');
        const license: License = LicenseServiceMock.mockLicenseA;
        const selectedTestData = { selectedRow: license, selectedOption: undefined, selectedIndex: 'selectedTestItem'};
        
        
        selectedTestData.selectedOption = licensesComponentTestInstance.MODIFY_LICENSE;
        licensesComponentTestInstance.rowAction(selectedTestData);
        expect(licensesComponentTestInstance.openDialog).toHaveBeenCalledWith(ModifyLicenseComponent,selectedTestData.selectedRow);
        
        selectedTestData.selectedOption = licensesComponentTestInstance.DELETE_LICENSE;
        licensesComponentTestInstance.rowAction(selectedTestData);
        expect(licensesComponentTestInstance.onDelete).toHaveBeenCalledWith(license);

    });

    it('should openDialog with AddLicenseComponent when calling onNewLicense()',()=>{
        spyOn(licensesComponentTestInstance,'openDialog');
        licensesComponentTestInstance.onNewLicense();
        expect(licensesComponentTestInstance.openDialog).toHaveBeenCalledWith(AddLicenseComponent);
    });

    it('should openDialog with expected data for given arguments',()=>{
        spyOn(MatDialogMock, 'open').and.callThrough();
        spyOn(licensesComponentTestInstance,'fetchLicenses');
        const expectedArgument = { width: 'auto', data: undefined, disableClose: true };

        licensesComponentTestInstance.openDialog(AddLicenseComponent);
        expect(MatDialogMock.open).toHaveBeenCalledWith(AddLicenseComponent,expectedArgument);
        expect(licensesComponentTestInstance.fetchLicenses).toHaveBeenCalled();

        const selectedItemTestData = {testProperty: 'testValue'}; 
        expectedArgument.data = selectedItemTestData ;
        licensesComponentTestInstance.openDialog(ModifyLicenseComponent,selectedItemTestData);
        expect(MatDialogMock.open).toHaveBeenCalledWith(ModifyLicenseComponent,expectedArgument);
        expect(licensesComponentTestInstance.fetchLicenses).toHaveBeenCalled();
    });

    it('should delete license if the operation is confirmed in confirmDialog after calling onDelete()',()=>{
        spyOn(dialogServiceMock,'confirmDialog').and.callThrough();
        spyOn(LicenseServiceMock,'deleteLicense').and.callThrough();
        spyOn(licensesComponentTestInstance,'fetchLicenses');
        const license: License = LicenseServiceMock.mockLicenseA;

        dialogServiceMock.setExpectedConfirmDialogValue(true);
        licensesComponentTestInstance.onDelete(license);

        expect(dialogServiceMock.confirmDialog).toHaveBeenCalled();
        expect(LicenseServiceMock.deleteLicense).toHaveBeenCalledWith(license.id);
        expect(licensesComponentTestInstance.fetchLicenses).toHaveBeenCalled();
    })

    
    it('should not delete license if the operation is NOT confirmed in confirmDialog after calling onDelete()',()=>{
        spyOn(dialogServiceMock,'confirmDialog').and.callThrough();
        spyOn(LicenseServiceMock,'deleteLicense').and.callThrough();
        spyOn(licensesComponentTestInstance,'fetchLicenses');

        dialogServiceMock.setExpectedConfirmDialogValue(false);
        licensesComponentTestInstance.onDelete(LicenseServiceMock.mockLicenseA);
        
        expect(dialogServiceMock.confirmDialog).toHaveBeenCalled();
        expect(LicenseServiceMock.deleteLicense).not.toHaveBeenCalled();
        expect(licensesComponentTestInstance.fetchLicenses).not.toHaveBeenCalled();
    })

});

describe('Navigation', ()=>{
    beforeEach(beforeEachFunction);
    it('sould navigate to dashboard after calling goToDashboard()',()=>{
        spyOn(RouterMock,'navigate');
        licensesComponentTestInstance.goToDashboard();
        expect(RouterMock.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
})