import { Component, EventEmitter, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Moment } from 'moment';
import { forkJoin, Observable } from 'rxjs';
import { Device } from 'src/app/model/device.model';
import { map, startWith } from 'rxjs/operators';
import { Project } from 'src/app/model/project.model';
import { CustomerService } from 'src/app/services/customer.service';
import { DevicesService } from 'src/app/services/devices.service';
import { LicenseConsumptionService } from 'src/app/services/license-consumption.service';
import { ProjectService } from 'src/app/services/project.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { AddProjectComponent } from '../../projects/add-project/add-project.component';
import { AddLicenseConsumptionComponent } from '../add-license-consumption/add-license-consumption.component';

@Component({
  selector: 'app-add-new-license-consumption',
  templateUrl: './add-new-license-consumption.component.html',
  styleUrls: ['./add-new-license-consumption.component.css']
})
export class AddNewLicenseConsumptionComponent implements OnInit, OnDestroy {
  updateProjects: EventEmitter<any> = new EventEmitter<any>();

  projects: Project[] = [];
  dutTypes: any[] = [];
  selectedDutType: string;
  callingPlatformTypes: any[] = [];
  selectedCallingPlatformType: string;
  deviceTypes: any[] = [];
  selectedDeviceType: string;

  vendors: any[] = [];
  callingPlatformVendors: any[] = [];
  deviceVendors: any[] = [];

  models: any = [];
  callingPlatformModels: any = [];
  deviceModels: any = [];

  dutUsed: any = [];
  callingPlatformUsed: any = [];
  otherDevicesUsed: any = [];
  consumptionDays: any = [
    { name: "Sun", used: false, disabled: true },
    { name: "Mon", used: false, disabled: true },
    { name: "Tue", used: false, disabled: true },
    { name: "Wed", used: false, disabled: true },
    { name: "Thu", used: false, disabled: true },
    { name: "Fri", used: false, disabled: true },
    { name: "Sat", used: false, disabled: true },
  ];
  deviceDays: any = [
    { name: "Sun", used: false, disabled: true },
    { name: "Mon", used: false, disabled: true },
    { name: "Tue", used: false, disabled: true },
    { name: "Wed", used: false, disabled: true },
    { name: "Thu", used: false, disabled: true },
    { name: "Fri", used: false, disabled: true },
    { name: "Sat", used: false, disabled: true },
  ];
  filteredProjects: Observable<any[]>;

  filteredVendors: Observable<any[]>;
  filteredModels: Observable<any[]>;
  filteredCallingPlatformVendors: Observable<any[]>;
  filteredCallingPlatformModels: Observable<any[]>;
  filteredDeviceVendors: Observable<any[]>;
  filteredDeviceModels: Observable<any[]>;

  startDate: any;
  endDate: any;
  addLicenseConsumptionForm = this.formBuilder.group({
    startWeek: ['', Validators.required],
    endWeek: ['', Validators.required],
    project: ['', [Validators.required, this.RequireMatch]],
    comment: ['']
  });
  addDutForm = this.formBuilder.group({
    type: ['', Validators.required],
    vendor: ['', Validators.required],
    product: ['', [this.RequireMatch]]
  });
  addCallingPlatformForm = this.formBuilder.group({
    type: ['', Validators.required],
    vendor: ['', Validators.required],
    product: ['', [this.RequireMatch]]
  });
  addDeviceForm = this.formBuilder.group({
    type: ['', Validators.required],
    vendor: ['', Validators.required],
    product: ['', [this.RequireMatch]]
  });
  currentCustomer: any;
  isDataLoading = false;

  constructor(
    private customerService: CustomerService,
    private deviceService: DevicesService,
    private projectService: ProjectService,
    private licenseConsumptionService: LicenseConsumptionService,
    private snackBarService: SnackBarService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<AddLicenseConsumptionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.currentCustomer = this.customerService.getSelectedCustomer();
    this.projectService.setSelectedSubAccount(this.currentCustomer.subaccountId);
    this.fetchData();
    if (this.data) {
      this.startDate = new Date(this.data.startDate + " 00:00:00");
      this.endDate = new Date(this.data.renewalDate + " 00:00:00");
    }
  }

