import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChartOptions } from "../../../helpers/chart-options-type";
import {
  defaultFailedCallsChartOptions,
  defaultVqChartOptions,
  defaultWeeklyFeatureFunctionalityChartOptions,
  defaultWeeklyCallingReliabilityChartOptions,
  defaultWeeklyCallsStatusChartOptions,
  defaultWeeklyVQChartOptions
} from "./initial-chart-config";
import { SubAccountService } from "../../../services/sub-account.service";
import { SpotlightChartsService } from "../../../services/spotlight-charts.service";
import moment, { Moment } from "moment";
import { forkJoin, Observable, interval, Subscription, of } from "rxjs";
import { Utility } from "../../../helpers/utils";
import { environment } from "../../../../environments/environment";
import { ReportName, ReportType } from "../../../helpers/report-type";
import { FormBuilder } from "@angular/forms";
import { map, startWith } from "rxjs/operators";
import { NetworkQualityComponent } from "./network-quality/network-quality.component";
import { Subject } from "rxjs/internal/Subject";
import { ActivatedRoute } from '@angular/router';
import { Note } from "../../../model/note.model";
import { NoteService } from "../../../services/notes.service";
import { Constants } from 'src/app/helpers/constants';
import { AddNotesComponent } from "../ctaas-notes/add-notes/add-notes.component";
import { MatDialog } from "@angular/material/dialog";
import { CtaasSetupService } from 'src/app/services/ctaas-setup.service';
import { BannerService } from 'src/app/services/banner.service';
import { MsalService } from '@azure/msal-angular';
import { OnboardWizardComponent } from '../ctaas-onboard-wizard/ctaas-onboard-wizard.component';
import { DialogService } from 'src/app/services/dialog.service';
@Component({
  selector: 'app-spotlight-dashboard',
  templateUrl: './spotlight-dashboard.component.html',
  styleUrls: ['./spotlight-dashboard.component.css']
})

export class SpotlightDashboardComponent implements OnInit, OnDestroy {
  vqChartOptions: Partial<ChartOptions>;
  chartsSubscription: Subscription;

  // Weekly Feature Functionality variables
  weeklyFeatureFunctionality = { numberCalls: 0, p2pCalls: 0, onNetCalls: 0, offNetCalls: 0 };
  weeklyFeatureFunctionalityChartOptions: Partial<ChartOptions>;

  // Weekly Calling Reliability variables
  weeklyCallingReliability = { numberCalls: 0, p2pCalls: 0, onNetCalls: 0, offNetCalls: 0 };
  weeklyCallingReliabilityChartOptions: Partial<ChartOptions>;
  weeklyCallsStatusChartOptions: Partial<ChartOptions>;

  // Weekly calls status Heat Map variables
  weeklyCallsStatusHeatMap: { series: any, maxValues: any, summary: any };
  heatMapCallsSummary = { total: 0, failed: 0 };
  selectedStatus = 'total';

  // Weekly VQ variables
  weeklyVQ = { numberCalls: 0, numberStreams: 0, p2p: 0, onNet: 0, offNet: 0 };
  weeklyVQChartOptions: Partial<ChartOptions>;
  weeklyVqNumericValues = null;

  // Daily Failed Calls chart variables
  failedCallsChartOptions: Partial<ChartOptions>;
  calls = { total: 0, failed: 0, onNetCalls: 0, offNetCalls: 0, p2pCalls: 0 };

  // Daily Calling Reliabilty gaguge variables
  callingReliability = { value: 0, total: 0, p2p: 0, onNet: 0, offNet: 0 };

  // Daily Feature Functionality gaguge variables
  featureFunctionality = { value: 0, total: 0, p2p: 0, onNet: 0, offNet: 0 };

  // Daily Feature Functionality gaguge variables
  vq = { calls: 0, streams: 0, numericValues: [], p2p: 0, onNet: 0, offNet: 0 };

  //Selected graphs variables
  selectedPeriod = 'daily';

  //Daily filters variables
  filters = this.fb.group({
    date: [moment().utc()],
    region: [""]
  });

  //Weekly filters variables
  weeklyFilters = this.fb.group({
    date: [moment().utc()],
    region: [""]
  });

  date: Moment;
  tapURLFlag: boolean;
  closedBanner: boolean;
  hiddenBanner: boolean;
  regions: { country: string, state: string, city: string, displayName: string }[] = [];
  users: string[] = [];
  filteredRegions: Observable<{ country: string, state: string, city: string, displayName: string }[]>;
  weeklyFilteredRegions: Observable<{ country: string, state: string, city: string, displayName: string }[]>;
  notSelectedFilteredDailyRegions: { country: string, state: string, city: string, displayName: string }[];
  notSelectedFilteredWeeklyRegions: { country: string, state: string, city: string, displayName: string }[];
  filteredUsers: Observable<string[]>;
  maxDate = moment().utc();
  minDate = moment.utc('0001-01-01');

  selectedDate: Moment = null;
  selectedRange: { start: Moment, end: Moment } = null;
  loadingTime = 0;

  isloading = true;
  maintenanceModeEnabled = false;
  showChartsFlag = true;

