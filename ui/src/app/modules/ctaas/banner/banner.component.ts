import { Component, Input, OnInit } from '@angular/core';
import { SubAccountService } from '../../../services/sub-account.service'

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent implements OnInit {

  cutomerDetails: any = {};
  @Input() stylesflag: any;

  isCustomerNameAndSubaccountNameIsSame: boolean = false;
  constructor(private subaccountservice: SubAccountService) { }

  ngOnInit(): void {
    this.cutomerDetails = this.subaccountservice.getSelectedSubAccount();
    this.isCustomerNameAndSubaccountNameIsSame = (this.cutomerDetails.customerName !== this.cutomerDetails.name);
    this.subaccountservice.subaccountData.subscribe(subaccountResp => {
      this.cutomerDetails = subaccountResp
      this.isCustomerNameAndSubaccountNameIsSame = (this.cutomerDetails.customerName !== this.cutomerDetails.name);
    });
  }
}
