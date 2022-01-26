import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadFileServiceService {
  apiURL: string = environment.apiEndpoint;
  constructor(private httpClient: HttpClient) { }

  /**
    * uploadFile 
    */
  public uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.httpClient.post(this.apiURL + '/broadwork/upload/file', formData);
  }
    /**
     * to upload file
     */
    public uploadCallServerFile(file: File, vendor:string){
        const formData = new FormData();
        formData.append('file', file);
        return this.httpClient.post(this.apiURL + '/upload/apiDoc/'+ vendor, formData);
    }
  /**
 * fetch all file details list
 */
  public getFileDetailsList() {
    const headers = this.getHeaders();
    return this.httpClient.get(this.apiURL + '/broadwork/upload/getListAllFiles', { headers });
  }
/**
 * fetch all file details list
 */
     public getserverApiFileList() {
      const headers = this.getHeaders();
      return this.httpClient.get(this.apiURL + '/upload/apiDoc', { headers });
    }
  /**
   * delete CallServerFile from the file list
   */
  public deleteserverApiFileList(id:string){
    return this.httpClient.delete(this.apiURL + '/upload/apiDoc/'+ id);
  }

  /**
   * deleteFile from the file list
   */
  public deleteFile(name: string) {
    return this.httpClient.post(this.apiURL + '/broadwork/upload/deleteFile/' , name);
  }
  private getHeaders() {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return headers;
  }
  /**
   * to reset logo
   */
  public resetFile() {
    const headers = this.getHeaders();
    return this.httpClient.get(this.apiURL + '/reset', { headers: headers });
  }

}