  currentDate: any;
  selectedRegion: any;
  locationFlag = false;
  startTime = 0;
  milliseconds = 0;
  seconds = 0;
  timer: any;
  stopTimer$: Subject<void> = new Subject();
  timerIsRunning = false;
  isRefreshing = false;
  chartsLoaded = 0;
  preselectedRegions = [];
  selectedRegions = [];
  weeklyPreselectedRegions = [];
  weeklySelectedRegions = [];
  refreshIntervalSubscription: Subscription;
  autoRefresh = false;
  disableFiltersWhileLoading = true;
  showChildren = false;
  subaccountDetails: any;
  // Historical view variables
  isHistoricalView = false;
  note: Note;
  showNewNoteBtn = false;
  messageSpinner = 'Please wait while we prepare your UCaaS Continuous Testing Dashboard.';
  isSelectedDayInWeekly = false;
  selectedDayInWeekly: Moment = null;
  loggedInUserRoles: any;

  readonly ReportType = ReportType;
  readonly callingReliabilityTestPlans = ReportName.TAP_CALLING_RELIABILITY + "," + ReportName.TAP_VQ;

  @ViewChild('regionInput') regionInput: ElementRef<HTMLInputElement>;

  @ViewChild('networkQuality') networkQuality: NetworkQualityComponent;

  private onDestroy: Subject<void> = new Subject<void>();

  constructor(private subaccountService: SubAccountService,
    private msalService: MsalService,
    private spotlightChartsService: SpotlightChartsService,
    private noteService: NoteService,
    private route: ActivatedRoute,
    private ctaasSetupService: CtaasSetupService,
    private bannerService: BannerService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private dialogService: DialogService) {
    this.vqChartOptions = defaultVqChartOptions;
    this.vqChartOptions.tooltip.custom = ({ series, seriesIndex, dataPointIndex, w }) => {
      return `
      <div class="apexcharts-tooltip-title" style="font-family: Helvetica, Arial, sans-serif;
        font-size: 12px;" xmlns="http://www.w3.org/1999/html"><span>${w.config.xaxis.categories[dataPointIndex]}</span></div>
      <div class="apexcharts-tooltip-series-group" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px;display: flex !important; flex-direction: column;
        align-items: flex-start;">
      <div>Call streams: <b>${this.vq.numericValues[dataPointIndex]}</b></div>
      </div>
      `;
    };
    this.weeklyFeatureFunctionalityChartOptions = defaultWeeklyFeatureFunctionalityChartOptions;
    this.weeklyCallingReliabilityChartOptions = defaultWeeklyCallingReliabilityChartOptions;
    this.failedCallsChartOptions = defaultFailedCallsChartOptions;
    this.weeklyCallsStatusChartOptions = defaultWeeklyCallsStatusChartOptions;
    this.weeklyVQChartOptions = defaultWeeklyVQChartOptions;
    this.weeklyVQChartOptions.tooltip.custom = ({ series, seriesIndex, dataPointIndex, w }) => {
      return `
      <div class="apexcharts-tooltip-title" style="font-family: Helvetica, Arial, sans-serif;
        font-size: 12px;" xmlns="http://www.w3.org/1999/html"><span>${w.config.xaxis.categories[dataPointIndex]}</span></div>
      <div class="apexcharts-tooltip-series-group" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px;display: flex !important; flex-direction: column;
        align-items: flex-start;">
      <div>Category: <b>${w.config.series[seriesIndex].name}</b></div>
      <div>Call streams: <b>${this.weeklyVqNumericValues[seriesIndex][dataPointIndex]}</b></div>
      <div>Percentage: <b>${series[seriesIndex][dataPointIndex].toFixed(2)}%</b></div>
      </div>
      `;
    };
  }

  ngOnInit() {
    this.dialogService.showHelpButton = true;
    this.closedBanner = localStorage.getItem("closedBanner") ? JSON.parse(localStorage.getItem("closedBanner")) : false;
    let accountId = this.msalService.instance.getActiveAccount().localAccountId;
    this.hiddenBanner = localStorage.getItem(accountId + "-hiddenBanner") ? JSON.parse(localStorage.getItem(accountId + "-hiddenBanner")) : false;
    this.subaccountDetails = this.subaccountService.getSelectedSubAccount();
    const accountDetails = this.getAccountDetails();
    const { idTokenClaims: { roles } } = accountDetails;
    this.loggedInUserRoles = roles;
    this.checkSetupStatus();

    let currentEndDate;
    this.disableFiltersWhileLoading = true;
    this.route.queryParams.subscribe(params => {
      if (params?.noteId) {
        this.noteService.getNoteList(this.subaccountDetails.id, params.noteId).subscribe(res => {
          this.note = res.notes[0];
          this.filters.get('date').setValue(moment.utc(this.note.openDate));
          this.weeklyFilters.get('date').setValue(moment.utc(this.note.openDate));
          this.isHistoricalView = true;
          this.setWeeklyRange();
          this.setDate();
          this.loadCharts();
          this.showChildren = true;
        });
      } else {
        if (params.date && this.filters.get('date').value !== "") {
          const nodeDate = params.date.split('T')[0]
          this.currentDate = Utility.setHoursOfDate(moment.utc(nodeDate));
          this.filters.controls['date'].setValue(moment.utc(nodeDate));
        }
        if (params.date && this.weeklyFilters.get('date').value !== "") {
          const parsedDate = params.date.split('T')[0];
          currentEndDate = Utility.setHoursOfDate(moment.utc(parsedDate));
          this.weeklyFilters.controls['date'].setValue(currentEndDate);
        }
        if (params.location && this.selectedRegions.length === 0) {
          this.selectedRegions.push({
            city: params.location.split(',')[0],
            state: params.location.split(', ')[1],
            country: params.location.split(', ')[2],
            displayName: params.location
          });
          if (params.toLocation) {
            this.selectedRegions.push({
              city: params.toLocation.split(',')[0],
              state: params.toLocation.split(', ')[1],
              country: params.toLocation.split(', ')[2],
              displayName: params.toLocation
            })
          }
          this.locationFlag = true;
          this.weeklySelectedRegions = this.selectedRegions;
          this.preselectedRegions = [...this.selectedRegions];
          this.weeklyPreselectedRegions = [...this.selectedRegions];
          this.weeklyFilters.controls['region'].setValue(this.selectedRegion)
          this.filters.controls['region'].setValue(this.selectedRegion);
        }
        this.setWeeklyRange();
        this.setDate();
        this.loadCharts();
        this.showChildren = true;
        this.showNewNoteBtn = !this.isHistoricalView;
        this.refreshIntervalSubscription = interval(Constants.DASHBOARD_REFRESH_INTERVAL)
          .subscribe(() => {
            this.disableFiltersWhileLoading = false;
            this.autoRefresh = true;
            this.reloadCharts(false);
            this.networkQuality.loadCharts({ showLoading: false });
          });
      }
    });
    this.initAutocompletes();
    this.initWeeklyAutocompletes();
    this.sendHelpDialogValuesDaily();
  }

