export interface IDashboardImageResponse {
    reportType: string;
    imagesList: IImage[]
}

export interface IImage{
    imageBase64: string;
    reportType: string;
    startDateStr: string;
    endDateStr: string;
}
