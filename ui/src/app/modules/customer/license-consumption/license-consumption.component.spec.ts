import { HttpClient } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import { MatDialog} from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
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
import { SharedModule } from '../../shared/shared.module';
import { LicenseConsumptionComponent } from './license-consumption.component';
import { AddLicenseConsumptionComponent } from './add-license-consumption/add-license-consumption.component';
import { ModifyLicenseConsumptionDetailsComponent } from './modify-license-consumption-details/modify-license-consumption-details.component';
import { DialogServiceMock } from 'src/test/mock/services/dialog-service.mock';
import { LicenseConsumptionService } from 'src/app/services/license-consumption.service';
import { LicenseServiceMock } from 'src/test/mock/services/license-service.mock';
import { LicenseService } from 'src/app/services/license.service';
import { ConsumptionServiceMock } from 'src/test/mock/services/license-consumption-service.mock';
import { ReactiveFormsModule } from '@angular/forms';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatHeaderCellHarness } from '@angular/material/table/testing';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { of, throwError } from 'rxjs';
import { AddLicenseComponent } from '../licenses/add-license/add-license.component';
import moment from 'moment';
import { By } from '@angular/platform-browser';
import { MatDateRangePicker } from '@angular/material/datepicker';
import { Sort } from '@angular/material/sort';
import { StaticConsumptionDetailsComponent } from './static-consumption-details/static-consumption-details.component';
import { EventEmitter } from '@angular/core';
import { delay } from 'rxjs/operators';

let licenseConsumptionComponentTestInstance: LicenseConsumptionComponent;
let fixture: ComponentFixture<LicenseConsumptionComponent>;
let loader: HarnessLoader;
const dialogService = new DialogServiceMock();

const RouterMock = {
    navigate: (commands: string[]) => {}
};

const CustomMatDialogMock = {
    open: <T, D = any, R = any>(arg1) => {
        return {
            afterClosed: () => {
                return of(true).pipe(delay(200));
            },
            componentInstance: {
                updateProjects: arg1 === AddLicenseConsumptionComponent ?  updateProjectsEvent : null
            }
        };
    },
};

const updateProjectsEvent = new EventEmitter<any>();

const TestBedParams = {
    declarations: [ LicenseConsumptionComponent, DataTableComponent, ModifyLicenseConsumptionDetailsComponent, AddLicenseConsumptionComponent,StaticConsumptionDetailsComponent ],
    imports: [ BrowserAnimationsModule, MatSnackBarModule, SharedModule, ReactiveFormsModule ],
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
            provide: ProjectService,
            useValue: ProjectServiceMock
        },
        {
            provide: LicenseService,
            useValue: LicenseServiceMock
        },
        {
            provide: LicenseConsumptionService,
            useValue: ConsumptionServiceMock
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
};

const beforeEachFunction = () => {
    TestBed.configureTestingModule(TestBedParams);
    fixture = TestBed.createComponent(LicenseConsumptionComponent);
    licenseConsumptionComponentTestInstance = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    const childComponent = jasmine.createSpyObj('detailsConsumptionTable', ['setPageIndex']);
    licenseConsumptionComponentTestInstance.detailsConsumptionTable = childComponent;
};

