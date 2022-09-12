import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class AvailableServicesService {

  constructor(private httpClient: HttpClient) { }

  public fetchAllAvailabeServices() {
    return this.httpClient.get('assets/services/availabe-services.json');
  }
}
