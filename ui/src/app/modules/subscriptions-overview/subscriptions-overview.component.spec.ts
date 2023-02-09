import { ComponentFixture, TestBed } from "@angular/core/testing";
import { DataTableComponent } from "../../generics/data-table/data-table.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { SharedModule } from "../shared/shared.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { MatDialogMock } from "../../../test/mock/components/mat-dialog.mock";
import { SnackBarService } from "../../services/snack-bar.service";
import { SnackBarServiceMock } from "../../../test/mock/services/snack-bar-service.mock";
import { CustomerService } from "../../services/customer.service";
import { CustomerServiceMock } from "../../../test/mock/services/customer-service.mock";
import { MsalService } from "@azure/msal-angular";
import { MsalServiceMock } from "../../../test/mock/services/msal-service.mock";
import { HttpClient } from "@angular/common/http";
import { SubscriptionsOverviewComponent } from "./subscriptions-overview.component";
import { SubscriptionsOverviewService } from "../../services/subscriptions-overview.service";
import { SubscriptionsOverviewServiceMock } from "../../../test/mock/services/subscriptions-overview.service.mock";
import { Sort } from "@angular/material/sort";
import { throwError } from "rxjs";
import moment from "moment";

let testInstance: SubscriptionsOverviewComponent;
let fixture: ComponentFixture<SubscriptionsOverviewComponent>;

const RouterMock = {
    navigate: (commands: string[], queryParams:any) => { return }
};

const beforeEachFunction = async () => {
    TestBed.configureTestingModule({
        declarations: [SubscriptionsOverviewComponent, DataTableComponent],
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
                provide: SubscriptionsOverviewService,
                useValue: SubscriptionsOverviewServiceMock
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
        fixture = TestBed.createComponent(SubscriptionsOverviewComponent);
        testInstance = fixture.componentInstance;
        testInstance.ngOnInit();
    });
};

