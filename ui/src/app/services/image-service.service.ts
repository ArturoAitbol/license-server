import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';

class Images {
    public static readonly LOGO_NAME: string = 'BrandLogo.png';
    public static readonly ICON_NAME: string = 'favicon.ico';
}

@Injectable({
    providedIn: 'root'
})
export class ImageService {
    private readonly apiURL: string = environment.apiEndpoint + '/upload';

    constructor(private httpClient: HttpClient) {
    }

    /**
     * to upload logo
     */
    public uploadImage(file: File) {
        const formData = new FormData();
        formData.append('file', file, Images.LOGO_NAME);
        return this.httpClient.post(this.apiURL + '/logo/', formData);
    }

    /**
     * to upload icon
     */
    public uploadIcon(file: File) {
        const formData = new FormData();
        formData.append('file', file, Images.ICON_NAME);
        return this.httpClient.post(this.apiURL + '/favicon/', formData);
    }

    /**
     * to reset icon
     */
    public resetIcon() {
        const headers = this.getHeaders();
        return this.httpClient.get(this.apiURL + '/reset', {params: {imageName: Images.ICON_NAME}, headers: headers});
    }

    /**
     * to reset logo
     */
    public resetLogo() {
        const headers = this.getHeaders();
        return this.httpClient.get(this.apiURL + '/reset', {params: {imageName: Images.LOGO_NAME}, headers: headers});
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
