import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CustomerService } from 'src/app/services/customer.service';

@Component({
  selector: 'app-view-customer-license',
  templateUrl: './view-customer-license.component.html',
  styleUrls: ['./view-customer-license.component.css']
})
export class ViewCustomerLicenseComponent implements OnInit {
  readonly displayedColumns: string[] = [
    'deviceAccessLimit',
    'devicesConnected',
    'tokensPurchased',
    'automationTokensConsumed',
    'configTokensConsumed',
    'configAvgerage'
  ];
  readonly equipmentDisplayColumns: string[] = [
    'vendor',
    'model',
    'version',
    'macAddress'
  ];
  currentCustomer: any;
  @ViewChild(MatSort) sort: MatSort;
  dataSource: any = [];
  data: any = [
    {
      id: '1',
      deviceAccessLimit: '5000',
      devicesConnected: '40',
      tokensPurchased: '200',
      automationTokensConsumed: '10',
      configTokensConsumed: '100',
      configAvgerage: '50'
    }
  ];

  equipmentDataSource: any = [];
  equipmentData = [
    {
      id: '1',
      vendor: 'Cisco',
      model: 'CUCM',
      version: '13.2.2',
      macAddress: 'MM:22:20:00:00:00'
    },
    {
      id: '2',
      vendor: 'Cisco',
      model: 'CUCM',
      version: '10.2',
      macAddress: 'CM:12:22:00:00:00'
    },
    {
      id: '3',
      vendor: 'Cisco',
      model: 'CUCM',
      version: '',
      macAddress: ''
    }
  ]

  readonly detailedDisplayColumns: string[] = [
    'week',
    'configTokensConsumed'
  ];

  detailedDataSource: any = [];
  detailedData = [
    {
      id: '1',
      week: 'Week 1',
      configTokensConsumed: '100'
    },
    {
      id: '2',
      week: 'Week 2',
      configTokensConsumed: '200'
    },
    {
      id: '3',
      week: 'Week 3',
      configTokensConsumed: '300'
    }
  ]

  detailedConsumptionDataSource: any = [];
  detailedConsumptionDisplayColumns: string[] = [
    'dateOfUsage',
    'vendor',
    'model',
    'version',
    'macAddress',
    'type',
    'consumption',
    'tokensUsed',
    'action'
  ];
  detailedConsumption = [
    {
      id: '1',
      dateOfUsage: '2020-01-01',
      vendor: 'Cisco',
      model: 'CUCM',
      version: '13.2.2',
      macAddress: 'MM:22:20:00:00:00',
      type: 'Automation',
      consumption: '100',
      tokensUsed: '10',
      action: ''
    },
    {
      id: '2',
      dateOfUsage: '2020-01-01',
      vendor: 'Cisco',
      model: 'CUCM',
      version: '13.2.2',
      macAddress: 'MM:22:20:00:00:00',
      type: 'Automation',
      consumption: '100',
      tokensUsed: '10',
      action: ''
    },
    {
      id: '3',
      dateOfUsage: '2020-01-01',
      vendor: 'Cisco',
      model: 'CUCM',
      version: '13.2.2',
      macAddress: 'MM:22:20:00:00:00',
      type: 'Automation',
      consumption: '100',
      tokensUsed: '10',
      action: ''
    },
    {
      id: '4',
      dateOfUsage: '2020-01-01',
      vendor: 'Cisco',
      model: 'CUCM',
      version: '13.2.2',
      macAddress: 'MM:22:20:00:00:00',
      type: 'Automation',
      consumption: '100',
      tokensUsed: '10',
      action: ''
    }
  ]
  constructor(
    private customerSerivce: CustomerService
  ) { }

  ngOnInit(): void {
    this.currentCustomer = this.customerSerivce.getSelectedCustomer();
    this.dataSource = new MatTableDataSource(this.data);
    this.equipmentDataSource = new MatTableDataSource(this.equipmentData);
    this.detailedDataSource = new MatTableDataSource(this.detailedData);
    this.detailedConsumptionDataSource = new MatTableDataSource(this.detailedConsumption);
  }
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  onEdit(index: number) { }
  onDelete(index: number) { }
}
