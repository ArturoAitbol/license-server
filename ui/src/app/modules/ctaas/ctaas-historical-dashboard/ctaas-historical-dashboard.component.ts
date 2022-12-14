import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { forkJoin, Observable } from 'rxjs';
import { ReportType } from 'src/app/helpers/report-type';
import { Note } from 'src/app/model/note.model';
import { CtaasDashboardService } from 'src/app/services/ctaas-dashboard.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubAccountService } from 'src/app/services/sub-account.service';
import { IResultant } from '../ctaas-dashboard/ctaas-dashboard.component';

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
  fontStyleControl = new FormControl('');
  resultantImagesList: IResultant[] = [];
  resultantImagesListBk: IResultant[] = [];
  resultant: any;
  reports:any;

  readonly DAILY: string = 'daily';
  readonly WEEKLY: string = 'weekly';


  constructor(
      private subaccountService: SubAccountService,
      private ctaasDashboardService: CtaasDashboardService,
      private snackBarService: SnackBarService,
      public dialogRef: MatDialogRef<CtaasHistoricalDashboardComponent>,
      @Inject(MAT_DIALOG_DATA) public note: Note
  ) { }

  ngOnInit(): void {
    if(this.note?.reports!=null){
      this.reports = this.note.reports;
      this.fontStyleControl.setValue(this.DAILY);
      const currentSubaccountDetails = this.subaccountService.getSelectedSubAccount();
      const { id, subaccountId } = currentSubaccountDetails;
      this.subaccountId = subaccountId ? subaccountId : id;
      this.fetchCtaasDashboardDetailsBySubaccount();
    }else{
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
          requests.push(this.ctaasDashboardService.getCtaasDashboardDetails(this.subaccountId, report.reportType,report.timestampId));
      }
      // get all the request response in an array
      forkJoin([...requests]).subscribe((res: [{ response?: { lastUpdatedTS: string, imageBase64: string }, error?: string }]) => {
          if (res) {
              // get all response without any error messages
              const result: { lastUpdatedTS: string, imageBase64: string, reportType: string, timestampId: string }[] = [...res]
                  .filter((e: any) => !e.error)
                  .map((e: { response: { lastUpdatedTS: string, imageBase64: string, reportType: string, timestampId: string } }) => e.response);
              this.isLoadingResults = false;
              if (result.length > 0) {
                  this.hasDashboardDetails = true;
                  const resultant = { daily: [], weekly: [], lastUpdatedDateList: [] };
                  result.forEach((e) => {
                      if (e.reportType.toLowerCase().includes(this.DAILY)) {
                          resultant.daily.push({ imageBase64: e.imageBase64, reportType: this.getReportNameByType(e.reportType) });
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
          case ReportType.DAILY_FEATURE_FUNCTIONALITY: case ReportType.WEEKLY_FEATURE_FUNCTIONALITY: return 'Feature Functionality';
          case ReportType.DAILY_CALLING_RELIABILITY: return 'Calling Reliability';
          case ReportType.DAILY_PESQ: case ReportType.WEEKLY_PESQ: return 'PESQ';
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
}