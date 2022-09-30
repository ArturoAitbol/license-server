import { Component, Input, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent implements OnInit {

  customerDetails:any = {};
  @Input() stylesflag:any;

  constructor(private msalService: MsalService,) { }

  ngOnInit(): void {
    this.customerDetails = JSON.parse(localStorage.getItem("selectedSubAccount"));
  }

}