describe('Subscriptions Overview - UI verification tests', () => {
    beforeEach(beforeEachFunction);
    it('should display essential UI and components', () => {
        fixture.detectChanges();
        const h1 = fixture.nativeElement.querySelector('#page-title');
        testInstance.sizeChange();
        expect(h1.textContent).toBe('Subscriptions Overview');
    });

    it('should load correct data columns for the subscriptions table', () => {
        fixture.detectChanges();
        const customerColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[0];
        const subAccountColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[1];
        const subscriptionColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[2];
        const statusColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[3];
        const subscriptionTypeColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[4];
        const startDateColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[5];
        const renewalDateColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[6];
        const tokensPurchasedColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[7];
        const tokensConsumedColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[8];

        expect(customerColumn.innerText).toBe('Customer');
        expect(subAccountColumn.innerText).toBe('Subaccount');
        expect(subscriptionColumn.innerText).toBe('Subscription');
        expect(statusColumn.innerText).toBe('Status');
        expect(subscriptionTypeColumn.innerText).toBe('Subscription Type');
        expect(startDateColumn.innerText).toBe('Start Date');
        expect(renewalDateColumn.innerText).toBe('Renewal Date');
        expect(tokensPurchasedColumn.innerText).toBe('Tokens Purchased');
        expect(tokensConsumedColumn.innerText).toBe('Tokens Consumed');
    });

    it('should call sortData and sort the data', () => {
        const sort: Sort = { active: 'customerName', direction: 'desc' };
        fixture.detectChanges();
        spyOn(testInstance, 'sortData').and.callThrough();

        testInstance.sortData(sort);
        expect(testInstance.sortData).toHaveBeenCalledWith(sort);
        expect(testInstance.filteredSubscriptions).toEqual([ {
            licenseTokens: 0,
            customerId: 'b062d227-5b26-4343-930a-9f3693d47c8a',
            licenseTokensConsumed: 0,
            customerName: 'Test Customer 4',
        }, {
            subaccountId: '966b6161-e28d-497b-8244-e3880b142584',
            licenseTokens: 0,
            customerId: 'b062d227-5b26-4343-920a-9f3693d47c8a',
            subaccountName: 'Test Sub 3',
            licenseTokensConsumed: 0,
            customerName: 'Test Customer 3',
            licenseStatus: 'Inactive'
        }, {
            subaccountId: '31d81e5c-a916-470b-aabe-6860f8464211',
            licenseRenewalDate: '2022-07-26',
            licenseTokens: 500,
            licenseDescription: 'License description',
            licenseStatus: 'Expired',
            licenseStartDate: '2022-07-10',
            customerId: '467aee0e-0cc8-4822-9789-fc90acea0a04',
            licensePackageType: 'Large',
            subaccountName: 'Test Sub 2',
            licenseId: '31b92e5c-b811-460b-ccbe-6860f8464233',
            licenseTokensConsumed: 0,
            customerName: 'Test Customer 2'
        }, {
            subaccountId: '6fe7d952-13cd-4b5d-90bd-6dce6c2ed475',
            licenseRenewalDate: '2023-02-02',
            licenseTokens: 150,
            licenseDescription: 'test',
            licenseStatus: 'Active',
            licenseStartDate: '2022-10-10',
            customerId: '0ec98484-2215-ea11-a811-000d3a31cd00',
            licensePackageType: 'Small',
            subaccountName: 'Test Sub',
            licenseId: '71dd76db-615f-4173-83cf-a12603c560de',
            licenseTokensConsumed: 0,
            customerName: 'Test Customer'
        } ]);

        sort.direction = 'asc';
        testInstance.sortData(sort);
        expect(testInstance.sortData).toHaveBeenCalledWith(sort);
        expect(testInstance.filteredSubscriptions).toEqual([ {
            subaccountId: '6fe7d952-13cd-4b5d-90bd-6dce6c2ed475',
            licenseRenewalDate: '2023-02-02',
            licenseTokens: 150,
            licenseDescription: 'test',
            licenseStatus: 'Active',
            licenseStartDate: '2022-10-10',
            customerId: '0ec98484-2215-ea11-a811-000d3a31cd00',
            licensePackageType: 'Small',
            subaccountName: 'Test Sub',
            licenseId: '71dd76db-615f-4173-83cf-a12603c560de',
            licenseTokensConsumed: 0,
            customerName: 'Test Customer'
        }, {
            subaccountId: '31d81e5c-a916-470b-aabe-6860f8464211',
            licenseRenewalDate: '2022-07-26',
            licenseTokens: 500,
            licenseDescription: 'License description',
            licenseStatus: 'Expired',
            licenseStartDate: '2022-07-10',
            customerId: '467aee0e-0cc8-4822-9789-fc90acea0a04',
            licensePackageType: 'Large',
            subaccountName: 'Test Sub 2',
            licenseId: '31b92e5c-b811-460b-ccbe-6860f8464233',
            licenseTokensConsumed: 0,
            customerName: 'Test Customer 2'
        }, {
            subaccountId: '966b6161-e28d-497b-8244-e3880b142584',
            licenseTokens: 0,
            customerId: 'b062d227-5b26-4343-920a-9f3693d47c8a',
            subaccountName: 'Test Sub 3',
            licenseTokensConsumed: 0,
            customerName: 'Test Customer 3',
            licenseStatus: 'Inactive'
        }, {
            licenseTokens: 0,
            customerId: 'b062d227-5b26-4343-930a-9f3693d47c8a',
            licenseTokensConsumed: 0,
            customerName: 'Test Customer 4',
        } ]);
    });
});

describe('Subscriptions Overview - Data collection and parsing tests', () => {
    beforeEach(beforeEachFunction);
    it('should make a call to get subscriptions list', () => {
        spyOn(CustomerServiceMock, 'getCustomerList').and.callThrough();
        spyOn(SubscriptionsOverviewServiceMock, 'getSubscriptionsList').and.callThrough();
        fixture.detectChanges();
        expect(testInstance.isLoadingResults).toBeFalse();
        expect(testInstance.isRequestCompleted).toBeTrue();
        expect(SubscriptionsOverviewServiceMock.getSubscriptionsList).toHaveBeenCalled();
    });

    it('should make a call to get subscriptions list and show error if needed', () => {
        spyOn(SubscriptionsOverviewServiceMock, 'getSubscriptionsList').and.returnValue(throwError('Test error'));
        spyOn(console, 'error').and.callThrough();
        fixture.detectChanges();
        expect(testInstance.isLoadingResults).toBeFalse();
        expect(testInstance.isRequestCompleted).toBeTrue();
        expect(SubscriptionsOverviewServiceMock.getSubscriptionsList).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith('Error while retrieving subscriptions: ', 'Test error');
    });
});