  /**
   * get logged in account details
   * @returns: any | null
   */
  private getAccountDetails(): any | null {
    return this.msalService.instance.getActiveAccount() || null;
  }

  dateHasChanged(): boolean {
    if (this.selectedPeriod === "daily")
      return this.filters.get('date').value.format("MM-DD-YYYY") !== this.date.format("MM-DD-YYYY");
    return this.weeklyFilters.get('date').value.format("MM-DD-YYYY") !== this.selectedRange.end.format("MM-DD-YYYY");
  }

  regionsHaveChanged(): boolean {
    if (this.selectedPeriod === "daily")
      return JSON.stringify(this.preselectedRegions) !== JSON.stringify(this.selectedRegions);
    return JSON.stringify(this.weeklyPreselectedRegions) !== JSON.stringify(this.weeklySelectedRegions);
  }

  getStartWeekDate(): Moment {
    return this.weeklyFilters.get('date').value.clone().subtract(6, 'days').startOf('day');
  }

  getEndWeekDate(): Moment {
    const date = this.weeklyFilters.get('date').value.clone();
    return this.isHistoricalView ? date : Utility.setHoursOfDate(date);
  }

  setWeeklyRange() {
    this.selectedRange = { start: this.getStartWeekDate(), end: this.getEndWeekDate() };
  }

  setDate() {
    const date = this.filters.get('date').value.clone();
    this.date = this.isHistoricalView ? date : Utility.setHoursOfDate(date);
  }

  removeRegion(region: string): void {
    const regions = this.selectedPeriod === 'daily' ? this.preselectedRegions : this.weeklyPreselectedRegions;
    const index = regions.indexOf(region);
    if (index >= 0) {
      regions.splice(index, 1);
    }
    this.initAutocompletes();
    this.initWeeklyAutocompletes();
  }

  removeRegionFromArray(displayName: string, array: { country: string, state: string, city: string, displayName: string }[]) {
    const index = array.map(e => e.displayName).indexOf(displayName);
    if (index >= 0) {
      array.splice(index, 1);
    }
  }

  addRegion(): void {
    if (this.selectedPeriod === 'daily') {
      const region = this.filters.get('region').value;
      this.preselectedRegions.push(region);
      this.filters.get('region').setValue("");
      this.initAutocompletes();
    } else {
      const region = this.weeklyFilters.get('region').value;
      this.weeklyPreselectedRegions.push(region);
      this.weeklyFilters.get('region').setValue("");
      this.initWeeklyAutocompletes();
    }
    //this.regionInput.nativeElement.value = '';
  }

  clearRegionsFilter() {
    if (this.selectedPeriod === 'daily') {
      this.preselectedRegions = [];
      this.initAutocompletes();
    }
    else {
      this.weeklyPreselectedRegions = [];
      this.initWeeklyAutocompletes();
    }
  }

  chartsStatus(chartCompleted: boolean) {
    if (chartCompleted)
      this.chartsLoaded++;
    if (this.chartsLoaded == 2) {
      this.stopTimer();
      this.chartsLoaded = 0;
      this.autoRefresh = false;
    }
  }

  applyFilters() {
    if (this.filters.get('date').dirty || this.weeklyFilters.get('date').dirty)
      this.isHistoricalView = false;
    if (this.selectedPeriod === "daily") {
      this.selectedRegions = [...this.preselectedRegions];
      this.setDate();
      this.setNewNoteBtn(this.filters.get('date').value);
    }
    else {
      this.weeklySelectedRegions = [...this.weeklyPreselectedRegions];
      this.setWeeklyRange();
      this.setNewNoteBtn(this.weeklyFilters.get('date').value);
    }
    this.reloadCharts();
  }

  reloadCharts(showLoading = true) {
    this.disableFiltersWhileLoading = showLoading;
    this.loadCharts(showLoading);
  }

  selectedPeriodChange() {
    this.dialogService.clearDialogData();
    if (this.selectedPeriod == 'daily') {
      this.sendHelpDialogValuesDaily();
      if (!this.isHistoricalView && this.filters.get('date').value.isSame(moment.utc(), 'day')) {
        this.filters.get('date').setValue(moment.utc());
        this.setDate();
      }
      this.setNewNoteBtn(this.filters.get('date').value);
    } else {
      this.sendHelpDialogValuesWeekly();
      if (!this.isHistoricalView && this.weeklyFilters.get('date').value.isSame(moment.utc(), 'day')) {
        this.weeklyFilters.get('date').setValue(moment.utc());
        this.setWeeklyRange();
      }
      this.setNewNoteBtn(this.weeklyFilters.get('date').value);
    }
    this.loadCharts();
  }