describe('UI verification test', () => {
    beforeEach(beforeEachFunction);
    beforeEach(()=>spyOn(LicenseServiceMock,'getLicenseList').and.returnValue(of({licenses:[]})));
    it('should display essential UI and components', async() =>{
        fixture.detectChanges();
        //Titles
        const title = fixture.nativeElement.querySelector('#page-title');
        const firstSectionTitle = fixture.nativeElement.querySelector('#first-section-title');
        const thirdSectionTitle = fixture.nativeElement.querySelector('#third-section-title');
        const currentCustomer = licenseConsumptionComponentTestInstance.currentCustomer;

        expect(title.textContent).toBe(`${currentCustomer.name} - ${currentCustomer.subaccountName}`);
        expect(firstSectionTitle.textContent).toBe('tekToken Consumption Summary');
        expect(thirdSectionTitle.textContent).toBe('Equipment Summary');
        
        
        //Buttons
        const addLicenseButton = fixture.nativeElement.querySelector('#add-license-button');
        const addLicenseConsumptionButton = fixture.nativeElement.querySelector('#add-license-consumption');
        const goBackButton = fixture.nativeElement.querySelector('#back-button');
        expect(addLicenseButton.textContent).toContain('Add tekVizion 360 Subscription');
        expect(addLicenseConsumptionButton.textContent).toContain('Add tekToken Consumption');
        expect(goBackButton.textContent).toContain('Back');

        const cloneConsumptionButton: HTMLElement = fixture.nativeElement.querySelector('#clone-consumption');
        expect(cloneConsumptionButton.textContent).toContain('Clone Consumption');
        licenseConsumptionComponentTestInstance.toggleSelectableConsumptions();
        fixture.detectChanges();
        const confirmCloningButton = fixture.nativeElement.querySelector('#confirm-cloning');
        expect(confirmCloningButton.textContent).toContain('Confirm Cloning');


        //Filters
        const consumptionTypeForm = await loader.getHarness(MatFormFieldHarness.with({selector:"#consumption-type-form"}));
        const licensePeriodForm = await loader.getHarness(MatFormFieldHarness.with({selector:"#license-period-form"}));
        const projectForm = await loader.getHarness(MatFormFieldHarness.with({selector:"#project-form"}));
        const dateForm = await loader.getHarness(MatFormFieldHarness.with({selector:"#date-form"}));
        expect(await consumptionTypeForm.getLabel()).toContain('Consumption Type');
        expect(await licensePeriodForm.getLabel()).toContain('tekVizion 360 Subscription');
        expect(await projectForm.getLabel()).toContain('Project');
        expect(await dateForm.getLabel()).toContain(licenseConsumptionComponentTestInstance.getDatePickerLabel());
        
        const radioGroup = fixture.nativeElement.querySelector('mat-radio-group');
        expect(radioGroup.querySelector('[value="period"]').textContent).toContain("License Period");
        expect(radioGroup.querySelector('[value="week"]').textContent).toContain("Week");
        expect(radioGroup.querySelector('[value="month"]').textContent).toContain("Month");
    });

    it('should load correct data columns for tekTokensSummary table', () => {
        fixture.detectChanges();
        const tekTokensSummaryColumns: HTMLElement[] = fixture.nativeElement.querySelectorAll('#tektokens-summary-table .mat-sort-header-content');
        expect(tekTokensSummaryColumns[0].innerText).toBe('tekTokens');
        expect(tekTokensSummaryColumns[1].innerText).toBe('Consumed');
        expect(tekTokensSummaryColumns[2].innerText).toBe('Available');

    });

    it('should load correct data columns for automationSummary table', () => {
        fixture.detectChanges();
        const automationSummaryColumns: HTMLElement[] = fixture.nativeElement.querySelectorAll('#automation-summary-table .mat-sort-header-content');
        expect(automationSummaryColumns[0].innerText).toBe('Device Access Limit');
        expect(automationSummaryColumns[1].innerText).toBe('Devices Connected');
    });

    it('should load correct data columns for tekTokenConsumption table', () => {
        fixture.detectChanges();
        const tekTokenConsumptionColumns: HTMLElement[] = fixture.nativeElement.querySelectorAll('#tektokens-consumption-table .mat-sort-header-content');
        expect(tekTokenConsumptionColumns[0].innerText).toBe('Automation tekTokens Consumed');
        expect(tekTokenConsumptionColumns[1].innerText).toBe('Configuration tekTokens Consumed');
        expect(tekTokenConsumptionColumns[2].innerText).toBe('Total Consumption');
    });

    it('should load correct data columns for weeklyConsumption table', () => {
        fixture.detectChanges();
        const weeklyConsumptionColumns: HTMLElement[] = fixture.nativeElement.querySelectorAll('#weekly-consumption-table .mat-sort-header-content');
        expect(weeklyConsumptionColumns[0].innerText).toBe('Week');
        expect(weeklyConsumptionColumns[1].innerText).toBe('tekTokens');
    });

    it('should load correct data columns for projectConsumption table', () => {
        fixture.detectChanges();
        const projectConsumptionColumns: HTMLElement[] = fixture.nativeElement.querySelectorAll('#project-consumption-table .mat-sort-header-content');
        expect(projectConsumptionColumns[0].innerText).toBe('Project Name');
        expect(projectConsumptionColumns[1].innerText).toBe('Status');
        expect(projectConsumptionColumns[2].innerText).toBe('tekTokens');
    });

    it('should load correct data columns for detailedConsumption table', async()=>{
        const detailedConsumptionColumns = await loader.getAllHarnesses(MatHeaderCellHarness.with({ancestor:"#detailed-consumption-table"}));
        expect(await detailedConsumptionColumns[0].getText()).toBe('Consumption Date');
        expect(await detailedConsumptionColumns[1].getText()).toBe('Project');
        expect(await detailedConsumptionColumns[2].getText()).toBe('Type');
        expect(await detailedConsumptionColumns[3].getText()).toBe('Vendor');
        expect(await detailedConsumptionColumns[4].getText()).toBe('Model');
        expect(await detailedConsumptionColumns[5].getText()).toBe('Version');
        expect(await detailedConsumptionColumns[6].getText()).toBe('tekTokens Used');
        expect(await detailedConsumptionColumns[7].getText()).toBe('Usage Days');
    });

    it('should load correct data columns for equipmentSummary table',()=>{
        fixture.detectChanges();
        const equipmentSummaryColumns: HTMLElement[] = fixture.nativeElement.querySelectorAll('#equipment-summary-table .mat-sort-header-content');
        expect(equipmentSummaryColumns[0].innerText).toBe('Vendor');
        expect(equipmentSummaryColumns[1].innerText).toBe('Model');
        expect(equipmentSummaryColumns[2].innerText).toBe('Version');
    });
});

