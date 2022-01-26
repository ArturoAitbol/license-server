import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  private apiURL: string = environment.apiEndpoint + '/appLog';

  constructor(private http: HttpClient) { }

  /**
   * get the file names list
   */
  public getFileNames() {
    const headers = this.getHeaders();
    return this.http.get(this.apiURL + '/get/fileNames', { headers: headers });
  }

  /**
   * download the logs
   * @param data : { dbSnapShot: boolean, fileNames: string[], systemLogs: boolean }
   */
  public downloadFiles(data: { dbLogs: boolean, fileNames: string[], systemLogs: boolean }) {
    // tslint:disable-next-line: max-line-length
    return this.http.post(this.apiURL + '/download/appLogs/' + data.dbLogs.toString() + '/' + data.systemLogs.toString(), data.fileNames,
      { responseType: 'arraybuffer', reportProgress: true, observe: 'events' }); //
  }

  /**
   * setting header and return it
   */
  private getHeaders() {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return headers;
  }
}
