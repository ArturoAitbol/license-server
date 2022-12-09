import {Observable} from 'rxjs';

const NOTE_A = {
    id: '12341234-1234-1234-1234-123412341234',
    subaccountId: 'fbb2d912-b202-432d-8c07-dce0dad51f7f',
    openDate: '2022-01-23 05:00:00',
    closeDate: '2022-05-29 05:00:00',
    openedBy: 'test@unit.test',
    closedBy: 'test@unit.test',
    status: 'Closed',
    content: 'Test content 1',
    reports: [{timestampId:"221207090048",reportType:"Daily-FeatureFunctionality"}]
};

const NOTE_B = {
    id: '56785678-5678-5678-5678-567856785678',
    subaccountId: 'fbb2d912-b202-432d-8c07-dce0dad51f7f',
    openDate: '2022-01-24 05:00:00',
    closeDate: '2022-05-29 05:00:00',
    openedBy: 'test@unit.test',
    closedBy: '',
    status: 'Open',
    content: 'Test content 2',
    reports: [{timestampId:"221207090048",reportType:"Daily-FeatureFunctionality"}]
};

const NOTE_C = {
    id: '78907890-7890-7890-7890-789078907890',
    subaccountId: 'fbb2d912-b202-432d-8c07-dce0dad51f7f',
    openDate: '2022-01-25 05:00:00',
    closeDate: '2022-05-29 05:00:00',
    openedBy: 'test@unit.test',
    closedBy: '',
    status: 'Closed',
    content: 'Test content 3',
    reports: [{timestampId:"221207090048",reportType:"Daily-FeatureFunctionality"}]
};

const NOTES_LIST = {
    notes: [
        NOTE_A,
        NOTE_B,
        NOTE_C,
    ]
};

export const NoteServiceMock = {
    projectsListValue: NOTES_LIST,
    mockNoteA: NOTE_A,
    unsortedNotesList: {
        notes: [
            NOTE_A,
            NOTE_B,
            NOTE_C,
        ]
    },
    sortedByStatusAsc: {
        notes: [
            NOTE_A,
            NOTE_C,
            NOTE_B,
        ]
    },
    sortedByStatusDesc: {
        notes: [
            NOTE_B,
            NOTE_A,
            NOTE_C,
        ]
    },
    sortedByOpenDateAsc: {
        notes: [
            NOTE_A,
            NOTE_B,
            NOTE_C,
        ]
    },
    sortedByOpenDateDesc: {
        notes: [
            NOTE_C,
            NOTE_B,
            NOTE_A,
        ]
    },
    closeNote: (noteId: string) => {
        return new Observable((observer) => {
            observer.next(
                {
                    body:[
                        {
                            id:'459cf3ca-7365-47a1-8d9b-1abee381545c',
                        }
                    ]
                }
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    getNoteList: () => {
        return new Observable((observer) => {
            observer.next(
                JSON.parse(JSON.stringify(NOTES_LIST))
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    }
};
