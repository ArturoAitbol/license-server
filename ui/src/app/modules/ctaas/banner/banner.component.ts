import { Component, Input, OnInit } from '@angular/core';
import { SubAccountService } from '../../../services/sub-account.service'

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent implements OnInit {

  subaccountDetails: any = {};
  @Input() stylesflag: any;

  isCustomerNameAndSubaccountNameIsSame: boolean = false;
  constructor(private subaccountservice: SubAccountService) { }

  ngOnInit(): void {
    this.subaccountDetails = this.subaccountservice.getSelectedSubAccount();
    this.isCustomerNameAndSubaccountNameIsSame = (this.subaccountDetails.customerName !== this.subaccountDetails.name);
    this.subaccountservice.subaccountData.subscribe(subaccountResp => {
      this.subaccountDetails = subaccountResp;
      this.isCustomerNameAndSubaccountNameIsSame = (this.subaccountDetails.customerName !== this.subaccountDetails.name);
    });
  }
}
