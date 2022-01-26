import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})

export class ProvisioningService {
  apiURL: string = environment.apiEndpoint + '/callServer';
  instance: any;
  closeModal: EventEmitter<any>;
  createdInstance: EventEmitter<any>;
  constructor(private httpClient: HttpClient) {
    this.closeModal = new EventEmitter<any>();
    this.createdInstance = new EventEmitter<any>();
  }

  public createInstance(instance: any) {
    return this.httpClient.post(this.apiURL + '/create', instance);
  }

  public getFilteredServers(vendor: string, model: string) {
    const headers = this.getHeaders();
    return this.httpClient.get<any[]>(this.apiURL + `/list/${vendor}/${model}`, { headers });

  }

  public updateInstance(instance: any) {
    return this.httpClient.put(this.apiURL + '/update/' + instance.id, instance);
  }

  public getInstanceId(id: string) {
    return this.httpClient.get(this.apiURL + '/get/' + id);
  }

  public deleteInstance(id: string) {
    return this.httpClient.delete(this.apiURL + '/delete/' + id);
  }

  public deleteMultipleInstances(ids: string) {
    return this.httpClient.delete(this.apiURL + '/deleteMultiple/' + ids);
  }

  public getInstances(url?: string) {
    const headers = this.getHeaders();
    return this.httpClient.get<any[]>(this.apiURL + '/listAll', { headers });
  }

  public syncInstance(id: string) {
    return this.httpClient.post(this.apiURL + '/syncCallServer/' + id, id);
  }

  public downloadServerFailureLogs(callServerId: string) {
    const fullUrl = '/downloadlogs/' + callServerId;
    const headers = this.getHeaders();
    return this.httpClient.get(this.apiURL + fullUrl, { responseType: 'arraybuffer' });
  }
  /**
   * fetch server by vendor
   * @param vendor: string 
   * @param model: string 
   */
  fetchServerByVendor(vendor: string, model?: string) {
    const headers = this.getHeaders();
    if (model) {
      return this.httpClient.get(this.apiURL + '/list/' + vendor + '/' + model, { headers: headers });
    }
    return this.httpClient.get(this.apiURL + '/list/' + vendor, { headers: headers });
  }

  setInstance(instance: any) {
    this.instance = instance;
  }

  getInstance() {
    return this.instance;
  }

  public getHeaders() {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return headers;
  }
}
