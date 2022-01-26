import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ImageService } from 'src/app/services/image-service.service';

import { ToastrService } from 'ngx-toastr';
import { Email } from '../../../../model/email';
import { EmailService } from '../../../../services/email.service';
import { Utility } from '../../../../helpers/Utility';
import { Role } from 'src/app/helpers/role';
import { DateTimeFormatService } from '../../../../services/date-time-format.service';


@Component({
    selector: 'settings-tab',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
    _enableEmailNotification: boolean;
    _enableBranding: boolean;
    currentLogo: File = null;
    currentIcon: File = null;
    emailServiceDataObj: any = {};
    emailConfigurationObj: Email = new Email();
    @ViewChild('logoInput', { static: false }) logoInput: ElementRef;
    @ViewChild('iconInput', { static: false }) iconInput: ElementRef;

    dateTimeFormatList: string[];
    selectedDateFormat: string;
    timeZoneList: any = [];
    selectedTimeZone: string;
    readonly refreshIntervalCounterInMS = 2000;
    constructor(private imageService: ImageService,
        private emailConfigService: EmailService,
        private toastService: ToastrService,
        private dateTimeFormatService: DateTimeFormatService,
        private cdRef: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.timeZoneList = this.dateTimeFormatService.timeZonesList;
        this.selectedDateFormat = '';
        const currentPermissions: [string] = JSON.parse(localStorage.getItem('currentUser')).roles;
        // tslint:disable-next-line: max-line-length
        if (currentPermissions.includes(Role[2]) && (currentPermissions.includes(Role[3]) || currentPermissions.includes(Role[4]))) {
            this._enableEmailNotification = currentPermissions.includes(Role[3]);
            this._enableBranding = currentPermissions.includes(Role[4]);
        } else if (currentPermissions.includes(Role[0]) || currentPermissions.includes(Role[1])) {
            this._enableBranding = this._enableEmailNotification = true;
        }
        this.fetchEmailConfigurationDetails();
        this.getDateTimeList();
    }

    /**
     * check whether the user has that role or not
     * @param event: any
     * @return boolean
     */
    canOpenFileDialog = (event: any) => {
        if (Utility.userEnabled('ROLE_APP_BRANDING')) {
            return true;
        }
        event.preventDefault();
        event.stopPropagation();
        this.toastService.warning('User doesn\'t have permissions to execute this action', 'Warning');
        return false;
    };

    setLogo(files: any) {
        this.currentLogo = files.item(0);
    }

    setIcon(files: any) {
        this.currentIcon = files.item(0);
    }

    clearLogo() {
        this.logoInput.nativeElement.value = '';
        this.currentLogo = null;
    }

    clearIcon() {
        this.iconInput.nativeElement.value = '';
        this.currentIcon = null;
    }

    uploadLogo() {
        this.imageService.uploadImage(this.currentLogo).subscribe((response: any) => {
            if (!response.success) {
                this.toastService.error('Error uploading logo image: ' + response.response.message, 'Error');
                setTimeout(() => {
                    location.reload(true);
                    // window.location.href = window.location.href;
                    // this.cdRef.detectChanges();
                }, this.refreshIntervalCounterInMS);
            } else {
                this.toastService.success('Image uploaded successfully', 'Success');
                // location.reload(true);
                setTimeout(() => {
                    location.reload(true);
                    // window.location.href = window.location.href;
                    // this.cdRef.detectChanges();
                }, this.refreshIntervalCounterInMS);
                this.clearLogo();
            }
        });
    }

    uploadIcon() {
        this.imageService.uploadIcon(this.currentIcon).subscribe((response: any) => {
            if (!response.success) {
                this.toastService.error('Error uploading icon image: ' + response.response.message);
                setTimeout(() => {
                    location.reload(true);
                    // window.location.href = window.location.href;
                    // this.cdRef.detectChanges();
                }, this.refreshIntervalCounterInMS);
            } else {
                this.toastService.success('Icon uploaded successfully', 'Success');
                setTimeout(() => {
                    location.reload(true);
                    // window.location.href = window.location.href;
                    // this.cdRef.detectChanges();
                }, this.refreshIntervalCounterInMS);
                this.clearIcon();
            }
        });
    }

    /**
     * to listen for the checkbox changes
     * @param isChecked:boolean
     */
    onChangeAuthentication(isChecked: boolean): void {
        this.emailConfigurationObj.authentication = isChecked;
        if (!isChecked) {
            this.emailConfigurationObj.userName = null;
            this.emailConfigurationObj.password = null;
        }
    }

    /**
     * on save email configuration
     */
    onSave(): void {
        if (Utility.userEnabled('ROLE_APP_EMAILCONFIGURATION')) {
            this.emailConfigService.addEmailConfiguration(this.emailConfigurationObj).subscribe((response: any) => {
                if (!response.success) {
                    this.toastService.error('Error while configuring email: ' + response.response.message);
                } else {
                    this.toastService.success('Email configuration is added successfully', 'Success');
                }
            });
        } else {
            this.toastService.warning('User doesn\'t have permissions to execute this action', 'Warning');
        }
    }

    /**
     * fetch the email configuration details
     */
    fetchEmailConfigurationDetails(): void {
        this.emailConfigService.getEmailConfigurationDetails().subscribe((response: any) => {
            if (response.success) {
                this.emailServiceDataObj = response.response.EmailConfig;
                this.emailConfigurationObj = this.emailServiceDataObj;
            }
        });
    }

    /**
     * service call to reset the brand logo
     */
    onResetLogo(): void {
        if (Utility.userEnabled('ROLE_APP_BRANDING')) {
            this.imageService.resetLogo().subscribe((response: any) => {
                if (!response.success) {
                    this.toastService.error('Error : ' + response.response.message, 'Error');
                } else {
                    this.toastService.success('Reset Logo successfully', 'Success');
                    // location.reload(true);
                    setTimeout(() => {                       
                        location.reload(true);
                        // this.cdRef.detectChanges();
                        // window.location.href = window.location.href;
                    }, this.refreshIntervalCounterInMS);

                }
            });
        }
    }

    /**
     * service call to reset the fav icon
     */
    onResetIcon(): void {
        if (Utility.userEnabled('ROLE_APP_BRANDING')) {
            this.imageService.resetIcon().subscribe((response: any) => {
                if (!response.success) {
                    this.toastService.error('Error : ' + response.response.message, 'Error');
                } else {
                    this.toastService.success('Reset Icon successfully', 'Success');
                    // location.reload(true);
                    setTimeout(() => {
                        location.reload(true);
                        // this.cdRef.detectChanges();
                        // window.location.href = window.location.href;
                    }, this.refreshIntervalCounterInMS);

                }
            });
        }
    }

    /***
     * get all date-time format list
     */
    getDateTimeList(): void {
        this.dateTimeFormatService.fetchAllDateTimeFormats().subscribe((response: any) => {
            if (!response.success) {
                this.toastService.error('Error : ' + response.response.message, 'Error');
            } else {
                const responseData = response.response.dateTimeFormat;
                this.dateTimeFormatList = responseData.formatTypeList;
                this.selectedDateFormat = (responseData.dateFormat) ? responseData.dateFormat : '';
                this.selectedTimeZone = (responseData.timeZone) ? responseData.timeZone : 'CST';
            }
        });
    }

    /***
     * set all date-time format list
     */
    setDateTimeList(): void {
        const dataObj = { dateFormat: this.selectedDateFormat, timeZone: this.selectedTimeZone };
        this.dateTimeFormatService.setDateTimeFormat(dataObj).subscribe((response: any) => {
            if (!response.success) {
                this.toastService.error('Error : ' + response.response.message, 'Error');
            } else {
                this.toastService.success('Date Time format updated successfully', 'Success');
            }
        });
    }
}
