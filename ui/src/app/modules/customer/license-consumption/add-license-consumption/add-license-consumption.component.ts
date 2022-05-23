import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { Device } from 'src/app/model/device.model';
import { LicenseConsumption } from 'src/app/model/license-consumption.model';
import { Project } from 'src/app/model/project.model';
import { CustomerService } from 'src/app/services/customer.service';
import { DevicesService } from 'src/app/services/devices.service';
import { LicenseConsumptionService } from 'src/app/services/license-consumption.service';
import { ProjectService } from 'src/app/services/project.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { AddProjectComponent } from '../../projects/add-project/add-project.component';
import { MatDatepicker } from '@angular/material/datepicker';

@Component({
  selector: 'app-add-license-consumption',
  templateUrl: './add-license-consumption.component.html',
  styleUrls: ['./add-license-consumption.component.css']
})
export class AddLicenseConsumptionComponent implements OnInit, OnDestroy {
  devices: Device[] = [];
  projects: Project[] = [];
  vendors: any[] = [];
  models: any = [];
  usedDevices: any = [];
  days: any = [
    { name: "Mon", used: false },
    { name: "Tue", used: false },
    { name: "Wed", used: false },
    { name: "Thu", used: false },
    { name: "Fri", used: false },
  ];


  filteredProjects: Observable<any[]>;
  filteredVendors: Observable<any[]>;
  filteredModels: Observable<any[]>;
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
  currentCustomer: any;
  isDataLoading: boolean = false;

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
    this.projectService.setSelectedSubAccount(this.currentCustomer.id);

    if (this.data) {
      this.startDate = new Date(this.data.startDate + " 00:00:00");
      this.endDate = new Date(this.data.renewalDate + " 00:00:00");
    }
    this.currentCustomer = this.customerService.getSelectedCustomer();
    this.fetchData();
    this.filteredModels = this.addDeviceForm.controls['product'].valueChanges.pipe(
      startWith(''),
      map(value => (typeof value === 'string' ? value : value ? value.product : '')),
      map(product => (product ? this.filterModels(product) : this.models.slice()))
    );
  }

  /**
  * fetch devices and projects list
  */
  fetchData(): void {
    this.isDataLoading = true;
    const subaccountId = this.currentCustomer.id;
    forkJoin([
      this.deviceService.getDevicesList(),
      this.projectService.getProjectDetailsBySubAccount(subaccountId, 'Open')
    ]).subscribe((res: any) => {
      const resDataObject: any = res.reduce((current: any, next: any) => {
        return { ...current, ...next };
      }, {});

      /*Devices list*/
      this.devices = resDataObject['devices'];
      let vendorsHash: any = {};
      this.vendors = this.devices.filter(device => {
        if (device.type != "Phone" && !vendorsHash[device.vendor]) {
          vendorsHash[device.vendor] = true;
          return true;
        }
        return false;
      });
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

      /*Projects List*/
      this.projects = resDataObject['projects'];
      this.filteredProjects = this.addLicenseConsumptionForm.controls['project'].valueChanges.pipe(
        startWith(''),
        map(value => (typeof value === 'string' ? value : value.name)),
        map(name => (name ? this.filterProjects(name) : this.projects.slice())),
      );

      this.isDataLoading = false;
    });
  }
  /**
   * fetch projects list
   */
  fetchProjects(): void {
    this.isDataLoading = true;
    const subaccountId = this.currentCustomer.id;
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

  onAddProject(): void {
    const dialogRef = this.dialog.open(AddProjectComponent, {
      width: 'auto',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res)
        this.fetchProjects();
    });
  }

  private filterVendorDevices(value: string): void {
    this.models = [];
    if (value) {
      this.devices.forEach((device: any) => {
        if (device.type != "Phone" && device.vendor == value) {
          this.models.push({
            id: device.id,
            vendor: value,
            product: device.version ? device.product + " - v." + device.version : device.product
          });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  pickStartWeek(newDateSelection: Date, datepicker: MatDatepicker<any>) {
    console.log(newDateSelection);
    let startWeek = new Date(newDateSelection);
    let endWeek = new Date(newDateSelection);
    startWeek.setDate(startWeek.getDate() - startWeek.getDay() + 1);
    endWeek.setDate(endWeek.getDate() - endWeek.getDay() + 5);
    this.addLicenseConsumptionForm.patchValue({ startWeek: startWeek, endWeek: endWeek });
    datepicker.close();
  }

  setChecked(value: boolean, daysIndex: number, deviceIndex?: number) {
    if (deviceIndex !== null && deviceIndex !== undefined)
      this.usedDevices[deviceIndex].usageDays[daysIndex] = value;
    else
      this.days[daysIndex].used = value;
  }

  submit(): void {
    let startWeek: Date = new Date(this.addLicenseConsumptionForm.value.startWeek);
    let consumptionRequests: any[] = [];
    const licenseConsumptionsObject: any = {
      subaccountId: this.currentCustomer.id,
      projectId: this.addLicenseConsumptionForm.value.project.id,
      consumptionDate: startWeek.toISOString().split("T")[0],
      usageType: "Configuration",
      macAddress: "",
      serialNumber: "",
      deviceId: "",
      usageDays: []
    };
    this.addDevice();
    this.usedDevices.forEach((device: any) => {
      let newConsumptionObject = { ...licenseConsumptionsObject };
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
    let device: any = this.addDeviceForm.value.product;
    if (device) {
      device.days = this.days;
      this.usedDevices.push(device);
      this.addDeviceForm.reset();
      // this.addDeviceForm.patchValue({ vendor: '', product: '' });
      this.days = [
        { name: "Mon", used: false },
        { name: "Tue", used: false },
        { name: "Wed", used: false },
        { name: "Thu", used: false },
        { name: "Fri", used: false },
      ];
    }
  }
  /**
   * trigger when user deletes a device
   * @param index: number 
   */
  removeDevice(index: number): void {
    this.usedDevices.splice(index, 1);
  }

  private filterProjects(value: string): Project[] {
    const filterValue = value.toLowerCase();
    return this.projects.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  private filterVendors(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.vendors.filter(option => option.vendor.toLowerCase().includes(filterValue));
  }

  private filterModels(value: string): Device[] {
    const filterValue = value.toLowerCase();
    return this.models.filter(option => option.product.toLowerCase().includes(filterValue));
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

  ngOnDestroy(): void {
    // reset form here
    this.addLicenseConsumptionForm.reset();
    this.addDeviceForm.reset();
  }
}
