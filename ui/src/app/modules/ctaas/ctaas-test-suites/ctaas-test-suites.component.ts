import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { MsalService } from '@azure/msal-angular';
import { Subject } from 'rxjs';
import { Utility } from 'src/app/helpers/utils';
import { TestSuite } from 'src/app/model/test-suite.model';
import { CtaasTestSuiteService } from 'src/app/services/ctaas-test-suite.service';
import { DialogService } from 'src/app/services/dialog.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { AddTestSuiteComponent } from './add-test-suite/add-test-suite.component';
import { ModifyTestSuiteComponent } from './modify-test-suite/modify-test-suite.component';

@Component({
  selector: 'app-ctaas-test-suites',
  templateUrl: './ctaas-test-suites.component.html',
  styleUrls: ['./ctaas-test-suites.component.css']
})
export class CtaasTestSuitesComponent implements OnInit, OnDestroy {
  tableMaxHeight: number;
  displayedColumns: any[] = [];
  testSuites: any = [];
  isLoadingResults = true;
  isRequestCompleted = false;
  private subaccountDetails: any;
  // readonly EXECUTE_ON_DEMAND: string = 'Execute OnDemand';
  readonly MODIFY_TEST_SUITE: string = 'Edit';
  readonly DELETE_TEST_SUITE: string = 'Delete';

  readonly options = {
    MODIFY_TEST_SUITE : this.MODIFY_TEST_SUITE,
    DELETE_TEST_SUITE : this.DELETE_TEST_SUITE
  }

  actionMenuOptions: any = [];
  private unsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private dialogService: DialogService,
    public dialog: MatDialog,
    private snackBarService: SnackBarService,
    private msalService: MsalService,
    private subaccountService: SubAccountService,
    private ctaasTestSuiteService: CtaasTestSuiteService) {}

  @HostListener('window:resize')
  sizeChange() {
    this.calculateTableHeight();
  }

  private getActionMenuOptions() {
    const roles = this.msalService.instance.getActiveAccount().idTokenClaims["roles"];
    this.actionMenuOptions = Utility.getTableOptions(roles,this.options,"ctaasTestSuiteOptions")
    if (this.subaccountDetails.testCustomer === false) {
      const action = (action) => action === 'Delete';
      const index = this.actionMenuOptions.findIndex(action);
      this.actionMenuOptions.splice(index,);
    }
  }

  private calculateTableHeight() {
    this.tableMaxHeight = window.innerHeight // doc height
      - (window.outerHeight * 0.01 * 2) // - main-container margin
      - 60 // - route-content margin
      - 20 // - dashboard-content padding
      - 30 // - table padding
      - 32 // - title height
      - (window.outerHeight * 0.05 * 2); // - table-section margin
  }

  ngOnInit(): void {
    this.subaccountDetails = this.subaccountService.getSelectedSubAccount();
    this.calculateTableHeight();
    this.initColumns();
    this.fetchDataToDisplay();
    this.getActionMenuOptions();
  }

  initColumns(): void {
    this.displayedColumns = [
      { name: 'Suite Name', dataKey: 'suiteName', position: 'left', isSortable: true },
      { name: 'Service Under Test', dataKey: 'deviceType', position: 'left', isSortable: true },
      { name: 'Total Executions', dataKey: 'totalExecutions', position: 'left', isSortable: true },
      { name: 'Next Execution', dataKey: 'nextExecution', position: 'left', isSortable: true },
      { name: 'Frequency', dataKey: 'frequency', position: 'left', isSortable: true }
    ];
  }

  private fetchDataToDisplay(): void {
    this.ctaasTestSuiteService.getTestSuitesBySubAccount(this.subaccountDetails.id).subscribe((response: any) => {
      this.testSuites = response.ctaasTestSuites;
      this.isRequestCompleted = true;
      this.isLoadingResults = false;
    }, () => {
      this.isLoadingResults = false;
      this.isRequestCompleted = true;
    });
  }

  sortData(sortParameters: Sort): any[] {
    const keyName = sortParameters.active;
    if (sortParameters.direction === 'asc')
      this.testSuites = this.testSuites.sort((a: any, b: any) => a[keyName].localeCompare(b[keyName]));
    else if (sortParameters.direction === 'desc')
      this.testSuites = this.testSuites.sort((a: any, b: any) => b[keyName].localeCompare(a[keyName]));
    else
      return this.testSuites = this.testSuites;
  }

  addTestSuite(): void {
    this.openDialog('add-test-suite');
  }

  /**
    * open dialog
    * @param type: string
    * @param selectedItemData: any
    */
  openDialog(type: string, selectedItemData?: any): void {
    let dialogRef;
    switch (type) {
      case 'add-test-suite':
        dialogRef = this.dialog.open(AddTestSuiteComponent, {
          width: '400px',
          disableClose: true
        });
        break;
      // case this.EXECUTE_ON_DEMAND:
      // TO DO
      // break;
      case this.MODIFY_TEST_SUITE:
        dialogRef = this.dialog.open(ModifyTestSuiteComponent, {
          width: '400px',
          data: selectedItemData,
          disableClose: true
        });
        break;
    }
    dialogRef.afterClosed().subscribe(res => {
      console.debug(`${type} dialog closed: ${res}`);
      if (res) {
        this.fetchDataToDisplay();
      }
    });
  }

  rowAction(object: { selectedRow: any, selectedOption: string, selectedIndex: string }) {
    switch (object.selectedOption) {
      case this.MODIFY_TEST_SUITE:
        this.openDialog(object.selectedOption, object.selectedRow);
        break;
      case this.DELETE_TEST_SUITE:
        this.onDelete(object.selectedRow);
        break;
      // case this.EXECUTE_ON_DEMAND:
      //   this.openDialog(object.selectedOption, object.selectedRow);
      //   break;
    }
  }

  onDelete(testSuite: TestSuite): void {
    this.dialogService
      .confirmDialog({
        title: 'Confirm Action',
        message: 'Are you sure you want to delete '+ testSuite.suiteName +'?',
        confirmCaption: 'Confirm',
        cancelCaption: 'Cancel',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.ctaasTestSuiteService.deleteTestSuite(testSuite.id).subscribe((res: any) => {
            this.snackBarService.openSnackBar('Test suite deleted successfully!', '');
            this.fetchDataToDisplay();
          });
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