  setNewNoteBtn(date: Moment) {
    this.showNewNoteBtn = !this.isHistoricalView && date.isSame(moment.utc(), 'day');
  }

  loadCharts(showLoading = true) {
    if (!this.showChartsFlag) return;
    if (this.chartsSubscription)
      this.chartsSubscription.unsubscribe();
    this.startTimer();
    this.chartsLoaded = 0;
    this.calls.total = 0;
    this.calls.failed = 0;
    this.isloading = showLoading && true;
    const startTime = performance.now();
    const subaccountId = this.subaccountDetails.id;
    const obs = [];

    if (this.selectedPeriod == "daily") {
      this.selectedDate = this.date.clone().utc();
      obs.push(this.spotlightChartsService.getDailyCallsStatusSummary(this.date, this.selectedRegions, subaccountId, null));
      obs.push(this.spotlightChartsService.getVoiceQualityChart(this.date, this.date, this.selectedRegions, subaccountId));
      obs.push(this.spotlightChartsService.getDailyCallsStatusSummary(this.date, this.selectedRegions, subaccountId, ReportName.TAP_VQ));
    } else {
      const selectedStartDate: Moment = this.selectedRange.start.clone();
      const selectedEndDate: Moment = this.selectedRange.end.clone();
      obs.push(this.spotlightChartsService.getWeeklyComboBarChart(selectedStartDate, selectedEndDate, subaccountId, 'FeatureFunctionality', this.weeklySelectedRegions));//.pipe(catchError(e => of(e))));
      obs.push(this.spotlightChartsService.getWeeklyComboBarChart(selectedStartDate, selectedEndDate, subaccountId, 'CallingReliability', this.weeklySelectedRegions));//.pipe(catchError(e => of(e))));
      obs.push(this.spotlightChartsService.getWeeklyCallsStatusHeatMap(selectedStartDate, selectedEndDate, subaccountId, this.weeklySelectedRegions));//.pipe(catchError(e => of(e))));
      obs.push(this.spotlightChartsService.getWeeklyCallsStatusSummary(selectedStartDate, selectedEndDate, this.weeklySelectedRegions, subaccountId, null));//.pipe(catchError(e => of(e))));
      obs.push(this.spotlightChartsService.getVoiceQualityChart(selectedStartDate, selectedEndDate, this.weeklySelectedRegions, subaccountId, true));//.pipe(catchError(e => of(e))));
      obs.push(this.spotlightChartsService.getWeeklyCallsStatusSummary(selectedStartDate, selectedEndDate, this.weeklySelectedRegions, subaccountId, ReportName.TAP_VQ));
    }

    this.chartsSubscription = forkJoin(obs).subscribe((res: any) => {
      try {
        if (this.selectedPeriod == "daily")
          this.processDailyData(res);
        else
          this.processWeeklyData(res);
      } catch (error) {
        console.error(error);
      }
      // common values
      const endTime = performance.now();
      this.loadingTime = (endTime - startTime) / 1000;
      this.isloading = false;
      this.chartsStatus(true);
    }, error => {
      console.error("SPDS ERROR: ", error);
      // console.error(error);
      this.isloading = false;
      this.chartsStatus(true);
    });
  }


  private processDailyData(res: any) {
    // Daily Calling reliability
    const dailyCallingReliabiltyRes: any = res[0].callingReliability;
    const POLQA = res[0].POLQA;
    let passedCalls = dailyCallingReliabiltyRes.callsByStatus.PASSED + POLQA.callsByStatus.PASSED;
    let failedCalls = dailyCallingReliabiltyRes.callsByStatus.FAILED + POLQA.callsByStatus.FAILED;
    this.callingReliability.total = passedCalls + failedCalls;
    this.callingReliability.p2p = dailyCallingReliabiltyRes.callsByType.p2p + POLQA.callsByType.p2p;
    this.callingReliability.onNet = dailyCallingReliabiltyRes.callsByType.onNet + POLQA.callsByType.onNet;
    this.callingReliability.offNet = dailyCallingReliabiltyRes.callsByType.offNet + POLQA.callsByType.offNet;
    this.callingReliability.value = (passedCalls / this.callingReliability.total) * 100 || 0;

    this.calls.total += this.callingReliability.total;
    this.calls.failed += failedCalls;
    this.calls.p2pCalls += this.callingReliability.p2p;
    this.calls.onNetCalls += this.callingReliability.onNet;
    this.calls.offNetCalls += this.callingReliability.offNet;

    // Daily Feature Functionality
    const dailyFeatureFunctionalityRes: any = res[0].featureFunctionality;
    passedCalls = dailyFeatureFunctionalityRes.callsByStatus.PASSED;
    failedCalls = dailyFeatureFunctionalityRes.callsByStatus.FAILED;
    this.featureFunctionality.total = passedCalls + failedCalls;
    this.featureFunctionality.p2p = dailyFeatureFunctionalityRes.callsByType.p2p;
    this.featureFunctionality.onNet = dailyFeatureFunctionalityRes.callsByType.onNet;
    this.featureFunctionality.offNet = dailyFeatureFunctionalityRes.callsByType.offNet;
    this.featureFunctionality.value = (passedCalls / this.featureFunctionality.total) * 100 || 0;

    this.calls.total += this.featureFunctionality.total;
    this.calls.failed += dailyFeatureFunctionalityRes.callsByStatus.FAILED;
    this.calls.p2pCalls += this.featureFunctionality.p2p;
    this.calls.onNetCalls += this.featureFunctionality.onNet;
    this.calls.offNetCalls += this.featureFunctionality.offNet;

    // Daily Voice Quality
    const voiceQualityRes: any = res[1];
    const POLQARes: any = res[2].POLQA;
    this.vq.calls = voiceQualityRes.summary.calls;
    this.vq.streams = voiceQualityRes.summary.streams;
    this.vq.p2p = POLQARes.callsByType.p2p;
    this.vq.onNet = POLQARes.callsByType.onNet;
    this.vq.offNet = POLQARes.callsByType.offNet;
    this.vqChartOptions.series = [{ name: 'percentages', data: voiceQualityRes.percentages }];
    this.vqChartOptions.xAxis.categories = voiceQualityRes.categories;
    this.vq.numericValues = voiceQualityRes.numericValues;

    // Daily Failed Calls Chart
    this.failedCallsChartOptions.series = [Number((this.calls.failed / this.calls.total * 100 || 0).toFixed(2))];
    this.vqChartOptions.chart.events = {
      dataPointSelection: (event, chartContext, config) => {
        this.navigateToPOLQACallsDetailedTableFilter(config.dataPointIndex);
      },
      dataPointMouseEnter: (event, chartContext, config) => {  
        event.target.style.cursor ='pointer';   
      }
    };
    if (this.selectedRegions.length > 0)
      this.reloadUserOptions(this.selectedRegions);
    else
      this.reloadFilterOptions();
  }