describe('Data collection and parsing tests', () => {
    beforeEach(beforeEachFunction);

    it('should set a project Id if there is a corresponding item in local storage after initializing', () => {
        const project = ProjectServiceMock.projectsListValue.projects[0];
        spyOn(localStorage,'getItem').and.returnValue(JSON.stringify(project));
        fixture.detectChanges();
        expect(licenseConsumptionComponentTestInstance.selectedProject).toBe(project.id);
    });

    it('should make a call to get licenses, projects, dataToDisplay and actionMenuOptions after initializing', () => {
        spyOn(LicenseServiceMock,'getLicenseList').and.callThrough();
        spyOn(CurrentCustomerServiceMock, 'getSelectedCustomer' ).and.callThrough();
        spyOn(licenseConsumptionComponentTestInstance,"fetchDataToDisplay").and.callThrough();
        spyOn(licenseConsumptionComponentTestInstance,"fetchProjectsList").and.callThrough();
        fixture.detectChanges();
        expect(CurrentCustomerServiceMock.getSelectedCustomer).toHaveBeenCalled();
        expect(LicenseServiceMock.getLicenseList).toHaveBeenCalledWith(CurrentCustomerServiceMock.selectedCustomer.subaccountId);
        expect(licenseConsumptionComponentTestInstance.licensesList).toEqual([LicenseServiceMock.mockLicenseA,LicenseServiceMock.mockLicenseL]);
        expect(licenseConsumptionComponentTestInstance.isLicenseListLoaded).toBeTrue();
        expect(licenseConsumptionComponentTestInstance.fetchDataToDisplay).toHaveBeenCalled();
        expect(licenseConsumptionComponentTestInstance.fetchProjectsList).toHaveBeenCalled();
        expect(licenseConsumptionComponentTestInstance.licConsumptionActionMenuOptions).toEqual(['Edit','Delete']);
    });

    it('should change the status of all the loading-related variables if there is no licenses to show after initializing', () => {
        spyOn(LicenseServiceMock,'getLicenseList').and.returnValue(of({licenses:[]}));
        fixture.detectChanges();
        expect(licenseConsumptionComponentTestInstance.isLicenseSummaryLoadingResults).toBeFalse();
        expect(licenseConsumptionComponentTestInstance.isLicenseSummaryRequestCompleted).toBeTrue();
        expect(licenseConsumptionComponentTestInstance.isEquipmentSummaryLoadingResults).toBeFalse();
        expect(licenseConsumptionComponentTestInstance.isEquipmentSummaryRequestCompleted).toBeTrue();
        expect(licenseConsumptionComponentTestInstance.isDetailedConsumptionSupplementalLoadingResults).toBeFalse();
        expect(licenseConsumptionComponentTestInstance.isDetailedConsumptionSupplementalRequestCompleted).toBeTrue();
        expect(licenseConsumptionComponentTestInstance.isDetailedConsumptionLoadingResults).toBeFalse();
        expect(licenseConsumptionComponentTestInstance.isDetailedConsumptionRequestCompleted).toBeTrue();
    });

    it('should make a call to get summaryData, Equipment and AggregatedData when calling fetchDataToDisplay()',()=>{
        spyOn(licenseConsumptionComponentTestInstance,"fetchSummaryData");
        spyOn(licenseConsumptionComponentTestInstance,"fetchEquipment");
        spyOn(licenseConsumptionComponentTestInstance,"fetchAggregatedData");
        licenseConsumptionComponentTestInstance.fetchDataToDisplay();
        expect(licenseConsumptionComponentTestInstance.fetchSummaryData).toHaveBeenCalled();
        expect(licenseConsumptionComponentTestInstance.fetchEquipment).toHaveBeenCalled();
        expect(licenseConsumptionComponentTestInstance.fetchAggregatedData).toHaveBeenCalled();
    });

    it('should make a call to get Projects when calling fetchProjectsList()',()=>{
        spyOn(ProjectServiceMock,'getProjectDetailsByLicense').and.callThrough();
        licenseConsumptionComponentTestInstance.currentCustomer = CurrentCustomerServiceMock.selectedCustomer;
        licenseConsumptionComponentTestInstance.selectedLicense = LicenseServiceMock.mockLicenseA;
        licenseConsumptionComponentTestInstance.fetchProjectsList();
        expect(ProjectServiceMock.getProjectDetailsByLicense).toHaveBeenCalledWith(CurrentCustomerServiceMock.selectedCustomer.subaccountId, CurrentCustomerServiceMock.selectedCustomer.licenseId);
        expect(licenseConsumptionComponentTestInstance.projects).toBe(ProjectServiceMock.projectsListValue.projects);
    });

    it('should make a call to get licenseConsumptionDetails for summary view when calling fetchSummaryData()',()=>{
        licenseConsumptionComponentTestInstance.selectedLicense = LicenseServiceMock.mockLicenseA;
        licenseConsumptionComponentTestInstance.currentCustomer = CurrentCustomerServiceMock.selectedCustomer;
        spyOn(ConsumptionServiceMock,'getLicenseConsumptionDetails').and.callThrough();
        
        licenseConsumptionComponentTestInstance.fetchSummaryData();

        expect(ConsumptionServiceMock.getLicenseConsumptionDetails).toHaveBeenCalled();
        expect(licenseConsumptionComponentTestInstance.isLicenseSummaryLoadingResults).toBeFalse();
        expect(licenseConsumptionComponentTestInstance.isLicenseSummaryRequestCompleted ).toBeTrue();
        const expectedSummary = ConsumptionServiceMock.mockSummaryInfo;
        expect(licenseConsumptionComponentTestInstance.data[0].tokensConsumed).toEqual(expectedSummary.tokensConsumed);
        expect(licenseConsumptionComponentTestInstance.data[0].devicesConnected).toEqual(expectedSummary.devicesConnected);


        licenseConsumptionComponentTestInstance.selectedLicense.tokensPurchased = expectedSummary.tokensConsumed;
        licenseConsumptionComponentTestInstance.fetchSummaryData();
        expect(licenseConsumptionComponentTestInstance.data[0].tokensAvailable).toBe(0);
    });

    
    it('should throw an error when something goes wrong getting licenseConsumptionDetails for summary view when calling fetchSummaryData()',()=>{
        licenseConsumptionComponentTestInstance.selectedLicense = LicenseServiceMock.mockLicenseA;
        licenseConsumptionComponentTestInstance.currentCustomer = CurrentCustomerServiceMock.selectedCustomer;
        const error = "some error";
        spyOn(ConsumptionServiceMock,'getLicenseConsumptionDetails').and.returnValue(throwError(error));
        spyOn(console,'error');
        
        licenseConsumptionComponentTestInstance.fetchSummaryData();

        expect(ConsumptionServiceMock.getLicenseConsumptionDetails).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith('Error fetching summary data: ', error);
        expect(licenseConsumptionComponentTestInstance.isLicenseSummaryLoadingResults).toBeFalse();
        expect(licenseConsumptionComponentTestInstance.isLicenseSummaryRequestCompleted ).toBeTrue();
    });

    it('should make a call to get licenseConsumptionDetails for equipment view when calling fetchEquipment()',()=>{
        licenseConsumptionComponentTestInstance.selectedLicense = LicenseServiceMock.mockLicenseA;
        licenseConsumptionComponentTestInstance.currentCustomer = CurrentCustomerServiceMock.selectedCustomer;
        spyOn(ConsumptionServiceMock,'getLicenseConsumptionDetails').and.callThrough();

        licenseConsumptionComponentTestInstance.fetchEquipment();

        expect(ConsumptionServiceMock.getLicenseConsumptionDetails).toHaveBeenCalled();
        expect(licenseConsumptionComponentTestInstance.isEquipmentSummaryLoadingResults).toBeFalse();
        expect(licenseConsumptionComponentTestInstance.isEquipmentSummaryRequestCompleted).toBeTrue();
        expect(licenseConsumptionComponentTestInstance.equipmentData).toEqual(ConsumptionServiceMock.mockEquipmentInfo.equipmentSummary);
    });

    it('should make a call to get licenseConsumptionDetails for equipment view when calling fetchEquipment()',()=>{
        licenseConsumptionComponentTestInstance.selectedLicense = LicenseServiceMock.mockLicenseA;
        licenseConsumptionComponentTestInstance.currentCustomer = CurrentCustomerServiceMock.selectedCustomer;
        const error = "some error";
        spyOn(ConsumptionServiceMock,'getLicenseConsumptionDetails').and.returnValue(throwError(error));
        spyOn(console,'error');
        
        licenseConsumptionComponentTestInstance.fetchEquipment();
        expect(ConsumptionServiceMock.getLicenseConsumptionDetails).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith('Error fetching equipment data: ', error);
        expect(licenseConsumptionComponentTestInstance.isEquipmentSummaryLoadingResults).toBeFalse();
        expect(licenseConsumptionComponentTestInstance.isEquipmentSummaryRequestCompleted ).toBeTrue();
    });

    it('should make a call to get licenseConsumptionDetails when calling fetchAggregatedData()',()=>{
        licenseConsumptionComponentTestInstance.selectedLicense = LicenseServiceMock.mockLicenseA;
        licenseConsumptionComponentTestInstance.currentCustomer = CurrentCustomerServiceMock.selectedCustomer;
        licenseConsumptionComponentTestInstance.setMonthAndYear(moment("2022-08-02"));
        spyOn(ConsumptionServiceMock,'getLicenseConsumptionDetails').and.callThrough();

        licenseConsumptionComponentTestInstance.fetchAggregatedData();

        expect(ConsumptionServiceMock.getLicenseConsumptionDetails).toHaveBeenCalled();
        expect(licenseConsumptionComponentTestInstance.isDetailedConsumptionSupplementalLoadingResults).toBeFalse();
        expect(licenseConsumptionComponentTestInstance.isDetailedConsumptionSupplementalRequestCompleted).toBeTrue();
        expect(licenseConsumptionComponentTestInstance.isDetailedConsumptionLoadingResults).toBeFalse();
        expect(licenseConsumptionComponentTestInstance.isDetailedConsumptionRequestCompleted).toBeTrue();
        expect(licenseConsumptionComponentTestInstance.detailedConsumptionData.length).toBe(ConsumptionServiceMock.mockDetailedInfo.usage.length);
        expect(licenseConsumptionComponentTestInstance.detailedConsumptionDataLength).toBe(ConsumptionServiceMock.mockDetailedInfo.usageTotalCount);
        expect(licenseConsumptionComponentTestInstance.weeklyConsumptionData).toEqual(jasmine.arrayContaining(ConsumptionServiceMock.mockDetailedInfo.weeklyConsumption));
        expect(licenseConsumptionComponentTestInstance.projectConsumptionData).toEqual(ConsumptionServiceMock.mockDetailedInfo.projectConsumption);
        const automationPlatformTokens = ConsumptionServiceMock.mockDetailedInfo.tokenConsumption.AutomationPlatform;
        const configurationTokens = ConsumptionServiceMock.mockDetailedInfo.tokenConsumption.Configuration;
        const expectedConsumptionDetail = {
            AutomationPlatformTokensConsumed: automationPlatformTokens,
            ConfigurationTokensConsumed: configurationTokens,
            tokensConsumed: automationPlatformTokens+configurationTokens
          };
        expect(licenseConsumptionComponentTestInstance.tokenConsumptionData).toEqual([expectedConsumptionDetail]);
    });

    it('should make a call to get licenseConsumptionDetails when calling fetchAggregatedData() - Case: (selectedType: Configuration, tokenConsumption variables null',()=>{
        licenseConsumptionComponentTestInstance.selectedLicense = LicenseServiceMock.mockLicenseA;
        licenseConsumptionComponentTestInstance.currentCustomer = CurrentCustomerServiceMock.selectedCustomer;
        licenseConsumptionComponentTestInstance.selectedType = 'Configuration';
        spyOn(ConsumptionServiceMock,'getLicenseConsumptionDetails').and.returnValue(of(ConsumptionServiceMock.mockDetailedInfoNoTokenConsumption));

        licenseConsumptionComponentTestInstance.fetchAggregatedData();

        expect(ConsumptionServiceMock.getLicenseConsumptionDetails).toHaveBeenCalled();

        const expectedConsumptionDetail = {
            AutomationPlatformTokensConsumed: null,
            ConfigurationTokensConsumed: 0,
            tokensConsumed: 0
          };
        expect(licenseConsumptionComponentTestInstance.tokenConsumptionData).toEqual([expectedConsumptionDetail]);
    });

    it('should throw an error if getting licenseConsumptionDetails failed when calling fetchAggregatedData()',()=>{
        licenseConsumptionComponentTestInstance.selectedLicense = LicenseServiceMock.mockLicenseA;
        licenseConsumptionComponentTestInstance.currentCustomer = CurrentCustomerServiceMock.selectedCustomer;
        const error = "some error";
        spyOn(ConsumptionServiceMock,'getLicenseConsumptionDetails').and.returnValue(throwError(error));
        spyOn(console,'error');
        
        licenseConsumptionComponentTestInstance.fetchAggregatedData();

        expect(ConsumptionServiceMock.getLicenseConsumptionDetails).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith('Error fetching detailed license consumption data: ', error);
        expect(licenseConsumptionComponentTestInstance.isDetailedConsumptionSupplementalLoadingResults).toBeFalse();
        expect(licenseConsumptionComponentTestInstance.isDetailedConsumptionSupplementalRequestCompleted).toBeTrue();
        expect(licenseConsumptionComponentTestInstance.isDetailedConsumptionLoadingResults).toBeFalse();
        expect(licenseConsumptionComponentTestInstance.isDetailedConsumptionRequestCompleted).toBeTrue();
    });

    it('should make a call to get licenseConsumptionDetails when calling onPageChange()',()=>{
        licenseConsumptionComponentTestInstance.selectedLicense = LicenseServiceMock.mockLicenseA;
        licenseConsumptionComponentTestInstance.currentCustomer = CurrentCustomerServiceMock.selectedCustomer;
        spyOn(ConsumptionServiceMock,'getLicenseConsumptionDetails').and.callThrough();
        const event = { pageIndex:0, pageSize:10 };
        
        licenseConsumptionComponentTestInstance.onPageChange(event);

        expect(ConsumptionServiceMock.getLicenseConsumptionDetails).toHaveBeenCalled();
        expect(licenseConsumptionComponentTestInstance.detailedConsumptionData.length).toBe(ConsumptionServiceMock.mockDetailedInfo.usage.length);
        expect(licenseConsumptionComponentTestInstance.detailedConsumptionDataLength).toBe(ConsumptionServiceMock.mockDetailedInfo.usageTotalCount);
        expect(licenseConsumptionComponentTestInstance.isDetailedConsumptionLoadingResults).toBeFalse();
        expect(licenseConsumptionComponentTestInstance.isDetailedConsumptionRequestCompleted).toBeTrue();
    });

    
    it('should throw an error if getting licenseConsumptionDetails failed when calling onPageChange()',()=>{
        licenseConsumptionComponentTestInstance.selectedLicense = LicenseServiceMock.mockLicenseA;
        licenseConsumptionComponentTestInstance.currentCustomer = CurrentCustomerServiceMock.selectedCustomer;
        const err = "some error";
        spyOn(ConsumptionServiceMock,'getLicenseConsumptionDetails').and.returnValue(throwError(err));
        spyOn(console,'error');
        const event = { pageIndex:0, pageSize:10 };

        licenseConsumptionComponentTestInstance.onPageChange(event);

        expect(ConsumptionServiceMock.getLicenseConsumptionDetails).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith('Error fetching detailed license consumption data: ', err);
        expect(licenseConsumptionComponentTestInstance.isDetailedConsumptionLoadingResults).toBeFalse();
        expect(licenseConsumptionComponentTestInstance.isDetailedConsumptionRequestCompleted).toBeTrue();
    });

    it('should make a call to get licenseConsumptionDetails with default queries when calling fetchDetailedConsumptionData() without arguments',()=>{
        licenseConsumptionComponentTestInstance.selectedLicense = LicenseServiceMock.mockLicenseA;
        licenseConsumptionComponentTestInstance.currentCustomer = CurrentCustomerServiceMock.selectedCustomer;
        spyOn(ConsumptionServiceMock,'getLicenseConsumptionDetails').and.callThrough();
        
        licenseConsumptionComponentTestInstance.fetchDetailedConsumptionData();

        expect(ConsumptionServiceMock.getLicenseConsumptionDetails).toHaveBeenCalled();
        expect(licenseConsumptionComponentTestInstance.detailedConsumptionData.length).toBe(ConsumptionServiceMock.mockDetailedInfo.usage.length);
        expect(licenseConsumptionComponentTestInstance.detailedConsumptionDataLength).toBe(ConsumptionServiceMock.mockDetailedInfo.usageTotalCount);
        expect(licenseConsumptionComponentTestInstance.isDetailedConsumptionLoadingResults).toBeFalse();
        expect(licenseConsumptionComponentTestInstance.isDetailedConsumptionRequestCompleted).toBeTrue();
    });

    it('should call to fetchAggregatedData when calling setWeek()',()=>{
        licenseConsumptionComponentTestInstance.currentCustomer = CurrentCustomerServiceMock.selectedCustomer;
        licenseConsumptionComponentTestInstance.selectedLicense = LicenseServiceMock.mockLicenseA;
        spyOn(licenseConsumptionComponentTestInstance,'fetchAggregatedData').and.callThrough();
        spyOn(licenseConsumptionComponentTestInstance,'resetCalendar');
        const date = moment.utc();
        licenseConsumptionComponentTestInstance.range.setValue({
            start:date,
            end:date
        });
        licenseConsumptionComponentTestInstance.aggregation = 'week';
        licenseConsumptionComponentTestInstance.setWeek();

        licenseConsumptionComponentTestInstance.aggregation = 'period';
        licenseConsumptionComponentTestInstance.setWeek();

        expect(licenseConsumptionComponentTestInstance.resetCalendar).toHaveBeenCalledTimes(1);
        expect(licenseConsumptionComponentTestInstance.fetchAggregatedData).toHaveBeenCalledTimes(1);
    });
});

