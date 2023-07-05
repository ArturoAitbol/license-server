import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ReportName } from 'src/app/helpers/report-type';
import { Utility } from 'src/app/helpers/utils';
import { IDashboardImageResponse, IImage } from 'src/app/model/dashboard-image-response.model';
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
    readonly ReportName = ReportName;

    constructor(
        private subaccountService: SubAccountService,
        private ctaasDashboardService: CtaasDashboardService,
        private snackBarService: SnackBarService,
        public dialogRef: MatDialogRef<CtaasHistoricalDashboardComponent>,
        @Inject(MAT_DIALOG_DATA) public note: Note
    ) { }

    ngOnInit(): void {
        if (this.note!= null) {
            this.fontStyleControl.setValue(this.DAILY);
            this.subaccountDetails = this.subaccountService.getSelectedSubAccount();
            this.subaccountId = this.subaccountDetails.id;
            this.fetchCtaasDashboardDetailsBySubaccount();
        } else {
            console.error('Error loading dashboard reports | ', "No reports found for the selected note");
            this.snackBarService.openSnackBar('Error loading dashboard, please contact your TekVizion 360 admin', 'Ok');
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

        this.ctaasDashboardService.getCtaasHistoricalDashboardDetails(this.subaccountId,this.note.id).subscribe((res: { response: IImage[]} ) => {
            this.isLoadingResults = false;
            const result: IImage[] = res.response;
            if (result.length > 0) {
                this.hasDashboardDetails = true;
                const resultant = { daily: [], weekly: [] };
                result.forEach((e) => {
                    if (e.reportType.toLowerCase().includes(this.DAILY)) {
                        resultant.daily.push({ imageBase64: e.imageBase64, reportType: Utility.getReportNameByReportTypeOrTestPlan(e.reportType), startDate: e.startDateStr, endDate: e.endDateStr });
                    } else if (e.reportType.toLowerCase().includes(this.WEEKLY)) {
                        resultant.weekly.push({ imageBase64: e.imageBase64, reportType: Utility.getReportNameByReportTypeOrTestPlan(e.reportType) });
                    }
                });
                const { daily, weekly } = resultant;
                if (daily.length > 0)
                    this.resultantImagesList.push({ reportType: this.DAILY, imagesList: daily });
                if (weekly.length > 0)
                    this.resultantImagesList.push({ reportType: this.WEEKLY, imagesList: weekly });
                this.resultantImagesListBk = [...this.resultantImagesList];
                if (this.resultantImagesListBk.length > 0) {
                    this.onChangeButtonToggle();
                }
            }
            this.hasDashboardDetails = this.checkForDashboardDetails();
        },(e)=>{
            this.resultantImagesList = this.resultantImagesListBk = [];
            this.hasDashboardDetails = this.checkForDashboardDetails();
            this.isLoadingResults = false;
            console.error('Error loading dashboard reports | ', e.error);
            this.snackBarService.openSnackBar('Error loading dashboard, please contact your TekVizion 360 admin', 'Ok');
        });
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
        const type = Utility.getTAPTestPlaNameByReportTypeOrName(reportType);
        const url = `${environment.BASE_URL}/#/spotlight/details?subaccountId=${this.subaccountId}&type=${type}&start=${startDate}&end=${endDate}`;
        window.open(url);
    }
}