  /**
  * fetch devices and projects list
  */
  fetchData(): void {
    this.isDataLoading = true;
    const subaccountId = this.currentCustomer.subaccountId;
    forkJoin([
      this.deviceService.getAllDeviceVendors(),
      this.deviceService.getDevicesTypesList(),
      this.projectService.getProjectDetailsByLicense(subaccountId, this.currentCustomer.licenseId, 'Open')
    ]).subscribe((res: any) => {
      const resDataObject: any = res.reduce((current: any, next: any) => {
        return { ...current, ...next };
      }, {});

      // Device Types
      this.dutTypes = resDataObject['dutTypes'];
      this.addDutForm.controls['vendor'].disable();
      this.addDutForm.patchValue({ vendor: '' });

      this.callingPlatformTypes = resDataObject['callingPlatformTypes'];
      this.addCallingPlatformForm.controls['vendor'].disable();
      this.addCallingPlatformForm.patchValue({ vendor: '' });

      this.deviceTypes = resDataObject['deviceTypes'];

      /*Devices list*/
      this.deviceVendors = resDataObject['vendors'].concat(resDataObject['supportVendors']);

      /*Projects List*/
      this.projects = resDataObject['projects'];
      this.filteredProjects = this.addLicenseConsumptionForm.controls['project'].valueChanges.pipe(
        startWith(''),
        map(value => (typeof value === 'string' ? value : value.projectName)),
        map(projectName => (projectName ? this.filterProjects(projectName) : this.projects.slice())),
      );

      this.filteredVendors = this.addDutForm.controls['vendor'].valueChanges.pipe(
        startWith(''),
        map(vendor => {
          if (vendor === '') {
            this.models = [];
            this.addDutForm.controls['product'].disable();
            this.addDutForm.patchValue({ product: '' });
          }
          return vendor ? this.filterVendors(vendor) : this.vendors.slice();
        })
      );

      this.addDutForm.controls['product'].disable();
      this.addDutForm.patchValue({ product: '' });

      this.filteredModels = this.addDutForm.controls['product'].valueChanges.pipe(
        startWith(''),
        map(value => (typeof value === 'string' ? value : value ? value.product : '')),
        map(product => (product ? this.filterModels(product) : this.models.slice()))
      );

      this.filteredCallingPlatformVendors = this.addCallingPlatformForm.controls['vendor'].valueChanges.pipe(
        startWith(''),
        map(vendor => {
          if (vendor === '') {
            this.callingPlatformModels = [];
            this.addCallingPlatformForm.controls['product'].disable();
            this.addCallingPlatformForm.patchValue({ product: '' });
          }
          return vendor ? this.filterVendors(vendor, true) : this.callingPlatformVendors.slice();
        })
      );

      this.addCallingPlatformForm.controls['product'].disable();
      this.addCallingPlatformForm.patchValue({ product: '' });

      this.filteredCallingPlatformModels = this.addCallingPlatformForm.controls['product'].valueChanges.pipe(
        startWith(''),
        map(value => (typeof value === 'string' ? value : value ? value.product : '')),
        map(product => (product ? this.filterModels(product, true) : this.callingPlatformModels.slice()))
      );

      this.filteredDeviceVendors = this.addDeviceForm.controls['vendor'].valueChanges.pipe(
        startWith(''),
        map(vendor => {
          if (vendor === '') {
            this.deviceModels = [];
            this.addDeviceForm.controls['product'].disable();
            this.addDeviceForm.patchValue({ product: '' });
          }
          return vendor ? this.filterDeviceVendors(vendor) : this.deviceVendors.slice();
        })
      );
      this.filteredDeviceModels = this.addDeviceForm.controls['product'].valueChanges.pipe(
        startWith(''),
        map(value => (typeof value === 'string' ? value : value ? value.product : '')),
        map(product => (product ? this.filterDeviceModels(product) : this.deviceModels.slice()))
      );
      this.isDataLoading = false;
    });
  }

  fetchProjects(): void {
    this.isDataLoading = true;
    this.projectService.getProjectDetailsByLicense(this.currentCustomer.subaccountId, this.currentCustomer.licenseId, 'Open').subscribe((res: any) => {
      this.projects = res['projects'];
      this.addLicenseConsumptionForm.patchValue({ project: '' });
      this.isDataLoading = false;
    });
  }