  private processWeeklyData(res: any) {
    // Weekly Feature Functionality
    const weeklyFeatureFunctionalityData = res[0];
    this.weeklyFeatureFunctionalityChartOptions.xAxis = { ...this.weeklyFeatureFunctionalityChartOptions.xAxis, categories: weeklyFeatureFunctionalityData.categories };
    this.weeklyFeatureFunctionalityChartOptions.series = [
      {
        name: "Success %",
        data: weeklyFeatureFunctionalityData.series['percentage'],
        type: "line"
      },
      {
        name: "Passed",
        data: weeklyFeatureFunctionalityData.series['passed'],
        type: "column",
      },
      {
        name: "Failed",
        data: weeklyFeatureFunctionalityData.series['failed'],
        type: "column",
      }
    ];

    // Weekly Calling Reliability
    const weeklyCallingReliabilityData = res[1];
    this.weeklyCallingReliabilityChartOptions.xAxis = { ...this.weeklyCallingReliabilityChartOptions.xAxis, categories: weeklyCallingReliabilityData.categories };
    this.weeklyCallingReliabilityChartOptions.series = [
      {
        name: "Success %",
        data: weeklyCallingReliabilityData.series['percentage'],
        type: "line"
      },
      {
        name: "Passed",
        data: weeklyCallingReliabilityData.series['passed'],
        type: "column",
      },
      {
        name: "Failed",
        data: weeklyCallingReliabilityData.series['failed'],
        type: "column",
      }
    ];

    // Weekly Calls Status HeatMap
    this.weeklyCallsStatusHeatMap = res[2];
    this.heatMapCallsSummary.total = this.weeklyCallsStatusHeatMap.summary.totalCalls;
    this.heatMapCallsSummary.failed = this.weeklyCallsStatusHeatMap.summary.failedCalls;
    this.changeHeatMapData();

    // Weekly CR and FF footer info
    const weeklyCallStatus = res[3];
    const POLQA = res[3].POLQA;
    this.weeklyFeatureFunctionality.p2pCalls = weeklyCallStatus.featureFunctionality.callsByType.p2p;
    this.weeklyFeatureFunctionality.onNetCalls = weeklyCallStatus.featureFunctionality.callsByType.onNet;
    this.weeklyFeatureFunctionality.offNetCalls = weeklyCallStatus.featureFunctionality.callsByType.offNet;
    this.weeklyFeatureFunctionality.numberCalls = weeklyCallStatus.featureFunctionality.callsByStatus.PASSED + weeklyCallStatus.featureFunctionality.callsByStatus.FAILED;

    this.weeklyCallingReliability.p2pCalls = weeklyCallStatus.callingReliability.callsByType.p2p + POLQA.callsByType.p2p;
    this.weeklyCallingReliability.onNetCalls = weeklyCallStatus.callingReliability.callsByType.onNet + POLQA.callsByType.onNet;
    this.weeklyCallingReliability.offNetCalls = weeklyCallStatus.callingReliability.callsByType.offNet + POLQA.callsByType.offNet;
    this.weeklyCallingReliability.numberCalls = weeklyCallStatus.callingReliability.callsByStatus.PASSED + weeklyCallStatus.callingReliability.callsByStatus.FAILED
      + POLQA.callsByStatus.PASSED + POLQA.callsByStatus.FAILED;

    // Weekly VQ chart
    const vqData = res[4];
    const resPOLQA = res[5].POLQA;
    this.weeklyVQ.numberStreams = vqData.summary.streams;
    this.weeklyVQ.numberCalls = vqData.summary.calls;
    this.weeklyVQ.p2p = resPOLQA.callsByType.p2p;
    this.weeklyVQ.onNet = resPOLQA.callsByType.onNet;
    this.weeklyVQ.offNet = resPOLQA.callsByType.offNet;
    this.weeklyVQChartOptions.xAxis = { ...this.weeklyVQChartOptions.xAxis, categories: vqData.categories };
    this.weeklyVQChartOptions.series = [
      vqData.percentages.excellent,
      vqData.percentages.good,
      vqData.percentages.fair,
      vqData.percentages.poor
    ];
    this.weeklyVQChartOptions.chart.events = {
      dataPointSelection: (event, chartContext, config) => {
        this.navigateToPOLQACallsDetailedWeekly(config);
      },
      dataPointMouseEnter: (event, chartContext, config) => {  
        event.target.style.cursor ='pointer';   
      }
    };
    this.weeklyVqNumericValues = [
      vqData.numericValues.excellent,
      vqData.numericValues.good,
      vqData.numericValues.fair,
      vqData.numericValues.poor
    ];

    if (this.weeklySelectedRegions.length > 0)
      this.reloadUserOptions(this.weeklySelectedRegions);
    else
      this.reloadFilterOptions();
  }

