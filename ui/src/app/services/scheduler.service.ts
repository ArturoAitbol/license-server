import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SchedulerService {
    apiURL: string = environment.apiEndpoint + '/schedule';

    constructor(private httpClient: HttpClient) {
    }

    public scheduleProject(scheduler: any) {
        return this.httpClient.post(this.apiURL + '/addProjectSchedule/', scheduler);
    }

    public getScheduleInfo(schedulerId: any) {
        let headers = this.getHeaders();
        return this.httpClient.get(this.apiURL + '/get/' + schedulerId, {headers});
    }

    public updateScheduledProject(scheduler: any) {
        return this.httpClient.post(this.apiURL + '/updateProjectSchedule/' + scheduler.id, scheduler);
    }

    public getHeaders() {
        let headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return headers;
    }

}