describe('Dialog calls and interactions', () => {
    beforeEach(beforeEachFunction);
    it('should openDialog with expected data for given arguments after calling onChangeToggle()', () =>{
        spyOn(licenseConsumptionComponentTestInstance, 'openDialog');
        fixture.detectChanges();
        const event = {source:undefined,value:"add-new-license"};
        
        licenseConsumptionComponentTestInstance.onChangeToggle(event);
        expect(licenseConsumptionComponentTestInstance.openDialog).toHaveBeenCalledWith(AddLicenseComponent);

        event.value = "add-license-consumption";
        licenseConsumptionComponentTestInstance.onChangeToggle(event);
        expect(licenseConsumptionComponentTestInstance.openDialog).toHaveBeenCalledWith(AddLicenseConsumptionComponent,licenseConsumptionComponentTestInstance.selectedLicense);
    });

    it('sould openDialog with add-license-consumption component after calling cloneConsumptions()',()=>{
        spyOn(licenseConsumptionComponentTestInstance, 'openDialog');
        fixture.detectChanges();
        licenseConsumptionComponentTestInstance.cloneConsumptions();
        const selectedLicense = licenseConsumptionComponentTestInstance.selectedLicense;
        const  detailsConsumptionTable = licenseConsumptionComponentTestInstance.detailsConsumptionTable;
        expect(licenseConsumptionComponentTestInstance.openDialog).toHaveBeenCalledWith(AddLicenseConsumptionComponent,{...selectedLicense, selectedConsumptions: detailsConsumptionTable.selection.selected});
    });

    it('should execute licConsumptionRowAction() with expected data given set arguments', () => {
        licenseConsumptionComponentTestInstance.currentCustomer = CurrentCustomerServiceMock.selectedCustomer;
        licenseConsumptionComponentTestInstance.selectedLicense = LicenseServiceMock.mockLicenseA;
        const selectedTestData = { selectedRow: ConsumptionServiceMock.mockConsumptionA, selectedOption: 'selectedTestOption', selectedIndex: '0' };
        const renewalDate = licenseConsumptionComponentTestInstance.selectedLicense.renewalDate;
        spyOn(licenseConsumptionComponentTestInstance,'openDialog').and.callThrough();
        spyOn(licenseConsumptionComponentTestInstance,'fetchDataToDisplay');
        spyOn(licenseConsumptionComponentTestInstance,'onDelete');

        selectedTestData.selectedOption = licenseConsumptionComponentTestInstance.EDIT;
        licenseConsumptionComponentTestInstance.licConsumptionRowAction(selectedTestData);
        let dataObject: any = { ...selectedTestData.selectedRow, ...{ endLicensePeriod: renewalDate } };
        expect(licenseConsumptionComponentTestInstance.openDialog).toHaveBeenCalledWith(ModifyLicenseConsumptionDetailsComponent,dataObject);

        selectedTestData.selectedRow = ConsumptionServiceMock.mockConsumptionD;
        licenseConsumptionComponentTestInstance.licConsumptionRowAction(selectedTestData);
        dataObject = { ...selectedTestData.selectedRow, ...{ endLicensePeriod: renewalDate } };
        expect(licenseConsumptionComponentTestInstance.openDialog).toHaveBeenCalledWith(StaticConsumptionDetailsComponent,dataObject);

        selectedTestData.selectedOption = licenseConsumptionComponentTestInstance.DELETE;
        licenseConsumptionComponentTestInstance.licConsumptionRowAction(selectedTestData);
        expect(licenseConsumptionComponentTestInstance.onDelete).toHaveBeenCalledWith(selectedTestData.selectedRow);
        
        expect(licenseConsumptionComponentTestInstance.fetchDataToDisplay).toHaveBeenCalledTimes(2);
    });
    it('should delete a consumptionDetail after confirmDialog when calling onDelete()',()=>{
        dialogService.expectedValue = true;
        const consumption = ConsumptionServiceMock.mockConsumptionA;
        spyOn(ConsumptionServiceMock,'deleteLicenseConsumptionDetails').and.callThrough();
        spyOn(licenseConsumptionComponentTestInstance,'fetchDataToDisplay');
        
        licenseConsumptionComponentTestInstance.onDelete(consumption);

        expect(ConsumptionServiceMock.deleteLicenseConsumptionDetails).toHaveBeenCalledWith(consumption.id);
        expect(licenseConsumptionComponentTestInstance.fetchDataToDisplay).toHaveBeenCalled();
    });
});

