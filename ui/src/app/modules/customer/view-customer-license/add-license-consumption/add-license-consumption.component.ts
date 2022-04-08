import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LicenseUsage } from 'src/app/model/license-usage.model';
import { CustomerService } from 'src/app/services/customer.service';
import { DevicesService } from 'src/app/services/devices.service';
import { LicenseUsageService } from 'src/app/services/license-usage.service';
import { ProjectService } from 'src/app/services/project.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

@Component({
  selector: 'app-add-license-consumption',
  templateUrl: './add-license-consumption.component.html',
  styleUrls: ['./add-license-consumption.component.css']
})
export class AddLicenseConsumptionComponent implements OnInit, OnDestroy {
  devices: any = [];
  projects: any = [];
  vendors: any = [];
  models: any = [];
  versions: any = [];
  selectedVendor: string = '';
  addLicenseConsumptionForm = this.formBuilder.group({
    dateOfUsage: ['', Validators.required],
    projectId: ['', Validators.required],
    vendor: [''],
    product: ['']
  });
  currentCustomer: any;
  isDataLoading: boolean = false;

  constructor(
    private customerService: CustomerService,
    private deviceService: DevicesService,
    private projectService: ProjectService,
    private licenseUsageService: LicenseUsageService,
    private snackBarService: SnackBarService,
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
    this.addLicenseConsumptionForm.patchValue({ product: '' });
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

  submit(): void {
    const deviceId = this.data? this.data.id : this.addLicenseConsumptionForm.value.product;
    const licenseConsumptionObject: any = {
      subaccountId: this.currentCustomer.subaccountId,
      projectId: this.addLicenseConsumptionForm.value.projectId,
      deviceId: deviceId,
      usageDate: this.addLicenseConsumptionForm.value.dateOfUsage,
      serialNumber: '',
      macAddress: '',
      usageType: "Configuration"
    };
    this.licenseUsageService.addLicenseUsageDetails(licenseConsumptionObject).toPromise().then((res: any) => {
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
      // automatically select device data if adding license consumption from devices list
      if (this.data) {
        this.addLicenseConsumptionForm.patchValue({ 
          vendor: this.data.vendor,
          product: this.data.id
        });
      }
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
