import { Component, EventEmitter, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { Device } from 'src/app/model/device.model';
import { Project } from 'src/app/model/project.model';
import { CustomerService } from 'src/app/services/customer.service';
import { DevicesService } from 'src/app/services/devices.service';
import { LicenseConsumptionService } from 'src/app/services/license-consumption.service';
import { ProjectService } from 'src/app/services/project.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { AddProjectComponent } from '../../projects/add-project/add-project.component';

@Component({
  selector: 'app-add-license-consumption',
  templateUrl: './add-license-consumption.component.html',
  styleUrls: ['./add-license-consumption.component.css']
})
export class AddLicenseConsumptionComponent implements OnInit, OnDestroy {

  updateProjects : EventEmitter<any> = new EventEmitter<any>();

  allDevices: Device[] = [];
  projects: Project[] = [];
  vendors: any[] = [];
  supportVendors: any[] = [];
  models: any = [];
  supportModels: any = [];
  devicesUsed: any = [];
  supportUsed: any = [];
  deviceDays: any = [
    { name: "Sun", used: false, disabled:true },
    { name: "Mon", used: false, disabled:true },
    { name: "Tue", used: false, disabled:true },
    { name: "Wed", used: false, disabled:true },
    { name: "Thu", used: false, disabled:true },
    { name: "Fri", used: false, disabled:true },
    { name: "Sat", used: false, disabled:true },
  ];
  supportDays: any = [
    { name: "Sun", used: false, disabled:true },
    { name: "Mon", used: false, disabled:true },
    { name: "Tue", used: false, disabled:true },
    { name: "Wed", used: false, disabled:true },
    { name: "Thu", used: false, disabled:true },
    { name: "Fri", used: false, disabled:true },
    { name: "Sat", used: false, disabled:true },
  ];
  filteredProjects: Observable<any[]>;
  filteredVendors: Observable<any[]>;
  filteredModels: Observable<any[]>;
  filteredSupportVendors: Observable<any[]>;
  filteredSupportModels: Observable<any[]>;
  startDate: any;
  endDate: any;
  addLicenseConsumptionForm = this.formBuilder.group({
    startWeek: ['', Validators.required],
    endWeek: ['', Validators.required],
    project: ['', [Validators.required, this.RequireMatch]]
  });
  addDeviceForm = this.formBuilder.group({
    vendor: ['', [this.RequireMatch]],
    product: ['', [this.RequireMatch]]
  });
  addSupportForm = this.formBuilder.group({
    vendor: ['', [this.RequireMatch]],
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

    if (this.data) {
      this.startDate = new Date(this.data.startDate + " 00:00:00");
      this.endDate = new Date(this.data.renewalDate + " 00:00:00");
    }
    this.fetchData();
  }

  /**
  * fetch devices and projects list
  */
  fetchData(): void {
    this.isDataLoading = true;
    const subaccountId = this.currentCustomer.subaccountId;
    forkJoin([
      this.deviceService.getDevicesList(subaccountId),
      this.projectService.getProjectDetailsBySubAccount(subaccountId, 'Open')
    ]).subscribe((res: any) => {
      const resDataObject: any = res.reduce((current: any, next: any) => {
        return { ...current, ...next };
      }, {});

      /*Devices list*/
      this.allDevices = resDataObject['devices'];
      const vendorsHash: any = {};
      this.vendors = this.allDevices.filter(device => {
        if (device.type != "PHONE" && !vendorsHash[device.vendor] && !device.supportType) {
          vendorsHash[device.vendor] = true;
          return true;
        }
        return false;
      });
      this.supportVendors = this.allDevices.filter(device => {
        if (device.type != "PHONE" && !vendorsHash[device.vendor] && device.supportType) {
          vendorsHash[device.vendor] = true;
          return true;
        }
        return false;
      });
      /*Projects List*/
      this.projects = resDataObject['projects'];
      this.filteredProjects = this.addLicenseConsumptionForm.controls['project'].valueChanges.pipe(
          startWith(''),
          map(value => (typeof value === 'string' ? value : value.name)),
          map(name => (name ? this.filterProjects(name) : this.projects.slice())),
      );
      this.filteredVendors = this.addDeviceForm.controls['vendor'].valueChanges.pipe(
          startWith(''),
          map(value => (typeof value === 'string' ? value : value ? value.vendor : '')),
          map(vendor => {
            if (vendor === '') {
              this.models = [];
              this.addDeviceForm.controls['product'].disable();
              this.addDeviceForm.patchValue({ product: '' });
            }
            return vendor ? this.filterVendors(vendor) : this.vendors.slice();
          })
      );
      this.filteredModels = this.addDeviceForm.controls['product'].valueChanges.pipe(
          startWith(''),
          map(value => (typeof value === 'string' ? value : value ? value.product : '')),
          map(product => (product ? this.filterModels(product) : this.models.slice()))
      );
      this.filteredSupportVendors = this.addSupportForm.controls['vendor'].valueChanges.pipe(
          startWith(''),
          map(value => (typeof value === 'string' ? value : value ? value.vendor : '')),
          map(vendor => {
            if (vendor === '') {
              this.supportModels = [];
              this.addSupportForm.controls['product'].disable();
              this.addSupportForm.patchValue({ product: '' });
            }
            return vendor ? this.filterVendors(vendor, true) : this.supportVendors.slice();
          })
      );
      this.filteredSupportModels = this.addSupportForm.controls['product'].valueChanges.pipe(
          startWith(''),
          map(value => (typeof value === 'string' ? value : value ? value.product : '')),
          map(product => (product ? this.filterModels(product, true) : this.supportModels.slice()))
      );
      this.isDataLoading = false;
    });
  }
  /**
   * fetch projects list
   */
  fetchProjects(): void {
    this.isDataLoading = true;
    const subaccountId = this.currentCustomer.subaccountId;
    this.projectService.getProjectDetailsBySubAccount(subaccountId, 'Open').subscribe((res: any) => {
      this.projects = res['projects'];
      this.addLicenseConsumptionForm.patchValue({ project: '' });
      this.isDataLoading = false;
    });
  }
  /**
   * trigger when user select/change vendor dropdown
   * @param value: string 
   */
  onChangeVendor(value: any): void {
    this.filterVendorDevices(value.vendor);
    this.addDeviceForm.patchValue({ product: '' });
    this.addDeviceForm.controls['product'].enable()
  }

  /**
   * trigger when user select/change vendor dropdown
   * @param value: string
   */
  onChangeSupportVendor(value: any): void {
    this.filterSupportVendorDevices(value.vendor);
    this.addSupportForm.patchValue({ product: '' });
    this.addSupportForm.controls['product'].enable()
  }

  onAddProject(): void {
    const dialogRef = this.dialog.open(AddProjectComponent, {
      width: 'auto',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res)
        this.fetchProjects();
        this.updateProjects.emit();
    });
  }

  private filterVendorDevices(value: string): void {
    this.models = [];
    if (value) {
      this.allDevices.forEach((device: any) => {
        if (device.type != "PHONE" && device.vendor == value && !device.supportType) {
          const productLabel = device.version ? device.product + " - v." + device.version : device.product;
          this.models.push({
            id: device.id,
            vendor: value,
            product: productLabel + " (" + device.granularity + " - " + device.tokensToConsume + ")"
          });
        }
      });
    }
  }

  private filterSupportVendorDevices(value: string): void {
    this.supportModels = [];
    if (value) {
      this.allDevices.forEach((device: any) => {
        if (device.type != "PHONE" && device.vendor == value && device.supportType) {
          const productLabel = device.version ? device.product + " - v." + device.version : device.product;
          this.models.push({
            id: device.id,
            vendor: value,
            product: productLabel + " (" + device.granularity + " - " + device.tokensToConsume + ")"
          });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  pickStartWeek() {
    const startWeek = this.addLicenseConsumptionForm.get('startWeek').value;
    const endWeek = this.addLicenseConsumptionForm.get('endWeek').value;
    this.toggleUsageDays(this.deviceDays,startWeek,endWeek);
    this.toggleUsageDays(this.supportDays,startWeek,endWeek);
    this.devicesUsed.forEach(deviceUsed => this.toggleUsageDays(deviceUsed.days,startWeek,endWeek));
    this.supportUsed.forEach(supportUsed => this.toggleUsageDays(supportUsed.days,startWeek,endWeek));
  }

  toggleUsageDays(days:any[],startWeek: Date,endWeek: Date){
    days.forEach((day,index)=> {
      if(index<startWeek.getDay() || index>endWeek.getDay()){
        day.disabled = true;
        day.used = false;
      }else{
        day.disabled = false;
      }
    })
  }

  setChecked(value: boolean, daysIndex: number, deviceIndex?: number) {
    if (deviceIndex !== null && deviceIndex !== undefined)
      this.devicesUsed[deviceIndex].days[daysIndex].used = value;
    else
      this.deviceDays[daysIndex].used = value;
  }

  setSupportDay(value: boolean, daysIndex: number, deviceIndex?: number) {
    if (deviceIndex !== null && deviceIndex !== undefined)
      this.supportUsed[deviceIndex].days[daysIndex].used = value;
    else
      this.supportDays[daysIndex].used = value;
  }

  submit(): void {
    const consumptionRequests: any[] = [];
    const licenseConsumptionsObject: any = {
      subaccountId: this.currentCustomer.subaccountId,
      projectId: this.addLicenseConsumptionForm.value.project.id,
      consumptionDate: this.addLicenseConsumptionForm.value.startWeek.toISOString().split("T")[0],
      type: "Configuration",
      macAddress: "",
      serialNumber: "",
      deviceId: "",
      usageDays: []
    };
    this.addDevice();
    this.addSupport();
    this.devicesUsed.forEach((device: any) => {
      const newConsumptionObject = JSON.parse(JSON.stringify(licenseConsumptionsObject));
      newConsumptionObject.deviceId = device.id;
      for (let i = 0; i < device.days.length; i++) {
        if (device.days[i].used)
          newConsumptionObject.usageDays.push(i);
      }
      consumptionRequests.push(this.licenseConsumptionService.addLicenseConsumptionDetails(newConsumptionObject));
    });
    this.supportUsed.forEach((device: any) => {
      const newConsumptionObject = JSON.parse(JSON.stringify(licenseConsumptionsObject));
      newConsumptionObject.deviceId = device.id;
      for (let i = 0; i < device.days.length; i++) {
        if (device.days[i].used)
          newConsumptionObject.usageDays.push(i);
      }
      consumptionRequests.push(this.licenseConsumptionService.addLicenseConsumptionDetails(newConsumptionObject));
    });
    this.isDataLoading = true;
    forkJoin(consumptionRequests).subscribe((res: any) => {
      const resDataObject: any = res.reduce((current: any, next: any) => {
        return { ...current, ...next };
      }, {});
      if (resDataObject.error)
        this.snackBarService.openSnackBar(resDataObject.error, 'Error adding license consumption!');
      this.isDataLoading = false;
      this.dialogRef.close(true);
    }, (err: any) => {
      this.snackBarService.openSnackBar(err, 'Error adding license consumption!');
      this.isDataLoading = false;
      this.dialogRef.close(true);
    });
  }
  /**
   * add device to the list
   */
  addDevice(): void {
    const device: any = this.addDeviceForm.value.product;
    if (device) {
      device.days = JSON.parse(JSON.stringify(this.deviceDays));
      this.devicesUsed.push(device);
      this.addDeviceForm.reset();
      // this.addDeviceForm.patchValue({ vendor: '', product: '' });
      this.deviceDays.forEach(deviceDay => deviceDay.used = false);
    }
  }

  addSupport(): void {
    const device: any = this.addSupportForm.value.product;
    if (device) {
      device.days = JSON.parse(JSON.stringify(this.supportDays));
      this.supportUsed.push(device);
      this.addSupportForm.reset();
      this.supportDays.forEach(supportDay => supportDay.used = false);
    }
  }

  /**
   * trigger when user deletes a device
   * @param index: number 
   */
  removeDevice(index: number): void {
    this.devicesUsed.splice(index, 1);
  }

  removeSupport(index: number): void {
    this.supportUsed.splice(index, 1);
  }

  private filterProjects(value: string): Project[] {
    const filterValue = value.toLowerCase();
    return this.projects.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  private filterVendors(value: string, support = false): any[] {
    const filterValue = value.toLowerCase();
    if (!support) {
      return this.vendors.filter(option => option.vendor.toLowerCase().includes(filterValue));
    } else {
      return this.supportVendors.filter(option => option.vendor.toLowerCase().includes(filterValue) && option.supportType);
    }
  }

  private filterModels(value: string, support = false): Device[] {
    const filterValue = value.toLowerCase();
    if (!support) {
      return this.models.filter(option => option.product.toLowerCase().includes(filterValue));
    } else {
      return this.supportModels.filter(option => option.product.toLowerCase().includes(filterValue) && option.supportType);
    }
  }

  displayFnProject(item: any): string {
    return item && item.name ? item.name : '';
  }
  displayFnDevice(item: any): string {
    return item && item.product ? item.product : '';
  }
  displayFnVendor(item: any): string {
    return item && item.vendor ? item.vendor : '';
  }

  private RequireMatch(control: AbstractControl) {
    const selection: any = control.value;
    if (typeof selection === 'string') {
      return { incorrect: true };
    }
    return null;
  }

  getErrorMessage(): string {
    return 'Please select a correct option';
  }

  isInvalidProject(): boolean {
    return this.addLicenseConsumptionForm.controls['project'].invalid;
  }

  isInvalid(control: string): boolean {
    return this.addDeviceForm.controls[control].invalid || !this.addDeviceForm.controls[control].value;
  }
  isInvalidSupport(control: string): boolean {
    return this.addSupportForm.controls[control].invalid || !this.addSupportForm.controls[control].value;
  }
  isWeekDefined(): boolean{
    return this.addLicenseConsumptionForm.controls['startWeek'].valid && this.addLicenseConsumptionForm.controls['endWeek'].valid;
  }

  devicesAndSupportInvalid(): boolean{
    const isInvalidDevice = this.devicesUsed.length === 0 && this.isInvalid('product');
    const isInvalidSupport = this.supportUsed.length === 0 && this.isInvalidSupport('product');
    return isInvalidDevice && isInvalidSupport;
  }

  ngOnDestroy(): void {
    // reset form here
    this.addLicenseConsumptionForm.reset();
    this.addDeviceForm.reset();
    this.addSupportForm.reset();
  }
}
