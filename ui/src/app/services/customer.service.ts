import { Injectable } from '@angular/core';
import { Constants } from '../model/constant';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private selectedCustomer: any;
  constructor() { }

  setSelectedCustomer(customer: any) { this.selectedCustomer = customer; }

  getSelectedCustomer() {
    return (this.selectedCustomer) ? this.selectedCustomer : JSON.parse(localStorage.getItem(Constants.SELECTED_CUSTOMER));
  }
}
