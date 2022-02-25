import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Constants } from '../helpers/constants';
import { Customer } from '../model/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly API_URL: string = environment.apiEndpoint + '/customers';

  private selectedCustomer: any;
  constructor(private httpClient: HttpClient) { }
  //set the selected customer
  setSelectedCustomer(customer: any) { this.selectedCustomer = customer; }
  //get the selected customer
  getSelectedCustomer() {
    return (this.selectedCustomer) ? this.selectedCustomer : JSON.parse(localStorage.getItem(Constants.SELECTED_CUSTOMER));
  }
  /**
   * create new customer
   * @param customerName: string 
   * @returns: Observable 
   */
  public createCustomer(customerName: string) {
    return this.httpClient.post(this.API_URL, { customerName });
  }

  /**
   * fetch customer details list
   * @returns: Observable
   */
  public getCustomerList(customerName?: string) {
    const params = new HttpParams();
    if (customerName) {
      params.append('customerName', customerName);
    }
    const headers = this.getHeaders();
    return this.httpClient.get<Customer>(this.API_URL, { headers, params });
  }
  /**
   * update customer details
   * @param customer: Customer 
   * @returns: Observable 
   */
  public updateCustomer(customer: Customer) {
    return this.httpClient.put(`${this.API_URL}/${customer.id}`, customer);
  }

  /**
   * delete selected customer by customerId
   * @param customerId: string 
   * @returns: Observable
   */
  public deleteCustomer(customerId: string) {
    return this.httpClient.delete(`${this.API_URL}/${customerId}`);
  }



  /**
   * set the header for the request
   * @returns: HttpHeaders 
   */
  public getHeaders() {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return headers;
  }
}
