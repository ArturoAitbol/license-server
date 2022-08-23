export interface Project {
    id: string;
    projectName: string;
    projectNumber: string;
    subaccountId: string;
    licenseId: string;
    licenseDescription?: string;
    openDate: string;
    closeDate: string;
    status: string;
}