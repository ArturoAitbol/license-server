import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CustomerService } from 'src/app/services/customer.service';
import { DevicesService } from 'src/app/services/devices.service';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-add-license-consumption',
  templateUrl: './add-license-consumption.component.html',
  styleUrls: ['./add-license-consumption.component.css']
})
export class AddLicenseConsumptionComponent implements OnInit, OnDestroy {
  devices: any = [];
  projects: any = [];
  vendorDetailedList: any = [
    {
      id: '1',
      'vendorName': 'Cisco',
      'models': [{ id: 1, model: 'CUCM' }],
      'versions': [{ id: 1, version: '13.2.0' }, { id: 2, version: '15.2.0' }, { id: 3, version: '16.2.0' }]
    }

  ];
  consumptionType: string[] = [
    'Automation',
    'Configuration'
  ];
  models: any = [];
  versions: any = [];
  selectedVendor: string = '';
  addLicenseConsumptionForm = this.formBuilder.group({
    dateOfUsage: ['', Validators.required],
    projectId: ['', Validators.required],
    type: ['', Validators.required],
    vendor: ['', Validators.required],
    product: ['', Validators.required],
    version: ['', Validators.required],
    macAddress: ['', Validators.required],
    serialNumber: ['', Validators.required]
  });
  currentCustomer: any;
  object: { vendor: string, product: string, version: string } = {
    vendor: '',
    product: '',
    version: ''
  };
  isDataLoading: boolean = false;
  constructor(
    private customerService: CustomerService,
    private deviceService: DevicesService,
    private projectService: ProjectService,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddLicenseConsumptionComponent>) { }
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
    this.object.product = '';
    this.object.version = '';
    if (value) {
      if (value) {
        this.object.vendor = value;
        this.getModelByVendor();
      }
    }
  }
  /**
   * trigger when user select/change model dropdown
   * @param value: string 
   */
  onChangeModel(value: string): void {
    this.addLicenseConsumptionForm.patchValue({
      version: ''
    });
    this.object.version = '';
    if (value) {
      if (value) {
        this.object.product = value;
        this.getVersionByModel();
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    this.dialogRef.close();
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
  /**
   * fetch model list by vendor
   */
  getModelByVendor(): void {
    this.isDataLoading = true;
    this.deviceService.getDevicesList(this.object).subscribe((res: any) => {
      this.models = res['devices'];
      this.isDataLoading = false;
    }, (err: any) => {
      this.isDataLoading = false;
    });
  }
  /**
   * fetch version list by model & vendor
   */
  getVersionByModel(): void {
    this.isDataLoading = true;
    this.deviceService.getDevicesList(this.object).subscribe((res: any) => {
      this.versions = res['devices'];
      this.isDataLoading = false;
    }, (err: any) => {
      this.isDataLoading = false;
    });
  }

  ngOnDestroy(): void {
    // reset form here
    this.addLicenseConsumptionForm.reset();
  }
}
