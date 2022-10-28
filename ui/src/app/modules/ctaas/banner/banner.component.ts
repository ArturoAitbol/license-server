import { Component, Input, OnInit } from '@angular/core';
import { SubAccountService } from '../../../services/sub-account.service'

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent implements OnInit {

  getLoginUserDetails:any = {};
  @Input() stylesflag:any;

  constructor(private subaccountservice: SubAccountService) {}

  ngOnInit(): void {
    this.getLoginUserDetails = this.subaccountservice.getSelectedSubAccount();
  }

}