import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-more-details',
  templateUrl: './more-details.component.html',
  styleUrls: ['./more-details.component.css']
})
export class MoreDetailsComponent implements OnInit {
  endpointDisplayedColumns: any = [];
  featureFunctionalityDisplayedColumns: any = [];
  downloadUrl: any;
  filename: string = 'report';
  tableMaxHeight: number;
  type: string = '';
  readonly FEATURE_FUNCTIONALITY: string = 'LTS';
  readonly CALL_RELIABILITY: string = 'STS';
  readonly PESQ: string = 'PESQ';

  constructor() { }

  readonly sampleJsonDataBk: any = {
    summary: {
      total: 200,
      passed: 189,
      failed: 11,
      startTime: '04-03-22 11:16:31   CST',
      endTime: '04-03-22 15:41:28   CST'
    },
    featureFunctionality: [
      {
        testCaseName: '43. Call Forward Always - External call - Teams CFA to PSTN',
        startTime: '04-03-22 12:37:31',
        endTime: '04-03-22 12:39:15',
        from: '+12142421234',
        to: '+12142421235',
        otherParties: ['+12142421236'],
        status: 'FAILED',
        errorCategory: 'Call Routing',
        errorReason: 'P1 - Line 1 - Call state ringback | Error reason: Mismatch>>  Response Call State Expected:ringback Got:idle'
      },
      {
        testCaseName: '48.Group call - PSTN to Teams - Teams 2 pickup',
        startTime: '04-03-22 12:46:38',
        endTime: '04-03-22 12:47:44',
        from: '+12142421234',
        to: '+12142421235',
        otherParties: ['+12142421236'],
        status: 'FAILED',
        errorCategory: 'Client Error',
        errorReason: 'Call Group created is validated and is incorrect'
      }
    ],
    endpoints: [
      {
        vendor: 'Microsoft',
        model: 'MS-Teams',
        did: '9721112222',
        firmwareVersion: '1.5.00.4689'
      },
      {
        vendor: 'Microsoft',
        model: 'MS-Teams',
        did: '9721112223',
        firmwareVersion: '1.5.00.4689'
      },
      {
        vendor: 'Microsoft',
        model: 'MS-Teams',
        did: '9721112224',
        firmwareVersion: '1.5.00.4689'
      }
    ],
    callReliability: [
      {
        testCaseName: 'Teams users calls PSTN via DID',
        startTime: '04-03-22 12:37:31',
        endTime: '04-03-22 12:39:15',
        from: '+12142421234',
        to: '+12142421235',
        otherParties: ['+12142421236'],
        status: 'FAILED',
        errorCategory: 'Call Routing',
        errorReason: 'P1 - Line 1 - Call state ringback | Error reason: Mismatch>>  Response Call State Expected:ringback Got:idle'
      },
      {
        testCaseName: 'PSTN user calls Teams via DID',
        startTime: '04-03-22 12:46:38',
        endTime: '04-03-22 12:47:44',
        from: '+12142421234',
        to: '+12142421235',
        otherParties: ['+12142421236'],
        status: 'FAILED',
        errorCategory: 'Client Error',
        errorReason: 'Call Group created is validated and is incorrect'
      }
    ],
    pesq: [
      {
        testCaseName: 'Teams users calls PSTN via DID',
        startTime: '04-03-22 12:37:31',
        endTime: '04-03-22 12:39:15',
        from: '+12142421234',
        to: '+12142421235',
        otherParties: ['+12142421236'],
        status: 'FAILED',
        errorCategory: 'Call Routing',
        errorReason: 'P1 - Line 1 - Call state ringback | Error reason: Mismatch>>  Response Call State Expected:ringback Got:idle'
      },
      {
        testCaseName: 'PSTN user calls Teams via DID',
        startTime: '04-03-22 12:46:38',
        endTime: '04-03-22 12:47:44',
        from: '+12142421234',
        to: '+12142421235',
        otherParties: ['+12142421236'],
        status: 'FAILED',
        errorCategory: 'Client Error',
        errorReason: 'Call Group created is validated and is incorrect'
      }
    ]
  }
  sampleJsonData: any = {};
  ngOnInit(): void {
    this.sampleJsonData = this.sampleJsonDataBk;
    this.type = localStorage.getItem('more-details');
    this.initColumns();
    this.calculateTableHeight();
  }
  /**
   * calculate table height based on the window height
   */
  private calculateTableHeight() {
    this.tableMaxHeight = window.innerHeight // doc height
      - (window.outerHeight * 0.01 * 2) // - main-container margin
      - 60 // - route-content margin
      - 20 // - dashboard-content padding
      - 30 // - table padding
      - 32 // - title height
      - (window.outerHeight * 0.05 * 2); // - table-section margin
  }

  /**
   * initialize the columns settings
   */
  initColumns(): void {
    this.endpointDisplayedColumns = [
      { name: 'Vendor', dataKey: 'vendor', position: 'left', isSortable: true },
      { name: 'Model', dataKey: 'model', position: 'center', isSortable: true },
      { name: 'DID', dataKey: 'did', position: 'center', isSortable: true },
      { name: 'Firmware', dataKey: 'firmwareVersion', position: 'center', isSortable: true },
    ];
    this.featureFunctionalityDisplayedColumns = [
      { name: 'Test Case', dataKey: 'testCaseName', position: 'left', isSortable: true },
      { name: 'Start Time', dataKey: 'startTime', position: 'center', isSortable: true },
      { name: 'End Time', dataKey: 'endTime', position: 'center', isSortable: true },
      { name: 'From', dataKey: 'from', position: 'center', isSortable: true },
      { name: 'To', dataKey: 'to', position: 'center', isSortable: true },
      { name: 'Other Parties', dataKey: 'otherParties', position: 'center', isSortable: true },
      { name: 'Status', dataKey: 'status', position: 'center', isSortable: true },
      { name: 'Error Category', dataKey: 'errorCategory', position: 'center', isSortable: true },
      { name: 'Reason', dataKey: 'errorReason', position: 'center', isSortable: true },
    ];
  }

  downloadResponseAsJson() {
    const data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.sampleJsonData));
    const a = document.createElement('a');
    a.href = 'data:' + data;
    a.download = 'data.json';
    a.innerHTML = 'download JSON';
    const container = document.getElementById('container');
    container.appendChild(a);
  }

  downloadTextFile() {
    const name = this.filename + '-' + Date.now().toString() + '.xlsx';
    const data = JSON.stringify(this.sampleJsonData);
    const a = document.createElement('a');
    const type = name.split(".").pop();
    a.href = URL.createObjectURL(new Blob([data], { type }));
    a.download = name;
    a.click();
  }
}
