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
import { Constants } from 'src/app/helpers/constants';
import { SubAccountService } from 'src/app/services/sub-account.service';

@Component({
  selector: 'app-add-other-consumption',
  templateUrl: './add-other-consumption.component.html',
  styleUrls: ['./add-other-consumption.component.css']
})
export class AddOtherConsumptionComponent implements OnInit, OnDestroy {

  updateProjects : EventEmitter<any> = new EventEmitter<any>();

  projects: Project[] = [];
  vendors: any[] = [];
  models: any = [];
  devicesUsed: any = [];
  deviceDays: any = [
    { name: "Sun", used: false, disabled:true },
    { name: "Mon", used: false, disabled:true },
    { name: "Tue", used: false, disabled:true },
    { name: "Wed", used: false, disabled:true },
    { name: "Thu", used: false, disabled:true },
    { name: "Fri", used: false, disabled:true },
    { name: "Sat", used: false, disabled:true },
  ];
  filteredProjects: Observable<any[]>;
  deviceTypes: string[] = [
    Constants.CERT_DEVICE_TYPE,
    Constants.SANDBOX_DEVICE_TYPE
  ];
  filteredVendors: Observable<any[]>;
  filteredModels: Observable<any[]>;
  startDate: any;
  endDate: any;
  selectedType: string;
  addLicenseConsumptionForm = this.formBuilder.group({
    startWeek: ['', Validators.required],
    endWeek: ['', Validators.required],
    project: ['', [Validators.required, this.RequireMatch]]
  });
  addDeviceForm = this.formBuilder.group({
    deviceType: ['', Validators.required],
    vendor: ['', Validators.required],
    product: ['', [this.RequireMatch]]
  });
  customerSubaccountDetails: any;
  isDataLoading = false;

  constructor(
    private deviceService: DevicesService,
    private projectService: ProjectService,
    private licenseConsumptionService: LicenseConsumptionService,
    private snackBarService: SnackBarService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private subaccountService: SubAccountService,
    public dialogRef: MatDialogRef<AddOtherConsumptionComponent>,
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
    this.projectService.getProjectDetailsByLicense(subaccountId, this.customerSubaccountDetails.licenseId, 'Open').subscribe((res: any) => {

      /*Projects List*/
      this.projects = res['projects'];
      this.vendors = [];
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
   * trigger when user select/change device type dropdown
   * @param value: string 
   */
  onChangeType(value: any): void {
    this.isDataLoading = true;
    this.selectedType = value;
    this.deviceService.getAllDeviceVendors(value).subscribe(res => {
      this.vendors = res['vendors'];
      this.addDeviceForm.patchValue({ vendor: '' });
      this.isDataLoading = false;
    });
  }
  /**
   * trigger when user select/change vendor dropdown
   * @param value: string 
   */
  onChangeVendor(value: any): void {
    this.isDataLoading = true;
    this.deviceService.getDevicesList(this.customerSubaccountDetails.id, value, this.selectedType).subscribe(res => {
      this.filterVendorDevices(res['devices']);
      this.addDeviceForm.patchValue({ product: '' });
      this.addDeviceForm.controls['product'].enable();
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
      const productLabel = device.version ? device.product + " - v." + device.version : device.product;
      this.models.push({
        id: device.id,
        vendor: device.vendor,
        product: productLabel + " (" + device.granularity + " - " + device.tokensToConsume + ")"
      });
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  pickStartWeek() {
    const startWeek = this.addLicenseConsumptionForm.get('startWeek').value;
    const endWeek = this.addLicenseConsumptionForm.get('endWeek').value;
    this.toggleUsageDays(this.deviceDays,startWeek,endWeek);
    this.devicesUsed.forEach(deviceUsed => this.toggleUsageDays(deviceUsed.days,startWeek,endWeek));
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
    this.devicesUsed.forEach((device: any) => {
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

  /**
   * trigger when user deletes a device
   * @param index: number 
   */
  removeDevice(index: number): void {
    this.devicesUsed.splice(index, 1);
  }

  private filterProjects(value: string): Project[] {
    const filterValue = value.toLowerCase();
    return this.projects.filter(option => option.projectName.toLowerCase().includes(filterValue));
  }

  private filterVendors(value: string): any[] {
    const filterValue = value.toLowerCase();
    const vendorsList: string[] = this.vendors;

    return vendorsList.filter(option => option.toLowerCase().includes(filterValue));
  }

  private filterModels(value: string): Device[] {
    const filterValue = value.toLowerCase();
    return this.models.filter(option => option.product.toLowerCase().includes(filterValue));
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
  
  isWeekDefined(): boolean{
    return this.addLicenseConsumptionForm.controls['startWeek'].valid && this.addLicenseConsumptionForm.controls['endWeek'].valid;
  }

  deviceInvalid(): boolean{
    const isInvalidDevice = this.devicesUsed.length === 0 && this.isInvalid('product');
    return isInvalidDevice;
  }

  ngOnDestroy(): void {
    // reset form here
    this.addLicenseConsumptionForm.reset();
    this.addDeviceForm.reset();
  }
}
