export interface IDashboardImageResponse {
    lastUpdatedTS: string;
    reportType: string;
    imagesList: IImages[]
}

export interface IImages{
    imageBase64: string;
    reportType: string
}
