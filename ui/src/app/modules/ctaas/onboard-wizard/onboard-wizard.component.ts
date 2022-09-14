import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-onboard-wizard',
  templateUrl: './onboard-wizard.component.html',
  styleUrls: ['./onboard-wizard.component.css']
})
export class OnboardWizardComponent implements OnInit {

  constructor(private router: Router) { }
  userInteraction: boolean = false;
  configuredReports: boolean = false;
  addAnotherStakeHolder: boolean = false;
  ngOnInit(): void {
  }
  onClickBtn(value: string): void {
    switch (value) {
      case 'confirm':
        this.userInteraction = true;
        break;
      default:
        this.userInteraction = false;
        break;
    }
  }

  onConfigureReports(): void {
    this.userInteraction = false;
    this.configuredReports = true;
  }

  addStakeholdersConfirmation(value: string): void {
    switch (value) {
      case 'yes':
        this.addAnotherStakeHolder = true;
        break;
      default:
        this.addAnotherStakeHolder = false;
        break;
    }
  }
  addStakeholder(): void {
    this.addAnotherStakeHolder = false;
    this.configuredReports = true;
  }
}