describe('Methods Calls', ()=>{
    beforeEach(beforeEachFunction);

    it('sould toggle the variable detailedConsumptionTableSelectable when calling toggleSelectableConsumptions()',()=>{
        licenseConsumptionComponentTestInstance.detailedConsumptionTableSelectable = false;
        licenseConsumptionComponentTestInstance.toggleSelectableConsumptions();
        expect(licenseConsumptionComponentTestInstance.detailedConsumptionTableSelectable).toBeTrue();
    });

    it('should change the selected license, reset period filters and make a call to fetchDataToDisplay() when calling onChangeLicense()',()=>{
        fixture.detectChanges();
        const expectedLicense = LicenseServiceMock.mockLicenseL;
        spyOn(licenseConsumptionComponentTestInstance,'resetPeriodFilter');
        spyOn(licenseConsumptionComponentTestInstance,'fetchDataToDisplay');

        licenseConsumptionComponentTestInstance.onChangeLicense(expectedLicense.id);

        expect(licenseConsumptionComponentTestInstance.selectedLicense).toBe(expectedLicense);
        expect(licenseConsumptionComponentTestInstance.resetPeriodFilter).toHaveBeenCalled();
        expect(licenseConsumptionComponentTestInstance.fetchDataToDisplay).toHaveBeenCalled();
    });

    it('should set the variable aggregation (used to filter data based on a given period of time) when calling getMultipleChoiceAnswer()',()=>{
        licenseConsumptionComponentTestInstance.currentCustomer = CurrentCustomerServiceMock.selectedCustomer;
        licenseConsumptionComponentTestInstance.selectedLicense = LicenseServiceMock.mockLicenseA;
        spyOn(licenseConsumptionComponentTestInstance,'fetchAggregatedData').and.callThrough();
        spyOn(licenseConsumptionComponentTestInstance,'resetCalendar');
        
        licenseConsumptionComponentTestInstance.getMultipleChoiceAnswer('period');
        expect(licenseConsumptionComponentTestInstance.aggregation).toBe('period');
        expect(licenseConsumptionComponentTestInstance.range.disabled).toBeTrue();

        licenseConsumptionComponentTestInstance.getMultipleChoiceAnswer('week');
        expect(licenseConsumptionComponentTestInstance.aggregation).toBe('week');
        expect(licenseConsumptionComponentTestInstance.range.disabled).toBeFalse();

        licenseConsumptionComponentTestInstance.getMultipleChoiceAnswer('month');
        expect(licenseConsumptionComponentTestInstance.aggregation).toBe('month');
        expect(licenseConsumptionComponentTestInstance.range.disabled).toBeFalse();

        expect(licenseConsumptionComponentTestInstance.resetCalendar).toHaveBeenCalledTimes(3);
        expect(licenseConsumptionComponentTestInstance.fetchAggregatedData).toHaveBeenCalledTimes(1);
    });


    it('should display a different text according to the aggregation variable when calling getDatePickerLabel()',()=>{
        licenseConsumptionComponentTestInstance.aggregation = 'period';
        expect(licenseConsumptionComponentTestInstance.getDatePickerLabel()).toBe('Choose a date');
        
        licenseConsumptionComponentTestInstance.aggregation = 'month';
        expect(licenseConsumptionComponentTestInstance.getDatePickerLabel()).toBe('Choose Month and Year');

        licenseConsumptionComponentTestInstance.aggregation = 'week';
        expect(licenseConsumptionComponentTestInstance.getDatePickerLabel()).toBe('Choose a week');
    });

    it('should call to fetchAggregatedData when calling setMonthAndYear()',async()=>{
        licenseConsumptionComponentTestInstance.currentCustomer = CurrentCustomerServiceMock.selectedCustomer;
        licenseConsumptionComponentTestInstance.selectedLicense = LicenseServiceMock.mockLicenseA;
        spyOn(licenseConsumptionComponentTestInstance,'fetchAggregatedData').and.callThrough();
        spyOn(licenseConsumptionComponentTestInstance,'setMonthAndYear').and.callThrough();
        const debugElement = fixture.debugElement.query(By.directive(MatDateRangePicker));
        const dateRangePicker: MatDateRangePicker<any> = debugElement.componentInstance;
        licenseConsumptionComponentTestInstance.aggregation = 'month';
        const date = moment(new Date());
        licenseConsumptionComponentTestInstance.range.setValue({start:date,end:date});
        
        licenseConsumptionComponentTestInstance.setMonthAndYear(date,dateRangePicker);

        expect(licenseConsumptionComponentTestInstance.setMonthAndYear).toHaveBeenCalled();
        expect(licenseConsumptionComponentTestInstance.fetchAggregatedData).toHaveBeenCalled();
    });

    it('should set the range variables to match the startDate and endDate variables if the selected period is greater than the license period when calling setMonthAndYear()',()=>{
        fixture.detectChanges();
        const date = moment(new Date());
        licenseConsumptionComponentTestInstance.startDate = moment(date).add(1,'days');
        licenseConsumptionComponentTestInstance.endDate = moment(date).subtract(1,'days');
        const debugElement = fixture.debugElement.query(By.directive(MatDateRangePicker));
        const dateRangePicker: MatDateRangePicker<any> = debugElement.componentInstance;
        licenseConsumptionComponentTestInstance.setMonthAndYear(date, dateRangePicker);
        expect(licenseConsumptionComponentTestInstance.range.get('start').value).toEqual(licenseConsumptionComponentTestInstance.startDate);
        expect(licenseConsumptionComponentTestInstance.range.get('end').value).toEqual(licenseConsumptionComponentTestInstance.endDate);
    });

    it('should change the selected project and make a call to fetchAggregatedData when calling getProject()',()=>{
        licenseConsumptionComponentTestInstance.currentCustomer = CurrentCustomerServiceMock.selectedCustomer;
        licenseConsumptionComponentTestInstance.selectedLicense = LicenseServiceMock.mockLicenseA;
        spyOn(licenseConsumptionComponentTestInstance,'fetchAggregatedData').and.callThrough();
        const projectId = ProjectServiceMock.projectsListValue.projects[0].id;
        licenseConsumptionComponentTestInstance.getProject(projectId);

        expect(licenseConsumptionComponentTestInstance.selectedProject).toBe(projectId);
        expect(licenseConsumptionComponentTestInstance.fetchAggregatedData).toHaveBeenCalled();
    });

    it('should change the selected type and make a call to fetchAggregatedData when calling getType()',()=>{
        licenseConsumptionComponentTestInstance.currentCustomer = CurrentCustomerServiceMock.selectedCustomer;
        licenseConsumptionComponentTestInstance.selectedLicense = LicenseServiceMock.mockLicenseA;
        spyOn(licenseConsumptionComponentTestInstance,'fetchAggregatedData').and.callThrough();
        const type = 'AutomationPlatform';
        licenseConsumptionComponentTestInstance.getType(type);

        expect(licenseConsumptionComponentTestInstance.selectedType).toBe(type);
        expect(licenseConsumptionComponentTestInstance.fetchAggregatedData).toHaveBeenCalled();
    });

    it('should reset month, year and range values when calling resetCalendar()',()=>{
        const date = moment(new Date());
        licenseConsumptionComponentTestInstance.range.setValue({start:date,end:date});
        
        licenseConsumptionComponentTestInstance.resetCalendar();

        expect(licenseConsumptionComponentTestInstance.range.get('start').value).toBeNull();
        expect(licenseConsumptionComponentTestInstance.range.get('end').value).toBeNull();
    });

    it('should change aggregation variable and make a reset calendar when calling resetPeriodFilter()',()=>{
        spyOn(licenseConsumptionComponentTestInstance,'resetCalendar');
        licenseConsumptionComponentTestInstance.aggregation="week";
        licenseConsumptionComponentTestInstance.range.enable();
        
        licenseConsumptionComponentTestInstance.resetPeriodFilter();

        expect(licenseConsumptionComponentTestInstance.aggregation).toBe('period');
        expect(licenseConsumptionComponentTestInstance.range.disabled).toBeTrue();
        expect(licenseConsumptionComponentTestInstance.resetCalendar).toHaveBeenCalled();
    });

    it('should sort the given array after calling sortData() according to the set arguments',()=>{
        const sort: Sort  = {active:'name', direction:'asc'};
        const unsortedArray = [{name:"c"},{name:"a"},{name:"b"}];
        let sortedArray = [{name:"a"},{name:"b"},{name:"c"}];

        licenseConsumptionComponentTestInstance.sortData(sort,unsortedArray);
        expect(unsortedArray).toEqual(sortedArray);

        sort.direction = 'desc';
        sortedArray = [{name:"c"},{name:"b"},{name:"a"}];
        licenseConsumptionComponentTestInstance.sortData(sort,unsortedArray);
        expect(unsortedArray).toEqual(sortedArray);

        sort.direction = '';
        licenseConsumptionComponentTestInstance.sortData(sort,unsortedArray);
        expect(unsortedArray).toEqual(sortedArray);
    });
})

