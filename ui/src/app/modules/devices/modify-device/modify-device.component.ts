import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Device } from 'src/app/model/device.model';
import { DevicesService } from 'src/app/services/devices.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

@Component({
  selector: 'app-modify-device',
  templateUrl: './modify-device.component.html',
  styleUrls: ['./modify-device.component.css']
})
export class ModifyDeviceComponent implements OnInit {

  deviceTypes: any[] = [];
  vendors: any[] = []
  private previousFormValue: any;

  readonly granularities: string[] = [
    'Day',
    'Week',
    'Month',
    'Static'
  ];

  modifyDeviceForm = this.formBuilder.group({
    startDate: ['', Validators.required],
    deprecatedDate: [''],
    type: ['', Validators.required],
    vendor: ['', Validators.required],
    product: ['', Validators.required], // name
    version: ['', Validators.required],
    granularity: ['', Validators.required],
    tokensToConsume: ['', Validators.required],
    supportType: [false],
  });

  startDateMax: Date = null;
  deprecatedDateMin: Date = null;
  isDataLoading = false;


  constructor(
    private formBuilder: FormBuilder,
    private devicesService: DevicesService,
    private snackBarService: SnackBarService,
    public dialogRef: MatDialogRef<ModifyDeviceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    if (this.data) {
      this.isDataLoading = true;
      this.data.granularity = this.data.granularity.charAt(0).toUpperCase() + this.data.granularity.slice(1);
      this.onStartDateChange(this.data.startDate);
      if (this.data.deprecatedDate != "infinity")
        this.onRenewalDateChange(this.data.deprecatedDate);
      this.modifyDeviceForm.patchValue(this.data);
      this.fetchData();
      this.previousFormValue = { ...this.modifyDeviceForm.getRawValue() };
    }
  }

  fetchData(): void {
    this.devicesService.getDevicesTypesList().subscribe((res: any) => {
      this.deviceTypes = res.deviceTypes;
      this.onChangeDeviceType(this.data.type);
      this.isDataLoading = false;
    });
  }

  onChangeDeviceType(value: any) {
    this.isDataLoading = true;
    this.devicesService.getAllDeviceVendors(value).subscribe((res: any) => {
      this.vendors = res.vendors;
      this.isDataLoading = false;
    });
  }

  submit(): void {
    this.isDataLoading = true;
    this.modifyDeviceForm.value.granularity = this.modifyDeviceForm.value.granularity.toLowerCase();
    this.modifyDeviceForm.value.supportType = this.modifyDeviceForm.value.supportType.toString();
    if (!this.modifyDeviceForm.value.deprecatedDate)
      this.modifyDeviceForm.value.deprecatedDate = "infinity";
    const mergedDeviceObject = { ... this.data, ...this.modifyDeviceForm.value };
    this.devicesService.updateDevice(mergedDeviceObject).subscribe((res: any) => {
      if (!res.error) {
        this.snackBarService.openSnackBar('Device updated successfully!', '');
        this.isDataLoading = false;
        this.dialogRef.close(res);
      } else {
        this.snackBarService.openSnackBar(res.error, 'Error updating Device!');
        this.isDataLoading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onStartDateChange(value) {
    const minDate = new Date(value);
    minDate.setDate(minDate.getDate() + 1);
    this.deprecatedDateMin = minDate;
  }

  onRenewalDateChange(value) {
    if (value) {
      const maxDate = new Date(value);
      maxDate.setDate(maxDate.getDate() - 1);
      this.startDateMax = maxDate;
    }
  }

  disableSumbitBtn(): boolean {
    return JSON.stringify(this.modifyDeviceForm.getRawValue()) === JSON.stringify(this.previousFormValue);
  }
}