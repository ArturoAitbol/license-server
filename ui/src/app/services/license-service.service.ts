import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LicenseService {

  apiURL: string = environment.apiEndpoint;
  constructor(private httpClient: HttpClient) { }

  public uploadLicense(file: File) {
    const formData = new FormData();
    const fileName = 'onPOINT.license';
    formData.append('file', file, fileName);
    return this.httpClient.post(this.apiURL + '/upload/license/', formData);
  }

  getLicenses() {
    const headers = this.getHeaders();
    return this.httpClient.get<any[]>(this.apiURL + '/dashboard/licenseInfo', { headers });
  }
  getViewMore() {
    const headers = this.getHeaders();
    return this.httpClient.get<any[]>(this.apiURL + '/dashboard/licenseInfo/deviceModel/consumption', { headers });
  }
  getProjectDetails(vendor: string, model: string, platform: string, firmware: string) {
    const headers = this.getHeaders();
    const url = this.apiURL + '/dashboard/licenseInfo/deviceModel/consumption/' + vendor + '/' + model;
    if (platform != '') {
      let params = new HttpParams();
      params = params.append('os', platform);
      params = params.append('firmware', firmware);
      return this.httpClient.get<any[]>(url, { headers, params });
    }
    return this.httpClient.get<any[]>(url, { headers });
  }
  /**
   * generate license MAC
   */
  generateLicenseMAC() {
    const headers = this.getHeaders();
    return this.httpClient.get<any[]>(this.apiURL + '/upload/onPOINTLicenseMac', { headers });
  }

  public getHeaders() {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return headers;
  }
  /**
   * GenerateLicenseReport()
   */
  public downloadGenerateLicenseReport() {

    const fullUrl = '/dashboard/licenseInfo/download/report';
    const headers = this.getHeaders();
    return this.httpClient.get(this.apiURL + fullUrl, { responseType: 'arraybuffer' });
  }

}