  changeHeatMapData() {
    this.weeklyCallsStatusChartOptions.series = this.weeklyCallsStatusHeatMap.series[this.selectedStatus];
    const maxValue = this.weeklyCallsStatusHeatMap.maxValues[this.selectedStatus];
    this.weeklyCallsStatusChartOptions.plotOptions.heatmap.colorScale.ranges[0].to = maxValue;
  }

  navigateToDetailedTable(reportType?: string, status?: string, section?: boolean) {
    let reportFilter = "";
    if (reportType && reportType != "")
      reportFilter += "type=" + reportType;
    else if (status && status != "")
      reportFilter += "status=" + status;
    if (section) reportFilter += "&sectionFailed=" + section;
    this.goToDetailedReportView(reportFilter);
  }

  navigateToPOLQACallsDetailedTable() {
    const reportFilter = "polqaCalls=true";
    this.goToDetailedReportView(reportFilter);
  }

  private navigateToPOLQACallsDetailedTableFilter(position: number): void {
    const reportFilter = `polqaCalls=true&avg=${position + 1}`;
    this.goToDetailedReportView(reportFilter);
  }

  private goToDetailedReportView(reportFilter: string) {
    let startDate;
    let endDate;
    if (this.selectedPeriod == "daily") {
      startDate = this.selectedDate.clone().utc().startOf('day');
      endDate = this.selectedDate.clone().utc();
    } else {
      if (this.isSelectedDayInWeekly) {
        startDate = this.selectedDayInWeekly.clone().utc().startOf('day');
        endDate = this.selectedDayInWeekly.clone().utc().endOf('day');
        this.isSelectedDayInWeekly = false;
      } else {
        startDate = this.getStartWeekDate();
        endDate = this.getEndWeekDate();
      }
    }
    const startTime = Utility.parseReportDate(startDate);
    const endTime = Utility.parseReportDate(endDate);
    let regions = ""
    if (this.selectedRegions.length > 0)
      regions = JSON.stringify(this.selectedRegions);
    const url = `${environment.BASE_URL}/#/spotlight/details?subaccountId=${this.subaccountDetails.id}&${reportFilter}&start=${startTime}&end=${endTime}&regions=${regions}`;
    window.open(url);
  }

  regionDisplayFn(region: any) {
    return region.displayName;
  }

  private _filterRegion(value: string): { country: string; state: string; city: string; displayName: string }[] {
    const filterValue = value.toLowerCase();

    return this.regions.filter(option => option.displayName.toLowerCase().includes(filterValue));
  }

  private initAutocompletes() {
    this.filteredRegions = this.filters.get('region').valueChanges.pipe(
      startWith(''),
      map(value => this._filterRegion(value || '')),
    );
    this.filteredRegions.subscribe((regions) => {
      this.notSelectedFilteredDailyRegions = regions;
      this.preselectedRegions.forEach(region => {
        this.removeRegionFromArray(region.displayName, this.notSelectedFilteredDailyRegions);
      });
    });
  }

  private initWeeklyAutocompletes() {
    this.weeklyFilteredRegions = this.weeklyFilters.get('region').valueChanges.pipe(
      startWith(''),
      map(value => this._filterRegion(value || '')),
    );
    this.weeklyFilteredRegions.subscribe((regions) => {
      this.notSelectedFilteredWeeklyRegions = regions;
      this.weeklyPreselectedRegions.forEach(region => {
        this.removeRegionFromArray(region.displayName, this.notSelectedFilteredWeeklyRegions);
      });
    });
  }

  private reloadFilterOptions() {
    if (this.disableFiltersWhileLoading) {
      this.weeklyFilters.disable();
      this.filters.disable();
      this.networkQuality?.filters.disable();
    }
    const subaccountId = this.subaccountDetails.id;
    let startDate, endDate;
    if (this.selectedPeriod == "daily") {
      startDate = endDate = this.selectedDate;
    } else {
      startDate = this.selectedRange.start;
      endDate = this.selectedRange.end;
    }
    this.spotlightChartsService.getFilterOptions(subaccountId, startDate, endDate).subscribe((res: any) => {
      const regions = [];
      res.regions.map(region => {
        if (region.country !== null) {
          regions.push({ country: region.country, state: null, city: null, displayName: region.country });
          if (region.state && region.country) regions.push({ country: region.country, state: region.state, city: null, displayName: `${region.state}, ${region.country}` });
          if (region.state && region.country && region.city) regions.push({ country: region.country, state: region.state, city: region.city, displayName: `${region.city}, ${region.state}, ${region.country}` });
        }
      });
      const flags = new Set();
      this.regions = regions.filter(entry => {
        if (flags.has(entry.displayName) || !entry.displayName.trim().length) {
          return false;
        }
        flags.add(entry.displayName);
        return true;
      }).sort();
      this.users = res.users.filter(user => user !== null);
      this.filters.enable();
      this.weeklyFilters.enable();

      this.networkQuality.users = res.users;
      this.networkQuality.initAutocompletes();
      this.networkQuality?.filters.enable();
    })
  }

