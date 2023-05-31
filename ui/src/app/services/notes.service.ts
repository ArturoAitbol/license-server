import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Note, NoteAPIResponse } from '../model/note.model';

@Injectable({
    providedIn: 'root'
})
export class NoteService {
    private readonly API_URL: string = environment.apiEndpoint + '/notes';

    constructor(private httpClient: HttpClient) { }

    /**
     * purchase new Note
     * @param data: Note
     * @returns: Observable
     */
    public createNote(data: Note) {
        return this.httpClient.post(this.API_URL, data);
    }

    /**
     * fetch Note details list
     * @param subaccountId: string
     * @returns: Observable
     */
    public getNoteList(subaccountId?: string, id?: string) {
        let params = new HttpParams();
        if (subaccountId) {
            params = params.set('subaccountId', subaccountId);
        }
        if (id) {
            params = params.set('id', id);
        }
        const headers = this.getHeaders();
        return this.httpClient.get<NoteAPIResponse>(this.API_URL, { headers, params });
    }

    /**
     * delete selected note by noteId
     * @param noteId: string
     * @returns: Observable
     */
    public closeNote(noteId: string) {
        return this.httpClient.delete(`${this.API_URL}/${noteId}`);
    }
    /**
     * set the header for the request
     * @returns: HttpHeaders
     */
    public getHeaders() {
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return headers;
    }
}
