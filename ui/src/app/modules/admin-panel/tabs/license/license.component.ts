import { Component, ElementRef, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { LicenseService } from 'src/app/services/license-service.service';
import { License } from './license';
import { Utility } from '../../../../helpers/Utility';
import { DataTableComponent } from 'src/app/generics/data-table/data-table.component';
import { AdminPanelService } from 'src/app/services/admin-panel.service';

@Component({
    selector: 'license-tab',
    templateUrl: './license.component.html',
    styleUrls: ['./license.component.css']
})
export class LicenseComponent implements OnInit {
    @ViewChild('projectsGrid', { static: true }) projectsGrid: DataTableComponent;
    @Input() searchQuery: boolean;
    searchBar: boolean;
    licenseDetails: License;
    currentFileUpload: File;
    generatedLicenseMAC: string;
    licenseUsage: any;
    licenceInfos: any;
    viewDetails = false;
    licensePackage: any;
    deviceLicenseConsumption: any;
    accessLicenseConsumption: any;
    @ViewChild('loadLicenseInput', { static: false }) loadLicense: ElementRef;
    deviceLicenseList: any = []
    accessLicenseList: any = [];
    private totalPortions: any = [];
    deviceLicenseColumns: any = [];
    loadingProjects: boolean;
    licenses: any = [];
    // tslint:disable-next-line: max-line-length
    deviceLicenseData: { vendor: string, model: string, numberOfLicensesconsumed: number, dateOfFirstConsumed: string, id: number, showItem: boolean }[];
    deviceLicenseDetails: any = [];
    deviceLicenseDetailsBk: any = [];
    usageinfo: any;
    projectDetailInfo: any;
    filtering: boolean;
    filterCount = -1;
    subscription: any;
    genarateLicenses: License[] = [];
    renewalDateValue: any;
    height: string;
    readonly toolTipMessage: string = `
    Tokens will be consumed for serviceability features of MPP.
A device will be charged tokens only if it is used to execute a project (during the valid times for a licenses)
`;
    isRequestCompleted: boolean;
    downloadInfoToastId: any;
    constructor(
        private licenseService: LicenseService,
        private toastService: ToastrService,
        private adminPanelService: AdminPanelService) {
    }

    ngOnInit() {
        switch (window.screen.width) {
            case 1440:
                this.height = '45vh'; break;
            case 1920:
            case 2560:
                this.height = '60vh'; break;
            default: this.height = '40vh'; break;
        }
        this.generatedLicenseMAC = '';
        if (localStorage.getItem('updateLicense')) {
            localStorage.removeItem('updateLicense');
        }
        this.initGridProperties();
        this.loadLicenseInfo();
        this.getWidthPortions();
    }

    /**
     * upload the license file
     * @param files:any
     */
    processLicense(files: any) {
        this.currentFileUpload = files.item(0);
        this.licenseService.uploadLicense(this.currentFileUpload).subscribe((response: any) => {
            if (!response.success) {
                this.toastService.error('Error trying to upload a license file: ' + response.response.message, 'Error');
            } else {
                this.loadLicenseInfo();
                this.toastService.success('License File Upload successfully', 'Success');
                localStorage.setItem('isClosed', 'false');
            }
            this.loadLicense.nativeElement.value = '';
            this.currentFileUpload = null;
        });
    }

    /**
     * check whether the user has that role or not
     * @param event: any
     * @return boolean
     */
    canOpenFileDialog = (event: any) => {
        if (Utility.userEnabled('ROLE_APP_LICENSEMANAGEMENT')) {
            return true;
        }
        event.preventDefault();
        event.stopPropagation();
        this.toastService.warning('User doesn\'t have permissions to execute this action', 'Warning');
        return false;
    }

    /**
     * initialize the device license columns
     */
    initGridProperties() {
        this.deviceLicenseColumns = [
            { field: 'vendor', header: 'Vendor', width: 8, suppressHide: false, suppressSort: false, filter: '' },
            { field: 'model', header: 'Model', width: 10, suppressHide: false, suppressSort: false, filter: '' },
            { field: 'osAndFirmware', header: 'Platform', width: 10, suppressHide: false, suppressSort: false, filter: '' }, {
                field: 'consumption',
                header: 'Number Of tekTokens Consumed', width: 20, suppressHide: false, suppressSort: false, filter: ''
            },
            {
                field: 'firstConsumptionDate',
                header: 'Date Of First Consumption', width: 20, suppressHide: false, suppressSort: false, filter: ''
            },
        ];

    }

    /**
     * calculate the particular column width and returns that value
     * @param column:any
     * @returns string 
     */
    getColumnWidth(column: any) {
        return (column.width * 100 / this.totalPortions) + '%';
    }

    /**
     * calculate the total width of the device license columns
     */
    getWidthPortions() {
        this.totalPortions = 0;
        this.deviceLicenseColumns.forEach((column: any) => {
            if (!column.hidden) {
                this.totalPortions += column.width;
            }
        });
    }

    /**
     * filter the columns data
     */
    filterData() {
        let filterCount = 0;
        this.deviceLicenseDetails = this.deviceLicenseDetailsBk;
        this.deviceLicenseColumns.forEach((column: any) => {
            if (column.filter) {
                filterCount++;
                const filter = { key: column.field, value: column.filter.toUpperCase() };
                this.deviceLicenseDetails = this.deviceLicenseDetails.filter((item) => {
                    // tslint:disable-next-line:triple-equals
                    if (item[filter.key] != undefined) {
                        return item[filter.key].toString().toUpperCase().indexOf(filter.value) > -1;
                    }
                });
            }
        });
        this.filtering = filterCount > 0;
    }

    /**
     * show/hide columns
     */
    checkAllHidden() {
        let response = false;
        let counter = 0;
        this.deviceLicenseColumns.forEach((column: any) => {
            if (!column.hidden) {
                counter++;
            }
        });
        // tslint:disable-next-line:triple-equals
        response = counter == this.deviceLicenseColumns.length;
        return response;
    }

    /**
     * view project information under respective device
     * @param item: any
     */
    viewProjectInfo(item: any) {
        item.showItem = !item.showItem;
        this.licenseService.getProjectDetails(item.vendor, item.model, item.os, item.firmware).subscribe((response: any) => {
            this.projectDetailInfo = response.response.projectInfo;
        });
    }

    /**
      * load current license info
      */
    loadLicenseInfo(): void {
        this.accessLicenseList = [];
        this.deviceLicenseList = [];
        this.licenseService.getLicenses().subscribe((response: any) => {
            if (!response.success) {
                this.toastService.error('Couldn\'t load LicenseDetails: ' + response.response.message, 'Error');
            } else {
                this.licenseDetails = response.response.licenseInfo;
                this.licenseUsage = response.response.usage;
                this.licenceInfos = response.response.licenseInfo.addOns;
                this.licensePackage = response.response.package;
                this.renewalDateValue = response.response.availableDaysForSubscriptionExpiry;
            }

            // separate access & device license details
            this.licenceInfos.forEach((element: any) => {
                if (+element.devices > 0 && +element.devices != 0) {
                    this.accessLicenseList.push(element);
                }
                if (+element.deviceModels > 0 && +element.deviceModels != 0) {
                    this.deviceLicenseList.push(element);
                }
            });

            // get device license consumed
            // tslint:disable-next-line: max-line-length
            const deviceConsumedInPercentage = ((this.licenseUsage.consumedDeviceModels / this.licenseUsage.allocatedDeviceModels) * 100).toFixed(0);
            this.deviceLicenseConsumption = +deviceConsumedInPercentage > 100 ? 100 : deviceConsumedInPercentage;
            // get access license consumed
            const accessConsumedInPercentage = ((this.licenseUsage.consumedDevices / this.licenseUsage.allocatedDevices) * 100).toFixed(0);
            this.accessLicenseConsumption = +accessConsumedInPercentage > 100 ? 100 : accessConsumedInPercentage;
        });
    }

    /**
     * on generate license MAC
     */
    onGenerateLicenseMAC(): void {
        this.licenseService.generateLicenseMAC().subscribe((response: any) => {
            if (!response.success) {
                this.toastService.error('Error trying to Generate License Key');
            } else {
                this.toastService.success('Generate License Key successfully', 'Success');
                this.generatedLicenseMAC = response.response.LicenseKey;
            }
        });
    }

    /**
     * copy the string to clipboard
     */
    copyMessageToClipBoard(val: string) {
        const selBox = document.createElement('textarea');
        selBox.style.position = 'fixed';
        selBox.style.left = '0';
        selBox.style.top = '0';
        selBox.style.opacity = '0';
        selBox.value = val;
        document.body.appendChild(selBox);
        selBox.focus();
        selBox.select();
        document.execCommand('copy');
        document.body.removeChild(selBox);
        this.toastService.info('Copied to Clipboard', 'Info');
    }
    /**
     * navigate to Device License details
     */
    viewLicenseDetails(): void {
        this.isRequestCompleted = false;
        this.adminPanelService.setEnableSearch(true);
        this.adminPanelService.searchField.emit()
        this.viewDetails = true;
        this.licenseService.getViewMore().subscribe((response: any) => {
            if (!response.success) {
                this.toastService.error('Couldn\'t load DeviceLicenseDetails: ' + response.response.message, 'Error');
                this.isRequestCompleted = true;
            } else {
                const data: any = response.response.consumptionInfo;
                data.forEach(element => {
                    element.osAndFirmware = element.os;
                });
                this.deviceLicenseDetails = this.deviceLicenseDetailsBk = data;
                // this.deviceLicenseDetails = this.deviceLicenseDetailsBk = response.response.consumptionInfo;
                this.usageinfo = response.response.usage;
                this.isRequestCompleted = true;
            }
        }, () => {
            this.isRequestCompleted = true;
        });
    }

    /**
     * navigate to generate license report
     * not yet implemented
     */
    private downloadFile(data: any, filename: string, type: any) {
        const blob = new Blob([data], type);
        const url = window.URL.createObjectURL(blob);
        if (navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, filename);
        } else {
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        window.URL.revokeObjectURL(url);
        setTimeout(() => {
            this.toastService.remove(this.downloadInfoToastId);
        }, 1000);

    }

    generateLicenseReport() {
        const reportName = 'Device  Access Consumption Report.xlsx';
        this.downloadInfoToastId = this.toastService.info("Downloading report is in progress", 'Info', { disableTimeOut: true }).toastId;
        this.licenseService.downloadGenerateLicenseReport().subscribe((response: any) => {
            if (response) {
                const type = { type: 'application/vnd.ms-excel' };
                this.downloadFile(response, reportName, type);
            }
        }, () => {
                this.toastService.remove(this.downloadInfoToastId);
        });
    }


    goToviewMore() {
    }

    /**
     * navigate to License tab
     */
    goToBackDetails() {
        this.viewDetails = false;
        this.adminPanelService.setEnableSearch(false);
        this.adminPanelService.searchField.emit()
    }
}


