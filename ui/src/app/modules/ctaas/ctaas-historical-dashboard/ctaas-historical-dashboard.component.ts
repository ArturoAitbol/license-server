import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { forkJoin, Observable } from 'rxjs';
import { ReportType } from 'src/app/helpers/report-type';
import { IDashboardImageResponse } from 'src/app/model/dashboard-image-response.model';
import { Note } from 'src/app/model/note.model';
import { CtaasDashboardService } from 'src/app/services/ctaas-dashboard.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-ctaas-historical-dashboard',
    templateUrl: './ctaas-historical-dashboard.component.html',
    styleUrls: ['./ctaas-historical-dashboard.component.css']
})
export class CtaasHistoricalDashboardComponent implements OnInit {

    subaccountId = '';
    hasDashboardDetails = false;
    isLoadingResults = false;
    dailyImagesList: string[] = [];
    weeklyImagesList: string[] = [];
    lastModifiedDate: string;
    private subaccountDetails: any;
    fontStyleControl = new FormControl('');
    resultantImagesList: IDashboardImageResponse[] = [];
    resultantImagesListBk: IDashboardImageResponse[] = [];
    resultant: any;
    reports: any;

    readonly DAILY: string = 'daily';
    readonly WEEKLY: string = 'weekly';
    readonly FEATURE_FUNCTIONALITY_NAME: string = 'Feature Functionality';
    readonly CALLING_RELIABILITY_NAME: string = 'Calling Reliability';
    readonly VQ_NAME: string = 'Voice Quality User Experience';


    constructor(
        private subaccountService: SubAccountService,
        private ctaasDashboardService: CtaasDashboardService,
        private snackBarService: SnackBarService,
        public dialogRef: MatDialogRef<CtaasHistoricalDashboardComponent>,
        @Inject(MAT_DIALOG_DATA) public note: Note
    ) { }

    ngOnInit(): void {
        if (this.note?.reports != null) {
            this.reports = this.note.reports;
            this.fontStyleControl.setValue(this.DAILY);
            this.subaccountDetails = this.subaccountService.getSelectedSubAccount();
            this.subaccountId = this.subaccountDetails.id;
            this.fetchCtaasDashboardDetailsBySubaccount();
        } else {
            console.error('Error loading dashboard reports | ', "No reports found for the selected note");
            this.snackBarService.openSnackBar('Error loading dashboard, please connect tekVizion admin', 'Ok');
        }
    }
    /**
    * on change button toggle
    */
    onChangeButtonToggle(): void {
        const { value } = this.fontStyleControl;
        this.resultantImagesList = this.resultantImagesListBk.filter(e => e.reportType.toLowerCase().includes(value));
    }

    /**
     * fetch PBRS images SpotLight dashboard required details
     */
    fetchCtaasDashboardDetailsBySubaccount(): void {
        this.isLoadingResults = true;
        this.resultantImagesList = this.resultantImagesListBk = [];
        const requests: Observable<any>[] = [];
        // iterate through dashboard reports
        for (const report of this.reports) {
            requests.push(this.ctaasDashboardService.getCtaasDashboardDetails(this.subaccountId, report.reportType, report.timestampId));
        }
        // get all the request response in an array
        forkJoin([...requests]).subscribe((res: [{ response?: { lastUpdatedTS: string, imageBase64: string }, error?: string }]) => {
            if (res) {
                // get all response without any error messages
                const result: { lastUpdatedTS: string, imageBase64: string, reportType: string, timestampId: string, startDateStr: string, endDateStr: string }[] = [...res]
                    .filter((e: any) => !e.error)
                    .map((e: { response: { lastUpdatedTS: string, imageBase64: string, reportType: string, timestampId: string, startDateStr: string, endDateStr: string } }) => e.response);
                this.isLoadingResults = false;
                if (result.length > 0) {
                    this.hasDashboardDetails = true;
                    const resultant = { daily: [], weekly: [], lastUpdatedDateList: [] };
                    result.forEach((e) => {
                        if (e.reportType.toLowerCase().includes(this.DAILY)) {
                            resultant.daily.push({ imageBase64: e.imageBase64, reportType: this.getReportNameByType(e.reportType), startDate: e.startDateStr, endDate: e.endDateStr });
                            resultant.lastUpdatedDateList.push(e.lastUpdatedTS);
                        } else if (e.reportType.toLowerCase().includes(this.WEEKLY)) {
                            resultant.weekly.push({ imageBase64: e.imageBase64, reportType: this.getReportNameByType(e.reportType) });
                            resultant.lastUpdatedDateList.push(e.lastUpdatedTS);
                        }
                    });
                    const { daily, weekly, lastUpdatedDateList } = resultant;
                    this.lastModifiedDate = lastUpdatedDateList[0];
                    if (daily.length > 0)
                        this.resultantImagesList.push({ lastUpdatedTS: lastUpdatedDateList[0], reportType: this.DAILY, imagesList: daily });
                    if (weekly.length > 0)
                        this.resultantImagesList.push({ lastUpdatedTS: lastUpdatedDateList[0], reportType: this.WEEKLY, imagesList: weekly });
                    this.resultantImagesListBk = [...this.resultantImagesList];
                    if (this.resultantImagesListBk.length > 0) {
                        this.onChangeButtonToggle();
                    }
                }
                this.hasDashboardDetails = this.checkForDashboardDetails();
            }
        }, (e) => {
            this.resultantImagesList = this.resultantImagesListBk = [];
            this.hasDashboardDetails = this.checkForDashboardDetails();
            this.isLoadingResults = false;
            console.error('Error loading dashboard reports | ', e.error);
            this.snackBarService.openSnackBar('Error loading dashboard, please connect tekVizion admin', 'Ok');
        });
    }
    /**
     * get report name by report type
     * @param reportType: string 
     * @returns: string 
     */
    getReportNameByType(reportType: string): string {
        switch (reportType) {
            case ReportType.DAILY_FEATURE_FUNCTIONALITY:
            case ReportType.WEEKLY_FEATURE_FUNCTIONALITY:
                return this.FEATURE_FUNCTIONALITY_NAME;
            case ReportType.DAILY_CALLING_RELIABILITY:
            case ReportType.WEEKLY_CALLING_RELIABILITY:
                return this.CALLING_RELIABILITY_NAME;
            case ReportType.DAILY_VQ:
            case ReportType.WEEKLY_VQ:
                return this.VQ_NAME;
        }
    }
    /**
     * check whether dashboard has any data to display or not
     * @returns: boolean 
     */
    checkForDashboardDetails(): boolean {
        return this.resultantImagesList.length > 0;
    }

    /**
     * Close modal
     */

    onClose(): void {
        this.dialogRef.close();
    }

    onClickMoreDetails(index: string): void {
        const obj = this.resultantImagesList[0];
        const { imagesList } = obj;
        const { reportType, startDate, endDate } = imagesList[index];
        const type = (reportType === 'Feature Functionality') ? ReportType.DAILY_FEATURE_FUNCTIONALITY : (reportType === 'Calling Reliability') ? ReportType.DAILY_CALLING_RELIABILITY : '';
        const url = `${environment.BASE_URL}/#/spotlight/details?subaccount=${this.subaccountId}&type=${type}&start=${startDate}&end=${endDate}`;
        window.open(url);
        window.close();
    }
}