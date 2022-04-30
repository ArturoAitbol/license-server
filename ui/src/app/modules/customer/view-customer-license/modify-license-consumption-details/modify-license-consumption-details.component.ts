import { Component, Inject, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
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
    projectId: ['', Validators.required],
    vendor: ['', Validators.required],
    deviceId: ['', Validators.required]
  });
  devices: any = [];
  projects: any = [];
  vendors: any = [];
  models: any = [];
  originalDays: any = [];
  days: any = [
    { name: "Mon", used: false },
    { name: "Tue", used: false },
    { name: "Wed", used: false },
    { name: "Thu", used: false },
    { name: "Fri", used: false },
  ];
  selectedVendor: string = '';
  startDate: any;
  endDate: any;
  isDataLoading: boolean = false;
  edited: boolean = false;
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
      this.data.consDate = new Date(this.data.consumptionDate + " 00:00:00");
      this.currentCustomer = this.customerService.getSelectedCustomer();
      this.fetchData();
    }
  }
  /**
   * trigger when user select/change vendor dropdown
   * @param value: string 
   */
  onChangeVendor(value: string): void {
    this.updateForm.patchValue({ deviceId: '' });
    this.filterVendorDevices(value);
  }

  private filterVendorDevices(value: string): void {
    this.models = [];
    if (value) {
      this.devices.forEach((device: any) => {
        if (device.type != "Phone" && device.vendor == value) {
          this.models.push({
            id: device.id,
            product: device.version ? device.product + " - v." + device.version : device.product
          });
        }
      });
    }
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
    let requestsArray: any[] = [];
    if (this.edited)
      this.modifyUsageDays(requestsArray);
    if (this.editedForm())
      this.modifyConsumption(requestsArray);
    forkJoin(requestsArray).subscribe(res => {
      this.isDataLoading = false;
      const resDataObject: any = res.reduce((current: any, next: any) => {
        return { ...current, ...next };
      }, {});
      if (!resDataObject.error) {
        this.snackBarService.openSnackBar('License consumption successfully edited!', '');
        this.dialogRef.close(res);
      } else
        this.snackBarService.openSnackBar(resDataObject.error, 'Error editing license consumption!');
    });
  }

  private modifyConsumption(requestsArray: any[]): void {
    const licenseConsumptionObject: any = {
      consumptionId: this.data.id,
      subaccountId: this.currentCustomer.subaccountId,
      projectId: this.updateForm.value.projectId,
      deviceId: this.updateForm.value.deviceId,
      consumptionDate: this.data.consumptionDate,
      usageType: this.data.usageType,
      macAddress: this.data.macAddress,
      serialNumber: this.data.serialNumber
    };
    requestsArray.push(this.licenseConsumptionService.updateLicenseConsumptionDetails(licenseConsumptionObject));
  }

  private modifyUsageDays(requestsArray: any[]): void {
    let modifiedDays: any = {
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
    if (modifiedDays.deletedDays.length > 0)
      requestsArray.push(this.usageDetailService.deleteUsageDetails(modifiedDays));
  }

  /**
   * fetch data
   */
  fetchData(): void {
    this.isDataLoading = true;
    const { subaccountId } = this.currentCustomer;
    const { id } = this.data;
    forkJoin([
      this.deviceService.getDevicesList(),
      this.projectService.getProjectDetailsBySubAccount(subaccountId),
      this.usageDetailService.getUsageDetailsByConsumptionId(id)
    ]).subscribe(res => {
      const resDataObject: any = res.reduce((current: any, next: any) => {
        return { ...current, ...next };
      }, {});
      this.devices = resDataObject['devices'];
      let vendorsHash: any = {};
      this.vendors = this.devices.filter(device => {
        if (device.type != "Phone" && !vendorsHash[device.vendor]) {
          vendorsHash[device.vendor] = true;
          return true;
        }
        return false;
      });
      this.projects = resDataObject['projects'];
      resDataObject['usageDays'].forEach((day) => {
        this.days[day.dayOfWeek - 1].used = true;
        this.days[day.dayOfWeek - 1].id = day.id;
      });
      this.originalDays = JSON.parse(JSON.stringify(this.days));
      this.updateForm.patchValue(this.data);
      this.previousFormValue = { ...this.updateForm };
      this.filterVendorDevices(this.data.vendor);
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

  private editedForm(): boolean {
    return JSON.stringify(this.updateForm.value) !== JSON.stringify(this.previousFormValue.value);
  }
}
