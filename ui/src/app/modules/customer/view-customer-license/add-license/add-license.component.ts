import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-license',
  templateUrl: './add-license.component.html',
  styleUrls: ['./add-license.component.css']
})
export class AddLicenseComponent implements OnInit {
  types: string[] = [
    'Small',
    'Medium',
    'Large',
    'AddOn '
  ];

  // addLicenseForm = new FormGroup({
  //   purchasedData: new FormControl('', [Validators.required]),
  //   type: new FormControl('', [Validators.required]),
  //   accessTokens: new FormControl('', [Validators.required]),
  //   tokens: new FormControl('', [Validators.required])
  // });
  addLicenseForm = this.formBuilder.group({
    purchasedDate: ['', Validators.required],
    type: ['', Validators.required],
    accessTokens: ['', Validators.required],
    tokens: ['', Validators.required],
    renewalDate: ['', Validators.required]
  });
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddLicenseComponent>
  ) {

  }

  ngOnInit() {
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  submit() {
    this.dialogRef.close();
    // TODO: Use EventEmitter with form value
    console.info(this.addLicenseForm.value);
  }
}
