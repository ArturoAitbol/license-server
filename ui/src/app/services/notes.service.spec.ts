import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { NoteService } from './notes.service';
import { environment } from '../../environments/environment';
import { NoteServiceMock } from '../../test/mock/services/ctaas-note-service.mock';

let httpClientSpy: jasmine.SpyObj<HttpClient>;
let noteService: NoteService;
const headers = new HttpHeaders();
headers.append('Content-Type', 'application/json');

describe('Note service http requests test', () => {
    beforeEach(async () => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
        noteService = new NoteService(httpClientSpy);
    });

    it('should make the proper http calls on getNoteListBySubaccountId()', (done: DoneFn) => {
        let params = new HttpParams();
        httpClientSpy.get.and.returnValue(NoteServiceMock.getNoteList());

        params = params.set('subaccountId', 'eea5f3b8-37eb-41fe-adad-5f94da124a5a');
        noteService.getNoteList('eea5f3b8-37eb-41fe-adad-5f94da124a5a').subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/notes', { headers, params });
    });

    it('should make the proper http calls on closeNote()', (done: DoneFn) => {
        const noteToDelete = {
            id: '12341234-1234-1234-1234-123412341234'
        };
        httpClientSpy.delete.and.returnValue(NoteServiceMock.closeNote(noteToDelete.id));
        noteService.closeNote(noteToDelete.id).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.delete).toHaveBeenCalledWith(environment.apiEndpoint + '/notes/' + noteToDelete.id);
    });

    it('should make the proper http calls on createNote', (done: DoneFn) => {
        const testNote = {
            id: '56785678-5678-5678-5678-567856785678',
            subaccountId: 'fbb2d912-b202-432d-8c07-dce0dad51f7f',
            openDate: '2022-01-24 05:00:00',
            closeDate: '2022-05-29 05:00:00',
            openedBy: 'test@unit.test',
            closedBy: '',
            status: 'Open',
            content: 'Test content 2',
            reports: [{timestampId:"221207090048",reportType:"Daily-FeatureFunctionality"}]
        }
        httpClientSpy.post.and.returnValue(NoteServiceMock.createNote(testNote));
        noteService.createNote(testNote).subscribe({
            next: () => {done();},
            error: done.fail
        });

        expect(httpClientSpy.post).toHaveBeenCalledWith(environment.apiEndpoint + '/notes', testNote);
    });
});