  onChangeDutType(value: any): void {
    this.isDataLoading = true;
    this.selectedDutType = value;
    this.deviceService.getAllDeviceVendors(this.selectedDutType).subscribe(res => {
      this.vendors = res['vendors'];
      this.addDutForm.patchValue({ vendor: '' });
      this.addDutForm.controls['vendor'].enable();
      this.addDutForm.patchValue({ product: '' });
      this.isDataLoading = false;
    });
  }

  onChangeCallingPlatformType(value: any): void {
    this.isDataLoading = true;
    this.selectedCallingPlatformType = value;
    this.deviceService.getAllDeviceVendors(this.selectedCallingPlatformType).subscribe(res => {
      this.callingPlatformVendors = res['vendors'];
      this.addCallingPlatformForm.patchValue({ vendor: '' });
      this.addCallingPlatformForm.controls['vendor'].enable();
      this.addCallingPlatformForm.patchValue({ product: '' });
      this.isDataLoading = false;
    });
  }

  onChangeDeviceType(value: any): void {
    this.isDataLoading = true;
    this.selectedDeviceType = value;
    this.deviceService.getAllDeviceVendors(this.selectedDeviceType).subscribe(res => {
      this.deviceVendors = res['vendors'];
      this.addDeviceForm.patchValue({ vendor: '' });
      this.addDeviceForm.controls['vendor'].enable();
      this.addDeviceForm.patchValue({ product: '' });
      this.isDataLoading = false;
    });
  }

  /**
   * trigger when user select/change vendor dropdown
   * @param value: string 
   */
  onChangeVendor(value: any): void {
    this.isDataLoading = true;
    this.deviceService.getDevicesList(this.currentCustomer.subaccountId, value, this.selectedDutType).subscribe(res => {
      this.filterVendorDevices(res['devices']);
      this.addDutForm.patchValue({ product: '' });
      this.addDutForm.controls['product'].enable();
      this.isDataLoading = false;
    });
  }

  onChangeCallingPlatformVendor(value: any): void {
    this.isDataLoading = true;
    this.deviceService.getDevicesList(this.currentCustomer.subaccountId, value, this.selectedCallingPlatformType).subscribe(res => {
      this.filterCallingPlatformVendorDevices(res['devices']);
      this.addCallingPlatformForm.patchValue({ product: '' });
      this.addCallingPlatformForm.controls['product'].enable();
      this.isDataLoading = false;
    });
  }

  onChangeDeviceVendor(value: any): void {
    this.isDataLoading = true;
    this.deviceService.getDevicesList(this.currentCustomer.subaccountId, value, this.selectedDeviceType).subscribe(res => {
      this.filterOtherVendorDevices(res['devices']);
      this.addDeviceForm.patchValue({ product: '' });
      this.addDeviceForm.controls['product'].enable();
      this.isDataLoading = false;
    });
  }

  private filterVendorDevices(devices: Device[]): void {
    this.models = [];
    devices.forEach((device: any) => {
      const productLabel = device.version ? device.product + " - v." + device.version : device.product;
      this.models.push({
        id: device.id,
        vendor: device.vendor,
        product: productLabel
      });
    });
  }

  private filterCallingPlatformVendorDevices(devices: Device[]): void {
    this.callingPlatformModels = [];
    devices.forEach((device: any) => {
      const productLabel = device.version ? device.product + " - v." + device.version : device.product;
      this.callingPlatformModels.push({
        id: device.id,
        vendor: device.vendor,
        product: productLabel
      });
    });
  }

  private filterOtherVendorDevices(devices: Device[]): void {
    this.deviceModels = [];
    devices.forEach((device: any) => {
      const productLabel = device.version ? device.product + " - v." + device.version : device.product;
      this.deviceModels.push({
        id: device.id,
        vendor: device.vendor,
        product: productLabel
      });
    });
  }

  private RequireMatch(control: AbstractControl) {
    const selection: any = control.value;
    if (typeof selection === 'string') {
      return { incorrect: true };
    }
    return null;
  }

