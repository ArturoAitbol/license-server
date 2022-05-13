import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LicenseConsumption } from 'src/app/model/license-consumption.model';
import { CustomerService } from 'src/app/services/customer.service';
import { DevicesService } from 'src/app/services/devices.service';
import { LicenseConsumptionService } from 'src/app/services/license-consumption.service';
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
  addLicenseConsumptionForm = this.formBuilder.group({
    consumptionDate: ['', Validators.required],
    projectId: ['', Validators.required],
    vendor: ['', Validators.required],
    product: ['', Validators.required]
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
    public dialogRef: MatDialogRef<AddLicenseConsumptionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.startDate = new Date(this.data.startDate + " 00:00:00");
    this.endDate = new Date(this.data.renewalDate + " 00:00:00");
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

  pickConsumptionDate(newDateSelection: Date) {
    let startOfWeek: Date = new Date(newDateSelection);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
    this.addLicenseConsumptionForm.patchValue({ consumptionDate: startOfWeek });
  }

  setChecked(value: boolean, index: number) {
    this.days[index].used = value;
  }

  submit(): void {
    let consumptionDate: Date = new Date(this.addLicenseConsumptionForm.value.consumptionDate);
    const licenseConsumptionObject: any = {
      subaccountId: this.currentCustomer.id,
      projectId: this.addLicenseConsumptionForm.value.projectId,
      deviceId: this.addLicenseConsumptionForm.value.product,
      consumptionDate: consumptionDate.toISOString().split("T")[0],
      usageType: "Configuration",
      macAddress: "",
      serialNumber: "",
      usageDays: []
    };
    for (let i = 0; i < this.days.length; i++) {
      if (this.days[i].used)
        licenseConsumptionObject.usageDays.push(i);
    }
    this.isDataLoading = true;
    this.licenseConsumptionService.addLicenseConsumptionDetails(licenseConsumptionObject).toPromise().then((res: any) => {
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
    });
  }
  /**
   * fetch projects list
   */
  fetchProjects(): void {
    const subaccountId = this.currentCustomer.id;
    this.projectService.getProjectDetailsBySubAccount(subaccountId, 'Open').subscribe((res: any) => {
      this.projects = res['projects'];
    });
  }

  ngOnDestroy(): void {
    // reset form here
    this.addLicenseConsumptionForm.reset();
  }
}
