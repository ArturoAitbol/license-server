export interface Note {
    id?: string;
    subaccountId: string;
    content: string;
    status: string;
    openDate?: string;
    openedBy?: string;
    closeDate?: string;
    closedBy?: string;
}

export interface NoteAPIResponse {
    notes: Note[]
}