  private reloadUserOptions(regions?: any) {
    if (this.disableFiltersWhileLoading) {
      this.filters.disable();
      this.weeklyFilters.disable();
      this.networkQuality?.filters.disable();
    }
    const subaccountId = this.subaccountDetails.id;
    let startDate, endDate;
    if (this.selectedPeriod == "daily") {
      startDate = endDate = this.selectedDate;
    } else {
      startDate = this.selectedRange.start;
      endDate = this.selectedRange.end;
    }
    if (this.locationFlag) {
      this.reloadFilterOptions();
    }
    this.spotlightChartsService.getFilterOptions(subaccountId, startDate, endDate, "users", regions ? regions : null).subscribe((res: any) => {
      this.users = res.users.filter(user => user !== null);
      this.filters.enable();
      this.weeklyFilters.enable();

      this.networkQuality.initAutocompletes();
      this.networkQuality?.filters.enable();
    })
  }

  startTimer() {
    if (!this.timerIsRunning) {
      this.startTime = 0;
      this.seconds = 0;
      this.milliseconds = 0;
      this.startTime = performance.now();
      this.timer = interval(1).subscribe(() => {
        const elapsedTime = performance.now() - this.startTime;
        this.seconds = Math.floor(elapsedTime / 1000);
        this.milliseconds = Math.floor(elapsedTime % 1000);
      });
      this.timerIsRunning = true;
    }
  }

  stopTimer() {
    this.timer.unsubscribe();
    this.timerIsRunning = false;
  }

  getSubaccountId(): string {
    return this.subaccountService.getSelectedSubAccount().id;
  }

  addNote() {
    const dialogRef = this.dialog.open(AddNotesComponent, {
      width: '85vw',
      maxHeight: '90vh',
      maxWidth: '30vw',
      disableClose: false
    });
  }

  private checkSetupStatus() {
    this.ctaasSetupService.getSubaccountCtaasSetupDetails(this.subaccountDetails.id).subscribe(res => {
      const ctaasSetupDetails = res['ctaasSetups'][0];
      if (ctaasSetupDetails.maintenance) {
        this.bannerService.open("ALERT", Constants.MAINTENANCE_MODE_ALERT, this.onDestroy, "alert");
        this.maintenanceModeEnabled = true;
      } else {
        this.setupCustomerOnboardDetails(ctaasSetupDetails);
      }
      if (ctaasSetupDetails.tapUrl !== '' && ctaasSetupDetails.tapUrl !== undefined)
        this.tapURLFlag = true
      else
        this.tapURLFlag = false;
      if (!this.closedBanner && !this.hiddenBanner && this.tapURLFlag)
        this.bannerService.open(Constants.UTC_DATE_INFO, "", this.onDestroy, "info", true);
    });
  }

  /**
   * setup customer onboarding details
   */
  private setupCustomerOnboardDetails(ctaasSetupDetails: any): void {
    // only open onboarding wizard dialog/modal when onboardingcomplete is f and user is SUBACCOUNT_ADMIN
    if ((!ctaasSetupDetails.onBoardingComplete && this.loggedInUserRoles.length === 1 && this.loggedInUserRoles.includes(Constants.SUBACCOUNT_ADMIN))) {
      this.showChartsFlag = false;
      const dialogRef = this.dialog.open(OnboardWizardComponent, {
        width: '700px',
        maxHeight: '80vh',
        disableClose: true,
        data: { ctaasSetupId: ctaasSetupDetails.id, ctaasSetupSubaccountId: this.subaccountDetails.id }
      });
      dialogRef.afterClosed().subscribe(res => {
        if (res) {
          console.debug(`dialog closed: ${res}`);
          this.showChartsFlag = true;
          this.loadCharts();
        }
      });
    }
  }

  private navigateToPOLQACallsDetailedWeekly(config): void {
    if (config) {
      this.isSelectedDayInWeekly = true;
      this.selectedDayInWeekly = this.weeklyFilters.get('date').value.clone().subtract((6 - config.dataPointIndex), 'days');
      var seriesIndex = config.seriesIndex;
      const reportFilter = `polqaCalls=true&avg=${seriesIndex + 1}`;
      this.goToDetailedReportView(reportFilter);
    }
  }

  ngOnDestroy(): void {
    if (this.chartsSubscription)
      this.chartsSubscription.unsubscribe();
    if (this.refreshIntervalSubscription)
      this.refreshIntervalSubscription.unsubscribe();
    this.onDestroy.next();
    this.onDestroy.complete();
    this.dialogService.showHelpButton = false;
  }

