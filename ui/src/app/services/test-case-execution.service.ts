import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TestCaseExecutionService {
  private apiURL: string = environment.apiEndpoint + '/testCase/execution';

  constructor(private httpClient: HttpClient) { }


  /**
   * test case execution 
   * @param testCaseId: string 
   * @param testCaseResources: any 
   */
  public testCaseExecution(testCaseId: string, testCaseResources: any) {
    return this.httpClient.post(this.apiURL + '/' + testCaseId, testCaseResources);
  }
  /**
   * stop test case execution
   * @param testCaseId: string 
   */
  public stopTestCaseExecution(testCaseId: string) {
    return this.httpClient.post(this.apiURL + '/stop/' + testCaseId, {});
  }
  /**
   * fetch test case execution details
   * @param testCaseId: string 
   */
  public fetchTestCaseExecutionDetails(testCaseId: string) {
    const headers = this.getHeaders();
    return this.httpClient.get(this.apiURL + '/' + testCaseId, { headers });
  }
  /**
   * get status of test case execution
   * @param testCaseId: string 
   */
  public getStatusTestCaseExecution(testCaseId: string) {
    const headers = this.getHeaders();
    return this.httpClient.get(this.apiURL + '/status/' + testCaseId, { headers });
  }
  /**
   * fetch test case execution results
   * @param testCaseId: string 
   */
  public getTestCaseExecutionResult(testCaseId: string) {
    const headers = this.getHeaders();
    return this.httpClient.get(this.apiURL + '/result/' + testCaseId, { headers });
  }
  /**
   * download execution result logs
   * @param testCaseId: string 
   */
  public downloadLogs(testCaseId: string) {
    const headers = this.getHeaders();
    return this.httpClient.get(this.apiURL + '/download/logs/' + testCaseId, { headers: headers, responseType: 'arraybuffer' })
  }
  public getHeaders() {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return headers;
  }
}
