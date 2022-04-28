import { Component, Inject, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
    consumptionDate: { disabled: true, value: ['', Validators.required] },
    projectId: ['', Validators.required],
    vendor: ['', Validators.required],
    deviceId: ['', Validators.required]
  });
  devices: any = [];
  projects: any = [];
  vendors: any = [];
  models: any = [];
  days: any = [
    {name: "Mon", used: false},
    {name: "Tue", used: false},
    {name: "Wed", used: false},
    {name: "Thu", used: false},
    {name: "Fri", used: false},
  ];
  selectedVendor: string = '';
  startDate: any;
  endDate: any;
  isDataLoading: boolean = false;
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
      this.startDate = new Date(this.data.startDate + " 00:00:00");
      this.endDate = new Date(this.data.renewalDate + " 00:00:00");
      this.currentCustomer = this.customerService.getSelectedCustomer();
      this.fetchDevices();
      this.fetchProjects();
      this.fetchUsageDays();
      this.updateForm.patchValue(this.data);
      this.previousFormValue = { ...this.updateForm };
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
            product: device.version? device.product + " - v." + device.version : device.product
          });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  setChecked(value: boolean, index: number) {
    this.days[index].used = value;
  }

  submit(): void {
    const licenseConsumptionObject: any = {
      subaccountId: this.currentCustomer.subaccountId,
      projectId: this.updateForm.value.projectId,
      deviceId: this.updateForm.value.deviceId,
      consumptionDate: this.data.consumptionDate,
      usageType: this.data.usageType,
      macAddress: this.data.macAddress,
      serialNumber: this.data.serialNumber
    };
    this.isDataLoading = true;
    this.licenseConsumptionService.updateLicenseConsumptionDetails(licenseConsumptionObject).toPromise().then((res: any) => {
      this.isDataLoading = false;
      if (!res.error) {
        this.snackBarService.openSnackBar('Added license consumption successfully!', '');
        this.dialogRef.close(res);
      } else 
        this.snackBarService.openSnackBar(res.error, 'Error adding license consumption!');
    }).catch((err: any) => {
      this.isDataLoading = false;
      this.snackBarService.openSnackBar(err, 'Error adding license consumption!');
    });
  }

  /**
   * fetch devices list
   */
  fetchDevices(): void {
    this.deviceService.getDevicesList().subscribe((res: any) => {
      this.devices = res['devices'];
      let vendorsHash: any = {};
      this.vendors = this.devices.filter(device => {
        if (device.type != "Phone" && !vendorsHash[device.vendor]) {
          vendorsHash[device.vendor] = true;
          return true;
        }
        return false;
      });
      this.filterVendorDevices(this.data.vendor);
      this.isDataLoading = false;
    });
  }
  /**
   * fetch projects list
   */
  fetchProjects(): void {
    const { subaccountId } = this.currentCustomer;
    this.projectService.getProjectDetailsBySubAccount(subaccountId).subscribe((res: any) => {
      this.projects = res['projects'];
    });
  }
  /**
   * fetch usageDays list
   */
  fetchUsageDays(): void {
    const { id } = this.data;
    this.usageDetailService.getUsageDetailDetailsByConsumptionId(id).subscribe((res: any) => {
      res['usageDays'].forEach((day) => {
        this.days[day.dayOfWeek - 1].used = true;
      });
    });
  }
  /**
   * to check whether sumbit button can be disabled or not
   * @returns: true if the not updated and false otherwise 
   */
  disableSumbitBtn(): boolean {
    return JSON.stringify(this.updateForm.value) === JSON.stringify(this.previousFormValue.value);
  }

}
