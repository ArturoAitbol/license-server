import { Component, HostListener, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MsalService } from '@azure/msal-angular';
import { Utility } from 'src/app/helpers/utils';
import { Device } from 'src/app/model/device.model';
import { TableColumn } from 'src/app/model/table-column.model';
import { CustomerService } from 'src/app/services/customer.service';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.css']
})
export class DevicesComponent implements OnInit {
  readonly displayedColumns: TableColumn[] = [
    { name: 'Start Date', dataKey: 'startDate', position: 'left', isSortable: true },
    { name: 'Type', dataKey: 'type', position: 'left', isSortable: true },
    { name: 'Vendor', dataKey: 'vendor', position: 'left', isSortable: true },
    { name: 'Device Name', dataKey: 'name', position: 'left', isSortable: true },
  ];
  tableMaxHeight: number;
  currentCustomer: any;
  devices: Device[] = [];
  devicesBk: Device[] = [];

  isLoadingResults = true;
  isRequestCompleted = false;

  readonly MODIFY_DEVICE: string = 'Edit';
  readonly DELETE_DEVICE: string = 'Delete';

  readonly options = {
    MODIFY_DEVICE: this.MODIFY_DEVICE,
    DELETE_DEVICE: this.DELETE_DEVICE
  }

  actionMenuOptions: any = [];

  constructor(
    private customerService: CustomerService,
    private msalService: MsalService
  ) { }

  @HostListener('window:resize')
  sizeChange() {
    this.calculateTableHeight();
  }

  private getActionMenuOptions() {
    const roles = this.msalService.instance.getActiveAccount().idTokenClaims["roles"];
    this.actionMenuOptions = Utility.getTableOptions(roles, this.options, "deviceOptions");
    if (this.currentCustomer.testCustomer === false) {
      const action = (action) => action === 'Delete';
      const index = this.actionMenuOptions.findIndex(action);
      this.actionMenuOptions.splice(index, 1);
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
    this.calculateTableHeight();
    this.currentCustomer = this.customerService.getSelectedCustomer();
    this.fetchDevices();
    this.getActionMenuOptions();
  }

  fetchDevices(): void {

  }

  sortData(sortParameters: Sort): any[] {
    const keyName = sortParameters.active;
    const arrayToSort = [...this.devices];
    if (sortParameters.direction === 'asc') {
      this.devices = arrayToSort.sort((a: any, b: any) => {
        if (typeof a[keyName] === 'number') {
          return +a[keyName] > +b[keyName] ? 1 : (+a[keyName] < +b[keyName] ? -1 : 0);
        }
        return a[keyName].localeCompare(b[keyName]);
      });
    } else if (sortParameters.direction === 'desc') {
      this.devices = arrayToSort.sort((a: any, b: any) => {
        if (typeof a[keyName] === 'number') {
          return +a[keyName] < +b[keyName] ? 1 : (+a[keyName] > +b[keyName] ? -1 : 0);
        }
        return b[keyName].localeCompare(a[keyName])
      });
    } else {
      return this.devices = this.devicesBk;
    }
  }

}
