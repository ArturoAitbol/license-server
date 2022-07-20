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
  private selectedType: string;

  constructor(private httpClient: HttpClient) { }
  //set the selected customer
  setSelectedCustomer(customer: any) { this.selectedCustomer = customer; }
  //get the selected customer
  getSelectedCustomer() {
    return (this.selectedCustomer) ? this.selectedCustomer : JSON.parse(localStorage.getItem(Constants.SELECTED_CUSTOMER));
  }

  setSelectedType(type: string) { this.selectedType = type; }

  getSelectedType() {
    return this.selectedType;
  }

  /**
   * create new customer
   * @param newCustomerDetails: Customer 
   * @returns: Observable 
   */
  public createCustomer(newCustomerDetails: Customer) {
    return this.httpClient.post(this.API_URL, newCustomerDetails);
  }

  /**
   * fetch customer details by id
   * @returns: Observable
   */
  public getCustomerById(customerId?: string) {
    const headers = this.getHeaders();
    return this.httpClient.get<any>(`${this.API_URL}/${customerId}`, { headers });
  }

  /**
   * fetch customer details list
   * @param customerName: string 
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
  public updateCustomer(customer: any) {
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
