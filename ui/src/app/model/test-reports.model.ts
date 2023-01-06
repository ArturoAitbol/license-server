export interface ITestReports {
    reportType: string, 
    timeStamp: string,
    status: string
}

export interface TestReportsAPIResponse {
    reports: ITestReports[];
}