import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { DevicesService } from 'src/app/services/devices.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { Device } from 'src/app/model/device.model';

@Component({
  selector: 'app-add-device',
  templateUrl: './add-device.component.html',
  styleUrls: ['./add-device.component.css']
})
export class AddDeviceComponent implements OnInit {

  deviceTypes: any[] = [];
  vendors: any[] = []

  readonly granularities: string[] = [
    'Day',
    'Week',
    'Month',
    'Static'
  ];

  addDeviceForm = this.formBuilder.group({
    startDate: ['', Validators.required],
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
    public dialogRef: MatDialogRef<AddDeviceComponent>
  ) { }

  ngOnInit(): void {
    this.isDataLoading = true;
    this.fetchData();
  }

  fetchData(): void {
    this.devicesService.getDevicesTypesList().subscribe((res: any) => {
      this.deviceTypes = res.deviceTypes;
      this.addDeviceForm.controls['vendor'].disable();
      this.addDeviceForm.patchValue({ vendor: '' });
      this.isDataLoading = false;
    });
  }

  onChangeDeviceType(value: any) {
    this.isDataLoading = true;
    this.devicesService.getAllDeviceVendors(value).subscribe((res: any) => {
      this.vendors = res.vendors;
      this.addDeviceForm.patchValue({ vendor: '' });
      this.addDeviceForm.controls['vendor'].enable();
      this.isDataLoading = false;
    });
  }

  submit(): void {
    this.isDataLoading = true;
    const deviceObject: Device | any = {
      startDate: this.addDeviceForm.value.startDate,
      // deprecatedDate: this.addDeviceForm.value.deprecatedDate,
      type: this.addDeviceForm.value.type,
      vendor: this.addDeviceForm.value.vendor,
      product: this.addDeviceForm.value.product,
      version: this.addDeviceForm.value.version,
      granularity: this.addDeviceForm.value.granularity.toLowerCase(),
      tokensToConsume: this.addDeviceForm.value.tokensToConsume,
      supportType: this.addDeviceForm.value.supportType.toString(),
    };

    this.devicesService.createDevice(deviceObject).subscribe((res: any) => {
      if (!res.error) {
        this.snackBarService.openSnackBar('Device added successfully!', '');
        this.isDataLoading = false;
        this.dialogRef.close(res);
      } else {
        this.snackBarService.openSnackBar(res.error, 'Error adding Device!');
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
    const maxDate = new Date(value);
    maxDate.setDate(maxDate.getDate() - 1);
    this.startDateMax = maxDate;
  }

}