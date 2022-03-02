import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ModifyCustomerAccountComponent } from 'src/app/dashboard/modify-customer-account/modify-customer-account.component';
import { TableColumn } from 'src/app/model/table-column.model';
import { CustomerService } from 'src/app/services/customer.service';
import { DialogService } from 'src/app/services/dialog.service';
import { LicenseUsageService } from 'src/app/services/license-usage.service';
import { LicenseService } from 'src/app/services/license.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { AddLicenseConsumptionComponent } from './add-license-consumption/add-license-consumption.component';
import { AddLicenseComponent } from './add-license/add-license.component';
import { ModifyLicenseConsumptionDetailsComponent } from './modify-license-consumption-details/modify-license-consumption-details.component';

@Component({
  selector: 'app-view-customer-license',
  templateUrl: './view-customer-license.component.html',
  styleUrls: ['./view-customer-license.component.css']
})
export class ViewCustomerLicenseComponent implements OnInit {
  readonly displayedColumns: string[] = [
    'deviceLimit',
    'devicesConnected',
    'tokensPurchased',
    'automationDeviceModelTokensConsumed',
    'configurationTokens',
    'configAvgerage'
  ];
  readonly equipmentDisplayColumns: string[] = [
    'vendor',
    'model',
    'version',
    'macAddress'
  ];
  currentCustomer: any;
  @ViewChild(MatSort) sort: MatSort;
  dataSource: any = [];
  // data: any = [
  //   {
  //     id: '1',
  //     deviceAccessLimit: '5000',
  //     devicesConnected: '40',
  //     tokensPurchased: '200',
  //     automationTokensConsumed: '10',
  //     configTokensConsumed: '100',
  //     configAvgerage: '50'
  //   }
  // ];
  data: any = [];
  equipmentDataSource: any = [];
  equipmentData = [
    {
      id: '1',
      vendor: 'Cisco',
      model: 'CUCM',
      version: '13.2.2',
      macAddress: 'MM:22:20:00:00:00'
    },
    {
      id: '2',
      vendor: 'Cisco',
      model: 'CUCM',
      version: '10.2',
      macAddress: 'CM:12:22:00:00:00'
    },
    {
      id: '3',
      vendor: 'Cisco',
      model: 'CUCM',
      version: '',
      macAddress: ''
    }
  ]

  readonly detailedDisplayColumns: string[] = [
    'week',
    'configTokensConsumed'
  ];

  detailedDataSource: any = [];
  detailedData = [
    {
      id: '1',
      week: 'Week 1',
      configTokensConsumed: '100'
    },
    {
      id: '2',
      week: 'Week 2',
      configTokensConsumed: '200'
    },
    {
      id: '3',
      week: 'Week 3',
      configTokensConsumed: '300'
    }
  ]

  detailedConsumptionDataSource: any = [];
  detailedConsumptionDisplayColumns: string[] = [
    'dateOfUsage',
    'vendor',
    'model',
    'version',
    'macAddress',
    'type',
    'consumption',
    'tokensUsed',
    'action'
  ];
  detailedConsumption = [
    {
      id: '1',
      dateOfUsage: '2020-01-01',
      vendor: 'Cisco',
      model: 'CUCM',
      version: '13.2.2',
      macAddress: 'MM:22:20:00:00:00',
      type: 'Automation',
      consumption: '100',
      tokensUsed: '10',
      action: ''
    },
    {
      id: '2',
      dateOfUsage: '2020-01-01',
      vendor: 'Cisco',
      model: 'CUCM',
      version: '13.2.2',
      macAddress: 'MM:22:20:00:00:00',
      type: 'Automation',
      consumption: '100',
      tokensUsed: '10',
      action: ''
    },
    {
      id: '3',
      dateOfUsage: '2020-01-01',
      vendor: 'Cisco',
      model: 'CUCM',
      version: '13.2.2',
      macAddress: 'MM:22:20:00:00:00',
      type: 'Automation',
      consumption: '100',
      tokensUsed: '10',
      action: ''
    },
    {
      id: '4',
      dateOfUsage: '2020-01-01',
      vendor: 'Cisco',
      model: 'CUCM',
      version: '13.2.2',
      macAddress: 'MM:22:20:00:00:00',
      type: 'Automation',
      consumption: '100',
      tokensUsed: '10',
      action: ''
    }
  ];