describe('Weekly Table',()=>{

    beforeEach(beforeEachFunction);

    it('should display weeks until the current week when the license renewal date is after',()=>{
        licenseConsumptionComponentTestInstance.currentCustomer = CurrentCustomerServiceMock.selectedCustomer;
        licenseConsumptionComponentTestInstance.selectedLicense = JSON.parse(JSON.stringify(LicenseServiceMock.mockLicenseA));
        let currentDate = moment.utc().add(1,'days');
        licenseConsumptionComponentTestInstance.selectedLicense.renewalDate = currentDate.toISOString().split('T')[0];

        licenseConsumptionComponentTestInstance.fetchAggregatedData();

        const weekStart = moment.utc();
        weekStart.subtract(weekStart.day(), "days")
        const weekEnd = moment.utc(weekStart).add(6, 'days');
        expect(licenseConsumptionComponentTestInstance.weeklyConsumptionData[0].weekId).toBe("Week " + moment.utc(weekStart).add(1, 'days').isoWeek() + " (" + weekStart.format("YYYY-MM-DD") + " - " + weekEnd.format("YYYY-MM-DD") + ")");

    });

    it('should display weeks until the last week of the license period when the license renewal date is before the current week',()=>{
        licenseConsumptionComponentTestInstance.currentCustomer = CurrentCustomerServiceMock.selectedCustomer;
        licenseConsumptionComponentTestInstance.selectedLicense = JSON.parse(JSON.stringify(LicenseServiceMock.mockLicenseA));
        let currentDate = moment.utc().subtract(1,'days');
        const renewalDate = currentDate.toISOString().split('T')[0]
        licenseConsumptionComponentTestInstance.selectedLicense.renewalDate = renewalDate;

        licenseConsumptionComponentTestInstance.fetchAggregatedData();

        const weekStart = moment.utc(renewalDate);
        weekStart.subtract(weekStart.day(), "days")
        const weekEnd = moment.utc(weekStart).add(6, 'days');
        expect(licenseConsumptionComponentTestInstance.weeklyConsumptionData[0].weekId).toBe("Week " + moment.utc(weekStart).add(1, 'days').isoWeek() + " (" + weekStart.format("YYYY-MM-DD") + " - " + weekEnd.format("YYYY-MM-DD") + ")");

    });

});

