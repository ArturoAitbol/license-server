export interface ITestReports {
    reportType: string, 
    endTime: string,
    startTime: string
}

export interface TestReportsAPIResponse {
    reports: ITestReports[];
}