export interface ITestReports {
    reportType: string, 
    endTime: string,
    startTime: string
    status: string
}

export interface TestReportsAPIResponse {
    reports: ITestReports[];
}