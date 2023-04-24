import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { MsalService } from '@azure/msal-angular';
import moment from 'moment';
import { forkJoin, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Utility } from 'src/app/helpers/utils';
import { Device } from 'src/app/model/device.model';
import { TableColumn } from 'src/app/model/table-column.model';
import { DevicesService } from 'src/app/services/devices.service';
import { DialogService } from 'src/app/services/dialog.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { AddDeviceComponent } from './add-device/add-device.component';
import { ModifyDeviceComponent } from './modify-device/modify-device.component';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.css']
})
export class DevicesComponent implements OnInit, OnDestroy {
  readonly displayedColumns: TableColumn[] = [
    { name: 'Start Date', dataKey: 'startDate', position: 'left', isSortable: true },
    { name: 'Type', dataKey: 'type', position: 'left', isSortable: true },
    { name: 'Vendor', dataKey: 'vendor', position: 'left', isSortable: true },
    { name: 'Device Name', dataKey: 'product', position: 'left', isSortable: true },
  ];

  tableMaxHeight: number;
  devices: Device[] = [];
  devicesBk: Device[] = [];
  deviceTypes: any[];
  deviceVendors: any[];

  isLoadingResults = true;
  isRequestCompleted = false;

  readonly MODIFY_DEVICE: string = 'Edit';
  readonly DELETE_DEVICE: string = 'Delete';

  readonly options = {
    MODIFY_DEVICE: this.MODIFY_DEVICE,
    DELETE_DEVICE: this.DELETE_DEVICE
  }

  actionMenuOptions: any = [];

  filterForm = this.fb.group({
    nameFilterControl: [''],
    typeFilterControl: [''],
    vendorFilterControl: [''],
    startDateFilterControl: [''],
    endDateFilterControl: [''],
  });

  private unsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private devicesService: DevicesService,
    private dialogService: DialogService,
    private snackBarService: SnackBarService,
    public dialog: MatDialog,
    private msalService: MsalService
  ) { }

  @HostListener('window:resize')
  sizeChange() {
    this.calculateTableHeight();
  }

  private getActionMenuOptions() {
    const roles = this.msalService.instance.getActiveAccount().idTokenClaims["roles"];
    this.actionMenuOptions = Utility.getTableOptions(roles, this.options, "deviceOptions");
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
    this.filterForm.disable();
    this.calculateTableHeight();
    this.fetchDevices();
    this.getActionMenuOptions();
    this.loadFilters();
  }

  loadFilters(): void {
    forkJoin([
      this.devicesService.getAllDeviceVendors(),
      this.devicesService.getDevicesTypesList(),
    ]).subscribe((res: any) => {
      const resDataObject: any = res.reduce((current: any, next: any) => {
        return { ...current, ...next };
      }, {});
      this.deviceTypes = resDataObject['deviceTypes'];
      this.deviceVendors = resDataObject['vendors'].concat(res['supportVendors']);
    });

    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.unsubscribe)).subscribe(value => {
        const filters = [];
      if (value.nameFilterControl != '')
        filters.push(device => device.product.toLowerCase().includes(value.nameFilterControl.toLowerCase()));
      
      if (value.typeFilterControl != '' && value.typeFilterControl != null)
        filters.push(device => device.type.toLowerCase().includes(value.typeFilterControl.toLowerCase()));

      if (value.vendorFilterControl != '' && value.vendorFilterControl != null)
        filters.push(device => device.vendor.toLowerCase().includes(value.vendorFilterControl.toLowerCase()));

      if (value.startDateFilterControl != '' && value.startDateFilterControl != null)
        filters.push(device => device.startDate != null && moment(device.startDate).isSameOrAfter(value.startDateFilterControl));

      if (value.endDateFilterControl != '' && value.endDateFilterControl != null)
        filters.push(device => device.startDate != null && moment(device.startDate).isSameOrBefore(moment(value.endDateFilterControl.format('MM/DD/YYYY'))));

      this.isLoadingResults = true;
      this.devicesBk = this.devices.filter(device => filters.every(filter => filter(device)));
      this.isLoadingResults = false;
    })
  }

  openDialog(component: any, data?: any): void {
    const dialogRef = this.dialog.open(component, {
      width: 'auto',
      data: data,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(res => {
      this.fetchDevices();
    });
  }

  fetchDevices(): void {
    this.isLoadingResults = true;
    this.isRequestCompleted = false;
    this.devicesService.getDevicesList().subscribe(res => {
      this.isLoadingResults = false;
      this.isRequestCompleted = true;
      res['devices'].map((device:any)=>{
        device.startDate = new Date(device.startDate).toLocaleDateString("en-CA");
      });
      
      this.devicesBk = this.devices = res['devices'];
      this.filterForm.enable();
    }, () => {
      this.isLoadingResults = false;
      this.isRequestCompleted = true;
    });
  }

  sortData(sortParameters: Sort): any[] {
    const keyName = sortParameters.active;
    const arrayToSort = [...this.devicesBk];
    if (sortParameters.direction === 'asc') {
      this.devicesBk = arrayToSort.sort((a: any, b: any) => {
        if (typeof a[keyName] === 'number')
          return +a[keyName] > +b[keyName] ? 1 : (+a[keyName] < +b[keyName] ? -1 : 0);
        return a[keyName].localeCompare(b[keyName]);
      });
    } else if (sortParameters.direction === 'desc') {
      this.devicesBk = arrayToSort.sort((a: any, b: any) => {
        if (typeof a[keyName] === 'number')
          return +a[keyName] < +b[keyName] ? 1 : (+a[keyName] > +b[keyName] ? -1 : 0);
        return b[keyName].localeCompare(a[keyName])
      });
    } else
      return this.devicesBk = this.devices;
  }

  onDelete(device: Device): void {
    let deviceDetail = device.vendor + " - " + device.product;
    if (device.version != "")
      deviceDetail = deviceDetail + " - " + device.version;
    this.dialogService
      .confirmDialog({
        title: 'Confirm Action',
        message: 'Are you sure you want to delete '+ deviceDetail +'?',
        confirmCaption: 'Confirm',
        cancelCaption: 'Cancel',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.snackBarService.openSnackBar('License deleted successfully!', '');
          this.devicesService.deleteDevice(device.id).subscribe((res: any) => {
            this.fetchDevices();
          });
        }
      });
  }

  rowAction(object: { selectedRow: any, selectedOption: string, selectedIndex: string }) {
    switch (object.selectedOption) {
      case this.MODIFY_DEVICE:
        this.openDialog(ModifyDeviceComponent, { ...object.selectedRow });
        break;
      case this.DELETE_DEVICE:
        this.onDelete(object.selectedRow);
        break;
    }
  }

  addDevice(): void {
    this.openDialog(AddDeviceComponent);
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();

  }
}