  onAddProject(): void {
    const dialogRef = this.dialog.open(AddProjectComponent, { width: 'auto', disableClose: true });
    dialogRef.afterClosed().subscribe(res => {
      if (res)
        this.fetchProjects();
      this.updateProjects.emit();
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  pickStartWeek() {
    const startWeek = this.addLicenseConsumptionForm.get('startWeek').value;
    const endWeek = this.addLicenseConsumptionForm.get('endWeek').value;
    this.toggleUsageDays(this.consumptionDays, startWeek, endWeek);
    this.toggleUsageDays(this.deviceDays, startWeek, endWeek);
    this.otherDevicesUsed.forEach(deviceUsed => this.toggleUsageDays(deviceUsed.days, startWeek, endWeek));
  }

  toggleUsageDays(days: any[], startWeek: Moment, endWeek: Moment) {
    days.forEach((day, index) => {
      if (index < startWeek.day() || index > endWeek.day()) {
        day.disabled = true;
        day.used = false;
      } else {
        day.disabled = false;
      }
    })
  }

  setChecked(value: boolean, daysIndex: number, deviceIndex?: number) {
    if (deviceIndex !== null && deviceIndex !== undefined)
      this.otherDevicesUsed[deviceIndex].days[daysIndex].used = value;
    else
      this.deviceDays[daysIndex].used = value;
  }

  setConsumptionDays(value: boolean, daysIndex: number) {
    this.consumptionDays[daysIndex].used = value;
  }

  submit(): void {
    this.isDataLoading = true;
    const consumptionRequests: any[] = [];
    const stringDate = this.addLicenseConsumptionForm.value.startWeek.format("YYYY-MM-DD");
    const licenseConsumptionsObject: any = {
      subaccountId: this.currentCustomer.subaccountId,
      projectId: this.addLicenseConsumptionForm.value.project.id,
      comment: this.addLicenseConsumptionForm.value.comment,
      consumptionDate: stringDate,
      type: "Configuration",
      macAddress: "",
      serialNumber: "",
      usageDays: []
    };
    this.addDut();
    this.addCallingPlatform();
    this.addDevice();

    const dut: any = this.dutUsed[0];
    const callingPlatform: any = this.callingPlatformUsed[0];
    const newConsumptionObject = JSON.parse(JSON.stringify(licenseConsumptionsObject));
    newConsumptionObject.dutId = dut.id;
    newConsumptionObject.callingPlatformId = callingPlatform.id;
    for (let i = 0; i < this.consumptionDays.length; i++) {
      if (this.consumptionDays[i].used)
        newConsumptionObject.usageDays.push(i);
    }

    this.licenseConsumptionService.addLicenseConsumptionEvent(newConsumptionObject).subscribe((response: any) => {
      if (!response.error) {
        if (this.otherDevicesUsed.length === 0) {
          this.isDataLoading = false;
          this.dialogRef.close(true);
          return;
        }
        const newOtherDeviceObject = JSON.parse(JSON.stringify(licenseConsumptionsObject));
        newOtherDeviceObject.supportDevice = true;
        newOtherDeviceObject.consumptionMatrixId = response.consumptionMatrixId;
        newOtherDeviceObject.usageDays = [];
        this.otherDevicesUsed.forEach((device: any) => {
          newOtherDeviceObject.deviceId = device.id;
          for (let i = 0; i < device.days.length; i++) {
            if (device.days[i].used)
              newOtherDeviceObject.usageDays.push(i);
          }
          consumptionRequests.push(this.licenseConsumptionService.addLicenseConsumptionDetails(newOtherDeviceObject));
        });
        forkJoin(consumptionRequests).subscribe((res: any) => {
          const resDataObject: any = res.reduce((current: any, next: any) => {
            return { ...current, ...next };
          }, {});
          if (resDataObject.error)
            this.snackBarService.openSnackBar(resDataObject.error, 'Error adding some devices for this license consumption!');
          this.isDataLoading = false;
          this.dialogRef.close(true);
        }, (err: any) => {
          this.snackBarService.openSnackBar(err, 'Error adding some devices for this license consumption!');
          this.isDataLoading = false;
          this.dialogRef.close(true);
        });
      } else {
        this.snackBarService.openSnackBar(response.error, 'Error adding license consumption!');
        this.isDataLoading = false;
        this.dialogRef.close(true);
      }
    });
  }

  addDut(): void {
    const dut: any = this.addDutForm.value.product;
    this.dutUsed = [];
    if (dut) {
      this.dutUsed.push(dut)
      // this.addDutForm.reset();
    }
  }

  addCallingPlatform(): void {
    const callingPlatform: any = this.addCallingPlatformForm.value.product;
    this.callingPlatformUsed = [];
    if (callingPlatform) {
      this.callingPlatformUsed.push(callingPlatform);
      // this.addCallingPlatformForm.reset();
    }
  }

  addDevice(): void {
    const device: any = this.addDeviceForm.value.product;
    if (device) {
      device.days = JSON.parse(JSON.stringify(this.deviceDays));
      this.otherDevicesUsed.push(device);
      this.addDeviceForm.reset();
      this.deviceDays.forEach(deviceDay => deviceDay.used = false);
    }
  }

  /**
   * trigger when user deletes a device
   * @param index: number 
   */
  removeDevice(index: number): void {
    this.otherDevicesUsed.splice(index, 1);
  }

  private filterProjects(value: string): Project[] {
    const filterValue = value.toLowerCase();
    return this.projects.filter(option => option.projectName.toLowerCase().includes(filterValue));
  }

  private filterVendors(value: string, callingPlatforms = false): any[] {
    const filterValue = value.toLowerCase();
    const vendorsList: string[] = callingPlatforms ? this.callingPlatformVendors : this.vendors;
    return vendorsList.filter(option => option.toLowerCase().includes(filterValue));
  }

  private filterDeviceVendors(value: string): any[] {
    const filterValue = value.toLowerCase();
    const vendorsList: string[] = this.deviceVendors;
    return vendorsList.filter(option => option.toLowerCase().includes(filterValue));
  }

  private filterModels(value: string, callingPlatforms = false): Device[] {
    const filterValue = value.toLowerCase();
    if (!callingPlatforms)
      return this.models.filter(option => option.product.toLowerCase().includes(filterValue));
    else
      return this.callingPlatformModels.filter(option => option.product.toLowerCase().includes(filterValue));
  }

  private filterDeviceModels(value: string): Device[] {
    const filterValue = value.toLowerCase();
    return this.deviceModels.filter(option => option.product.toLowerCase().includes(filterValue));
  }

  displayFnProject(project: any): string {
    return project && project.projectName ? project.projectName : '';
  }

  displayFnDevice(device: any): string {
    return device && device.product ? device.product : '';
  }

  dutCallingAndDeviceInvalid(): boolean {
    const isInvalidDut = this.dutUsed.length === 0 && this.isInvalid('product');
    const isInvalidCalling = this.callingPlatformUsed.length === 0 && this.isInvalidCallingPlatform('product');
    const isDeviceInvalid = this.otherDevicesUsed.length === 0 && this.isDeviceInvalid('product');
    return isInvalidDut && isInvalidCalling && isDeviceInvalid;
  }

  getErrorMessage(): string {
    return 'Please select a correct option';
  }

  isInvalidProject(): boolean {
    return this.addLicenseConsumptionForm.controls['project'].invalid;
  }

  isInvalid(control: string): boolean {
    return this.addDutForm.controls[control].invalid || !this.addDutForm.controls[control].value;
  }

  isInvalidCallingPlatform(control: string): boolean {
    return this.addCallingPlatformForm.controls[control].invalid || !this.addCallingPlatformForm.controls[control].value;
  }

  isDeviceInvalid(control: string): boolean {
    return this.addDeviceForm.controls[control].invalid || !this.addDeviceForm.controls[control].value;
  }

  isWeekDefined(): boolean {
    return this.addLicenseConsumptionForm.controls['startWeek'].valid && this.addLicenseConsumptionForm.controls['endWeek'].valid;
  }

  ngOnDestroy(): void {
    // reset form here
    this.addLicenseConsumptionForm.reset();
    this.addDutForm.reset();
    this.addCallingPlatformForm.reset();
  }
}