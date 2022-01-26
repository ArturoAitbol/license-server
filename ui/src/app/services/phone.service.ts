import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Phone } from '../model/phone';
import { Firmware } from '../model/firmware';
import { shareReplay } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class PhoneService {
    apiURL: string = environment.apiEndpoint + '/phone';

    constructor(private httpClient: HttpClient) {
    }

    public createPhone(phone: Phone) {
        return this.httpClient.post(this.apiURL + '/create', phone);
    }

    public updatePhone(phone: Phone) {
        return this.httpClient.put(this.apiURL + '/update/' + phone.id, phone);
    }

    public getPhoneDetails(id: string) {
        return this.httpClient.get(this.apiURL + '/getPhoneDetails/' + id);
    }

    public getUpdateStatus(serverTime: string) {
        return this.httpClient.get(this.apiURL + '/anyChange/' + serverTime);
    }

    public rebootPhone(phone: Phone) {
        return this.httpClient.post(this.apiURL + '/reboot/' + phone.id, phone);
    }

    public syncPhoneConfig(phone: Phone) {
        return this.httpClient.post(this.apiURL + '/syncConfig/' + phone.id, phone);
    }

    public easyButton(phone: Phone) {
        const details = { id: phone.id, outBoundCallNumber: phone.outBoundCallNumber };
        return this.httpClient.post(this.apiURL + '/easyButton', details);
    }

    public easyButtonDetails(phone: Phone) {
        return this.httpClient.post(this.apiURL + '/easyButtonDetails/' + phone.id, phone);
    }

    public easyButtonLogs(id: string) {
        return this.httpClient.get(this.apiURL + '/downloadPrtByPhone/' + id, { responseType: 'arraybuffer' });
    }

    public phoneConfigDetails(phone: Phone) {
        return this.httpClient.post(this.apiURL + '/phoneConfigDetails/' + phone.id, phone);
    }

    /* public getPhoneConfig(id: string) {
      return this.httpClient.get(this.apiURL + "/getConfig/" + id);
    } */

    public getPhoneById(id: string) {
        return this.httpClient.get(this.apiURL + '/get/' + id);
    }

    public downloadPhonesEvents(mac: string) {
        return this.httpClient.get(this.apiURL + '/downloadPhonesEvents/' + mac, { responseType: 'arraybuffer' });
    }

    public deletePhone(phoneId: string) {
        return this.httpClient.delete(this.apiURL + '/delete/' + phoneId);
    }

    public deleteMultiplePhones(phoneIds: string[]) {
        return this.httpClient.post(this.apiURL + '/deleteMultiple/', { ids: phoneIds });
    }

    public getPhones(url?: string) {
        const headers = this.getHeaders();
        return this.httpClient.get<Phone[]>(this.apiURL + '/listAll', { headers });
    }

    /**
     * fetch phones along with hierarchy
     * @param levelId: string
     */
    public getPhonesAndHierarchy(levelId?: string) {
        const headers = this.getHeaders();
        if (levelId) {
            return this.httpClient.get<Phone[]>(this.apiURL + '/listAll/hirarchy/' + levelId, { headers }).pipe(shareReplay(1));
        } else {
            return this.httpClient.get<Phone[]>(this.apiURL + '/listAll/hirarchy', { headers }).pipe(shareReplay(1));
        }
    }

    public listEventsByMac(mac: string) {
        const headers = this.getHeaders();
        return this.httpClient.get<any[]>(this.apiURL + '/events/listByMAC/' + mac, { headers });
    }

    public listEventsByPhone(id: string) {
        const headers = this.getHeaders();
        return this.httpClient.get<any[]>(this.apiURL + '/events/listByPhone/' + id, { headers });
    }

    public getEventById(id: string) {
        return this.httpClient.get(this.apiURL + '/events/get/' + id);
    }

    public getEventTypes() {
        const headers = this.getHeaders();
        return this.httpClient.get<any[]>(this.apiURL + '/events/listTypes', { headers });
    }

    public firmwareUpdate(ids: any, upgradePhoneList: Firmware[]) {
        return this.httpClient.post(this.apiURL + '/firmwareUpgrade/', { ids: ids, firmwareUpgrades: upgradePhoneList });
    }

    public rebootMultiplePhones(selectedPhones: any) {
        return this.httpClient.post(this.apiURL + '/rebootMultiple/', { ids: selectedPhones });
    }

    public startCapture(phone: any) {
        return this.httpClient.post(this.apiURL + '/trace/' + phone.id + '/start', phone);
    }

    public stopCapture(phone: any) {
        return this.httpClient.post(this.apiURL + '/trace/' + phone.id + '/stop', phone);
    }

    public getPacketCapture(phone: any) {
        return this.httpClient.post(this.apiURL + '/trace/' + phone.id + '/get', phone);
    }

    public getLogs(phone: any) {
        const headers = this.getHeaders();
        return this.httpClient.get(this.apiURL + '/downloadPcapByPhone/' + phone.macAddress, { responseType: 'arraybuffer' });
    }

    public updateNewStatus() {
        return this.httpClient.post(this.apiURL + '/updateNewStatus/', {});
    }
    public updateForWaitingNewStatus() {
        return this.httpClient.get(this.apiURL + '/list/waitingForUpdate');
    }

    public getDateRange(phone: any) {
        return this.httpClient.get(this.apiURL + '/events/getDatesByPhone/' + phone.id);
    }

    public getEventsByDate(phoneId: any, startDate: any, endDate: any) {
        return this.httpClient.get(this.apiURL + '/events/listByPhone/' + phoneId + '/' + startDate + '/' + endDate);
    }

    public getPhoneLicenseStatus() {
        return this.httpClient.get(this.apiURL + '/getLicenseStatus');
    }

    // public visualInitiatedDevice(id: string) {
    //     return this.httpClient.post(environment.apiEndpoint + '/phone/vdm/initiated/' + id, {});
    // }

    // public visualGetDevice(id: string) {
    //     return this.httpClient.post(environment.apiEndpoint + '/phone/vdm/get/' + id, {});
    // }

    /**
     * to initiate Phone LCD
     * @param phoneId:string
     */
    public initiateVisualLCD(phoneId: string) {
        return this.httpClient.post(this.apiURL + '/vdm/initiatedLcd/' + phoneId, {});
    }

    /**
     * to initiate config details
     * @param phoneId:string
     */
    public initiateVisualConfig(phoneId: string) {
        return this.httpClient.post(this.apiURL + '/vdm/initiatedConfigFile/' + phoneId, {});
    }

    /**
     * get Phone LCD details
     * @param phoneId:string
     */
    public getVisualLCD(phoneId: string) {
        return this.httpClient.post(this.apiURL + '/vdm/getLcd/' + phoneId, {});
    }

    /**
     * get Visual config details
     * @param phoneId:string
     */
    public getVisualConfigDetails(phoneId: string) {
        return this.httpClient.post(this.apiURL + '/vdm/getConfig/' + phoneId, {});
    }

    public applyVisualConfigs(configs: any) {
        return this.httpClient.post(this.apiURL + '/vdm/applyChanges', configs);
    }

    public vdmAnyChange(serverTime: string, phoneId: string) {
        return this.httpClient.get(this.apiURL + '/vdm/anyChange/' + serverTime + '/' + phoneId);
    }

    /**
     * save the VDM template
     */
    public saveVDMTemplate(obj: any) {
        // const params = obj.phoneId + '/' +obj.name + '/' + obj.model
        return this.httpClient.post(this.apiURL + '/vdm/save/template', obj);
    }

    /**
     * delete the VDM template
     */
    public deleteVDMTemplate(templateId: any) {
        return this.httpClient.post(this.apiURL + '/vdm/delete/template/' + templateId, {});
    }

    /**
     * get the respective VDM template config details
     * @param templateId: string
     */
    public getVDMTemplateConfigDetails(templateId: string) {
        return this.httpClient.post(this.apiURL + '/vdm/get/template/' + templateId, {});
    }

    /**
     * fetch the VDM templates
     */
    public getVDMTemplatesList(obj: any) {
        return this.httpClient.post(this.apiURL + '/vdm/list/template/' + obj.model, {});
    }

    /**
     * save the VDM template along with the respective config details
     */
    public saveVDMTemplateConfigDetails(configDetails: any) {
        // tslint:disable-next-line: max-line-length
        return this.httpClient.post(this.apiURL + '/vdm/applyChanges/template', configDetails);
    }

    public fetchPhonesListForTemplate(ids: string[]) {
        return this.httpClient.post(this.apiURL + '/vdm/list', { phoneIds: ids });

    }

    public initiateMOSScore(id: string) {
        return this.httpClient.post(this.apiURL + '/mosscore/' + id, {});
    }

    public getMOSScoreDetails(id: string) {
        return this.httpClient.post(this.apiURL + '/getMOSScore/' + id, {});
    }

    /**
     * set the debugging based on the log type
     * @param phoneId: string
     * @param logType: string
     */
    public setDebugging(phoneId: string, logType: string) {
        return this.httpClient.post(this.apiURL + `/loggingLevel/${phoneId}/${logType}`, {});
    }

    /**
     * to add mutiple phones to relay
     * @param data: any
     */
    public addMultiplePhonesToRelay(data: any) {
        return this.httpClient.post(this.apiURL + '/update/relay', data);
    }
    /**
     * fetch phones by vendor
     * @param vendor: string 
     * @param model: string 
     */
    public fetchPhonesByVendor(vendor: string, model?: string) {
        const headers = this.getHeaders();
        if (model) {
            return this.httpClient.get(this.apiURL + '/list/' + vendor + '/' + model, { headers: headers });
        }
        return this.httpClient.get(this.apiURL + '/list/' + vendor, { headers: headers });
    }
    public getHeaders() {
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return headers;
    }

}

/**
 * /phone/vdm/list - phoneIds : post
 * /phone/vdm/applyChanges/template : post
 * /phone/vdm/applyChanges/status/{id} : post
 */