  sendHelpDialogValuesDaily(): void {
    const data = {
      title: 'Dashboard Help',
      summary: 'A dashboard is a visual representation of data that provides an overview of key information and metrics in a concise and accessible manner.',
      sections: [
          {
              //name: empty as section doesn't have title
              elements: [
                  {
                    subtitle: 'Number of calls', // can be empty
                    description: 'Refers to the total count of call volume made or received by someone or a group of people during a specific period of time.'
                  },  
                  {
                    subtitle: 'P2P',
                    description: 'Refer to Peer-Peer call wherein the two users have a direct call within the same voice server.'
                  },  
                  {
                    subtitle: 'On-net',
                    description: 'Refers to phone calls that are routed between the same service provider network.'
                  },
                  {
                    subtitle: 'Off-net',
                    description: 'Refers to phone calls that are routed between different service provider network.'
                  },  
                  {
                    subtitle: 'View detailed report',
                    description: 'Provides in-depth summary of data for a better understanding and analysis.'
                  }
              ]
          },
          {
              name: "Network Quality",
              elements: [
                {
                  subtitle: 'Worst Case',
                  description: 'Displays the results for the user who has experienced the most significant drop in network performance for the specific date.'
                },  
                {
                  subtitle: 'Average',
                  description: 'Displays the average of the network parameters across all users.'
                },  
                {
                  subtitle: 'Calls with Network Stats',
                  description: 'Refers to calls that come with detailed statistics about network performance.',
                },
                {
                  subtitle: 'Jitter',
                  description: 'Is the variation in packet delay during the transmission of data over a network.',
                },
                {
                  subtitle: 'Packet loss',
                  description: 'Is when data packets go missing or get lost while traveling through a network, causing problems in communication.',
                },
                {
                  subtitle: 'Round Trip Time (RTT)',
                  description: 'Time taken for a data packet to travel from the source to the destination and back again to the source in a network communication.',
                },
                {
                  subtitle: 'Max. Packet Loss',
                  description: 'Is the highest rate of missing data packets during network communication.',
                },
                {
                  subtitle: 'Max. Jitter (ms)',
                  description: 'Is the highest variation in packet delay, measured in milliseconds, during network communication.',
                },
                {
                  subtitle: 'Max. Round Trip Time (ms)',
                  description: 'Is the highest time taken for a data packet to travel from the source to the destination and back in a network communication.',
                },
                {
                  subtitle: 'Min. POLQA',
                  description: 'Is a metric used to measure the minimum audio quality in telecommunications, such as voice calls.',
                },
                {
                  subtitle: 'Avg. Sent Bitrate(kbps)',
                  description: 'Is the average rate at which data bits are transmitted from the source during a communication session.',
                },
                {
                  subtitle: 'Select metric',
                  descriptions:[
                    'Max. Jitter (ms) vs Min. POLQA',
                    'Max. Packet Loss (%) vs Min. POLQA',
                    'Max. Round Trip Time (ms) vs Min. POLQA'
                  ],
                },
                {
                  description: "The graph for Max.<selected metric> versus Min. POLQA appears when select metric field is selected. Hovering over the data points on the graph provides detailed insights into the metric's values corresponding to each hour. Clicking on the data points, redirects to a new page that presents the results in a more comprehensive and detailed format."
                },
                {
                  subtitle: 'Network Trends',
                  description: "Provides visibility into the network's overall condition through detailed reports on Received Packet Loss, Round Trip Time, Jitter, and Sent Bitrate per hour. Hovering over the data points on the graph reveals specific metrics for each hour, allowing for in-depth analysis and understanding of network performance.",
                },
                {
                  subtitle: 'Feature Functionality',
                  description: 'Graph displays total call by region, comparing the number of calls vs. Success rate, Pass, or Fail for the latest week. Hovering over the data points on the graph gives the overall Success percentage.',
                },
                {
                  subtitle: 'Calling Reliability',
                  description: "Shows call routing status in selected regions, with the number of calls vs. Success rate or Pass/Fail for the latest week (last seven days from the selected date) in the Date field. Hovering over the data points on the graph gives the overall Success percentage.",
                },
                {
                  subtitle: 'Voice Quality (POLQA)',
                  description: "Displays voice quality of different call streams measured using the ITU's POLQA algorithm. It displays the Percentage Quality of these call streams over the past week from the selected date. Hovering over the graph gives the Date, Category, Call Streams, and the Percentage of Excellent, Good, Fair, or Poor calls.",
                },
                {
                  subtitle: 'Failed calls',
                  description: 'Failed calls are phone calls that were not successful and couldn\'t be completed due to various reasons like network issues or incorrect dialling.',
                }
              ]
          }
      ]
  };
    this.dialogService.clearDialogData();
    this.dialogService.updateDialogData(this.dialogService.transformToDialogData(data));
  }

  sendHelpDialogValuesWeekly(): void {
    const data = {
      title: 'Dashboard/Weekly Help',
      summary: 'A dashboard is a visual representation of data that provides an overview of key information and metrics in a concise and accessible manner.',
      sections: [
        {
          //name: empty as section doesn't have title
          elements: [
            {
              subtitle: 'Feature Functionality',
              description: 'Graph displays total call by region, comparing the number of calls vs. Success rate, Pass, or Fail for the latest week. Hovering over the data points on the graph gives the overall Success percentage.',
            },
            {
              subtitle: 'Calling Reliability',
              description: 'Shows call routing status in selected regions, with the number of calls vs. Success rate or Pass/Fail for the latest week (last seven days from selected date) in the Date field. Hovering over the data points on the graph gives the overall Success percentage.',
            },
            {
              subtitle: 'Voice Quality (POLQA)',
              description: "Displays voice quality of different call streams measured using the ITU's POLQA algorithm. It displays the Percentage Quality of these call streams over the past week from the selected date. Hovering over the graph gives the Date, Category, Call Streams, and the Percentage of Excellent, Good, Fair, or Poor calls.",
            },
            {
              subtitle: 'Call Status History/Heatmap',
              description: 'Call history status is a record of the calls made or received, including details like date, time. Click on the failed section to identify patterns of call failure, helping you identify and resolve issues effectively.',
            },
            {
              subtitle: 'View detailed report',
              description: 'Provides in-depth summary of data for a better understanding and analysis.',
            },
            {
              subtitle: 'Download report',
              description: 'To download the report in Microsoft Excel format, simply click the "Download Report" button.',
            },
          ]
        }
      ]
  };
    this.dialogService.clearDialogData();
    this.dialogService.updateDialogData(this.dialogService.transformToDialogData(data));
  }
}
