import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {PhoneList} from '../model/phone-list';
import {environment} from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PhoneListService {
    private currentList: any;
    listOperationsHide: EventEmitter<any>;
    apiURL: string = environment.apiEndpoint + '/phonePool';

    constructor(private httpClient: HttpClient) {
        this.listOperationsHide = new EventEmitter<any>();
    }

    public createPhoneList(phoneList: PhoneList) {
        return this.httpClient.post(this.apiURL + '/create', phoneList);
    }

    public updatePhoneList(phoneList: PhoneList) {
        return this.httpClient.put(this.apiURL + '/update/' + phoneList.id, phoneList);
    }

    public getPhoneListById(id: string) {
        return this.httpClient.get(this.apiURL + '/get/' + id);
    }

    public getPhonesWaitingForUpdateByPhoneList(id: string) {
        return this.httpClient.get(this.apiURL + '/list/waitingForUpdatePhones/' + id);
    }

    public deletePhoneList(id: string) {
        return this.httpClient.delete(this.apiURL + '/delete/' + id);
    }

    public deleteMultipleLists(ids: string[]) {
        return this.httpClient.post(this.apiURL + '/deleteMultiple', {phonePoolIds: ids});
    }

    public addPhoneToList(phoneId: string, phoneList: PhoneList) {
        return this.httpClient.post(this.apiURL + '/addPhone/' + phoneId, phoneList);
    }

    public removePhoneFromlist(phoneListId: string, phoneId: string) {
        return this.httpClient.delete(this.apiURL + '/removePhone/' + phoneListId + '/' + phoneId);
    }

    public getPhoneLists(url?: string) {
        const headers = this.getHeaders();
        return this.httpClient.get<PhoneList[]>(this.apiURL + '/listAll', {headers});
    }

    public setList(list: any) {
        this.currentList = list;
    }

    public getList() {
        return this.currentList;
    }

    public getHeaders() {
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return headers;
    }
}
