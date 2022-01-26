import { Component, OnInit, Input } from '@angular/core';
import { ProjectViewService } from 'src/app/services/project-view.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ItemsList } from '@ng-select/ng-select/lib/items-list';
import { Utility } from 'src/app/helpers/Utility';

@Component({
  selector: 'run-details',
  templateUrl: './run-details.component.html',
  styleUrls: ['./run-details.component.css']
})
export class RunDetailsComponent implements OnInit {
  @Input() run: any;
  totalPortions: number;
  testPortions: number;
  runDetails: any[];
  testColumns: any;
  subResults: any = [];
  subscription: Subscription;
  sortField: string;
  sortType: string;

  constructor(private projectService: ProjectViewService, private toastr: ToastrService) { }

  ngOnInit() {
    this.sortField = '';
    this.sortType = '';
    this.loadTestResults();
    this.initGridProperties();
    this.getTestWidthPortions();
    this.projectService.updateTests.subscribe((response: any) => {
      if (this.run.id == response.id) {
        this.subResults = [];
        this.loadTestResults();
      }
    });
  }

  getTestColumnWidth(column: any) {
    return (column.width * 100 / this.testPortions) + '%';
  }

  getTestWidthPortions() {
    this.testPortions = 0;
    this.testColumns.forEach((column: any) => {
      if (!column.hidden) {
        this.testPortions += column.width;
      }
    });
  }

  getTestDetails(item: any) {
    item.details = !item.details;
  }

  downloadLogs(item: any) {
    let url = item.runInstanceDto.id + '/' + item.id;
    this.projectService.downloadLogs(url).subscribe((response: any) => {
      this.downloadFile(response, item.downloadLogName);
    })
  }

  downloadFile(data: any, filename: string) {
    var blob = new Blob([data], { type: 'application/octet-stream' });
    var url = window.URL.createObjectURL(blob);
    if (navigator.msSaveOrOpenBlob) {
      navigator.msSaveBlob(blob, filename);
    } else {
      let a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    window.URL.revokeObjectURL(url);
  }

  loadTestResults() {
    if (this.run.testResultDtos) {
      this.runDetails = this.run.testResultDtos;
      // this.runDetails.reverse();
      this.runDetails = Utility.sortListInAscendingOrder(this.runDetails, 'exeIndex', true);
      this.runDetails.forEach((runDetail: any) => {
        runDetail.details = false;
        runDetail.isLogsAvailable = this.run.logsAvailable;
      });
      this.loadSubResults();
    } else {
      this.projectService.getTestResults(this.run.id).subscribe((response: any) => {
        if (!response.success) {
          this.toastr.error('Couldn\'t load details for test results: ' + response.response.message, 'Error');
        } else {
          this.runDetails = response.response.testResults;
          // this.runDetails.reverse();
          this.runDetails = Utility.sortListInAscendingOrder(this.runDetails, 'exeIndex', true);
          this.runDetails.forEach((runDetail: any) => {
            runDetail.details = false;
            runDetail.isLogsAvailable = this.run.logsAvailable;
          });
          this.loadSubResults();
        }
      });
    }
  }

  loadSubResults() {
    this.runDetails.forEach((runDetail: any) => {
      runDetail.subResultDtoList.forEach((testResult: any) => {
        testResult.testId = runDetail.testCaseDto.id;
        testResult.isLogAvailable = runDetail.isLogsAvailable;
        this.subResults.push(testResult);
      });
    });
    // this.sortSubResults();
  }

  getResultIteration(name: string) {
    return +name.substring(name.lastIndexOf('_') + 1);
  }

  sortSubResults() {
    this.subResults.sort((sub1, sub2) => {
      if (this.getResultIteration(sub1.index) > this.getResultIteration(sub2.index)) {
        return 1;
      }
      if (this.getResultIteration(sub1.index) < this.getResultIteration(sub2.index)) {
        return -1;
      }
      return 0;
    });
  }

  sortClass(item: any) {
    if (item.field == this.sortField) {
      return 'sort-' + this.sortType;
    } else {
      return '';
    }
  }

  sortBy(column: any) {
    if (column.suppressSort) {
      return;
    }
    if (this.sortField == column.field) {
      if (this.sortType != 'desc') {
        this.sortField = '';
        return;
      }
      this.sortType = 'asc';
    } else {
      this.sortType = 'desc';
      this.sortField = column.field;
    }
    this.sortData();
  }

  sortData() {
    this.subResults = this.subResults.sort((a, b) => {
      if (a[this.sortField] == b[this.sortField]) {
        return 0;
      }
      if (a[this.sortField] < b[this.sortField]) {
        return this.sortType == 'asc' ? -1 : 1;
      }
      if (a[this.sortField] > b[this.sortField]) {
        return this.sortType == 'asc' ? 1 : -1;
      }
    });
  }

  initGridProperties() {
    this.testColumns = [
      { field: 'index', header: 'ID', width: 15, suppressHide: true },
      { field: 'status', header: 'Status', width: 15, suppressHide: true },
      { field: 'startDate', header: 'Start Date', width: 15, suppressHide: true },
      { field: 'endDate', header: 'End Date', width: 15, suppressHide: true },
      { field: '', header: '', width: 10, suppressHide: true, suppressSort: true }
    ];
  }
}