describe('Subscriptions Overview - Routing events', () => {
    beforeEach(beforeEachFunction);
    it('should navigate to customer licenses after calling openLicenseDetails()', () => {
        spyOn(CustomerServiceMock, 'setSelectedCustomer');
        spyOn(RouterMock, 'navigate');
        testInstance.openLicenseDetails({});
        expect(RouterMock.navigate).toHaveBeenCalledWith([ '/customer/licenses' ], {queryParams:{subaccountId:undefined}});
    });

    it('should navigate to license consumption after calling openLicenseConsumption()', () => {
        spyOn(CustomerServiceMock, 'setSelectedCustomer');
        spyOn(RouterMock, 'navigate');
        fixture.detectChanges();
        testInstance.openLicenseConsumption({});
        expect(RouterMock.navigate).toHaveBeenCalledWith([ '/customer/consumption' ],{queryParams:{subaccountId:undefined}});
    });
});

describe('Subscriptions Overview - Row actions', () => {
    beforeEach(beforeEachFunction);
    // it('should make a call to openLicenseDetails or snackBarService if the selected option is VIEW_LICENSES', () => {
    //     const selectedTestData = {
    //         selectedRow: {
    //             testProperty: 'testData',
    //             subaccountId: undefined,
    //             id: '821f079f-be9f-4b11-b364-4f9652c581ce'
    //         },
    //         selectedOption: 'selectedTestOption',
    //         selectedIndex: 'selectedTestItem',
    //         subaccountId: 'test-id'
    //     };
    //     spyOn(testInstance, 'openLicenseDetails');
    //     spyOn(SnackBarServiceMock, 'openSnackBar');

    //     selectedTestData.selectedOption = testInstance.VIEW_LICENSES;
    //     testInstance.rowAction(selectedTestData);
    //     expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Subaccount is missing, create one to access tekVizion360 Subscriptions view', '');

    //     selectedTestData.selectedRow.subaccountId = 'not undefined';
    //     testInstance.rowAction(selectedTestData);
    //     expect(testInstance.openLicenseDetails).toHaveBeenCalledWith(selectedTestData.selectedRow);
    // });

    // it('should make a call to openLicenseConsumption or snackBarService if the selected option is VIEW_CONSUMPTION', () => {
    //     const selectedTestData = {
    //         selectedRow: {
    //             testProperty: 'testData',
    //             subaccountId: undefined
    //         },
    //         selectedOption: 'selectedTestOption',
    //         selectedIndex: 'selectedTestItem',
    //         subaccountId: 'test-id'
    //     };
    //     spyOn(testInstance, 'openLicenseConsumption');
    //     spyOn(SnackBarServiceMock, 'openSnackBar');

    //     selectedTestData.selectedOption = testInstance.VIEW_CONSUMPTION;
    //     testInstance.rowAction(selectedTestData);
    //     expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Subaccount is missing, create one to access tekToken Consumption view', '');

    //     selectedTestData.selectedRow.subaccountId = 'not undefined';
    //     testInstance.rowAction(selectedTestData);
    //     expect(testInstance.openLicenseConsumption).toHaveBeenCalledWith(selectedTestData.selectedRow);
    // });
});