  readonly licenseSummaryColumns: TableColumn[] = [
    {
      name: 'Device Access Limit',
      dataKey: 'deviceLimit',
      position: 'left',
      isSortable: true,
    },
    {
      name: 'Devices Connected',
      dataKey: 'devicesConnected',
      position: 'left',
      isSortable: true
    },
    {
      name: 'Tokens Purchased',
      dataKey: 'tokensPurchased',
      position: 'left',
      isSortable: true
    },
    {
      name: 'Automation Token Consumed',
      dataKey: 'automationDeviceModelTokensConsumed',
      position: 'left',
      isSortable: true
    },
    {
      name: 'Configuration Tokens Consumed',
      dataKey: 'configurationTokens',
      position: 'left',
      isSortable: true
    },
    {
      name: 'Configuration Average',
      dataKey: 'configAvgerage',
      position: 'left',
      isSortable: true
    }
  ];

  readonly equipmentSummaryColumns: TableColumn[] = [
    {
      name: 'Vendor',
      dataKey: 'vendor',
      position: 'left',
      isSortable: true,
    },
    {
      name: 'Model',
      dataKey: 'model',
      position: 'left',
      isSortable: true,
    },
    {
      name: 'Version',
      dataKey: 'version',
      position: 'left',
      isSortable: true,
    },
    {
      name: 'MAC Address',
      dataKey: 'macAddress',
      position: 'left',
      isSortable: true,
    }
  ];

  readonly detailedConsumptionColumns: TableColumn[] = [
    {
      name: 'Week',
      dataKey: 'week',
      position: 'left',
      isSortable: true,
    },
    {
      name: 'Configuration Tokens Consumed',
      dataKey: 'configTokensConsumed',
      position: 'left',
      isSortable: true,
    }
  ];

  readonly detailedConsumptionSummaryColumns: TableColumn[] = [
    {
      name: 'Date Of Usage',
      dataKey: 'dateOfUsage',
      position: 'left',
      isSortable: true,
    },
    {
      name: 'Vendor',
      dataKey: 'vendor',
      position: 'left',
      isSortable: true,
    },
    {
      name: 'Model',
      dataKey: 'model',
      position: 'left',
      isSortable: true,
    },
    {
      name: 'Version',
      dataKey: 'version',
      position: 'left',
      isSortable: true,
    },
    {
      name: 'MAC Address',
      dataKey: 'macAddress',
      position: 'left',
      isSortable: true,
    },
    {
      name: 'Consumption',
      dataKey: 'consumption',
      position: 'left',
      isSortable: true,
    },
    {
      name: 'Tokens Used',
      dataKey: 'tokensUsed',
      position: 'left',
      isSortable: true,
    }
  ];
  readonly ADD_LICENSE_CONSUMPTION = 'add-license-consumption';
  readonly ADD_LICENSE = 'add-new-license';
  readonly MODIFY = 'modify';

  // flag
  isLicenseSummaryLoadingResults: boolean = true;
  isLicenseSummaryRequestCompleted: boolean = false;
  readonly EDIT: string = 'Edit';
  readonly DELETE: string = 'Delete';

  actionMenuOptions: any = [
    this.EDIT,
    this.DELETE
  ];

