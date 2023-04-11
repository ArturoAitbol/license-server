import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { Constants } from "src/app/helpers/constants";
import { DialogService } from "src/app/services/dialog.service";
import { StakeHolderServiceMock } from "src/test/mock/services/ctaas-stakeholder-service.mock";
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { AddStakeHolderComponent } from "./add-stake-holder/add-stake-holder.component";
import { CtaasStakeholderComponent } from "./ctaas-stakeholder.component";
import { UpdateStakeHolderComponent } from "./update-stake-holder/update-stake-holder.component";
import { TestBedConfigBuilder } from '../../../../test/mock/TestBedConfigHelper.mock';
import { MsalServiceMock } from '../../../../test/mock/services/msal-service.mock';
import { delay } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { CallbackService } from "src/app/services/callback.service";
import { CallbackServiceMock } from "src/test/mock/services/callback-service.mock";

let ctaasStakeholderComponentTestInstance: CtaasStakeholderComponent;
let fixture: ComponentFixture<CtaasStakeholderComponent>;
const dialogService = new DialogServiceMock();
const CustomMatDialogMock = {
    open: <T, D = any, R = any>(arg1) => {
        return {
            afterClosed: () => {
                return of(true).pipe(delay(200));
            },
        };
    },
};


const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(CtaasStakeholderComponent);
    configBuilder.addProvider({ provide: DialogService, useValue: dialogService });
    configBuilder.addProvider({provide: CallbackService, useValue: CallbackServiceMock});
    configBuilder.addDeclaration(AddStakeHolderComponent);
    configBuilder.addDeclaration(UpdateStakeHolderComponent);
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(CtaasStakeholderComponent);
    ctaasStakeholderComponentTestInstance = fixture.componentInstance;
};

describe('UI verification test', () => {
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
    });

    it('should execute sortData()', () => {
        ctaasStakeholderComponentTestInstance.stakeholdersData = StakeHolderServiceMock.unsortedStakeholderList.stakeHolders;
        ctaasStakeholderComponentTestInstance.sortData({ active: 'jobTitle', direction: 'desc' })
        expect(ctaasStakeholderComponentTestInstance.stakeholdersData).toEqual(StakeHolderServiceMock.sortedJobDes.stakeHolders);
        
        ctaasStakeholderComponentTestInstance.sortData({ active: 'jobTitle', direction: 'asc' })
        expect(ctaasStakeholderComponentTestInstance.stakeholdersData).toEqual(StakeHolderServiceMock.sortedJobAsc.stakeHolders);

        ctaasStakeholderComponentTestInstance.sortData({ active: 'jobTitle', direction: '' })
        expect(ctaasStakeholderComponentTestInstance.stakeholdersData).toEqual(StakeHolderServiceMock.unsortedStakeholderList.stakeHolders);
    
    });
});

describe('Data collection test', () => {
    beforeEach(beforeEachFunction);
    it('should make a call to fetchStakeholderList', () => { 
        spyOn(StakeHolderServiceMock, 'getStakeholderList').and.callThrough();
        spyOn(ctaasStakeholderComponentTestInstance, 'initColumns').and.callThrough()
        fixture.detectChanges();
        
        expect(StakeHolderServiceMock.getStakeholderList).toHaveBeenCalled();
        expect(ctaasStakeholderComponentTestInstance.initColumns).toHaveBeenCalled();
    });
});
    
