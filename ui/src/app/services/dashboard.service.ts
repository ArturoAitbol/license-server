import { Injectable } from '@angular/core';
import { CustomerLicense } from '../model/customer-license';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly CUSTOMER_LICENSE_JSON = [
    {
      id: '1',
      customerAccounts: 'AT&T',
      customerSubAccounts: 'USA Division',
      renewalDate: '1/3/2022',
      status: 'Active',
      packageType: 'Large',
      purchaseDate: '1/3/2021',
      action: false
    },
    {
      id: '2',
      customerAccounts: 'AT&T',
      customerSubAccounts: 'EU Division',
      renewalDate: '10/2/2022',
      status: 'Active',
      packageType: 'Large',
      purchaseDate: '10/2/2021',
      action: false
    },
    {
      id: '3',
      customerAccounts: 'AT&T',
      customerSubAccounts: 'EU Division',
      renewalDate: '10/2/2022',
      status: 'Active',
      packageType: 'AddOn',
      purchaseDate: '10/2/2021',
      action: false
    },
    {
      id: '4',
      customerAccounts: 'BT',
      customerSubAccounts: 'BT Dev',
      renewalDate: '3/3/2022',
      status: 'Active',
      packageType: 'Large',
      purchaseDate: '3/3/2021',
      action: false
    },
    {
      id: '5',
      customerAccounts: 'AWS',
      customerSubAccounts: 'AWS Dev-US',
      renewalDate: '1/5/2021',
      status: 'Expired',
      packageType: 'Large',
      purchaseDate: '1/5/2020',
      action: false
    },
  ];
  constructor() { }

  public getCustomerLicense(): CustomerLicense[] {
    return this.CUSTOMER_LICENSE_JSON;
  }
}