describe('openDialog',()=>{

    beforeEach(() => {
        TestBed.configureTestingModule(TestBedParams);
        TestBed.overrideProvider(MatDialog,{useValue: CustomMatDialogMock});
        fixture = TestBed.createComponent(LicenseConsumptionComponent);
        licenseConsumptionComponentTestInstance = fixture.componentInstance;
    });

    it('should update Projects List when a updateProjects event occurs',fakeAsync( () => {
        spyOn(licenseConsumptionComponentTestInstance,'resetPeriodFilter');
        spyOn(licenseConsumptionComponentTestInstance,'ngOnInit');
        spyOn(licenseConsumptionComponentTestInstance,'fetchProjectsList');
      
        licenseConsumptionComponentTestInstance.openDialog(AddLicenseConsumptionComponent);
        updateProjectsEvent.emit();
        tick(200);
        
        expect(licenseConsumptionComponentTestInstance.resetPeriodFilter).toHaveBeenCalled();
        expect(licenseConsumptionComponentTestInstance.ngOnInit).toHaveBeenCalled();
        expect(licenseConsumptionComponentTestInstance.fetchProjectsList).toHaveBeenCalled();
    }));
});

describe('navigate', () => {
    beforeEach(beforeEachFunction);
    it('should navigate to dashboard after calling goToDashboard()', () => {
        spyOn(RouterMock, 'navigate');
        licenseConsumptionComponentTestInstance.goToDashboard();
        expect(RouterMock.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
});
