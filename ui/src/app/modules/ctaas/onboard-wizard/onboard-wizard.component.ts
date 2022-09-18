import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IStakeholder } from 'src/app/model/stakeholder.model';

@Component({
  selector: 'app-onboard-wizard',
  templateUrl: './onboard-wizard.component.html',
  styleUrls: ['./onboard-wizard.component.css']
})
export class OnboardWizardComponent implements OnInit {
  userInteraction: boolean = false;
  configuredReports: boolean = false;
  addAnotherStakeHolder: boolean = false;
  interaction: string;
  readonly pattern = "((\\+?)?|0)?[0-9]{10}$";
  readonly reportsNotificationsList: any = [
    { label: "Reports each time a test suite runs", value: 'every_time' },
    { label: "Daily reports", value: 'daily_reports' },
    { label: "Weekly reports", value: 'weekly_reports' },
    { label: "Monthly Summaries", value: 'monthly_reports' },
    { label: "Event Notifications", value: 'event_notifications' }
  ];
  stakeholderList: IStakeholder[] = [];
  // form group
  reportsForm: FormGroup;
  stakeholderForm: FormGroup;

  constructor(
    private router: Router,
    private formbuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.interaction = '1';
    // initialize report form
    this.initFormModel();
  }
  /**
   * initialize reactive forms model
   */
  initFormModel(): void {
    this.reportsForm = this.formbuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      jobTitle: ['', Validators.required],
      companyName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(this.pattern), Validators.required]],
      notifications: new FormArray([]),
    });
    this.stakeholderForm = this.formbuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      jobTitle: ['', Validators.required],
      companyName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      notifications: new FormArray([]),
    });
  }

  onClickBtn(value: string): void {
    switch (value) {
      case 'confirm':
        this.userInteraction = true;
        // localStorage.setItem('onboardingFlag', JSON.stringify(false));
        this.interaction = '2';
        break;
      default:
        this.userInteraction = false;
        this.interaction = '-1';
        break;
    }
  }

  onConfigureReports(): void {
    this.userInteraction = false;
    this.configuredReports = true;
    this.interaction = '3';
    console.debug('reports submit | ', this.reportsForm.value);
  }

  addStakeholdersConfirmation(value: string): void {
    switch (value) {
      case 'yes':
        this.addAnotherStakeHolder = true;
        this.interaction = '4';
        break;
      default:
        this.addAnotherStakeHolder = false;
        this.interaction = '-1';
        console.debug('stake holder list | ', this.stakeholderList);
        break;
    }
  }
  addStakeholder(): void {
    this.addAnotherStakeHolder = false;
    this.configuredReports = true;
    this.interaction = '3';
    console.debug(' add stake holder ', this.stakeholderForm.value);
    this.stakeholderList.push(this.stakeholderForm.value);
  }
  /**
   * 
   * @param event: any 
   * @param item: any 
   */
  onFormCheckboxChange(event: any, item: any): void {
    const { target: { checked } } = event;
    const { value: selectedItemValue } = item;
    const formArray: FormArray = ((this.interaction === '2') ? this.reportsForm.get('notifications') : this.stakeholderForm.get('notifications')) as FormArray;
    /* Selected */
    if (checked) {
      // Add a new control in the arrayForm
      formArray.push(new FormControl(selectedItemValue));
    } else { /* unselected */
      // find the unselected element
      formArray.controls.forEach((ctrl: FormControl, index: number) => {
        if (ctrl.value == selectedItemValue) {
          // Remove the unselected element from the arrayForm
          formArray.removeAt(index);
          return;
        }
      });
    }
  }
  hasError(event): void { }
  getNumber(value: any): void { }
  telInputObject(event: any): void { }
  onCountryChange(event: any): void { }
}
