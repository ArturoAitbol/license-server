import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MsalService } from '@azure/msal-angular';
import { tekVizionServices } from 'src/app/helpers/tekvizion-services';
import { CustomerService } from 'src/app/services/customer.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubAccountService } from 'src/app/services/sub-account.service';

@Component({
  selector: 'app-add-subaccount-modal',
  templateUrl: './add-subaccount-modal.component.html',
  styleUrls: ['./add-subaccount-modal.component.css']
})
export class AddSubaccountModalComponent implements OnInit {
  addSubaccountForm = this.formBuilder.group({
    customer: ['', Validators.required],
    subaccountName: ['', Validators.required],
    subaccountAdminEmail: ['', [Validators.required, Validators.email]],
  });
  services: any = [
    {name: tekVizionServices.SpotLight, value: "UCaaS Continuous Testing", used: false},
    {name: tekVizionServices.tekTokenConstumption, value: "tekToken Consumption", used: true}
  ];
  isDataLoading = false;
  customers: any[];
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddSubaccountModalComponent>,
    private snackBarService: SnackBarService,
    private customerService: CustomerService,
    private subaccountService: SubAccountService,
    private msalService: MsalService,
  ) { }

  ngOnInit() {
    this.isDataLoading = true;
    this.customerService.getCustomerList().subscribe((res: any) => {
      this.customers = res.customers;
      this.isDataLoading = false;
    }, err => {
      this.snackBarService.openSnackBar(err.error, 'Error retrieving customers!');
      console.error('error while retrieving customers', err);
      this.isDataLoading = false;
    });
  }
  /**
   * on cancel dialog
   */
  onCancel(): void {
    this.dialogRef.close();
  }

  setChecked(value: boolean, index: number){
    this.services[index].used = value
  }

  getServices(): any{
    let actualServices = "";
    for(let i = 0; i < this.services.length; i++){
      if(this.services[i].used){
        actualServices = actualServices + this.services[i].name + ',';
      }
    }
    actualServices = actualServices.slice(0, -1);
    return actualServices
  }
  /**
   * on add customer account
   */
  addSubaccount() {
    this.isDataLoading = true;
    const subaccountDetails: any = {
      subaccountName: this.addSubaccountForm.value.subaccountName,
      customerId: this.addSubaccountForm.value.customer,
      subaccountAdminEmail: this.addSubaccountForm.value.subaccountAdminEmail
    };
    let services; 
    services = this.getServices();
    subaccountDetails.services = services;
    this.subaccountService.createSubAccount(subaccountDetails).subscribe((res: any) => {
      if (!res.error) {
        this.snackBarService.openSnackBar('Subaccount added successfully!', '');
        this.dialogRef.close(res);
      }else{
        this.snackBarService.openSnackBar(res.error, 'Error adding subaccount!');
        this.dialogRef.close(res);
        this.isDataLoading = false;
      }
    }, err => {
      this.snackBarService.openSnackBar(err.error, 'Error adding subaccount!');
      console.error('error while adding a new subaccount', err);
      this.isDataLoading = false;
    });
  }
}