describe('Subscriptions Overview - Column actions', () => {
    beforeEach(beforeEachFunction);
    it('should make a call to openLicenseConsumption or snackBarService if the column name is "Subaccount"', () => {
        const selectedTestData: { selectedRow: any, selectedIndex: string, columnName: string } = {
            selectedRow: {
                customerId: 'testId',
                customerName: 'testName',
                subaccountName: 'testName',
                subaccountId: undefined
            },
            selectedIndex: 'testSelectedIndex',
            columnName: 'testColumnName'
        };
        spyOn(testInstance, 'openLicenseConsumption').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar');

        selectedTestData.columnName = 'Tokens Consumed';
        testInstance.columnAction(selectedTestData);
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Subaccount is missing, create one to access tekToken Consumption view', '');

        selectedTestData.selectedRow.subaccountId = 'not undefined';
        testInstance.columnAction(selectedTestData);
        expect(testInstance.openLicenseConsumption).toHaveBeenCalledWith({ id: 'testId', name: 'testName', subaccountId: 'not undefined', subaccountName: 'testName' });
    });

    it('should make a call to openLicenseDetails or snackBarService if the column name is "Subaccount"', () => {
        const selectedTestData: { selectedRow: any, selectedIndex: string, columnName: string } = {
            selectedRow: {
                id: 'testId',
                name: 'testName',
                subaccountId: undefined,
                subaccountName: 'testName',
                licenseStatus: undefined,
            },
            selectedIndex: 'testSelectedIndex',
            columnName: 'Status'
        };
        spyOn(testInstance, 'openLicenseDetails').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar');

        selectedTestData.columnName = 'Status';
        testInstance.columnAction(selectedTestData);
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Subaccount is missing, create one to access tekVizion360 Subscriptions view', '');

        selectedTestData.selectedRow.licenseStatus = 'not undefined';
        testInstance.columnAction(selectedTestData);
        expect(testInstance.openLicenseDetails).toHaveBeenCalledWith({ id: undefined, name: undefined, subaccountId: undefined, subaccountName: 'testName' });
    });
});

describe('Subscriptions Overview - Filtering table rows', () => {
    beforeEach(beforeEachFunction);
    it('should filter the rows in the table based on the name and status filters', async () => {
        testInstance.filterForm.patchValue({ customerFilterControl: "Test Customer", subStatusFilterControl: "Active" });
        fixture.detectChanges();
        await fixture.whenStable();
        expect(testInstance.filteredSubscriptions.length).toBe(1);
        const objectToCompare: any = {
                "subaccountId": "6fe7d952-13cd-4b5d-90bd-6dce6c2ed475",
                "licenseRenewalDate": "2023-02-02",
                "licenseTokens": 150,
                "licenseDescription": "test",
                "licenseStatus": "Active",
                "licenseStartDate": "2022-10-10",
                "customerId": "0ec98484-2215-ea11-a811-000d3a31cd00",
                "licensePackageType": "Small",
                "subaccountName": "Test Sub",
                "licenseId": "71dd76db-615f-4173-83cf-a12603c560de",
                "licenseTokensConsumed": 0,
                "customerName": "Test Customer"
        };
        expect(testInstance.filteredSubscriptions[0]).toEqual(objectToCompare);
    });

    it('should filter the rows in the table based on the name', async () => {
        testInstance.filterForm.patchValue({ customerFilterControl: "Test Sub 3"});
        fixture.detectChanges();
        await fixture.whenStable();
        expect(testInstance.filteredSubscriptions.length).toBe(1);
        const objectToCompare: any = {
                "subaccountId": "966b6161-e28d-497b-8244-e3880b142584",
                "licenseTokens": 0,
                "customerId": "b062d227-5b26-4343-920a-9f3693d47c8a",
                "subaccountName": "Test Sub 3",
                "licenseTokensConsumed": 0,
                "customerName": "Test Customer 3",
                "licenseStatus": 'Inactive'
        };
        expect(testInstance.filteredSubscriptions[0]).toEqual(objectToCompare);
    });

    it('should filter the rows in the table based on the name and dates filters', async () => {
        testInstance.filterForm.patchValue({
            customerFilterControl: "Test Sub 2",
            startDateFilterControl: moment('2022-07-10', 'YYYY-MM-DD'),
            renewalDateFilterControl: moment('2022-07-26', 'YYYY-MM-DD')
        });
        fixture.detectChanges();
        await fixture.whenStable();
        expect(testInstance.filteredSubscriptions.length).toBe(1);
        const objectToCompare: any = {
            "subaccountId": "31d81e5c-a916-470b-aabe-6860f8464211",
            "licenseRenewalDate": "2022-07-26",
            "licenseTokens": 500,
            "licenseDescription": "License description",
            "licenseStatus": "Expired",
            "licenseStartDate": "2022-07-10",
            "customerId": "467aee0e-0cc8-4822-9789-fc90acea0a04",
            "licensePackageType": "Large",
            "subaccountName": "Test Sub 2",
            "licenseId": "31b92e5c-b811-460b-ccbe-6860f8464233",
            "licenseTokensConsumed": 0,
            "customerName": "Test Customer 2"
        };
        expect(testInstance.filteredSubscriptions[0]).toEqual(objectToCompare);
    });
});
