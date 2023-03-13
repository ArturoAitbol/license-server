import moment from "moment";
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

const START_DATE_A = {
    startDate:moment.utc().subtract(0 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(0 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC")
}
const START_DATE_B = {
    startDate:moment.utc().subtract(1 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(1 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC")
}
const START_DATE_C = {
    startDate:moment.utc().subtract(2 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(2 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC")
}
const START_DATE_D = {
    startDate:moment.utc().subtract(3 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(3 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC")
}

const START_DATE_E = {
    startDate:moment.utc().subtract(4 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(4 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC")
}
const START_DATE_F = {
    startDate:moment.utc().subtract(5 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(5 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC")
}
const START_DATE_G = {
    startDate:moment.utc().subtract(6 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(6 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC")
}
const START_DATE_H = {
    startDate:moment.utc().subtract(7 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(7 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC")
}
const START_DATE_I = {
    startDate:moment.utc().subtract(8 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(8 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC")
}
const START_DATE_J = {
    startDate:moment.utc().subtract(9 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(9 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC")
}
const START_DATE_K = {
    startDate:moment.utc().subtract(10 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(10 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC")
}
const START_DATE_L = {
    startDate:moment.utc().subtract(11 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(11 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC")
}
const START_DATE_M = {
    startDate:moment.utc().subtract(12 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(12 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC")
}
const START_DATE_N = {
    startDate:moment.utc().subtract(13 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(13 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC")
}
const START_DATE_O = {
    startDate:moment.utc().subtract(14 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(14 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC")
}
const DATE_LIST = [
    START_DATE_B,
    START_DATE_C,
    START_DATE_A,
    START_DATE_D,
    START_DATE_O,
    START_DATE_G,
    START_DATE_H,
    START_DATE_F,
    START_DATE_I,
    START_DATE_J,
    START_DATE_K,
    START_DATE_L,
    START_DATE_N,
    START_DATE_M,
    START_DATE_E

]
const ASC_SORTED_DATE_LIST = [
    START_DATE_O,
    START_DATE_N,
    START_DATE_M,
    START_DATE_L,
    START_DATE_K,
    START_DATE_J,
    START_DATE_I,
    START_DATE_H,
    START_DATE_G,
    START_DATE_F,
    START_DATE_E,
    START_DATE_D,
    START_DATE_C,
    START_DATE_B,
    START_DATE_A
]

const DESC_SORTED_DATE_LIST = [
    START_DATE_A,
    START_DATE_B,
    START_DATE_C,
    START_DATE_D,
    START_DATE_E,
    START_DATE_F,
    START_DATE_G,
    START_DATE_H,
    START_DATE_I,
    START_DATE_J,
    START_DATE_K,
    START_DATE_L,
    START_DATE_M,
    START_DATE_N,
    START_DATE_O
]

export const TestReportsServiceMock = {
    testReportsValue: TEST_REPORTS_LIST,
    testReportsSortedAsc: TEST_REPORTS_LIST_ASC,
    testReportsSortedDesc: TEST_REPORTS_LIST_DESC,
    mockTestReportA: MOCK_TEST_REPORT_A,
    testListOfReports: TEST_LIST,
    unsortedDateList: DATE_LIST,
    ascSortedDateList: ASC_SORTED_DATE_LIST,
    descSortedDateList: DESC_SORTED_DATE_LIST,
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