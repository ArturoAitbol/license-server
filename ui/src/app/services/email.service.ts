import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Email} from '../model/email';

@Injectable({
    providedIn: 'root'
})
export class EmailService {

    apiURL: string = environment.apiEndpoint + '/email/config';

    constructor(private http: HttpClient) {
    }

    /**
     * to add email configuration
     * @param emailConfigurationObj: Email
     */
    public addEmailConfiguration(emailConfigurationObj: Email): Observable<any> {
        return this.http.post(this.apiURL + '/add', emailConfigurationObj);
    }

    /**
     * get email configuration details
     */
    public getEmailConfigurationDetails(): Observable<any> {
        const headers = this.getHeaders();
        return this.http.get(this.apiURL + '/getDetails', {headers: headers});
    }

    /**
     * setting header and return it
     */
    public getHeaders() {
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return headers;
    }
}
