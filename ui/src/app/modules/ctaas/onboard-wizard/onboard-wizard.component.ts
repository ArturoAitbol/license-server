import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
  reportsNotificationsList: any = [];
  stakeholderList: IStakeholder[] = [];
  // form group
  reportsForm: FormGroup;
  stakeholderForm: FormGroup;

  constructor(
    private formbuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.reportsNotificationsList = [
      { label: "Reports each time a test suite runs", value: 'every_time' },
      { label: "Daily reports", value: 'daily_reports' },
      { label: "Weekly reports", value: 'weekly_reports' },
      { label: "Monthly Summaries", value: 'monthly_reports' },
      { label: "Event Notifications", value: 'event_notifications' }
    ];
    this.interaction = '1';
    // initialize report form
    this.initFormModel();
  }
  /**
   * initialize reactive forms model
   */
  initFormModel(): void {
    // report form
    this.reportsForm = this.formbuilder.group({
      name: ['', Validators.required],
      jobTitle: ['', Validators.required],
      companyName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(this.pattern), Validators.required]],
      notifications: new FormArray([]),
    });
    // add stake holder form
    this.stakeholderForm = this.formbuilder.group({
      name: ['', Validators.required],
      jobTitle: ['', Validators.required],
      companyName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      notifications: new FormArray([]),
    });
  }
  /**
   * on accept onboarding flow
   * @param value: string 
   */
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
  }
  /**
   * add stake holder confirmation
   * @param value: string 
   */
  addStakeholdersConfirmation(value: string): void {
    switch (value) {
      case 'yes':
        this.addAnotherStakeHolder = true;
        this.interaction = '4';
        this.stakeholderForm.reset();
        break;
      default:
        this.addAnotherStakeHolder = false;
        this.interaction = '-1';
        console.debug('stake holder list | ', this.stakeholderList);
        break;
    }
  }
  /**
   * add stake holder details to a list
   */
  addStakeholder(): void {
    this.addAnotherStakeHolder = false;
    this.configuredReports = true;
    this.interaction = '3';
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
}