  constructor(
    private customerSerivce: CustomerService,
    private dialogService: DialogService,
    private licenseSerivce: LicenseService,
    private licenseUsageService: LicenseUsageService,
    private snackBarService: SnackBarService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.currentCustomer = this.customerSerivce.getSelectedCustomer();

    this.dataSource = new MatTableDataSource(this.data);
    this.equipmentDataSource = new MatTableDataSource(this.equipmentData);
    this.detailedDataSource = new MatTableDataSource(this.detailedData);
    this.detailedConsumptionDataSource = new MatTableDataSource(this.detailedConsumption);
    // this.fetchLicenseSummaryData();
    // this.fetchLicenseConsumptionData();
    const { subaccountId } = this.currentCustomer;
    console.log('@subaccountId', subaccountId);

    const requiredObject = {
      tokensPurchased: 0,
      deviceLimit: 0,
      tokensRemaining: 0,
      automationDeviceModelTokensConsumed: 0,
      configurationTokens: 0,
      devicesConnected: 0,
      tokensConsumed: 0,
      configAvgerage: 0
    };
    const requestObject: { subaccount: string, view: string, month?: string, year?: string } = {
      subaccount: subaccountId,
      view: 'weekly'
    };
    forkJoin(
      [this.licenseUsageService.getLicenseDetails(requestObject),
      this.licenseSerivce.getLicenseList(subaccountId)]
    ).subscribe((response: any) => {
      this.isLicenseSummaryLoadingResults = false;
      this.isLicenseSummaryRequestCompleted = true;
      let resultant = {};
      response.reduce((acc, curr) => resultant = { ...acc, ...curr });
      const licensesList = resultant['licenses'];
      licensesList.forEach(element => {
        requiredObject.tokensPurchased += +element.tokensPurchased;
        requiredObject.deviceLimit += +element.deviceLimit;
      });
      const mergedObj = { ...requiredObject, ...resultant };
      mergedObj.configurationTokens = 0;
      this.data = [mergedObj];
      this.dataSource = new MatTableDataSource(this.data);

    }, (error) => {
      this.isLicenseSummaryLoadingResults = false;
      this.isLicenseSummaryRequestCompleted = true;
    });
  }
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.equipmentDataSource.sort = this.sort;
    this.detailedDataSource.sort = this.sort;
    this.detailedConsumptionDataSource.sort = this.sort;

  }

  onChangeToggle(event: any, selectedItemData?: any): void {
    console.log('event', event.value);
    switch (event.value) {
      case this.ADD_LICENSE:
        this.openDialog(AddLicenseComponent);
        break;
      case this.ADD_LICENSE_CONSUMPTION:
        this.openDialog(AddLicenseConsumptionComponent);
        break;
    }
  }
  onEdit(index: number) {
    const item = this.detailedConsumptionDataSource.filteredData[index];
    console.log('item', item);

    this.openDialog(ModifyLicenseConsumptionDetailsComponent, item);
  }

  onDelete(index: number) {
    this.openConfirmaCancelDialog();
  }

  openConfirmaCancelDialog() {
    this.dialogService
      .confirmDialog({
        title: 'Confirm Action',
        message: 'Do you want to confirm this action?',
        confirmCaption: 'Confirm',
        cancelCaption: 'Cancel',
      })
      .subscribe((confirmed) => {
        if (confirmed) console.log('The user confirmed the action');
      });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  openDialog(component: any, data?: any): void {
    const dialogRef = this.dialog.open(component, {
      width: 'auto',
      data: data,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(res => {
      console.log('add customer dialog closed');
      if (res) {
        this.snackBarService.openSnackBar('License added successfully!', '');
      }
    });
  }

  fetchLicenseSummaryData(): void {
    const { subaccountId } = this.currentCustomer.subaccountId;
    const requiredObject = { tokensPurchased: 0, deviceLimit: 0, tokensRemaining: 0 };
    this.licenseSerivce.getLicenseList(subaccountId).subscribe(res => {
      console.log('license details res by subid', res);
      const licensesList = res['licenses'];
      licensesList.forEach(element => {
        requiredObject.tokensPurchased += +element.tokensPurchased;
        requiredObject.deviceLimit += +element.deviceLimit;
      });
      console.log('requiredObject', requiredObject);

    });
  }

  fetchLicenseConsumptionData(): void {
    const requestObject: { subaccount: string, view: string, month?: string, year?: string } = {
      subaccount: this.currentCustomer.subaccountId,
      view: 'weekly'
    };
    this.licenseUsageService.getLicenseDetails(requestObject).subscribe((res: any) => {
      console.log('license consumption res', res);

    });
  }
  /**
 * sort table
 * @param sortParameters: Sort 
 * @returns 
 */
  sortData(sortParameters: Sort): any[] {
    const keyName = sortParameters.active;
    if (sortParameters.direction === 'asc') {
      this.data = this.data.sort((a: any, b: any) => a[keyName].localeCompare(b[keyName]));
    } else if (sortParameters.direction === 'desc') {
      this.data = this.data.sort((a: any, b: any) => b[keyName].localeCompare(a[keyName]));
    } else {
      return this.data = this.data;
    }
  }
  /**
   * action row click event
   * @param object: { selectedRow: any, selectedOption: string, selectedIndex: string }
   */
  rowAction(object: { selectedRow: any, selectedOption: string, selectedIndex: string }) {
    switch (object.selectedOption) {
      case this.EDIT:
        // this.openProjectDetails(object.selectedIndex);
        break;
      case this.DELETE:
        this.onDelete(+object.selectedIndex);
        break;
    }
  }

}
