import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class ImportExportService {
    apiURL: string = environment.apiEndpoint + "/bulk";

    constructor(private httpClient: HttpClient) { }

    public validateFile(file: File, vendor: string) {
        let formData = new FormData();
        formData.append('file', file, file.name)
        formData.append('vendor', vendor)
        return this.httpClient.post(this.apiURL + "/phones/validate", formData);
    }

    public import(phoneDtoWrapper: any) {
        return this.httpClient.post(this.apiURL + "/phones/import", phoneDtoWrapper);
    }

    public getTemplate(type: string) {
        return this.httpClient.get(this.apiURL + "/phones/template/" + type, { responseType: 'arraybuffer' });
    }
}