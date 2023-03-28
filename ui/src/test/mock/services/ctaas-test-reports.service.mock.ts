import { Observable } from "rxjs";
import { ITestReports } from "src/app/model/test-reports.model";

const MOCK_TEST_REPORT_A: ITestReports = {
    reportType: "Daily-FeatureFunctionality",
    endTime: "230110034409",
    startTime: "230109113617"
};
const MOCK_TEST_REPORT_B: ITestReports = {
    reportType: "Daily-FeatureFunctionality",
    endTime: "230110034409",
    startTime: "230109113617"
};
const MOCK_TEST_REPORT_C: ITestReports = {
    reportType: "Daily-CallingReliability",
    endTime: "230110034409",
    startTime: "230109113617"
};
const MOCK_TEST_REPORT_D: ITestReports = {
    reportType: "Daily-FeatureFunctionality",
    endTime: "230110034409",
    startTime: "230109113617"
};
const MOCK_TEST_REPORT_E: ITestReports = {
    reportType: "Daily-CallingReliability",
    endTime: "230110034409",
    startTime: "230109113617"
};

const MOCK_TEST_REPORT_F: ITestReports = {
    reportType: "testName",
    endTime: "230110034409",
    startTime: "230109113617"
};

const TEST_REPORTS_LIST = {
    reports: [
        MOCK_TEST_REPORT_B,
        MOCK_TEST_REPORT_D,
        MOCK_TEST_REPORT_A,
        MOCK_TEST_REPORT_E,
        MOCK_TEST_REPORT_C,
        MOCK_TEST_REPORT_F
    ]
};

const TEST_REPORTS_LIST_ASC = {
    reports: [
        
        MOCK_TEST_REPORT_E,
        MOCK_TEST_REPORT_C,
        MOCK_TEST_REPORT_B,
        MOCK_TEST_REPORT_D,
        MOCK_TEST_REPORT_A,
        MOCK_TEST_REPORT_F
    ]
};

const TEST_REPORTS_LIST_DESC = {
    reports: [
        MOCK_TEST_REPORT_F,
        MOCK_TEST_REPORT_B,
        MOCK_TEST_REPORT_D,
        MOCK_TEST_REPORT_A,
        MOCK_TEST_REPORT_E,
        MOCK_TEST_REPORT_C
    ]
};

const TEST_LIST = {
    reports: [
        {
            reportType: "Daily-FeatureFunctionality",
            endTime: "230110034409",
            startTime: "230109113617"
        }
    ]
}

export const TestReportsServiceMock = {
    testReportsValue: TEST_REPORTS_LIST,
    testReportsSortedAsc: TEST_REPORTS_LIST_ASC,
    testReportsSortedDesc: TEST_REPORTS_LIST_DESC,
    mockTestReportA: MOCK_TEST_REPORT_A,
    testListOfReports: TEST_LIST,

    getTestReportsList: () => {
        return new Observable((observer) => {
            observer.next(
                JSON.parse(JSON.stringify(TEST_REPORTS_LIST))
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    }
}