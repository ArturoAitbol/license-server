import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class AuditLogsService {
    private apiURL: string = environment.apiEndpoint + '/auditLog';

    constructor(private http: HttpClient) {
    }

    /**
     * get audit logs by phoneId and type
     * @param phoneId: string
     * @param type: string
     */
    public getAuditLogs(phoneId: string, type: string) {
        const headers = this.getHeaders();
        return this.http.get(this.apiURL + '/get/' + phoneId + '/' + type, {headers: headers});
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
