import { Component, Inject, OnInit } from '@angular/core';
import { Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { map, startWith } from 'rxjs/operators';
import { Device } from 'src/app/model/device.model';
import { Project } from 'src/app/model/project.model';
import { CustomerService } from 'src/app/services/customer.service';
import { DevicesService } from 'src/app/services/devices.service';
import { LicenseConsumptionService } from 'src/app/services/license-consumption.service';
import { ProjectService } from 'src/app/services/project.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UsageDetailService } from 'src/app/services/usage-detail.service';

@Component({
  selector: 'app-modify-license-consumption-details',
  templateUrl: './modify-license-consumption-details.component.html',
  styleUrls: ['./modify-license-consumption-details.component.css']
})
export class ModifyLicenseConsumptionDetailsComponent implements OnInit {
  updateForm = this.formBuilder.group({
    consDate: { disabled: true, value: ['', Validators.required] },
    project: ['', [Validators.required, this.nonStringValidator]],
    vendor: ['', Validators.required],
    device: ['', [Validators.required, this.nonStringValidator]]
  });
  projects: Project[] = [];
  filteredProjects: Observable<Project[]>;
  vendors: any = [];
  filteredVendors: Observable<string[]>;
  models: any[] = [];
  filteredModels: Observable<Device[]>;
  originalDays: any = [];
  days: any = [
    { name: "Sun", used: false, disabled:true },
    { name: "Mon", used: false, disabled:true },
    { name: "Tue", used: false, disabled:true },
    { name: "Wed", used: false, disabled:true },
    { name: "Thu", used: false, disabled:true },
    { name: "Fri", used: false, disabled:true },
    { name: "Sat", used: false, disabled:true },
  ];
  selectedVendor = '';
  startDate: any;
  endDate: any;
  isDataLoading = false;
  edited = false;
  currentCustomer: any;
  private previousFormValue: any;

  constructor(
    private formBuilder: FormBuilder,
    private customerService: CustomerService,
    private deviceService: DevicesService,
    private projectService: ProjectService,
    private licenseConsumptionService: LicenseConsumptionService,
    private usageDetailService: UsageDetailService,
    private snackBarService: SnackBarService,
    public dialogRef: MatDialogRef<ModifyLicenseConsumptionDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    if (this.data) {
      this.isDataLoading = true;
      this.data.consDate = new Date(this.data.consumptionDate + " 00:00:00");
      this.enableUsageDays();
      this.currentCustomer = this.customerService.getSelectedCustomer();
      this.fetchData();
      this.filteredProjects = this.updateForm.controls['project'].valueChanges.pipe(
        startWith(''),
        map(value => (typeof value === 'string' ? value : value.projectName)),
        map(projectName => (projectName ? this.filterProjects(projectName) : this.projects.slice())),
      );
      this.filteredVendors = this.updateForm.controls['vendor'].valueChanges.pipe(
        startWith(''),
        map(vendor => vendor ? this.filterVendors(vendor) : this.vendors.slice())
      );
      this.filteredModels = this.updateForm.controls['device'].valueChanges.pipe(
        startWith(''),
        map(value => (typeof value === 'string' ? value : value.product)),
        map(product => (product ? this.filterModels(product) : this.models.slice())),
      );
    }
  }
  /**
   * trigger when user select/change vendor dropdown
   * @param value: string 
   */
  onChangeVendor(value: any): void {
    this.isDataLoading = true;
    this.deviceService.getDevicesList(this.currentCustomer.subaccountId, value).subscribe(res => {
      this.updateForm.controls.device.disable();
      this.filterVendorDevices(res['devices']);
      this.updateForm.controls.device.enable();
      this.updateForm.controls.device.setValue("");
      this.isDataLoading = false;
    });
  }

  enableUsageDays(){
    const endLicense = new Date(this.data.endLicensePeriod+" 00:00:00");
    const startWeek: Date = this.data.consDate;
    let endWeek = new Date(startWeek.getTime());
    endWeek.setDate(endWeek.getDate() - endWeek.getDay() + 6);
    if(endWeek>endLicense){
      endWeek=endLicense;
    }
    this.days.forEach((day,index)=> {
      if(index>=startWeek.getDay() && index<=endWeek.getDay()){
        day.disabled = false;
      }
    }) 
  }

  private filterVendorDevices(devices: Device[]): void {
    this.models = [];
    devices.forEach((device: any) => {
      if (device.type != "PHONE") {
        const productLabel = device.version ? device.product + " - v." + device.version : device.product;
        this.models.push({
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

  setChecked(value: boolean, index: number) {
    this.edited = true;
    this.days[index].used = value;
  }

  submit(): void {
    this.isDataLoading = true;
    const requestsArray: any[] = [];
    let modifiedDays : any;
    let modifiedConsumption: any;
    if (this.edited)
      modifiedDays = this.modifyUsageDays(requestsArray);
    if (this.editedForm())
      modifiedConsumption = this.modifyConsumption(requestsArray);
    if(requestsArray.length > 0){
      forkJoin(requestsArray).subscribe(res => {
        this.isDataLoading = false;
        const resDataObject: any = res.reduce((current: any, next: any) => {
          return { ...current, ...next };
        }, {});
        if (!resDataObject.error) {
          if(!modifiedConsumption || (modifiedDays.addedDays.length > 0 && modifiedDays.deletedDays.length == 0)){
            this.snackBarService.openSnackBar('tekToken consumption successfully edited!', '');
            this.dialogRef.close(res);
          }
          if (modifiedDays.deletedDays.length > 0)
            this.deleteDays(modifiedDays);
        } else
          this.snackBarService.openSnackBar(resDataObject.error, 'Error editing license consumption!');
      });
    } else {
      if (modifiedDays.deletedDays.length > 0){
        this.deleteDays(modifiedDays);
      }
    }
  }

  private modifyConsumption(requestsArray: any[]): any {
    const licenseConsumptionObject: any = {
      consumptionId: this.data.id,
      projectId: this.updateForm.value.project.id,
      deviceId: this.updateForm.value.device.id,
      consumptionDate: this.data.consumptionDate,
      type: this.data.usageType,
      macAddress: this.data.macAddress,
      serialNumber: this.data.serialNumber
    };
    requestsArray.push(this.licenseConsumptionService.updateLicenseConsumptionDetails(licenseConsumptionObject));
    return licenseConsumptionObject;
  }

  private modifyUsageDays(requestsArray: any[]): any {
    const modifiedDays: any = {
      id: this.data.id,
      consumptionDate: this.data.consumptionDate,
      addedDays: [],
      deletedDays: []
    };
    for (let i = 0; i < this.days.length; i++) {
      if (this.days[i].used != this.originalDays[i].used) {
        if (this.days[i].used)
          modifiedDays.addedDays.push(i);
        else
          modifiedDays.deletedDays.push(this.days[i].id);
      }
    }
    if (modifiedDays.addedDays.length > 0)
      requestsArray.push(this.usageDetailService.createUsageDetails(modifiedDays));

    return modifiedDays;
  }

  deleteDays(modifiedDays: any): void {
    this.usageDetailService.deleteUsageDetails(modifiedDays).subscribe(res => {
      if(!res){
        this.snackBarService.openSnackBar('tekToken consumption successfully edited!', '');
        this.dialogRef.close([]);
      }
    });
  }

  /**
   * fetch data
   */
  fetchData(): void {
    const subaccountId = this.currentCustomer.subaccountId;
    forkJoin([
      this.deviceService.getAllDeviceVendors(),
      this.deviceService.getDeviceById(this.data.deviceId),
      this.projectService.getProjectDetailsByLicense(subaccountId, this.currentCustomer.licenseId),
      this.usageDetailService.getUsageDetailsByConsumptionId(this.data.id)
    ]).subscribe(res => {
      const resDataObject: any = res.reduce((current: any, next: any) => {
        return { ...current, ...next };
      }, {});
      this.currentCustomer.modifiedBy = resDataObject['modifiedBy'];
      this.vendors = [...new Set([...resDataObject['vendors'], ...resDataObject['supportVendors']])];
      this.projects = resDataObject['projects'];
      resDataObject['usageDays'].forEach((day) => {
        this.days[day.dayOfWeek].used = true;
        this.days[day.dayOfWeek].id = day.id;
      });
      this.originalDays = JSON.parse(JSON.stringify(this.days));
      const currentProject = this.projects.filter(project => project.id === this.data.projectId)[0];
      const currentVendor = resDataObject['devices'][0].vendor;
      const currentDevice = resDataObject['devices'][0];
      const patchValue = {...this.data};
      patchValue.project = currentProject;
      patchValue.device = currentDevice;
      patchValue.vendor = currentVendor;
      this.updateForm.patchValue(patchValue);
      this.previousFormValue = { ...this.updateForm };
      this.isDataLoading = false;
    });
  }
  /**
   * to check whether sumbit button can be disabled or not
   * @returns: true if the not updated and false otherwise 
   */
  disableSumbitBtn(): boolean {
    return !this.editedForm() && !this.edited;
  }

  displayFnProject(project: Project): string {
    return project?.projectName;
  }

  displayFnDevice(device: Device): string {
    return device?.product;
  }

  getErrorMessage(): string{
    return 'Please select a correct option';
  }
  
  isInvalid(control:string):boolean{
    return this.updateForm.controls[control].invalid;
  }

  private filterProjects(value: string): Project[] {
    const filterValue = value.toLowerCase();
    return this.projects.filter(option => option.projectName.toLowerCase().includes(filterValue));
  }

  private filterVendors(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.vendors.filter(option => option.toLowerCase().includes(filterValue));
  }

  private filterModels(value: string): Device[] {
    const filterValue = value.toLowerCase();
    return this.models.filter(option => option.product.toLowerCase().includes(filterValue));
  }


  private editedForm(): boolean {
    return JSON.stringify(this.updateForm.value) !== JSON.stringify(this.previousFormValue.value);
  }

  private nonStringValidator(control: AbstractControl) {
    const selection: any = control.value;
    if (typeof selection === 'string') {
        return { incorrect: true };
    }
    return null;
  }
}
