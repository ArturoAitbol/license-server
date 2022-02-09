import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-license-consumption',
  templateUrl: './add-license-consumption.component.html',
  styleUrls: ['./add-license-consumption.component.css']
})
export class AddLicenseConsumptionComponent implements OnInit {
  vendorDetailedList: any = [
    {
      id: '1',
      'vendorName': 'Cisco',
      'models': [{ id: 1, model: 'CUCM' }],
      'versions': [{ id: 1, version: '13.2.0' }, { id: 2, version: '15.2.0' }, { id: 3, version: '16.2.0' }]
    }

  ];
  models: any = [];
  versions: any = [];
  selectedVendor: string = '';
  addLicenseConsumptionForm = this.formBuilder.group({
    dateOfUse: ['', Validators.required],
    vendor: ['', Validators.required],
    model: ['', Validators.required],
    version: ['', Validators.required],
    macAddress: ['', Validators.required]
  });
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddLicenseConsumptionComponent>) { }

  ngOnInit() {
  }
  onChangeVendor(value: string): void {
    console.log('onChangeVendor: ', value);
    if (value) {
      const selectedVendorDetails = this.vendorDetailedList.find(x => x.id == value);
      if (selectedVendorDetails)
        this.models = (selectedVendorDetails.models) ? selectedVendorDetails.models : [];
      this.versions = (selectedVendorDetails.versions) ? selectedVendorDetails.versions : [];
    }

  }
  onCancel(): void {
    this.dialogRef.close();
  }
  submit(): void {
    this.dialogRef.close();

    // TODO: Use EventEmitter with form value
    console.info(this.addLicenseConsumptionForm.value);
  }

}
