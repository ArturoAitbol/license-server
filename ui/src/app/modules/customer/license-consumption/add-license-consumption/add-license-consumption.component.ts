import { Component, EventEmitter, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { Device } from 'src/app/model/device.model';
import { Project } from 'src/app/model/project.model';
import { DevicesService } from 'src/app/services/devices.service';
import { LicenseConsumptionService } from 'src/app/services/license-consumption.service';
import { ProjectService } from 'src/app/services/project.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { AddProjectComponent } from '../../projects/add-project/add-project.component';
import { Moment } from 'moment';
import { SubAccountService } from 'src/app/services/sub-account.service';

@Component({
  selector: 'app-add-license-consumption',
  templateUrl: './add-license-consumption.component.html',
  styleUrls: ['./add-license-consumption.component.css']
})
export class AddLicenseConsumptionComponent implements OnInit, OnDestroy {

  updateProjects : EventEmitter<any> = new EventEmitter<any>();

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
    vendor: ['', Validators.required],
    product: ['', [this.RequireMatch]]
  });
  addSupportForm = this.formBuilder.group({
    vendor: ['', Validators.required],
    product: ['', [this.RequireMatch]]
  });
  isDataLoading = false;
  customerSubaccountDetails: any;

  constructor(
    private deviceService: DevicesService,
    private projectService: ProjectService,
    private licenseConsumptionService: LicenseConsumptionService,
    private snackBarService: SnackBarService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private subaccountService: SubAccountService,
    public dialogRef: MatDialogRef<AddLicenseConsumptionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.customerSubaccountDetails = this.subaccountService.getSelectedSubAccount();
    this.projectService.setSelectedSubAccount(this.customerSubaccountDetails.id);
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
    const subaccountId = this.customerSubaccountDetails.id;
    forkJoin([
      this.deviceService.getAllDeviceVendors(),
      this.projectService.getProjectDetailsByLicense(subaccountId, this.customerSubaccountDetails.licenseId, 'Open')
    ]).subscribe((res: any) => {
      const resDataObject: any = res.reduce((current: any, next: any) => {
        return { ...current, ...next };
      }, {});

      /*Devices list*/
      this.vendors = resDataObject['vendors'];
      this.supportVendors = resDataObject['supportVendors'];

      /*Projects List*/
      this.projects = resDataObject['projects'];
      this.filteredProjects = this.addLicenseConsumptionForm.controls['project'].valueChanges.pipe(
          startWith(''),
          map(value => (typeof value === 'string' ? value : value.projectName)),
          map(projectName => (projectName ? this.filterProjects(projectName) : this.projects.slice())),
      );
      this.filteredVendors = this.addDeviceForm.controls['vendor'].valueChanges.pipe(
          startWith(''),
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
      this.loadClonedDevices();
      this.isDataLoading = false;
    });
  }
  /**
   * fetch projects list
   */
  fetchProjects(): void {
    this.isDataLoading = true;
    this.projectService.getProjectDetailsByLicense(this.customerSubaccountDetails.id, this.customerSubaccountDetails.licenseId, 'Open').subscribe((res: any) => {
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
    this.isDataLoading = true;
    this.deviceService.getDevicesList(this.customerSubaccountDetails.id, value).subscribe(res => {
      this.filterVendorDevices(res['devices']);
      this.addDeviceForm.patchValue({ product: '' });
      this.addDeviceForm.controls['product'].enable();
      this.isDataLoading = false;
    });
  }

  /**
   * trigger when user select/change vendor dropdown
   * @param value: string
   */
  onChangeSupportVendor(value: any): void {
    this.isDataLoading = true;
    this.deviceService.getDevicesList(this.customerSubaccountDetails.id, value).subscribe(res => {
      this.filterSupportVendorDevices(res['devices']);
      this.addSupportForm.patchValue({ product: '' });
      this.addSupportForm.controls['product'].enable();
      this.isDataLoading = false;
    });
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

  private filterVendorDevices(devices: Device[]): void {
    this.models = [];
    devices.forEach((device: any) => {
      if (device.type != "PHONE" && !device.supportType) {
        const productLabel = device.version ? device.product + " - v." + device.version : device.product;
        this.models.push({
          id: device.id,
          vendor: device.vendor,
          product: productLabel + " (" + device.granularity + " - " + device.tokensToConsume + ")"
        });
      }
    });
  }

  private filterSupportVendorDevices(devices: Device[]): void {
    this.supportModels = [];
    devices.forEach((device: any) => {
      if (device.type != "PHONE" && device.supportType) {
        const productLabel = device.version ? device.product + " - v." + device.version : device.product;
        this.supportModels.push({
          id: device.id,
          vendor: device.vendor,
          product: productLabel + " (" + device.granularity + " - " + device.tokensToConsume + ")"
        });
      }
    });
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

  toggleUsageDays(days:any[],startWeek: Moment,endWeek: Moment){
    days.forEach((day,index)=> {
      if(index<startWeek.day() || index>endWeek.day()){
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
    const stringDate = this.addLicenseConsumptionForm.value.startWeek.format("YYYY-MM-DD");
    const licenseConsumptionsObject: any = {
      subaccountId: this.customerSubaccountDetails.id,
      projectId: this.addLicenseConsumptionForm.value.project.id,
      consumptionDate: stringDate,
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
    return this.projects.filter(option => option.projectName.toLowerCase().includes(filterValue));
  }

  private filterVendors(value: string, support = false): any[] {
    const filterValue = value.toLowerCase();
    const vendorsList: string[] = support ? this.supportVendors : this.vendors;

    return vendorsList.filter(option => option.toLowerCase().includes(filterValue));
  }

  private filterModels(value: string, support = false): Device[] {
    const filterValue = value.toLowerCase();
    if (!support) {
      return this.models.filter(option => option.product.toLowerCase().includes(filterValue));
    } else {
      return this.supportModels.filter(option => option.product.toLowerCase().includes(filterValue));
    }
  }

  displayFnProject(project: any): string {
    return project && project.projectName ? project.projectName : '';
  }
  displayFnDevice(device: any): string {
    return device && device.product ? device.product : '';
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

  loadClonedDevices() {
    if (this.data.selectedConsumptions) {
      const selectedConsumptions = JSON.parse(JSON.stringify(this.data.selectedConsumptions));
      selectedConsumptions.forEach(selectedConsumption => {
        const device=  { id: null, vendor: null, product: null, days: null };
        device.id = selectedConsumption.device.id;
        device.vendor = selectedConsumption.device.vendor;
        const productLabel = selectedConsumption.device.version ? selectedConsumption.device.product + " - v." + selectedConsumption.device.version : selectedConsumption.device.product;
        device.product = productLabel + " (" + selectedConsumption.device.granularity + " - " + selectedConsumption.tokensConsumed + ")";
        device.days = JSON.parse(JSON.stringify(this.deviceDays));
        if (selectedConsumption.device.granularity === 'week') {
          device.days.forEach(day => {
            if (selectedConsumption.usageDays.includes(day.name)) {
              day.used = true;
            }
          });
        }
        if (selectedConsumption.device.supportType) this.supportUsed.push(device);
        else this.devicesUsed.push(device);
        });
    }
  }

  ngOnDestroy(): void {
    // reset form here
    this.addLicenseConsumptionForm.reset();
    this.addDeviceForm.reset();
    this.addSupportForm.reset();
  }
}
