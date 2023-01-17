import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Moment } from 'moment';
import { forkJoin, Observable } from 'rxjs';
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
export class AddNewLicenseConsumptionComponent implements OnInit {
  updateProjects: EventEmitter<any> = new EventEmitter<any>();

  projects: Project[] = [];
  dutTypes: any[] = [];
  callingPlatformTypes: any[] = [];
  deviceTypes: any[] = [];
  vendors: any[] = [];
  // supportVendors: any[] = [];
  // models: any = [];
  // supportModels: any = [];
  devicesUsed: any = [];
  supportUsed: any = [];
  consumptionDays: any = [
    { name: "Sun", used: false, disabled: true },
    { name: "Mon", used: false, disabled: true },
    { name: "Tue", used: false, disabled: true },
    { name: "Wed", used: false, disabled: true },
    { name: "Thu", used: false, disabled: true },
    { name: "Fri", used: false, disabled: true },
    { name: "Sat", used: false, disabled: true },
  ];
  // deviceDays: any = [
  //   { name: "Sun", used: false, disabled: true },
  //   { name: "Mon", used: false, disabled: true },
  //   { name: "Tue", used: false, disabled: true },
  //   { name: "Wed", used: false, disabled: true },
  //   { name: "Thu", used: false, disabled: true },
  //   { name: "Fri", used: false, disabled: true },
  //   { name: "Sat", used: false, disabled: true },
  // ];
  // supportDays: any = [
  //   { name: "Sun", used: false, disabled: true },
  //   { name: "Mon", used: false, disabled: true },
  //   { name: "Tue", used: false, disabled: true },
  //   { name: "Wed", used: false, disabled: true },
  //   { name: "Thu", used: false, disabled: true },
  //   { name: "Fri", used: false, disabled: true },
  //   { name: "Sat", used: false, disabled: true },
  // ];
  filteredProjects: Observable<any[]>;
  // filteredVendors: Observable<any[]>;
  // filteredModels: Observable<any[]>;
  // filteredSupportVendors: Observable<any[]>;
  // filteredSupportModels: Observable<any[]>;
  startDate: any;
  endDate: any;
  addLicenseConsumptionForm = this.formBuilder.group({
    startWeek: ['', Validators.required],
    endWeek: ['', Validators.required],
    project: ['', [Validators.required, this.RequireMatch]]
  });
  addDutForm = this.formBuilder.group({
    name: ['', Validators.required],
    vendor: ['', Validators.required],
  });
  addCallingPlatformForm = this.formBuilder.group({
    name: ['', Validators.required],
    vendor: ['', Validators.required],
  });
  // addDeviceForm = this.formBuilder.group({
  //   vendor: ['', Validators.required],
  //   product: ['', [this.RequireMatch]]
  // });
  // addSupportForm = this.formBuilder.group({
  //   vendor: ['', Validators.required],
  //   product: ['', [this.RequireMatch]]
  // });
  currentCustomer: any;
  isDataLoading = false;

