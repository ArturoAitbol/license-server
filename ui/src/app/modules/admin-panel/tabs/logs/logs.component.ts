import { Component, OnInit, OnDestroy } from '@angular/core';
import { LogService } from 'src/app/services/log.service';
import { ToastrService } from 'ngx-toastr';
import { Utility } from 'src/app/helpers/Utility';
import { HttpEventType } from '@angular/common/http';
import { Constants } from 'src/app/model/constant';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent implements OnInit, OnDestroy {

  selectAll: boolean;
  _isDownloadStarted: boolean;
  logsObject: any = { dbLogs: false, systemLogs: false, onPointLogs: false };
  fileNamesList: any = [];
  unSelectedfilesList: any = [];
  selectedfilesList: any = [];
  maxValue: number;
  downloadedValue: number;
  contentDownlodedInPercent: number;
  disabledDownloadButton: boolean = false;
  holdDownloadInfoToastId: any;
  constructor(private logService: LogService, private toastr: ToastrService) { }


  ngOnInit() {
    this.setDefaultValues();
  }

  /**
   * set default values for the varibles
   */
  setDefaultValues(): void {
    this.maxValue = this.downloadedValue = this.contentDownlodedInPercent = 0;
    this.selectAll = this._isDownloadStarted = false;
    this.fileNamesList = [];
    this.unSelectedfilesList = [];
    this.selectedfilesList = [];
  }
  /**
   * listen for checkbox change event
   */
  onChangeCheckBox(checked: boolean, key: string): void {
    if (key !== 'selectAll') {
      this.logsObject[key] = checked;
    }
    this.selectAll = checked;
    if (key === 'selectAll') {
      const keySet = Object.keys(this.logsObject);
      keySet.forEach((e: string) => { this.logsObject[e] = checked; });
    }

    if ((key === 'onPointLogs' || key === 'selectAll') && checked === true) {
      this.fetchFileNames();
    } else if ((key === 'onPointLogs' || key === 'selectAll') && !checked) {
      this.fileNamesList.length = 0;
    }

    const values = Object.values(this.logsObject);
    // tslint:disable-next-line: triple-equals
    this.selectAll = values.every((item: boolean) => item == true);
  }

  /**
   * fetch the file names from the backend
   */
  fetchFileNames(): void {
    this.logService.getFileNames().subscribe((response: any) => {
      if (!response.success) {
        this.toastr.error('Error trying to fetch file names: ' + response.response.message, 'Error');
      } else {
        const list: string[] = Utility.sortListInAscendingOrderWithoutKey(response.response.appLogFileNames);
        list.forEach((e: string) => { this.fileNamesList.push({ name: e, selected: false }); });
        this.unSelectedfilesList = this.fileNamesList;
      }
    });
  }

  /**
   * move unselected files to selected files
   */
  save(): void {
    this.unSelectedfilesList.forEach((e: any) => {
      // tslint:disable-next-line: triple-equals
      if (e.selected == true) {
        this.selectedfilesList.push({ ...e });
      }
    });
    this.selectedfilesList.forEach((e: any) => e.selected = false);
    // tslint:disable-next-line: triple-equals
    this.unSelectedfilesList = this.unSelectedfilesList.filter((e: any) => e.selected == false);
  }

  /**
   * move selected files to unselected files
   */
  unsave(): void {
    this.selectedfilesList.forEach((e: any) => {
      // tslint:disable-next-line: triple-equals
      if (e.selected == true) {
        this.unSelectedfilesList.push({ ...e });
      }
    });
    this.unSelectedfilesList.forEach((e: any) => e.selected = false);
    // tslint:disable-next-line: triple-equals
    this.selectedfilesList = this.selectedfilesList.filter((e: any) => e.selected == false);
  }

  /**
   * download the logs based on the selection
   */
  getLogs(): void {
    this.disabledDownloadButton = true;
    const data: any = this.buildObject();
    data.fileNames = this.selectedfilesList.map(e => e.name);
    this.holdDownloadInfoToastId = this.toastr.info("Downloading logs is in progress", 'Info', { disableTimeOut: true }).toastId;
    this.logService.downloadFiles(data).subscribe((response: any) => {
      switch (response.type) {
        case HttpEventType.Sent: { break; }
        case HttpEventType.ResponseHeader: {
          // tslint:disable-next-line: triple-equals
          if (response.status == 200 && response.statusText == 'OK') { this._isDownloadStarted = true; }
          break;
        }
        case HttpEventType.DownloadProgress: {
          this.maxValue = response.total;
          this.downloadedValue = response.loaded;
          this.contentDownlodedInPercent = Math.round(100 * this.downloadedValue / this.maxValue);
          break;
        }
        case HttpEventType.Response: {
          this.disabledDownloadButton = false;
          setTimeout(() => {
            this.toastr.remove(this.holdDownloadInfoToastId);
          }, 1000);
          Utility.downloadFile(response.body, 'debug-logs.zip');
          setTimeout(() => {
            this.setDefaultValues();
            for (const key in this.logsObject) {
              if (this.logsObject.hasOwnProperty(key)) {
                this.logsObject[key] = false;
              }
            }
          }, 3000);
          break;
        }
      }
    }, () => {
      this.disabledDownloadButton = false;
      setTimeout(() => {
        this.toastr.remove(this.holdDownloadInfoToastId);
      }, 1000);
    });
  }

  private buildObject(): {} {
    if (this.selectAll) {
      const keySet = Object.keys(this.logsObject);
      keySet.forEach((e: string) => { this.logsObject[e] = true; });
    }
    return { ...this.logsObject };
  }

  /**
   * check for atleast one selection
   * @returns: boolean
   */
  checkSelectionStatus(): boolean {
    // tslint:disable-next-line: triple-equals
    const validateSelection: boolean = Object.values(this.logsObject).some(e => e == true);
    return (this.selectAll || this.logsObject.onPointLogs) ? (validateSelection && this.selectedfilesList.length > 0) : validateSelection;
  }

  ngOnDestroy(): void {
  }
}