describe('dialog calls and interactions',() => {
    beforeEach(beforeEachFunction)
    it('should execute openDialogs() with expected data', () => {
        const selectedTestData = {selectedRow:{testProperty: 'testData'}, selectedOption: 'selectedOption', selectedIndex: '0' }
        fixture.detectChanges();
    
        spyOn(ctaasStakeholderComponentTestInstance, 'openDialog').and.callThrough();
        spyOn(ctaasStakeholderComponentTestInstance, 'onDeleteStakeholderAccount').and.callThrough();
        spyOn(dialogService, 'confirmDialog').and.callThrough();
        spyOn(dialogService, 'afterClosed').and.callThrough();
        spyOn(StakeHolderServiceMock, 'deleteStakeholder').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
    
        ctaasStakeholderComponentTestInstance.addStakeholder();
        expect(ctaasStakeholderComponentTestInstance.openDialog).toHaveBeenCalledWith('Add Stakeholder');
           
        selectedTestData.selectedOption = 'Update Details';
        ctaasStakeholderComponentTestInstance.rowAction(selectedTestData);
        expect(ctaasStakeholderComponentTestInstance.openDialog).toHaveBeenCalledWith(selectedTestData.selectedOption, selectedTestData.selectedRow);
        dialogService.afterClosed();
            
        selectedTestData.selectedOption = 'Delete Account';
        dialogService.setExpectedConfirmDialogValue(true);
        ctaasStakeholderComponentTestInstance.rowAction(selectedTestData);
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Deleted Stakeholder successfully', '');
        expect(ctaasStakeholderComponentTestInstance.onDeleteStakeholderAccount).toHaveBeenCalledWith(selectedTestData.selectedRow);
        expect(StakeHolderServiceMock.deleteStakeholder).toHaveBeenCalled();

        selectedTestData.selectedOption = 'Delete Account';
        dialogService.setExpectedConfirmDialogValue(true);
        ctaasStakeholderComponentTestInstance.rowAction(selectedTestData);
        expect(ctaasStakeholderComponentTestInstance.onDeleteStakeholderAccount).toHaveBeenCalledWith(selectedTestData.selectedRow);
        expect(StakeHolderServiceMock.deleteStakeholder).toHaveBeenCalled();

        selectedTestData.selectedOption = 'Request Call to this Account'
        const selectedInconpleteUser = {selectedRow:
            {
            jobTitle:'testJob3', 
            companyName:'testCom3', 
            subaccountAdminEmail:'test3@gmail.com', 
            phoneNumber:'2222222222', 
            notifications: 'TYPE:LOW TIER',
            subaccountId: 'f6c0e45e-cfdc-4c1a-820e-bef6a856aaea',
            type:'High level'}, 
        selectedOption: 'Request Call to this Account', 
        selectedIndex: '0' }

        dialogService.setExpectedConfirmDialogValue(true);
        ctaasStakeholderComponentTestInstance.rowAction(selectedInconpleteUser);
        dialogService.afterClosed();
        expect(ctaasStakeholderComponentTestInstance.openDialog).toHaveBeenCalledWith(selectedInconpleteUser.selectedOption, selectedInconpleteUser.selectedRow);

        selectedTestData.selectedOption = 'Request Call to this Account'
        const selectedUser = {selectedRow:
            {
            name: 'test name',
            jobTitle:'testJob3', 
            companyName:'testCom3', 
            subaccountAdminEmail:'test3@gmail.com', 
            phoneNumber:'2222222222', 
            notifications: 'TYPE:LOW TIER',
            subaccountId: 'f6c0e45e-cfdc-4c1a-820e-bef6a856aaea',
            type:'High level'}, 
        selectedOption: 'Request Call to this Account', 
        selectedIndex: '0' }

        dialogService.setExpectedConfirmDialogValue(true);
        ctaasStakeholderComponentTestInstance.rowAction(selectedUser);
        dialogService.afterClosed();
        expect(ctaasStakeholderComponentTestInstance.openDialog).toHaveBeenCalledWith(selectedUser.selectedOption, selectedUser.selectedRow);
    });

    it('should call onChangeToggle with false flag', () => {
        spyOn(ctaasStakeholderComponentTestInstance, 'onChangeToggle').and.callThrough();

        ctaasStakeholderComponentTestInstance.toggleStatus = true;
        fixture.detectChanges();

        expect(ctaasStakeholderComponentTestInstance.onChangeToggle).toHaveBeenCalledWith(true);
    });

    it('should show a messge if an error ocurred while deleteing stakeholder', () => {
        const selectedTestData = {selectedRow:{testProperty: 'testData'}, selectedOption: 'selectedOption', selectedIndex: '1' }
        const response = {error: "some error message"};
        fixture.detectChanges();

        spyOn(ctaasStakeholderComponentTestInstance, 'onDeleteStakeholderAccount').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        spyOn(StakeHolderServiceMock, 'deleteStakeholder').and.returnValue(of(response));
        spyOn(dialogService, 'confirmDialog').and.callThrough();

        selectedTestData.selectedOption = 'Delete Account';
        dialogService.setExpectedConfirmDialogValue(true);
        ctaasStakeholderComponentTestInstance.rowAction(selectedTestData);
        expect(ctaasStakeholderComponentTestInstance.onDeleteStakeholderAccount).toHaveBeenCalledWith(selectedTestData.selectedRow);
        expect(StakeHolderServiceMock.deleteStakeholder).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith(response.error, 'Error while deleting Stakeholder');
    });
    
    it('should call deleteStakeHolder with an object', () => {
        const selectedTestData = {selectedRow:{testProperty: 'testData'}, selectedOption: 'selectedOption', selectedIndex: '1' }
        const response = {email: "testmail@gmail.com"};
        fixture.detectChanges();

        spyOn(ctaasStakeholderComponentTestInstance, 'onDeleteStakeholderAccount').and.callThrough();
        spyOn(StakeHolderServiceMock, 'deleteStakeholder').and.returnValue(of(response));
        spyOn(dialogService, 'confirmDialog').and.callThrough();

        selectedTestData.selectedOption = 'Delete Account';
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

    it('should throw a error if you exceeded the amount of stakeholders created', () => {
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();

        fixture.detectChanges();
        ctaasStakeholderComponentTestInstance.stakeholdersCount = Constants.STAKEHOLDERS_LIMIT_PER_SUBACCOUNT;
        ctaasStakeholderComponentTestInstance.addStakeholder();

        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('The maximum amount of users per customer (' + Constants.STAKEHOLDERS_LIMIT_PER_SUBACCOUNT + ') has been reached', '');
    });

    it('should display an error message if an error ocurred in fetchStakeholderList', () => {
        spyOn(console, 'error').and.callThrough();
        spyOn(StakeHolderServiceMock, 'getStakeholderList').and.returnValue(of([{error:'some error'}]));
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();

        fixture.detectChanges()
    
        expect(console.error).toHaveBeenCalledWith('some error |', jasmine.any(TypeError))
    });
});

describe('calls with customer subaccount admin role', () => {
    beforeEach(beforeEachFunction);
    
    it('should make a call to onDeleteStakeholderAccount with customer subaccount role', () => {
        spyOn(ctaasStakeholderComponentTestInstance, 'onDeleteStakeholderAccount').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        spyOn(MsalServiceMock.instance,'getActiveAccount').and.returnValue(MsalServiceMock.mockIdTokenClaimsSubaccountRole);
        ctaasStakeholderComponentTestInstance.toggleStatus = true;
        fixture.detectChanges();
        ctaasStakeholderComponentTestInstance.onDeleteStakeholderAccount({
            "subaccountId": "2c8e386b-d1bd-48b3-b73a-12bfa5d00805",
            "role": "customer.SubaccountAdmin",
            "phoneNumber": "",
            "jobTitle": "",
            "companyName": "",
            "name": "Test customer subaccount stakeholder",
            "email": "test-customer-subaccount-stakeholder@tekvizionlabs.com"
        });
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith("Error deleting administrator email, at least one administrator must remain")
    });
});

describe('ctaas-stakeholders, row action callback', () => {
    beforeEach(() => {
        const configBuilder = new TestBedConfigBuilder().useDefaultConfig(CtaasStakeholderComponent);
        TestBed.configureTestingModule(configBuilder.getConfig());
        TestBed.overrideProvider(MatDialog, { useValue: CustomMatDialogMock });
        fixture = TestBed.createComponent(CtaasStakeholderComponent);
        ctaasStakeholderComponentTestInstance = fixture.componentInstance;
    });
    beforeEach(() => {
        spyOn(MsalServiceMock.instance,'getActiveAccount').and.returnValue(MsalServiceMock.mockIdTokenClaimsSubaccountRole);
    });

    it('should execute openDialogs() with callback and subaacount admin role', () => {
    
        spyOn(ctaasStakeholderComponentTestInstance, 'openDialog').and.callThrough();
        spyOn(ctaasStakeholderComponentTestInstance, 'onDeleteStakeholderAccount').and.callThrough();
        spyOn(dialogService, 'confirmDialog').and.callThrough();
        spyOn(dialogService, 'afterClosed').and.callThrough();
        spyOn(StakeHolderServiceMock, 'deleteStakeholder').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        const selectedTestData = {selectedRow:{testProperty: 'testData'}, selectedOption: 'selectedOption', selectedIndex: '0' }
        fixture.detectChanges();
    
        selectedTestData.selectedOption = 'Request Call to this Account'
        const selectedUser = {selectedRow:
            {
            jobTitle:'testJob3', 
            companyName:'testCom3', 
            subaccountAdminEmail:'test3@gmail.com', 
            phoneNumber:'2222222222', 
            notifications: 'TYPE:LOW TIER',
            subaccountId: 'f6c0e45e-cfdc-4c1a-820e-bef6a856aaea',
            type:'High level'}, 
        selectedOption: 'Request Call to this Account', 
        selectedIndex: '0' }

        dialogService.setExpectedConfirmDialogValue(true);
        ctaasStakeholderComponentTestInstance.rowAction(selectedUser);
        dialogService.afterClosed();
        expect(ctaasStakeholderComponentTestInstance.openDialog).toHaveBeenCalledWith(selectedUser.selectedOption, selectedUser.selectedRow);
    });
});
