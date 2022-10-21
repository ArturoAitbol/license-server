import {Component, Inject, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Constants} from 'src/app/helpers/constants';
import {Report} from 'src/app/helpers/report';
import {AutoLogoutService} from 'src/app/services/auto-logout.service';
import {CtaasSetupService} from 'src/app/services/ctaas-setup.service';
import {SnackBarService} from 'src/app/services/snack-bar.service';
import {StakeHolderService} from 'src/app/services/stake-holder.service';
import {UserProfileService} from 'src/app/services/user-profile.service';

@Component({
    selector: 'app-onboard-wizard',
    templateUrl: './onboard-wizard.component.html',
    styleUrls: ['./onboard-wizard.component.css']
})
export class OnboardWizardComponent implements OnInit {
    userInteraction = false;
    configuredReports = false;
    addAnotherStakeHolder = false;
    interaction: string;
    readonly pattern = "/[0-9]{3}-[0-9]{3}-[0-9]{4}$/";
    reportsNotificationsList: any = [];
    errorCreatingStakeholder = false;
    isDataLoading = false;
    errorMsg = '';
    // form group
    userProfileForm: FormGroup;
    stakeholderForm: FormGroup;
    subaccountUserProfileDetails: any = {};

    ctaasSetupId: string;

    constructor(
        private userprofileService: UserProfileService,
        private stakeholderService: StakeHolderService,
        private formbuilder: FormBuilder,
        public dialogRef: MatDialogRef<OnboardWizardComponent>,
        private autoLogoutService: AutoLogoutService,
        private ctaasSetupService: CtaasSetupService,
        private snackBarService: SnackBarService,
        @Inject(MAT_DIALOG_DATA) public data: string
    ) {
        this.ctaasSetupId = data;
    }

    /**
     * fetch user profile details
     */
    fetchUserProfileDetails(): void {
        const subaccountUserProfileDetails = this.userprofileService.getSubaccountUserProfileDetails();
        const {companyName, email, jobTitle, phoneNumber, name, subaccountId} = subaccountUserProfileDetails;
        const parsedObj = {companyName, email, jobTitle, phoneNumber, name, subaccountId};
        this.userProfileForm.patchValue(parsedObj);
        this.subaccountUserProfileDetails = parsedObj;
    }

    ngOnInit(): void {
        this.reportsNotificationsList = [
            {label: "Daily Reports", value: Report.DAILY_REPORTS},
            {label: "Weekly Reports", value: Report.WEEKLY_REPORTS},
            {label: "Monthly Summaries", value: Report.MONTHLY_REPORTS}
        ];
        this.interaction = '1';
        // initialize report form
        this.initFormModel();
        this.fetchUserProfileDetails();
    }

    /**
     * initialize reactive forms model
     */
    initFormModel(): void {
        // report form
        this.userProfileForm = this.formbuilder.group({
            name: ['', Validators.required],
            jobTitle: ['', Validators.required],
            companyName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phoneNumber: ['', [Validators.required, Validators.pattern(Constants.PHONE_NUMBER_PATTERN), Validators.minLength(10), Validators.maxLength(15)]],
            type: ['', Validators.required],
            notifications: new FormArray([]),
        });
        // add stake holder form
        this.stakeholderForm = this.formbuilder.group({
            name: ['', Validators.required],
            jobTitle: ['', Validators.required],
            companyName: ['', Validators.required],
            subaccountAdminEmail: ['', [Validators.required, Validators.email]],
            phoneNumber: ['', [Validators.required, Validators.pattern(Constants.PHONE_NUMBER_PATTERN), Validators.minLength(10), Validators.maxLength(15)]],
            type: ['', Validators.required],
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
                this.autoLogoutService.logout();
                break;
        }
    }

    /**
     * configure user profile details
     */
    onConfigureUserprofile(): void {
        this.userInteraction = false;
        this.configuredReports = true;
        this.interaction = '3';
        const userProfileObj = this.userProfileForm.value;
        const {type, notifications} = userProfileObj;
        // userProfileObj.notifications = type;
        if (notifications.length > 0) {
            userProfileObj.notifications = type + ',' + notifications.join(',');
        } else {
            userProfileObj.notifications = type;
        }
        this.userprofileService.updateUserProfile(userProfileObj)
            .subscribe((response: any) => {
                if (response?.error) {
                    this.snackBarService.openSnackBar('Error updating User profile details !', '');
                } else {
                    this.updateOnboardingStatus();
                }
            });
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
                this.onCancel('closed');
                break;
        }
    }

    /**
     * add stake holder details to a list
     */
    addStakeholder(): void {
        this.errorCreatingStakeholder = false;
        this.addAnotherStakeHolder = false;
        this.configuredReports = true;
        this.isDataLoading = true;
        const requestPayload = this.stakeholderForm.value;
        let {type, notifications} = requestPayload;
        const {subaccountId} = this.subaccountUserProfileDetails;
        requestPayload.subaccountId = subaccountId;
        // requestPayload.notifications = type
        notifications = notifications.filter((e: string) => e !== null && e !== undefined);
        if (notifications.length > 0) {
            requestPayload.notifications = type + ',' + notifications.join(',');
        } else {
            requestPayload.notifications = type;
        }
        this.stakeholderService.createStakeholder(requestPayload).subscribe((response: any) => {
            this.isDataLoading = false;
            if (response) {
                const {error} = response;
                if (error) {
                    this.errorCreatingStakeholder = true;
                } else {
                    this.interaction = '3';
                }
            } else {
                this.interaction = '3';
            }
        });
    }

    /**
     *
     * @param event: any
     * @param item: any
     */
    onFormCheckboxChange(event: any, item: any): void {
        const {target: {checked}} = event;
        const {value: selectedItemValue} = item;
        const formArray: FormArray = ((this.interaction === '2') ? this.userProfileForm.get('notifications') : this.stakeholderForm.get('notifications')) as FormArray;
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

    /**
     * on cancel dialog
     */
    onCancel(type?: string): void {
        this.dialogRef.close(type);
    }

    /**
     * update spotlight onboarding details
     */
    updateOnboardingStatus(): void {
        const requestPayload = {onBoardingComplete: true, ctaasSetupId: this.ctaasSetupId};
        this.ctaasSetupService.updateSubaccountCtaasDetails(requestPayload)
            .subscribe((response: any) => {
                if (response?.error) {
                    this.snackBarService.openSnackBar('Error updating the onboarding status !', '');
                }
            });
    }
}
