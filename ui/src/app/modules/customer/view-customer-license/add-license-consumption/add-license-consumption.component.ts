import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LicenseUsage } from 'src/app/model/license-usage.model';
import { CustomerService } from 'src/app/services/customer.service';
import { DevicesService } from 'src/app/services/devices.service';
import { LicenseUsageService } from 'src/app/services/license-usage.service';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-add-license-consumption',
  templateUrl: './add-license-consumption.component.html',
  styleUrls: ['./add-license-consumption.component.css']
})
export class AddLicenseConsumptionComponent implements OnInit, OnDestroy {
  devices: any = [];
  projects: any = [];
  models: any = [];
  versions: any = [];
  selectedVendor: string = '';
  consumptionType: string[] = [
    'Configuration',
    'AutomationPlatform'
  ];
  addLicenseConsumptionForm = this.formBuilder.group({
    dateOfUsage: ['', Validators.required],
    projectId: ['', Validators.required],
    type: ['', Validators.required],
    vendor: [''],
    product: [''],
    version: [''],
    macAddress: ['', Validators.required],
    serialNumber: ['', Validators.required]
  });
  currentCustomer: any;
  isDataLoading: boolean = false;

  constructor(
    private customerService: CustomerService,
    private deviceService: DevicesService,
    private projectService: ProjectService,
    private licenseUsageService: LicenseUsageService,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddLicenseConsumptionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.currentCustomer = this.customerService.getSelectedCustomer();
    this.fetchDevices();
    this.fetchProjects();
  }
  /**
   * trigger when user select/change vendor dropdown
   * @param value: string 
   */
  onChangeVendor(value: string): void {
    this.addLicenseConsumptionForm.patchValue({
      product: '',
      version: ''
    });
    this.versions = [];
    if (value) 
      this.models = this.devices.filter((device: any) => device.vendor == value);
    else this.models = [];
  }
  /**
   * trigger when user select/change model dropdown
   * @param value: string 
   */
  onChangeModel(value: string): void {
    this.addLicenseConsumptionForm.patchValue({
      version: ''
    });
    if (value)
      this.versions = this.devices.filter((device: any) => device.product == value);
    else this.versions = [];
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    const deviceId = this.data? this.data.id : this.addLicenseConsumptionForm.value.version;
    const licenseConsumptionObject: any = {
      subaccountId: this.currentCustomer.subaccountId,
      projectId: this.addLicenseConsumptionForm.value.projectId,
      deviceId: deviceId,
      usageDate: this.addLicenseConsumptionForm.value.dateOfUsage,
      serialNumber: this.addLicenseConsumptionForm.value.serialNumber,
      macAddress: this.addLicenseConsumptionForm.value.macAddress,
      usageType: this.addLicenseConsumptionForm.value.type
    };
    this.licenseUsageService.addLicenseUsageDetails(licenseConsumptionObject).subscribe((res: any) => {
      console.debug(res);
      this.dialogRef.close(res);
    });
  }

  /**
   * fetch devices list
   */
  fetchDevices(): void {
    this.deviceService.getDevicesList().subscribe((res: any) => {
      this.devices = res['devices'];
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

  ngOnDestroy(): void {
    // reset form here
    this.addLicenseConsumptionForm.reset();
  }
}