  constructor(
    private customerService: CustomerService,
    private deviceService: DevicesService,
    private projectService: ProjectService,
    // private licenseConsumptionService: LicenseConsumptionService,
    // private snackBarService: SnackBarService,
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
      this.callingPlatformTypes = resDataObject['callingPlatformTypes'];
      this.deviceTypes = resDataObject['deviceTypes'];

      /*Devices list*/
      this.vendors = resDataObject['vendors'];
      // this.supportVendors = resDataObject['supportVendors'];

      /*Projects List*/
      this.projects = resDataObject['projects'];
      this.filteredProjects = this.addLicenseConsumptionForm.controls['project'].valueChanges.pipe(
        startWith(''),
        map(value => (typeof value === 'string' ? value : value.projectName)),
        map(projectName => (projectName ? this.filterProjects(projectName) : this.projects.slice())),
      );
      // this.filteredVendors = this.addDeviceForm.controls['vendor'].valueChanges.pipe(
      //   startWith(''),
      //   map(vendor => {
      //     if (vendor === '') {
      //       this.models = [];
      //       this.addDeviceForm.controls['product'].disable();
      //       this.addDeviceForm.patchValue({ product: '' });
      //     }
      //     return vendor ? this.filterVendors(vendor) : this.vendors.slice();
      //   })
      // );
      // this.filteredModels = this.addDeviceForm.controls['product'].valueChanges.pipe(
      //   startWith(''),
      //   map(value => (typeof value === 'string' ? value : value ? value.product : '')),
      //   map(product => (product ? this.filterModels(product) : this.models.slice()))
      // );
      // this.filteredSupportVendors = this.addSupportForm.controls['vendor'].valueChanges.pipe(
      //   startWith(''),
      //   map(vendor => {
      //     if (vendor === '') {
      //       this.supportModels = [];
      //       this.addSupportForm.controls['product'].disable();
      //       this.addSupportForm.patchValue({ product: '' });
      //     }
      //     return vendor ? this.filterVendors(vendor, true) : this.supportVendors.slice();
      //   })
      // );
      // this.filteredSupportModels = this.addSupportForm.controls['product'].valueChanges.pipe(
      //   startWith(''),
      //   map(value => (typeof value === 'string' ? value : value ? value.product : '')),
      //   map(product => (product ? this.filterModels(product, true) : this.supportModels.slice()))
      // );
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
    console.log(value);
    // this.isDataLoading = true;
    // this.deviceService.getDevicesList(this.currentCustomer.subaccountId, value).subscribe(res => {
    //   this.filterVendorDevices(res['devices']);
    //   this.addDeviceForm.patchValue({ product: '' });
    //   this.addDeviceForm.controls['product'].enable();
    //   this.isDataLoading = false;
    // });
  }

  onChangeCallingPlatformType(value: any): void {
    console.log(value);
    // this.isDataLoading = true;
    // this.deviceService.getDevicesList(this.currentCustomer.subaccountId, value).subscribe(res => {
    //   this.filterVendorDevices(res['devices']);
    //   this.addDeviceForm.patchValue({ product: '' });
    //   this.addDeviceForm.controls['product'].enable();
    //   this.isDataLoading = false;
    // });
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
    // this.toggleUsageDays(this.deviceDays, startWeek, endWeek);
    // this.toggleUsageDays(this.supportDays, startWeek, endWeek);
    // this.devicesUsed.forEach(deviceUsed => this.toggleUsageDays(deviceUsed.days, startWeek, endWeek));
    // this.supportUsed.forEach(supportUsed => this.toggleUsageDays(supportUsed.days, startWeek, endWeek));
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

  setConsumptionDays(value: boolean, daysIndex: number, deviceIndex?: number) {
    if (deviceIndex !== null && deviceIndex !== undefined)
      this.devicesUsed[deviceIndex].days[daysIndex].used = value;
    else
      this.consumptionDays[daysIndex].used = value;
  }

  submit(): void { }

  private filterProjects(value: string): Project[] {
    const filterValue = value.toLowerCase();
    return this.projects.filter(option => option.projectName.toLowerCase().includes(filterValue));
  }

  displayFnProject(project: any): string {
    return project && project.projectName ? project.projectName : '';
  }

  devicesAndSupportInvalid(): boolean {
    // const isInvalidDevice = this.devicesUsed.length === 0 && this.isInvalid('product');
    // const isInvalidSupport = this.supportUsed.length === 0 && this.isInvalidSupport('product');
    // return isInvalidDevice && isInvalidSupport;
    return true;
  }

  getErrorMessage(): string {
    return 'Please select a correct option';
  }

  isInvalidProject(): boolean {
    return this.addLicenseConsumptionForm.controls['project'].invalid;
  }

  // isInvalid(control: string): boolean {
  //   return this.addDeviceForm.controls[control].invalid || !this.addDeviceForm.controls[control].value;
  // }
  // isInvalidSupport(control: string): boolean {
  //   return this.addSupportForm.controls[control].invalid || !this.addSupportForm.controls[control].value;
  // }

  isWeekDefined(): boolean{
    return this.addLicenseConsumptionForm.controls['startWeek'].valid && this.addLicenseConsumptionForm.controls['endWeek'].valid;
  }

  

  ngOnDestroy(): void {
    // reset form here
    this.addLicenseConsumptionForm.reset();
    // this.addDeviceForm.reset();
    // this.addSupportForm.reset();
  }
}

