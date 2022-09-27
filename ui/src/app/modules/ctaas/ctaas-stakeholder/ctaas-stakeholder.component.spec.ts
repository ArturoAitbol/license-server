import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { HttpClient } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBarModule, MatSnackBarRef } from "@angular/material/snack-bar";
import { Sort } from "@angular/material/sort";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Router } from "@angular/router";
import { MsalService } from "@azure/msal-angular";
import { throwError } from "rxjs";
import { DialogService } from "src/app/services/dialog.service";
import { SnackBarService } from "src/app/services/snack-bar.service";
import { StakeHolderService } from "src/app/services/stake-holder.service";
import { MatDialogMock } from "src/test/mock/components/mat-dialog.mock";
import { StakeHolderServiceMock } from "src/test/mock/services/ctaas-stakeholder-service.mock";
import { DialogServiceMock } from "src/test/mock/services/dialog.service.mock";
import { MsalServiceMock } from "src/test/mock/services/msal-service.mock";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { SharedModule } from "../../shared/shared.module";
import { AddStakeHolderComponent } from "./add-stake-holder/add-stake-holder.component";
import { CtaasStakeholderComponent } from "./ctaas-stakeholder.component";
import { UpdateStakeHolderComponent } from "./update-stake-holder/update-stake-holder.component";

let ctaasStakeholderComponentTestInstance: CtaasStakeholderComponent;
let fixture: ComponentFixture<CtaasStakeholderComponent>;
const dialogService = new DialogServiceMock();
let loader: HarnessLoader;

const RouterMock = {
    navigate: (commands: string[]) => { }
};

const beforeEachFunction = () => {
    TestBed.configureTestingModule({
        declarations: [CtaasStakeholderComponent,AddStakeHolderComponent,UpdateStakeHolderComponent],
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
                provide: StakeHolderService,
                useValue: StakeHolderServiceMock
            },
            {
                provide: DialogService,
                useValue: dialogService
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
    });
    fixture = TestBed.createComponent(CtaasStakeholderComponent);
    ctaasStakeholderComponentTestInstance = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    spyOn(console, 'log').and.callThrough();
};

fdescribe('UI verification test', () => {
    beforeEach(beforeEachFunction);
    it('should display essential UI and components', () => {
       fixture.detectChanges();
       const h2 = fixture.nativeElement.querySelector('#main-title');
       const addButton = fixture.nativeElement.querySelector('#add-customer-button');

       expect(h2.textContent).toBe('Stakeholders');
       expect(addButton.textContent).toBe(' Add Stakeholder ');
    });

    it('should load correct data columns for the table', () => {
        fixture.detectChanges();

        const headers: HTMLElement[] = fixture.nativeElement.querySelectorAll('.mat-sort-header-content');
        expect(headers[0].innerText).toBe('User');
        expect(headers[1].innerText).toBe('Company Name');
        expect(headers[2].innerText).toBe('Job Title');
        expect(headers[3].innerText).toBe('Email');
        expect(headers[4].innerText).toBe('Phone Number');
        expect(headers[5].innerText).toBe('Type');
    });

    it('should execute sortData()', () => {
        const sort: Sort = { active: 'companyName', direction: 'desc' }

        spyOn(ctaasStakeholderComponentTestInstance, 'sortData').and.callThrough();

        ctaasStakeholderComponentTestInstance.sortData(sort);
        expect(ctaasStakeholderComponentTestInstance.sortData).toHaveBeenCalledWith(sort);

        sort.direction = 'asc';
        ctaasStakeholderComponentTestInstance.sortData(sort);

        sort.direction = '';
        ctaasStakeholderComponentTestInstance.sortData(sort);
    });
});

fdescribe('Data collection test', () => {
    beforeEach(beforeEachFunction);
    it('should make a call to fetch fetchStakeholderList', () => { 
        spyOn(StakeHolderServiceMock, 'getStakeholderList').and.callThrough();
        spyOn(ctaasStakeholderComponentTestInstance, 'initColumns').and.callThrough()
        fixture.detectChanges();

        expect(StakeHolderServiceMock.getStakeholderList).toHaveBeenCalled();
        expect(ctaasStakeholderComponentTestInstance.initColumns).toHaveBeenCalled();
    });
});

fdescribe('dialog calls and interactions',() => {
    beforeEach(beforeEachFunction)
    it('should execute openDialogs() with expected data', () => {
        const selectedTestData = {selectedRow:{testProperty: 'testData'}, selectedOption: 'selectedOption', selectedIndex: '0' }
        fixture.detectChanges();

        spyOn(ctaasStakeholderComponentTestInstance, 'openDialog').and.callThrough();
        spyOn(ctaasStakeholderComponentTestInstance, 'onDeleteStakeholderAccount').and.callThrough();
        spyOn(dialogService, 'confirmDialog').and.callThrough();
        spyOn(StakeHolderServiceMock, 'deleteStakeholder').and.callThrough();

        ctaasStakeholderComponentTestInstance.addStakeholder();
        expect(ctaasStakeholderComponentTestInstance.openDialog).toHaveBeenCalledWith('Add Stakeholder');
       

        selectedTestData.selectedOption = 'Update Stakeholder Details';
        ctaasStakeholderComponentTestInstance.rowAction(selectedTestData);
        expect(ctaasStakeholderComponentTestInstance.openDialog).toHaveBeenCalledWith(selectedTestData.selectedOption, selectedTestData.selectedRow);
        

        selectedTestData.selectedOption = 'Delete Stakeholder Account';
        dialogService.setExpectedConfirmDialogValue(true);
        ctaasStakeholderComponentTestInstance.rowAction(selectedTestData);
        expect(ctaasStakeholderComponentTestInstance.onDeleteStakeholderAccount).toHaveBeenCalledWith(selectedTestData.selectedRow);
        expect(StakeHolderServiceMock.deleteStakeholder).toHaveBeenCalled();
    });

    it('should show a message if an error ocurred while fetching the data', () => {
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        spyOn(StakeHolderServiceMock, 'getStakeholderList').and.returnValue(throwError('some error'))

        fixture.detectChanges();
        
        expect(StakeHolderServiceMock.getStakeholderList).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('some error', 'Error while loading stake holders');
        
    });
});

