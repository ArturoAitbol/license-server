import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CustomerOnboardService } from 'src/app/services/customer-onboard.service';
import { HeaderService } from 'src/app/services/header.service';
import { OnboardWizardComponent } from '../onboard-wizard/onboard-wizard.component';

@Component({
  selector: 'app-ctaas-dashboard',
  templateUrl: './ctaas-dashboard.component.html',
  styleUrls: ['./ctaas-dashboard.component.css']
})
export class CtaasDashboardComponent implements OnInit {

  onboardStatus = '';
  constructor(
    private headerService: HeaderService,
    private customerOnboardService: CustomerOnboardService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.headerService.onChangeService({ hideToolbar: false, tabName: 'CTaaS', transparentToolbar: false });
    this.getCustomerOnboardDetails();
  }
  /**
   * get customer onboarding details,
   * status is hard-coded as 'pending'
   */
  getCustomerOnboardDetails(): void {
    this.onboardStatus = this.customerOnboardService.fetchCustomerOnboardingDetails('');
    // if (this.onboardStatus === 'pending') {
    //   setTimeout(() => {
    //     this.dialog.open(OnboardWizardComponent, { width: '700px', height: '500px', disableClose: true });
    //   }, 2000);
    // }
  }
}
