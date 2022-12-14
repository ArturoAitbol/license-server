export interface Note {
    id?: string;
    subaccountId: string;
    content: string;
    status: string;
    openDate?: Date;
    openedBy?: string;
    closeDate?: Date;
    closedBy?: string;
    reports: any[];
    current?: string;
}

export interface NoteAPIResponse {
    notes: Note[]
}