import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class DateTimeFormatService {
    private timeZones: any = [
        {name: 'ACT', description: 'Australia Central Time'},
        {name: 'AET', description: 'Australia Eastern Time'},
        {name: 'AGT', description: 'Argentina Standard Time'},
        {name: 'ART', description: '(Arabic) Egypt Standard Time'},
        {name: 'AST', description: 'Alaska Standard Time'},
        {name: 'BET', description: 'Brazil Eastern Time'},
        {name: 'BST', description: 'Bangladesh Standard Time'},
        {name: 'CAT', description: 'Central African Time'},
        {name: 'CNT', description: 'Canada Newfoundland Time'},
        {name: 'CST', description: 'Central Standard Time'},
        {name: 'CTT', description: 'China Taiwan Time'},
        {name: 'EAT', description: 'Eastern African Time'},
        {name: 'ECT', description: 'European Central Time'},
        {name: 'EET', description: 'Eastern European Time'},
        {name: 'EST', description: 'Eastern Standard Time'},
        {name: 'GMT', description: 'Greenwich Mean Time'},
        {name: 'HST', description: 'Hawaii Standard Time'},
        {name: 'IET', description: 'Indiana Eastern Standard Time'},
        {name: 'IST', description: 'Indian Standard Time'},
        {name: 'JST', description: 'Japan Standard Time'},
        {name: 'MET', description: 'Middle East Time'},
        {name: 'MIT', description: 'Midway Islands Time'},
        {name: 'MST', description: 'Mountain Standard Time'},
        {name: 'NET', description: 'Near East Time'},
        {name: 'NST', description: 'New Zealand Standard Time'},
        {name: 'PLT', description: 'Pakistan Lahore Time'},
        {name: 'PNT', description: 'Phoenix Standard Time'},
        {name: 'PRT'},
        {name: 'PST', description: 'Pacific Standard Time'},
        {name: 'SST', description: 'Solomon Standard Time'},
        {name: 'UTC', description: 'Universal Coordinated Time'},
        {name: 'VST', description: 'Vietnam Standard Time'}
    ];
    private apiURL: string = environment.apiEndpoint + '/dateFormat';

    constructor(private httpClient: HttpClient) {
    }

    /**
     * get the timezones list
     */
    get timeZonesList(): any[] {
        return this.timeZones;
    }

    /**
     * fetch all the date time format list
     */
    public fetchAllDateTimeFormats() {
        const headers = this.getHeaders();
        return this.httpClient.get(this.apiURL + '/listAll', {headers});
    }

    /**
     * set the preferred date time format
     */
    public setDateTimeFormat(data: any) {
        return this.httpClient.post(this.apiURL + '/defineFormat', data);
    }

    public getHeaders() {
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return headers;
    }
}
